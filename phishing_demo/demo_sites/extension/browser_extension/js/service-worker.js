/**
 * service-worker.js - Service worker для расширения CorgPhish в манифесте V3
 * 
 * Основное отличие от Background скрипта в Manifest V2:
 * 1. Используется более новый API
 * 2. Имеет жизненный цикл, более похожий на PWA
 * 3. Не имеет доступа к DOM
 */

// Импортируем наши модули с защитой от ошибок
try {
  // Подготавливаем глобальный объект для передачи данных между модулями
  self.CorgPhishData = {
    // Данные будут заполнены модулями
    initialized: false
  };
  
  // Сначала загружаем модуль XGBoost, который определяет общие переменные
  self.importScripts('./xgboost_model.js');
  
  // Затем загружаем проверку доменов
  self.importScripts('./domain_checker.js');
  
  console.log('[CorgPhish] Модули успешно загружены');
  
  // Копируем необходимые данные из модулей
  const serviceWorkerCriticalDomains = self.CorgPhishData.criticalDomains || [];
  const popularDomains = self.CorgPhishData.officialDomains || [];
  
  console.log('[CorgPhish] Загружено критических доменов:', serviceWorkerCriticalDomains.length);
  console.log('[CorgPhish] Загружено популярных доменов:', popularDomains.length);
} catch (error) {
  console.error('[CorgPhish] Ошибка при загрузке модулей:', error);
  // Создаем заглушки для функций, чтобы избежать ошибок
  if (typeof isDomainSuspicious === 'undefined') {
    self.isDomainSuspicious = function() { return false; };
  }
  if (typeof extractFeatures === 'undefined') {
    self.extractFeatures = function() { return {}; };
  }
  if (typeof predictXGBoost === 'undefined') {
    self.predictXGBoost = function() { return { score: 90, is_phishing: false }; };
  }
  if (typeof checkWithGoogleSafeBrowsing === 'undefined') {
    self.checkWithGoogleSafeBrowsing = function(url, callback) { 
      callback({ score: 90, is_phishing: false }); 
    };
  }
  if (typeof combinedAnalysis === 'undefined') {
    self.combinedAnalysis = function(url, callback) { 
      callback({ score: 90, is_phishing: false }); 
    };
  }
  if (typeof checkDomainTypos === 'undefined') {
    self.checkDomainTypos = function() { return { suspicious: false }; };
  }
  
  // Определяем пустые массивы в случае ошибки
  const popularDomains = [];
  const serviceWorkerCriticalDomains = [];
}

// Глобальные переменные для хранения результатов
let results = {};                // Сохраненные результаты анализа
let legitimatePercents = {};     // Процент легитимности сайта
let isPhish = {};                // Флаг фишингового сайта
let domainResults = {};          // Результаты проверки доменов

// Настройки анализа по умолчанию
let analysisMethod = 'combined'; // 'corgphish', 'google_safe_browsing', 'combined'
let gsbApiKey = null;            // API ключ для Google Safe Browsing
let isApiKeyValid = false;       // Флаг валидности API ключа

// Основные константы для API
const API_BASE_URL = "http://localhost:5000/api";
const API_ENDPOINTS = {
  check: `${API_BASE_URL}/check`,
  batch: `${API_BASE_URL}/batch`,
  extended: `${API_BASE_URL}/extended-check`,
  health: `${API_BASE_URL}/health`
};

// Функции профилирования для отладки производительности
let profileData = {};

/**
 * Начинает профилирование функции
 * @param {string} functionName - Имя профилируемой функции
 */
function startProfiler(functionName) {
  profileData[functionName] = {
    startTime: performance.now(),
    endTime: null,
    duration: null
  };
}

/**
 * Завершает профилирование функции и возвращает результаты
 * @param {string} functionName - Имя профилируемой функции
 * @returns {Object} Результаты профилирования
 */
function endProfiler(functionName) {
  if (!profileData[functionName]) {
    console.warn(`[CorgPhish] Профилирование для ${functionName} не было начато`);
    return null;
  }
  
  profileData[functionName].endTime = performance.now();
  profileData[functionName].duration = profileData[functionName].endTime - profileData[functionName].startTime;
  
  console.log(`[CorgPhish] Профилирование ${functionName}: ${profileData[functionName].duration.toFixed(2)}ms`);
  
  return profileData[functionName];
}

// -----------------------------------------------------
// Функции для загрузки модели классификации
// -----------------------------------------------------

/**
 * Загружает модель классификации с удаленного сервера
 * @param {Function} callback - Функция, вызываемая после загрузки модели
 */
function fetchLive(callback) {
  fetch('https://raw.githubusercontent.com/picopalette/phishing-detection-plugin/master/static/classifier.json', { 
    method: 'GET'
  })
  .then(function(response) { 
    if (!response.ok) { throw response }
    return response.json(); 
  })
  .then(function(data) {
    chrome.storage.local.set({cache: data, cacheTime: Date.now()}, function() {
      callback(data);
    });
  });
}

/**
 * Получает модель из локального кеша или загружает с сервера
 * @param {Function} callback - Функция, вызываемая после получения модели
 */
function fetchCLF(callback) {
  chrome.storage.local.get(['cache', 'cacheTime'], function(items) {
    if (items.cache && items.cacheTime) {
      return callback(items.cache);
    }
    fetchLive(callback);
  });
}

// -----------------------------------------------------
// Функции проверки доменов
// -----------------------------------------------------

/**
 * Проверяет, содержит ли URL критический домен (точное совпадение)
 * @param {string} url - URL для проверки
 * @returns {boolean} - true если URL содержит критический домен
 */
function containsCriticalDomain(url) {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.toLowerCase();
    
    // Проверяем точное совпадение с критическими доменами
    for (const criticalDomain of serviceWorkerCriticalDomains) {
      const lowerCritical = criticalDomain.toLowerCase();
      // Полное совпадение домена или является поддоменом критического домена
      if (hostname === lowerCritical || hostname.endsWith('.' + lowerCritical)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[CorgPhish] Ошибка при проверке критического домена:', error);
    return false;
  }
}

/**
 * Проверяет, находится ли сайт в базе данных популярных доменов (точное совпадение)
 * @param {string} url - URL для проверки
 * @returns {boolean} - true если сайт в базе
 */
function isSiteInDatabase(url) {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname.toLowerCase();
    
    // Проверяем точное совпадение с популярными доменами
    for (const popularDomain of popularDomains) {
      const lowerPopular = popularDomain.toLowerCase();
      // Полное совпадение домена или является поддоменом популярного домена
      if (hostname === lowerPopular || hostname.endsWith('.' + lowerPopular)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[CorgPhish] Ошибка при проверке популярного домена:', error);
    return false;
  }
}

/**
 * Проверяет домен через анализ Левенштейна
 * @param {string} url - URL для проверки
 * @returns {object} Результат проверки
 */
function checkDomain(url) {
  try {
    if (!url) {
      return { status: 'unknown', message: 'Пустой URL' };
    }
    
    // Получаем домен из URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Проверяем домен через Левенштейна
    let result = { suspicious: false };
    
    // Проверяем, определена ли функция checkDomainTypos
    if (typeof checkDomainTypos === 'function') {
      result = checkDomainTypos(domain);
    } else {
      console.warn('[CorgPhish] Функция checkDomainTypos не определена.');
      // Используем встроенную проверку на популярные домены
      for (const popularDomain of popularDomains) {
        if (domain.includes(popularDomain) && domain !== popularDomain) {
          result = {
            suspicious: true,
            similarTo: popularDomain,
            similarity: 80,
            reason: `Домен содержит название ${popularDomain} в своем имени`
          };
          break;
        }
      }
    }
    
    if (result.suspicious) {
      return {
        status: 'suspicious',
        message: result.reason,
        domain: domain,
        similarTo: result.similarTo,
        similarity: result.similarity
      };
    }
    
    return {
      status: 'safe',
      message: 'Домен не похож на популярные сайты',
      domain: domain
    };
  } catch (error) {
    console.error('[CorgPhish] Ошибка при проверке домена:', error);
    return {
      status: 'error',
      message: 'Ошибка при проверке домена',
      domain: url
    };
  }
}

/**
 * Проверяет URL на фишинг
 * @param {string} url - URL для проверки
 * @param {Function} callback - Функция обратного вызова для результата
 * @param {boolean} [highPriority=false] - Флаг высокого приоритета для быстрой проверки
 */
function checkUrlWithModel(url, callback, highPriority = false) {
  try {
    startProfiler('checkUrlWithModel');
    console.log(`[CorgPhish] Проверка URL: ${url}, метод: ${analysisMethod}, приоритет: ${highPriority ? 'высокий' : 'обычный'}`);
    logToFile(`Проверка URL: ${url}, метод: ${analysisMethod}`);
    
    // Сверхбыстрая проверка белого списка и критических признаков
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Проверка белого списка (критически важные домены)
      for (const domain of serviceWorkerCriticalDomains) {
        const lowerDomain = domain.toLowerCase();
        if (hostname === lowerDomain || hostname.endsWith('.' + lowerDomain)) {
          const result = {
            is_phishing: false,
            probability: 0,
            reasons: [`Домен находится в защищенном списке`],
            source: "whitelist_check",
            score: 100,
            binary_result: "БЕЗОПАСНО"
          };
          endProfiler('checkUrlWithModel');
          callback(result);
          return;
        }
      }
      
      // Быстрые проверки на критические признаки фишинга
      if (url.includes('@') || 
          (url.startsWith('http://') && !url.includes('https://')) || 
          /\d+\.\d+\.\d+\.\d+/.test(hostname)) {
        
        // Определяем причину
        let reason = "Обнаружены признаки фишинга";
        if (url.includes('@')) reason = "URL содержит символ @";
        else if (url.startsWith('http://') && !url.includes('https://')) reason = "Небезопасный протокол (HTTP)";
        else if (/\d+\.\d+\.\d+\.\d+/.test(hostname)) reason = "IP-адрес вместо домена";
        
        const result = {
          is_phishing: true,
          probability: 1,
          reasons: [reason],
          source: "fast_check",
          score: 0,
          binary_result: "ФИШИНГ"
        };
        endProfiler('checkUrlWithModel');
        callback(result);
        return;
      }
    } catch (error) {
      console.error('[CorgPhish] Ошибка при быстрой проверке:', error);
      // Продолжаем с основными проверками
    }
    
    // Выбор метода анализа в зависимости от настроек
    switch (analysisMethod) {
      case 'google_safe_browsing':
        if (typeof checkWithGoogleSafeBrowsing !== 'undefined') {
          console.log('[CorgPhish] Используем быструю проверку');
          checkWithGoogleSafeBrowsing(url, result => {
            endProfiler('checkUrlWithModel');
            callback(result);
          });
        } else {
          console.warn('[CorgPhish] Быстрая проверка недоступна, используем CorgPhish');
          useCorgPhish();
        }
        break;
        
      case 'combined':
        if (typeof combinedAnalysis !== 'undefined') {
          console.log('[CorgPhish] Используем комбинированный анализ');
          combinedAnalysis(url, result => {
            endProfiler('checkUrlWithModel');
            callback(result);
          });
        } else {
          console.warn('[CorgPhish] Комбинированный анализ недоступен, используем CorgPhish');
          useCorgPhish();
        }
        break;
        
      case 'corgphish':
      default:
        useCorgPhish();
        break;
    }
    
    // Функция для использования CorgPhish модели
    function useCorgPhish() {
      startProfiler('useCorgPhish');
      console.log('[CorgPhish] Используем модель CorgPhish');
      
      // Проверяем доступность функций
      if (typeof predictXGBoost !== 'undefined' && typeof extractFeatures !== 'undefined') {
        startProfiler('extractFeatures');
        const features = extractFeatures(url);
        const extractionTime = endProfiler('extractFeatures');
        console.log(`[CorgPhish] Извлечение признаков завершено за ${extractionTime.duration.toFixed(2)}ms`);
        
        startProfiler('predictXGBoost');
        const prediction = predictXGBoost(features);
        const predictionTime = endProfiler('predictXGBoost');
        console.log(`[CorgPhish] Предсказание завершено за ${predictionTime.duration.toFixed(2)}ms`);
        
        console.log(`[CorgPhish] Результат проверки: ${prediction.binary_result}`);
        const result = endProfiler('useCorgPhish');
        
        endProfiler('checkUrlWithModel');
        callback(prediction);
      } else {
        console.error('[CorgPhish] Модель не загружена, возвращаем значение по умолчанию');
        endProfiler('useCorgPhish');
        endProfiler('checkUrlWithModel');
        
        callback({
          is_phishing: false,
          probability: 0,
          reasons: ["Не удалось проверить с помощью модели"],
          source: "error",
          score: 100,
          binary_result: "БЕЗОПАСНО"
        });
      }
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при проверке URL:', error);
    endProfiler('checkUrlWithModel');
    
    callback({
      is_phishing: false,
      probability: 0,
      reasons: ["Произошла ошибка при проверке"],
      source: "error",
      score: 100,
      binary_result: "БЕЗОПАСНО"
    });
  }
}

/**
 * Проверяет валидность API ключа Google Safe Browsing
 * @param {string} apiKey - API ключ для проверки
 * @param {Function} callback - Функция обратного вызова
 */
function validateGoogleSafeBrowsingApiKey(apiKey, callback) {
  if (!apiKey) {
    callback({ valid: false, reason: "Ключ не указан" });
    return;
  }
  
  // Тестовый запрос к Google Safe Browsing API
  const url = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  const payload = {
    client: {
      clientId: "CorgPhish",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        { url: "https://example.com" }
      ]
    }
  };
  
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (response.status === 200) {
      // API ключ валиден
      isApiKeyValid = true;
      gsbApiKey = apiKey;
      chrome.storage.local.set({ 'gsb_api_key_valid': true });
      callback({ valid: true });
    } else if (response.status === 400) {
      // Ошибка в запросе, но ключ может быть действительным
      isApiKeyValid = true;
      gsbApiKey = apiKey;
      chrome.storage.local.set({ 'gsb_api_key_valid': true });
      callback({ valid: true });
    } else {
      // Ключ недействителен
      isApiKeyValid = false;
      chrome.storage.local.set({ 'gsb_api_key_valid': false });
      callback({ valid: false, reason: `Ошибка API: ${response.status}` });
    }
  })
  .catch(error => {
    console.error('[CorgPhish] Ошибка при проверке API ключа:', error);
    isApiKeyValid = false;
    chrome.storage.local.set({ 'gsb_api_key_valid': false });
    callback({ valid: false, reason: "Ошибка сети" });
  });
}

/**
 * Проверяет URL через Google Safe Browsing API
 * @param {string} url - URL для проверки
 * @param {Function} callback - Функция обратного вызова
 */
function checkWithGoogleSafeBrowsing(url, callback) {
  if (!gsbApiKey || !isApiKeyValid) {
    console.error('[CorgPhish] API ключ Google Safe Browsing не настроен или недействителен');
    callback({
      is_phishing: false,
      probability: 0.5,
      reasons: ["Google Safe Browsing API недоступен: не настроен API ключ"],
      source: "error",
      score: 50,
      binary_result: "НЕИЗВЕСТНО"
    });
    return;
  }
  
  console.log('[CorgPhish] Проверка через Google Safe Browsing API');
  
  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${gsbApiKey}`;
  const payload = {
    client: {
      clientId: "CorgPhish",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: [
        "MALWARE", 
        "SOCIAL_ENGINEERING", 
        "UNWANTED_SOFTWARE", 
        "POTENTIALLY_HARMFUL_APPLICATION"
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [
        { url: url }
      ]
    }
  };
  
  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    if (data && data.matches && data.matches.length > 0) {
      // URL опасен
      const threats = data.matches.map(match => match.threatType).join(", ");
      callback({
        is_phishing: true,
        probability: 0.95,
        reasons: [`Google Safe Browsing обнаружил угрозу: ${threats}`],
        source: "google_safe_browsing",
        score: 5,
        binary_result: "ФИШИНГ"
      });
    } else {
      // URL безопасен
      callback({
        is_phishing: false,
        probability: 0.05,
        reasons: ["Не обнаружено угроз через Google Safe Browsing"],
        source: "google_safe_browsing",
        score: 95,
        binary_result: "БЕЗОПАСНО"
      });
    }
  })
  .catch(error => {
    console.error('[CorgPhish] Ошибка при проверке через Google Safe Browsing:', error);
    callback({
      is_phishing: false,
      probability: 0.5,
      reasons: ["Ошибка при проверке через Google Safe Browsing"],
      source: "error",
      score: 50,
      binary_result: "НЕИЗВЕСТНО"
    });
  });
}

/**
 * Выполняет комбинированный анализ URL
 * @param {string} url - URL для проверки
 * @param {Function} callback - Функция обратного вызова
 */
function combinedAnalysis(url, callback) {
  // Проверяем, доступен ли Google Safe Browsing
  if (!gsbApiKey || !isApiKeyValid) {
    console.warn('[CorgPhish] Google Safe Browsing недоступен для комбинированного анализа. Используем только CorgPhish.');
    // Если GSB недоступен, используем только CorgPhish
    if (typeof predictXGBoost !== 'undefined' && typeof extractFeatures !== 'undefined') {
      const features = extractFeatures(url);
      const prediction = predictXGBoost(features);
      callback(prediction);
    } else {
      callback({
        is_phishing: false,
        probability: 0.5,
        reasons: ["Модели недоступны"],
        source: "error",
        score: 50,
        binary_result: "НЕИЗВЕСТНО"
      });
    }
    return;
  }
  
  // Запускаем проверку через CorgPhish
  let corgphishResult = null;
  try {
    if (typeof predictXGBoost !== 'undefined' && typeof extractFeatures !== 'undefined') {
      const features = extractFeatures(url);
      corgphishResult = predictXGBoost(features);
    } else {
      console.warn('[CorgPhish] Модель CorgPhish недоступна');
      corgphishResult = {
        is_phishing: false,
        probability: 0.5,
        reasons: ["Модель CorgPhish недоступна"],
        source: "error",
        score: 50,
        binary_result: "НЕИЗВЕСТНО"
      };
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при анализе через CorgPhish:', error);
    corgphishResult = {
      is_phishing: false,
      probability: 0.5,
      reasons: ["Ошибка при анализе через CorgPhish"],
      source: "error",
      score: 50,
      binary_result: "НЕИЗВЕСТНО"
    };
  }
  
  // Запускаем проверку через Google Safe Browsing
  checkWithGoogleSafeBrowsing(url, function(gsbResult) {
    // Комбинируем результаты
    if (gsbResult.is_phishing) {
      // Если GSB считает URL фишинговым, принимаем это как основной результат
      callback({
        is_phishing: true,
        probability: Math.max(corgphishResult.probability, gsbResult.probability),
        reasons: [
          ...gsbResult.reasons,
          ...(corgphishResult.is_phishing ? corgphishResult.reasons : [])
        ],
        source: "combined",
        score: Math.min(corgphishResult.score, gsbResult.score),
        binary_result: "ФИШИНГ"
      });
    } else if (corgphishResult.is_phishing) {
      // Если CorgPhish считает URL фишинговым, но GSB нет, больше доверяем CorgPhish
      callback({
        is_phishing: true,
        probability: corgphishResult.probability * 0.9, // Небольшое снижение вероятности
        reasons: [
          ...corgphishResult.reasons,
          "Google Safe Browsing не обнаружил угроз"
        ],
        source: "combined",
        score: corgphishResult.score + 5, // Небольшое повышение оценки
        binary_result: "ФИШИНГ"
      });
    } else {
      // Оба сервиса считают URL безопасным
      callback({
        is_phishing: false,
        probability: Math.min(corgphishResult.probability, gsbResult.probability),
        reasons: [
          "CorgPhish не обнаружил признаков фишинга",
          "Google Safe Browsing не обнаружил угроз"
        ],
        source: "combined",
        score: Math.max(corgphishResult.score, gsbResult.score),
        binary_result: "БЕЗОПАСНО"
      });
    }
  });
}

// -----------------------------------------------------
// Основная функция классификации
// -----------------------------------------------------

/**
 * Классифицирует страницу на основе извлеченных признаков и проверки домена
 * @param {number} tabId - ID вкладки
 * @param {object} result - Результаты извлечения признаков
 * @param {string} url - URL страницы
 * @param {boolean} [highPriority=false] - Флаг высокого приоритета для быстрой проверки
 */
async function classify(tabId, result, url, highPriority = false) {
  console.log('[CorgPhish] Классификация для URL:', url, 'приоритет:', highPriority ? 'высокий' : 'обычный');
  
  // Проверяем, есть ли URL
  if (!url) {
    console.error('[CorgPhish] Пустой URL, отмена классификации');
    return;
  }

  try {
    // Выполняем проверку URL с помощью модели
    checkUrlWithModel(url, function(modelResult) {
      console.log('[CorgPhish] Результат проверки модели:', modelResult);
      
      // Добавляем URL к результатам для отслеживания
      modelResult.url = url;
      
      // Сохраняем результаты для этой вкладки
      isPhish[tabId] = modelResult.is_phishing;
      legitimatePercents[tabId] = modelResult.score;
      results[tabId] = modelResult;
      
      // Проверяем домен дополнительно, если не из белого списка и не приоритетная проверка
      if (modelResult.source !== "whitelist" && modelResult.source !== "whitelist_fast" && !highPriority) {
        try {
          const domainCheckResult = checkDomain(url);
          domainResults[tabId] = domainCheckResult;
          
          // Сохраняем результаты в storage
          saveResults();
          
          // Отправляем уведомление, если сайт фишинговый
          if (modelResult.is_phishing) {
            notifyUser(tabId, modelResult);
          }
        } catch (error) {
          console.error('[CorgPhish] Ошибка при проверке домена:', error);
          
          // Используем результаты только от модели
          domainResults[tabId] = {
            status: modelResult.is_phishing ? 'phishing' : 'safe',
            message: modelResult.reasons[0] || 'Не удалось проверить домен',
            domain: url
          };
          
          saveResults();
          
          if (modelResult.is_phishing) {
            notifyUser(tabId, modelResult);
          }
        }
      } else {
        // Для сайтов из белого списка или при приоритетной проверке используем простой статус
        domainResults[tabId] = {
          status: modelResult.is_phishing ? 'phishing' : 'official',
          message: modelResult.reasons[0] || 'Сайт проверен',
          domain: url
        };
        
        // Сохраняем результаты в storage
        saveResults();
        
        // Отправляем уведомление, если сайт фишинговый
        if (modelResult.is_phishing) {
          notifyUser(tabId, modelResult);
        }
      }
    }, highPriority); // Передаем флаг приоритета в checkUrlWithModel
  } catch (error) {
    console.error('[CorgPhish] Ошибка при классификации:', error);
  }
}

/**
 * Сохраняет результаты проверки в хранилище
 */
function saveResults() {
  chrome.storage.local.set({
    'results': results, 
    'legitimatePercents': legitimatePercents, 
    'isPhish': isPhish,
    'domainResults': domainResults,
    'analysisMethod': analysisMethod,
    'gsb_api_key': gsbApiKey,
    'gsb_api_key_valid': isApiKeyValid
  });
}

/**
 * Отправляет уведомление пользователю о фишинговом сайте
 * @param {number} tabId - ID вкладки
 * @param {object} modelResult - Результат проверки
 */
function notifyUser(tabId, modelResult) {
  // Формируем сообщение на основе причин
  let message = "Внимание! Возможно это фишинговый сайт.";
  
  // Отправляем уведомление в контентный скрипт
  chrome.tabs.sendMessage(tabId, {
    action: "alert_user",
    message: message,
    reasons: modelResult.reasons,
    score: modelResult.score,
    binary_result: modelResult.binary_result
  }).catch(error => {
    console.error("Ошибка при отправке сообщения:", error);
  });
}

/**
 * Записывает сообщение в лог-файл (для отладки)
 * @param {string} message - Сообщение для записи
 */
function logToFile(message) {
  try {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    console.log('[CorgPhish-Log] ' + logMessage);
    
    // Сохраняем также в локальное хранилище для возможности просмотра через интерфейс
    chrome.storage.local.get('debug_logs', (result) => {
      const logs = result.debug_logs || [];
      logs.push(logMessage);
      
      // Ограничиваем количество логов для экономии места
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      chrome.storage.local.set({ 'debug_logs': logs });
    });
  } catch (error) {
    console.error('[CorgPhish] Ошибка при записи лога:', error);
  }
}

// -----------------------------------------------------
// Обработчики событий Service Worker
// -----------------------------------------------------

// Слушаем событие установки
self.addEventListener('install', event => {
  console.log('CorgPhish: Service Worker установлен');
  self.skipWaiting(); // Гарантирует, что новая версия SW сразу начнет работать
});

// Слушаем событие активации
self.addEventListener('activate', event => {
  console.log('CorgPhish: Service Worker активирован');
  
  // Записываем в лог для отладки
  logToFile('Service Worker активирован');
  
  event.waitUntil(clients.claim()); // Гарантирует немедленный контроль SW над страницами
  
  // Загружаем сохраненные настройки
  chrome.storage.local.get(['analysisMethod', 'gsb_api_key', 'gsb_api_key_valid'], function(result) {
    // Загружаем метод анализа
    if (result.analysisMethod) {
      analysisMethod = result.analysisMethod;
      console.log(`[CorgPhish] Загружен метод анализа: ${analysisMethod}`);
      logToFile(`Загружен метод анализа: ${analysisMethod}`);
    }
    
    // Загружаем API ключ и его статус
    if (result.gsb_api_key) {
      gsbApiKey = result.gsb_api_key;
      console.log('[CorgPhish] Загружен API ключ Google Safe Browsing');
      logToFile('Загружен API ключ Google Safe Browsing');
      
      // Загружаем статус валидности ключа
      if (result.gsb_api_key_valid !== undefined) {
        isApiKeyValid = result.gsb_api_key_valid;
        console.log(`[CorgPhish] Статус API ключа: ${isApiKeyValid ? 'валиден' : 'невалиден'}`);
        logToFile(`Статус API ключа: ${isApiKeyValid ? 'валиден' : 'невалиден'}`);
      }
    }
  });
});