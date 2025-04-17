/**
 * Тестовый скрипт для проверки модели CorgPhish
 */

// Импортируем функции
const xgboostPath = './dist/browser_extension/js/xgboost_model.js';
const domainPath = './dist/browser_extension/js/domain_checker.js';

// Функции для эмуляции URL
class URL {
  constructor(url) {
    this.url = url;
    const urlParts = url.split('://');
    this.protocol = urlParts[0];
    
    const withoutProtocol = urlParts[1] || '';
    const pathParts = withoutProtocol.split('/');
    
    this.hostname = pathParts[0];
    this.pathname = '/' + (pathParts.slice(1).join('/') || '');
    
    const queryParts = this.pathname.split('?');
    if (queryParts.length > 1) {
      this.pathname = queryParts[0];
      this.searchParams = {
        toString: () => queryParts[1],
        get: (key) => {
          const params = queryParts[1].split('&');
          for (const param of params) {
            const [k, v] = param.split('=');
            if (k === key) return v;
          }
          return null;
        }
      };
    } else {
      this.searchParams = { toString: () => '', get: () => null };
    }
  }
}

// Если модуль запускается в Node.js, добавляем глобальный конструктор URL
if (typeof global !== 'undefined' && typeof global.URL === 'undefined') {
  global.URL = URL;
  global.console = console;
}

// Функция для извлечения признаков
function extractFeatures(url) {
  try {
    // Создадим URL-объект для парсинга
    const urlObj = new URL(url);
    
    // Базовые признаки
    const features = {
      // Длина URL
      url_length: url.length,
      
      // Количество субдоменов
      subdomain_count: urlObj.hostname.split('.').length - 1,
      
      // Наличие IP-адреса
      has_ip: /\d+\.\d+\.\d+\.\d+/.test(urlObj.hostname) ? 1 : 0,
      
      // Количество специальных символов
      special_chars: (url.match(/[@#$%^&*()+=\[\]{}|\\:<>?]/g) || []).length,
      
      // Наличие "http" в пути
      http_in_path: urlObj.pathname.includes('http') ? 1 : 0,
      
      // Длина домена
      domain_length: urlObj.hostname.length,
      
      // Количество цифр в домене
      domain_digits: (urlObj.hostname.match(/\d/g) || []).length,
      
      // Наличие символа @ в URL
      has_at_symbol: url.includes('@') ? 1 : 0,
      
      // Наличие кириллицы в URL
      has_cyrillic: /[а-яА-Я]/.test(url) ? 1 : 0,
      
      // Количество точек в URL
      dot_count: (url.match(/\./g) || []).length,
      
      // Количество параметров запроса
      query_params_count: urlObj.searchParams.toString().length > 0 ? 
                          urlObj.searchParams.toString().split('&').length : 0,
      
      // Длина пути
      path_length: urlObj.pathname.length,
      
      // Наличие "secure", "account", "login", "signin" в URL
      has_security_terms: /secure|account|login|signin|password|user|verify|update|access/i.test(url) ? 1 : 0,
      
      // Основной домен (без www и поддоменов)
      base_domain: urlObj.hostname.replace(/^www\./i, '').split('.').slice(-2).join('.'),
      
      // Полный домен для дополнительных проверок
      full_domain: urlObj.hostname,
      
      // Содержит ли URL редирект
      has_redirect: /redirect|redir|url|\?to=|goto/i.test(url) ? 1 : 0,
      
      // Наличие нескольких доменов в URL
      multiple_domains: (url.match(/\.[a-z]{2,6}\//ig) || []).length > 1 ? 1 : 0,
      
      // Протокол
      is_https: urlObj.protocol === 'https:' ? 1 : 0
    };
    
    return features;
  } catch (error) {
    console.error('[CorgPhish] Ошибка при извлечении признаков:', error);
    return {};
  }
}

// Список официальных доменов крупных компаний
const officialDomains = [
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
const criticalDomains = [
  "sberbank.ru", "tinkoff.ru", "vtb.ru", "alfabank.ru", "gazprombank.ru", 
  "gosuslugi.ru", "nalog.ru", "pfr.gov.ru", "paypal.com", "apple.com", 
  "google.com", "mail.ru", "yandex.ru", "vk.com", "facebook.com"
];

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
 * Проверяет, является ли домен официальным
 * @param {string} domain - Домен для проверки
 * @returns {boolean} - Результат проверки
 */
function isOfficialDomain(domain) {
  if (!domain) return false;
  
  // Очищаем домен от www.
  const cleanDomain = domain.replace(/^www\./i, '');
  
  // Проверяем точное совпадение с официальными доменами
  return officialDomains.some(officialDomain => {
    // Точное совпадение с доменом или поддоменом официального домена
    return cleanDomain === officialDomain || 
           cleanDomain.endsWith('.' + officialDomain);
  });
}

/**
 * Упрощенное предсказание на основе признаков
 * (Эмуляция модели XGBoost)
 * @param {object} features - Признаки URL
 * @returns {object} - Результат предсказания
 */
function predictXGBoost(features) {
  try {
    // Сначала проверяем, является ли домен официальным
    if (features.base_domain && isOfficialDomain(features.base_domain)) {
      // Если у официального домена в URL есть редирект, это может быть фишинг
      if (features.has_redirect === 1) {
        return {
          is_phishing: true,
          probability: 0.75,
          reasons: [
            "Подозрительный редирект с официального домена",
            "Это может быть попытка обмана через перенаправление"
          ],
          source: "redirect_check",
          score: 25,
          binary_result: "ФИШИНГ"
        };
      }
      
      return {
        is_phishing: false,
        probability: 0.01,
        reasons: ["Официальный домен крупной компании"],
        source: "whitelist",
        score: 99,
        binary_result: "БЕЗОПАСНО"
      };
    }
    
    // Проверяем схожесть домена с критическими доменами
    const similarityCheck = checkDomainSimilarity(features.full_domain);
    if (similarityCheck) {
      return {
        is_phishing: true,
        probability: 0.95,
        reasons: [similarityCheck.reason, "Возможная попытка имитации известного сайта"],
        source: "domain_similarity",
        score: 5,
        binary_result: "ФИШИНГ"
      };
    }
    
    // Подсчитываем "подозрительные" признаки
    let suspiciousCount = 0;
    const reasons = [];
    
    // Критически подозрительные признаки (вес 3) - сразу определяем как фишинг
    const criticalSuspicionFeatures = [
      { condition: features.http_in_path === 1 && features.is_https === 1, reason: "URL содержит 'http' в пути безопасного соединения" },
      { condition: features.has_at_symbol === 1, reason: "URL содержит символ @" },
      { condition: features.multiple_domains === 1, reason: "URL содержит несколько доменов" }
    ];
    
    // Проверяем критически подозрительные признаки
    for (const feature of criticalSuspicionFeatures) {
      if (feature.condition) {
        return {
          is_phishing: true,
          probability: 0.95,
          reasons: [feature.reason, "Критически подозрительный признак фишинга"],
          source: "critical_feature",
          score: 5,
          binary_result: "ФИШИНГ"
        };
      }
    }
    
    // Высоко подозрительные признаки (вес 2)
    const highSuspicionFeatures = [
      { condition: features.has_ip === 1, reason: "URL содержит IP-адрес вместо домена" },
      { condition: features.has_redirect === 1, reason: "URL содержит параметр перенаправления" },
      { condition: features.is_https === 0, reason: "Сайт не использует безопасное соединение (HTTPS)" }
    ];
    
    // Средне подозрительные признаки (вес 1)
    const mediumSuspicionFeatures = [
      { condition: features.url_length > 100, reason: "Слишком длинный URL" },
      { condition: features.subdomain_count > 3, reason: "Необычно большое количество субдоменов" },
      { condition: features.special_chars > 5, reason: "Много специальных символов в URL" },
      { condition: features.has_cyrillic === 1, reason: "URL содержит кириллические символы" },
      { condition: features.dot_count > 5, reason: "Необычно большое количество точек в URL" },
      { condition: features.query_params_count > 7, reason: "Слишком много параметров в URL" },
      { condition: features.has_security_terms === 1, reason: "URL содержит слова, связанные с безопасностью или аутентификацией" },
      { condition: features.domain_digits > 4, reason: "Много цифр в домене" }
    ];
    
    // Проверяем высоко подозрительные признаки
    for (const feature of highSuspicionFeatures) {
      if (feature.condition) {
        suspiciousCount += 2; // Вес 2
        reasons.push(feature.reason);
      }
    }
    
    // Проверяем средне подозрительные признаки
    for (const feature of mediumSuspicionFeatures) {
      if (feature.condition) {
        suspiciousCount += 1; // Вес 1
        reasons.push(feature.reason);
      }
    }
    
    // Рассчитываем вероятность фишинга (0-1, где 1 - высокая вероятность фишинга)
    // Используем пороговые значения для четкой бинарной классификации
    let phishingProbability = 0;
    let binaryResult = "БЕЗОПАСНО";
    
    if (suspiciousCount >= 5) {
      phishingProbability = 0.95;
      binaryResult = "ФИШИНГ";
    } else if (suspiciousCount >= 3) {
      phishingProbability = 0.8;
      binaryResult = "ФИШИНГ";
    } else if (suspiciousCount >= 2) {
      phishingProbability = 0.7;
      binaryResult = "ФИШИНГ";
    } else if (suspiciousCount >= 1) {
      phishingProbability = 0.3;
      binaryResult = "БЕЗОПАСНО";
    } else {
      phishingProbability = 0.05;
      binaryResult = "БЕЗОПАСНО";
    }
    
    // Преобразуем оценку в более понятный формат
    const score = Math.round((1 - phishingProbability) * 100);
    const isPhishing = binaryResult === "ФИШИНГ";
    
    // Используем эвристику если нет причин, но высокая вероятность
    if (reasons.length === 0 && isPhishing) {
      reasons.push("Общая структура URL подозрительна");
    }
    
    // Если нет подозрительных причин
    if (reasons.length === 0) {
      reasons.push("Нет обнаруженных признаков фишинга");
    }
    
    return {
      is_phishing: isPhishing,
      probability: phishingProbability,
      reasons: reasons,
      source: "xgboost_emulation",
      score: score,
      binary_result: binaryResult
    };
  } catch (error) {
    console.error('[CorgPhish] Ошибка при предсказании:', error);
    return {
      is_phishing: false,
      probability: 0.5,
      reasons: ["Произошла ошибка при анализе"],
      source: "error",
      score: 50,
      binary_result: "НЕИЗВЕСТНО"
    };
  }
}

// Тестовые URL для проверки
const testUrls = [
  'https://www.google.com',                      // Официальный сайт (безопасный)
  'https://login.google.com',                    // Официальный сайт с безопасным логином
  'https://drive.google.com',                    // Официальный поддомен
  'https://mail.google.com',                     // Официальный поддомен
  'https://login.goggle.com',                    // Опечатка в домене (фишинг)
  'https://gooogle.com',                         // Опечатка в домене (фишинг)
  'https://www.google.com.phishing.com',         // Попытка маскировки под официальный домен (фишинг)
  'https://secure-payment.paypalc.com/login',    // Фишинг PayPal с опечаткой
  'https://www.sberbank.ru',                     // Официальный банк
  'https://online.sberbank.ru',                  // Официальный банк (подддомен)
  'http://192.168.1.1/admin',                    // IP-адрес (подозрительно)
  'https://login-sberbank.ru',                   // Поддельный банк (фишинг)
  'https://sberbank-verification.site',          // Фишинг
  'https://mail.ru@phishing.ru',                 // URL с @ (фишинг)
  'https://www.gosuslugi.ru',                    // Госуслуги (безопасно)
  'https://esia.gosuslugi.ru',                   // Госуслуги (безопасно)
  'https://gosuslugi-verify.ru',                 // Поддельный госуслуги (фишинг)
  'https://vk.com',                              // Соцсеть (безопасно)
  'https://vk.com/login?redirect=http://evil.com', // Подозрительный редирект (фишинг)
  'https://wwwvk.com',                           // Опечатка без точки (фишинг)
  'http://yandex.ru',                            // HTTP вместо HTTPS (подозрительно)
  'http://tinkoff-online.com',                   // Поддельный банк (фишинг)
  'https://sb6erbank.ru',                        // Злонамеренная опечатка (фишинг)
  'https://sb6bank.ru',                          // Похожий на Сбербанк (фишинг)
  'https://verification-account-google.com'      // Фишинг с использованием ключевых слов (фишинг)
];

// Функция для тестирования URL
function testUrl(url) {
  console.log(`\n\n----- Тестирование URL: ${url} -----`);
  
  try {
    // Получаем признаки URL
    const features = extractFeatures(url);
    console.log("Признаки URL:");
    console.log(features);
    
    // Проверяем схожесть домена
    const similarity = checkDomainSimilarity(features.full_domain);
    if (similarity) {
      console.log("\nРезультат проверки домена:");
      console.log(similarity);
    }
    
    // Делаем предсказание
    const result = predictXGBoost(features);
    
    // Выводим результат
    console.log("\nРезультат классификации:");
    console.log(`Вердикт: ${result.binary_result}`);
    console.log(`Фишинг: ${result.is_phishing ? 'Да' : 'Нет'}`);
    console.log(`Оценка безопасности: ${result.score}%`);
    console.log(`Вероятность фишинга: ${Math.round(result.probability * 100)}%`);
    console.log(`Причины:`);
    result.reasons.forEach(reason => console.log(`- ${reason}`));
    
    return result;
  } catch (error) {
    console.error(`Ошибка при тестировании URL ${url}:`, error);
    return null;
  }
}

// Тестируем все URL
console.log("=== НАЧАЛО ТЕСТИРОВАНИЯ МОДЕЛИ CORGPHISH ===");

const results = {
  safe: 0,
  phishing: 0,
  error: 0
};

testUrls.forEach(url => {
  const result = testUrl(url);
  
  if (result) {
    if (result.is_phishing) {
      results.phishing++;
    } else {
      results.safe++;
    }
  } else {
    results.error++;
  }
});

console.log("\n\n=== ИТОГИ ТЕСТИРОВАНИЯ ===");
console.log(`Всего URL проверено: ${testUrls.length}`);
console.log(`Безопасных: ${results.safe}`);
console.log(`Фишинговых: ${results.phishing}`);
console.log(`Ошибок: ${results.error}`);
console.log("=============================="); 