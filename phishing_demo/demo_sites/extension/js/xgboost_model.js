/**
 * xgboost_model.js - Эмуляция модели XGBoost для расширения CorgPhish
 * 
 * Этот файл содержит функции для работы с моделью машинного обучения
 * или её эмуляцию, если настоящая модель недоступна.
 */

console.log('[CorgPhish] Загрузка модуля XGBoost');

// Инициализируем общее хранилище данных, если оно еще не существует
if (!self.CorgPhishData) {
  self.CorgPhishData = {
    initialized: false
  };
}

// Список официальных доменов крупных компаний
self.CorgPhishData.officialDomains = [
  "google.com", "google.ru", "youtube.com", "facebook.com", "instagram.com", "twitter.com", 
  "vk.com", "ok.ru", "yandex.ru", "mail.ru", "rambler.ru", "yahoo.com", 
  "amazon.com", "netflix.com", "microsoft.com", "apple.com", "linkedin.com",
  "tinkoff.ru", "sberbank.ru", "vtb.ru", "alfabank.ru", "gazprombank.ru", 
  "raiffeisen.ru", "rshb.ru", "gpb.ru", "tbank.ru", "mtsbank.ru",
  "wikipedia.org", "reddit.com", "twitch.tv", "spotify.com", "telegram.org",
  "whatsapp.com", "skype.com", "zoom.us", "github.com", "stackoverflow.com",
  "gosuslugi.ru", "mos.ru", "nalog.ru", "pfr.gov.ru", "pfrf.ru", "gu.spb.ru"
];

// Критичные домены, для которых особенно важно точное определение фишинга
self.CorgPhishData.criticalDomains = [
  "sberbank.ru", "tinkoff.ru", "vtb.ru", "alfabank.ru", "gazprombank.ru", 
  "gosuslugi.ru", "nalog.ru", "pfr.gov.ru", "paypal.com", "apple.com", 
  "google.com", "mail.ru", "yandex.ru", "vk.com", "facebook.com",
  // Государственные порталы
  "gosuslugi.ru", 
  "www.gosuslugi.ru",
  "beta.gosuslugi.ru",
  "esia.gosuslugi.ru",
  "gu.spb.ru",
  "login.mos.ru",
  "www.mos.ru",
  "mos.ru",
  "moskva.gosuslugi.ru",
  
  // Правительственные сайты
  "gov.ru",
  "kremlin.ru",
  "government.ru",
  "council.gov.ru",
  "president-sovet.ru",
  "duma.gov.ru",
  "мвд.рф",
  "минобрнауки.рф",
  "минпросвещения.рф",
  ".рф",
  
  // Министерства и ведомства
  "nalog.ru",
  "nalog.gov.ru",
  "pfr.gov.ru",
  "mchs.gov.ru",
  "minzdrav.gov.ru",
  "roszdravnadzor.ru",
  "mid.ru",
  "fsb.ru",
  "svr.gov.ru",
  "fstec.ru",
  "genproc.gov.ru",
  "mil.ru"
];

// Локальные ссылки на списки доменов для использования в функциях этого модуля
const officialDomains = self.CorgPhishData.officialDomains;
const criticalDomains = self.CorgPhishData.criticalDomains;

// Отмечаем, что модуль инициализирован
self.CorgPhishData.initialized = true;

/**
 * Извлекает признаки из URL для анализа
 * @param {string} url - URL для анализа
 * @returns {object} - Объект с признаками
 */
function extractFeatures(url) {
  try {
    // Создадим URL-объект для парсинга
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    // Оптимизированные проверки
    const hasIpRegex = /\d+\.\d+\.\d+\.\d+/;
    const hasIp = hasIpRegex.test(hostname) ? 1 : 0;
    
    // Более эффективный поиск специальных символов
    const specialCharsCount = (url.match(/[@#$%^&*()+=\[\]{}|\\:<>?]/g) || []).length;
    
    // Более быстрая проверка subdomains
    const subdomains = hostname.split('.');
    const subdomainCount = subdomains.length - 1;
    
    // Простые константы
    const hasAtSymbol = url.includes('@') ? 1 : 0;
    const hasHttpInPath = pathname.includes('http') ? 1 : 0;
    const hasCyrillic = /[а-яА-Я]/.test(url) ? 1 : 0;
    const hasSecurityTerms = /secure|account|login|signin|password|user|verify|update|access/i.test(url) ? 1 : 0;
    
    // Простые расчеты
    const dotCount = (url.match(/\./g) || []).length;
    const domainDigits = (hostname.match(/\d/g) || []).length;
    
    // Для параметров запроса проверяем длину перед разбивкой
    const searchParams = urlObj.search;
    const queryParamsCount = searchParams.length > 1 ? 
                            searchParams.slice(1).split('&').length : 0;
    
    // Базовая часть домена (без www и поддоменов)
    const baseDomain = hostname.replace(/^www\./i, '').split('.').slice(-2).join('.');
    
    // Проверки на редиректы и несколько доменов (оптимизированные)
    const hasRedirect = /redirect|redir|url|\?to=|goto/i.test(url) ? 1 : 0;
    const multipleDomains = (url.match(/\.[a-z]{2,6}\//ig) || []).length > 1 ? 1 : 0;
    
    // Собираем все признаки в объект
    return {
      url_length: url.length,
      subdomain_count: subdomainCount,
      has_ip: hasIp,
      special_chars: specialCharsCount,
      http_in_path: hasHttpInPath,
      domain_length: hostname.length,
      domain_digits: domainDigits,
      has_at_symbol: hasAtSymbol,
      has_cyrillic: hasCyrillic,
      dot_count: dotCount,
      query_params_count: queryParamsCount,
      path_length: pathname.length,
      has_security_terms: hasSecurityTerms,
      base_domain: baseDomain,
      full_domain: hostname,
      has_redirect: hasRedirect,
      multiple_domains: multipleDomains,
      is_https: urlObj.protocol === 'https:' ? 1 : 0
    };
  } catch (error) {
    console.error('[CorgPhish] Ошибка при извлечении признаков:', error);
    return {};
  }
}

/**
 * Вычисляет расстояние Левенштейна между двумя строками
 * @param {string} a - Первая строка
 * @param {string} b - Вторая строка
 * @returns {number} Расстояние Левенштейна
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Инициализация
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  // Заполнение матрицы
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Замена
          matrix[i][j - 1] + 1,     // Вставка
          matrix[i - 1][j] + 1      // Удаление
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Проверяет, похож ли домен на один из критически важных доменов
 * @param {string} domain - Домен для проверки
 * @returns {object|null} - Результат проверки или null, если домен не похож
 */
function checkDomainSimilarity(domain) {
  if (!domain) return null;
  
  // Убираем www и другие распространенные префиксы
  const cleanDomain = domain.replace(/^(www\.|m\.|login\.|online\.|account\.|secure\.|mail\.)/i, '');
  
  for (const criticalDomain of criticalDomains) {
    // Проверяем, не содержит ли домен критический домен как часть (без точки)
    // например, "sberbankinfo.ru" содержит "sberbank" но не является поддоменом
    if (cleanDomain !== criticalDomain && 
        cleanDomain.includes(criticalDomain.split('.')[0]) && 
        !cleanDomain.endsWith('.' + criticalDomain)) {
      return {
        similar_to: criticalDomain,
        reason: `Домен содержит название ${criticalDomain.split('.')[0]} в своем имени`
      };
    }
    
    // Проверяем расстояние Левенштейна для похожих доменов
    // например "gooogle.com" vs "google.com" или "sbirbang.ru" vs "sberbank.ru"
    const baseDomainA = cleanDomain.split('.')[0];
    const baseDomainB = criticalDomain.split('.')[0];
    
    // Если базовая часть домена похожа но не идентична
    if (baseDomainA !== baseDomainB) {
      const distance = levenshteinDistance(baseDomainA, baseDomainB);
      const maxLength = Math.max(baseDomainA.length, baseDomainB.length);
      const similarity = (1 - distance / maxLength) * 100;
      
      // Если сходство более 70%, это подозрительно
      if (similarity > 70) {
        return {
          similar_to: criticalDomain,
          reason: `Домен похож на ${criticalDomain} (${Math.round(similarity)}% сходства)`
        };
      }
    }
  }
  
  return null;
}

/**
 * Проверяет, является ли домен официальным (из белого списка)
 * @param {string} url - URL для проверки
 * @returns {boolean} True, если домен официальный
 */
function isOfficialDomain(url) {
  try {
    // Извлекаем домен из URL
    const urlObj = new URL(url);
    let domain = urlObj.hostname.toLowerCase();
    
    // Удаляем www. если он есть
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    // Проверяем точное совпадение домена с официальными доменами
    for (const officialDomain of officialDomains) {
      // Точное совпадение или поддомен официального домена
      const lowerOfficial = officialDomain.toLowerCase();
      if (domain === lowerOfficial || domain.endsWith('.' + lowerOfficial)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[CorgPhish] Ошибка при проверке официального домена:', error);
    return false;
  }
}

/**
 * Предсказывает, является ли URL фишинговым на основе извлеченных признаков.
 * @param {Object} features - Объект с признаками URL.
 * @returns {Object} Результат предсказания.
 */
function predictXGBoost(features) {
  try {
    // Проверка на официальные домены (белый список)
    if (isOfficialDomain(features.url)) {
      return {
        is_phishing: false,
        probability: 0,
        reasons: ['Официальный домен из белого списка'],
        source: 'whitelist',
        score: 100,
        binary_result: "БЕЗОПАСНО"
      };
    }
    
    // Критические признаки фишинга, которые сразу дают сильный сигнал
    const criticalPhishingFeatures = [];
    
    // Проверка наличия IP-адреса вместо домена
    if (features.has_ip) {
      criticalPhishingFeatures.push('URL содержит IP-адрес вместо домена');
    }
    
    // Проверка наличия символа '@' в URL
    if (features.has_at_symbol) {
      criticalPhishingFeatures.push('URL содержит символ @');
    }
    
    // Проверка наличия небезопасного протокола или редиректа
    if (features.http_in_path) {
      criticalPhishingFeatures.push('URL содержит перенаправление HTTP в пути');
    }
    
    // Проверка наличия кириллицы в URL (часто используется для обмана)
    if (features.has_cyrillic) {
      criticalPhishingFeatures.push('URL содержит кириллические символы');
    }
    
    // Проверка наличия подозрительных терминов безопасности
    if (features.has_security_terms) {
      criticalPhishingFeatures.push('URL содержит термины безопасности (возможная имитация)');
    }
    
    // Проверка схожести с критическими доменами (банки, платежные системы и т.д.)
    const similarToCritical = checkSimilarityToCriticalDomains(features.domain);
    if (similarToCritical.suspicious) {
      criticalPhishingFeatures.push(`Домен похож на критический домен: ${similarToCritical.domain} (${similarToCritical.similarity}% схожести)`);
    }
    
    // Если обнаружены критические признаки фишинга, сразу классифицируем как фишинг
    if (criticalPhishingFeatures.length > 0) {
      return {
        is_phishing: true,
        probability: 1.0,
        reasons: criticalPhishingFeatures,
        source: 'critical_features',
        score: 0,
        binary_result: "ФИШИНГ"
      };
    }
    
    // Подозрительные признаки (менее критичные)
    const suspiciousFeatures = [];
    
    // Слишком длинный URL (более 75 символов)
    if (features.url_length > 75) {
      suspiciousFeatures.push(`Длинный URL (${features.url_length} символов)`);
    }
    
    // Большое количество поддоменов
    if (features.subdomain_count > 3) {
      suspiciousFeatures.push(`Много поддоменов (${features.subdomain_count})`);
    }
    
    // Высокое количество спецсимволов
    if (features.special_chars > 5) {
      suspiciousFeatures.push(`Много специальных символов (${features.special_chars})`);
    }
    
    // Большое количество цифр в домене
    if (features.domain_digits > 4 || features.domain_digits / features.domain_length > 0.3) {
      suspiciousFeatures.push(`Много цифр в домене (${features.domain_digits})`);
    }
    
    // Большое количество точек
    if (features.dot_count > 4) {
      suspiciousFeatures.push(`Много точек в URL (${features.dot_count})`);
    }
    
    // Много параметров запроса
    if (features.query_params_count > 4) {
      suspiciousFeatures.push(`Много параметров запроса (${features.query_params_count})`);
    }
    
    // Длинный путь URL
    if (features.path_length > 100) {
      suspiciousFeatures.push(`Длинный путь URL (${features.path_length} символов)`);
    }
    
    // Принятие решения на основе числа подозрительных признаков
    // Для более четкой бинарной классификации
    if (suspiciousFeatures.length >= 2) {
      return {
        is_phishing: true,
        probability: 0.8 + (0.05 * (suspiciousFeatures.length - 2)),
        reasons: suspiciousFeatures,
        source: 'suspicious_features',
        score: Math.max(10, 30 - (suspiciousFeatures.length * 5)),
        binary_result: "ФИШИНГ"
      };
    }
    
    // Если нет подозрительных признаков или их мало, считаем URL безопасным
    return {
      is_phishing: false,
      probability: suspiciousFeatures.length > 0 ? 0.2 : 0,
      reasons: suspiciousFeatures.length > 0 ? suspiciousFeatures : ['Отсутствуют подозрительные признаки'],
      source: 'minimal_risk',
      score: suspiciousFeatures.length > 0 ? 80 : 100,
      binary_result: "БЕЗОПАСНО"
    };
  } catch (error) {
    console.error('[CorgPhish] Ошибка при предсказании:', error);
    // В случае ошибки возвращаем безопасный результат
    return {
      is_phishing: false,
      probability: 0,
      reasons: ['Произошла ошибка при анализе'],
      source: 'error',
      score: 100,
      binary_result: "БЕЗОПАСНО"
    };
  }
}

// Функция для интеграции с Google Safe Browsing API
function checkWithGoogleSafeBrowsing(url, callback) {
  try {
    console.log(`[CorgPhish] Быстрая проверка URL: ${url}`);
    
    // Создаем URL-объект для парсинга
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Быстрая проверка на официальные домены (без полного извлечения признаков)
    if (isOfficialDomain(hostname.replace(/^www\./i, ''))) {
      callback({
        is_phishing: false,
        probability: 0.0,
        reasons: ["Официальный домен из белого списка"],
        source: "whitelist",
        score: 100,
        binary_result: "БЕЗОПАСНО"
      });
      return;
    }
    
    // Быстрая проверка на критические признаки
    if (url.includes('@') || 
        url.includes('http://') || 
        /\d+\.\d+\.\d+\.\d+/.test(hostname)) {
      
      // Определяем причину для сообщения пользователю
      let reason = "Обнаружен признак фишинга";
      if (url.includes('@')) reason = "URL содержит символ @";
      else if (url.includes('http://')) reason = "Небезопасный протокол (HTTP)";
      else if (/\d+\.\d+\.\d+\.\d+/.test(hostname)) reason = "IP-адрес вместо домена";
      
      callback({
        is_phishing: true,
        probability: 1.0,
        reasons: [reason],
        source: "quick_check",
        score: 0,
        binary_result: "ФИШИНГ"
      });
      return;
    }
    
    // Проверка на похожие домены (проще и быстрее полного checkDomainSimilarity)
    for (const domain of criticalDomains) {
      if (hostname.includes(domain.split('.')[0]) && 
          hostname !== domain && 
          !hostname.endsWith('.' + domain)) {
        
        callback({
          is_phishing: true,
          probability: 1.0,
          reasons: [`Домен похож на ${domain}`],
          source: "domain_similarity",
          score: 0,
          binary_result: "ФИШИНГ"
        });
        return;
      }
    }
    
    // Если быстрые проверки не сработали, считаем домен безопасным
    callback({
      is_phishing: false,
      probability: 0.0,
      reasons: ["Быстрая проверка не обнаружила признаков фишинга"],
      source: "quick_check",
      score: 100,
      binary_result: "БЕЗОПАСНО"
    });
  } catch (error) {
    console.error('[CorgPhish] Ошибка при быстрой проверке:', error);
    callback({
      is_phishing: false,
      probability: 0.0,
      reasons: ["Ошибка при быстрой проверке"],
      source: "error",
      score: 100,
      binary_result: "БЕЗОПАСНО"
    });
  }
}

// Функция для комбинирования нескольких методов анализа
function combinedAnalysis(url, callback) {
  try {
    console.log(`[CorgPhish] Комбинированный анализ для URL: ${url}`);
    
    // Быстрая проверка URL на общие признаки фишинга
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // 1. Белый список официальных доменов
    if (isOfficialDomain(hostname.replace(/^www\./i, ''))) {
      callback({
        is_phishing: false,
        probability: 0.0,
        reasons: ["Официальный домен из белого списка"],
        source: "combined_whitelist",
        score: 100,
        binary_result: "БЕЗОПАСНО"
      });
      return;
    }
    
    // 2. Критические признаки фишинга (немедленное решение)
    if (url.includes('@') || 
        url.includes('http://') && !url.includes('https://') || 
        /\d+\.\d+\.\d+\.\d+/.test(hostname)) {
      
      // Определяем причину для сообщения пользователю
      let reason = "Обнаружен признак фишинга";
      if (url.includes('@')) reason = "URL содержит символ @";
      else if (url.includes('http://') && !url.includes('https://')) reason = "Небезопасный протокол (HTTP)";
      else if (/\d+\.\d+\.\d+\.\d+/.test(hostname)) reason = "IP-адрес вместо домена";
      
      callback({
        is_phishing: true,
        probability: 1.0,
        reasons: [reason],
        source: "combined_critical",
        score: 0,
        binary_result: "ФИШИНГ"
      });
      return;
    }
    
    // 3. Извлекаем признаки и запускаем основную модель
    const features = extractFeatures(url);
    const result = predictXGBoost(features);
    
    // Возвращаем результат анализа
    callback(result);
  } catch (error) {
    console.error('[CorgPhish] Ошибка при комбинированном анализе:', error);
    callback({
      is_phishing: false,
      probability: 0.0,
      reasons: ["Ошибка при комбинированном анализе"],
      source: "error",
      score: 100,
      binary_result: "БЕЗОПАСНО"
    });
  }
}

console.log('[CorgPhish] Модуль XGBoost успешно загружен');
