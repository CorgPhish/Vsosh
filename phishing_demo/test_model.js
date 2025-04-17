/**
 * Тестовый скрипт для модели обнаружения фишинга CorgPhish
 * 
 * Этот скрипт позволяет протестировать работу модели на различных URL
 * без необходимости запуска демо-сервера или браузерного расширения.
 * 
 * Использование:
 * node test_model.js [url]
 * 
 * Примеры:
 * node test_model.js https://example.com
 * node test_model.js https://demo-site.com/login
 */

// Подключаем необходимые модули
const fs = require('fs');
const path = require('path');
const url = require('url');

// Реализация тестовой модели
class PhishingTester {
  constructor() {
    this.officialDomains = [
      "google.com", "google.ru", "youtube.com", "facebook.com", "instagram.com", "twitter.com", 
      "vk.com", "ok.ru", "yandex.ru", "mail.ru", "rambler.ru", "yahoo.com", 
      "amazon.com", "netflix.com", "microsoft.com", "apple.com", "linkedin.com",
      "tinkoff.ru", "sberbank.ru", "vtb.ru", "alfabank.ru", "gazprombank.ru", 
      "gosuslugi.ru", "mos.ru", "nalog.ru"
    ];

    this.criticalDomains = [
      "sberbank.ru", "tinkoff.ru", "vtb.ru", "alfabank.ru", "gazprombank.ru", 
      "gosuslugi.ru", "nalog.ru", "paypal.com", "apple.com", 
      "google.com", "mail.ru", "yandex.ru", "vk.com", "facebook.com"
    ];

    console.log('* Тестер фишинга инициализирован');
  }

  /**
   * Проверить URL на фишинг
   * @param {string} testUrl - URL для проверки
   * @param {boolean} demoMode - Режим демонстрации (всегда считает фишингом)
   * @returns {object} - Результат проверки
   */
  checkUrl(testUrl, demoMode = false) {
    console.log(`* Проверка URL: ${testUrl}`);
    
    // В демо-режиме всегда считаем фишингом
    if (demoMode) {
      console.log('* ДЕМО-РЕЖИМ: всегда считаем фишингом');
      return {
        is_phishing: true,
        probability: 0.95,
        reasons: ['Демонстрационный фишинговый сайт', 'Для целей тестирования'],
        source: 'demo_mode',
        score: 5,
        binary_result: "ФИШИНГ"
      };
    }
    
    try {
      // Извлекаем признаки из URL
      const features = this.extractFeatures(testUrl);
      console.log('* Извлеченные признаки:', JSON.stringify(features, null, 2));
      
      // Производим предсказание
      const result = this.predictPhishing(features);
      console.log('* Результат:', result.is_phishing ? 'ФИШИНГ' : 'БЕЗОПАСНО', `(${result.score}%)`);
      
      return result;
    } catch (error) {
      console.error('* Ошибка при проверке URL:', error);
      return {
        is_phishing: false,
        probability: 0.5,
        reasons: ['Произошла ошибка при анализе'],
        source: 'error',
        score: 50,
        binary_result: "НЕИЗВЕСТНО"
      };
    }
  }

  /**
   * Извлечь признаки из URL
   * @param {string} urlString - URL для извлечения признаков
   * @returns {object} - Объект с признаками
   */
  extractFeatures(urlString) {
    // Парсим URL
    const parsedUrl = new URL(urlString);
    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname;
    
    // Базовые признаки
    const features = {
      url: urlString,
      domain: hostname,
      url_length: urlString.length,
      path_length: pathname.length,
      has_ip: /\d+\.\d+\.\d+\.\d+/.test(hostname) ? 1 : 0,
      has_at_symbol: urlString.includes('@') ? 1 : 0,
      has_cyrillic: /[а-яА-Я]/.test(urlString) ? 1 : 0,
      special_chars: (urlString.match(/[@#$%^&*()+=\[\]{}|\\:<>?]/g) || []).length,
      http_in_path: pathname.includes('http') ? 1 : 0,
      is_https: parsedUrl.protocol === 'https:' ? 1 : 0,
      has_security_terms: /secure|account|login|signin|password|user|verify|update|access/i.test(urlString) ? 1 : 0
    };
    
    // Дополнительные признаки
    features.subdomain_count = hostname.split('.').length - 1;
    features.dot_count = (urlString.match(/\./g) || []).length;
    features.query_params_count = parsedUrl.searchParams.toString() ? parsedUrl.searchParams.toString().split('&').length : 0;
    features.has_redirect = /redirect|redir|url|\?to=|goto/i.test(urlString) ? 1 : 0;
    
    return features;
  }

  /**
   * Предсказать, является ли URL фишинговым
   * @param {object} features - Признаки URL
   * @returns {object} - Результат предсказания
   */
  predictPhishing(features) {
    // Демо-режим: Локальные URL всегда считаются фишинговыми
    if (features.domain === 'localhost' || features.domain.includes('127.0.0.1') || features.url.includes('demo_sites')) {
      console.log('* Обнаружен локальный домен для демо, классифицируем как фишинг');
      return {
        is_phishing: true,
        probability: 0.95,
        reasons: ['Демонстрационный фишинговый сайт', 'Для целей тестирования и обучения'],
        source: 'demo_forced',
        score: 5,
        binary_result: "ФИШИНГ"
      };
    }
    
    // Проверяем официальные домены
    if (this.isOfficialDomain(features.domain)) {
      return {
        is_phishing: false,
        probability: 0.01,
        reasons: ['Официальный домен из белого списка'],
        source: 'whitelist',
        score: 99,
        binary_result: "БЕЗОПАСНО"
      };
    }
    
    // Проверяем критические признаки
    const criticalFeatures = [];
    
    if (features.has_ip) {
      criticalFeatures.push('URL содержит IP-адрес вместо домена');
    }
    
    if (features.has_at_symbol) {
      criticalFeatures.push('URL содержит символ @');
    }
    
    if (features.http_in_path) {
      criticalFeatures.push('URL содержит перенаправление HTTP в пути');
    }
    
    if (features.has_cyrillic) {
      criticalFeatures.push('URL содержит кириллические символы');
    }
    
    // Проверяем схожесть с критическими доменами
    const similarityCheck = this.checkDomainSimilarity(features.domain);
    if (similarityCheck) {
      criticalFeatures.push(`Домен похож на ${similarityCheck.similarTo}`);
    }
    
    // Если есть критические признаки, считаем фишингом
    if (criticalFeatures.length > 0) {
      return {
        is_phishing: true,
        probability: 0.95,
        reasons: criticalFeatures,
        source: 'critical_features',
        score: 5,
        binary_result: "ФИШИНГ"
      };
    }
    
    // Подозрительные признаки
    const suspiciousFeatures = [];
    
    if (features.url_length > 75) {
      suspiciousFeatures.push(`Длинный URL (${features.url_length} символов)`);
    }
    
    if (features.subdomain_count > 3) {
      suspiciousFeatures.push(`Много поддоменов (${features.subdomain_count})`);
    }
    
    if (features.special_chars > 5) {
      suspiciousFeatures.push(`Много специальных символов (${features.special_chars})`);
    }
    
    if (features.has_security_terms) {
      suspiciousFeatures.push('URL содержит термины безопасности (возможная имитация)');
    }
    
    if (features.has_redirect) {
      suspiciousFeatures.push('URL содержит параметр редиректа');
    }
    
    // Принимаем решение на основе подозрительных признаков
    let phishingProbability = 0.05;
    let score = 95;
    let isPhishing = false;
    
    if (suspiciousFeatures.length >= 3) {
      phishingProbability = 0.85;
      score = 15;
      isPhishing = true;
    } else if (suspiciousFeatures.length >= 2) {
      phishingProbability = 0.7;
      score = 30;
      isPhishing = true;
    } else if (suspiciousFeatures.length >= 1) {
      phishingProbability = 0.3;
      score = 70;
      isPhishing = false;
    }
    
    // Формируем итоговый результат
    return {
      is_phishing: isPhishing,
      probability: phishingProbability,
      reasons: suspiciousFeatures.length > 0 ? suspiciousFeatures : ['Нет обнаруженных признаков фишинга'],
      source: 'feature_analysis',
      score: score,
      binary_result: isPhishing ? "ФИШИНГ" : "БЕЗОПАСНО"
    };
  }

  /**
   * Проверяет, является ли домен официальным
   * @param {string} domain - Домен для проверки
   * @returns {boolean} - true, если домен официальный
   */
  isOfficialDomain(domain) {
    if (!domain) return false;
    
    // Демо-режим: Localhost и подобные домены никогда не считаются официальными
    if (domain === 'localhost' || domain.includes('127.0.0.1') || domain.includes('local')) {
      console.log('* Обнаружен локальный домен, считаем не официальным для демо');
      return false;
    }
    
    // Очищаем домен от www
    const cleanDomain = domain.replace(/^www\./i, '');
    
    // Проверяем, есть ли домен в списке официальных
    for (const officialDomain of this.officialDomains) {
      if (cleanDomain === officialDomain || cleanDomain.endsWith('.' + officialDomain)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Проверяет схожесть домена с критическими доменами
   * @param {string} domain - Домен для проверки
   * @returns {object|null} - Результат проверки или null
   */
  checkDomainSimilarity(domain) {
    if (!domain) return null;
    
    // Очищаем домен от www
    const cleanDomain = domain.replace(/^www\./i, '');
    
    // Проверяем, содержит ли домен критический домен как часть
    for (const criticalDomain of this.criticalDomains) {
      // Базовое имя критического домена (без TLD)
      const criticalBase = criticalDomain.split('.')[0];
      
      // Если домен содержит имя критического домена, но не равен ему
      if (cleanDomain.includes(criticalBase) && 
          cleanDomain !== criticalDomain && 
          !cleanDomain.endsWith('.' + criticalDomain)) {
        return {
          similarTo: criticalDomain,
          similarity: 80
        };
      }
      
      // Проверка на схожесть по Левенштейну (упрощенная)
      const domainParts = cleanDomain.split('.');
      const domainBase = domainParts.length > 1 ? domainParts[0] : cleanDomain;
      
      // Простая проверка на опечатки (если длина почти такая же)
      if (Math.abs(domainBase.length - criticalBase.length) <= 2 &&
          domainBase !== criticalBase) {
        // Подсчитываем различающиеся символы
        let diffCount = 0;
        for (let i = 0; i < Math.min(domainBase.length, criticalBase.length); i++) {
          if (domainBase[i] !== criticalBase[i]) {
            diffCount++;
          }
        }
        
        // Если различий мало, считаем похожим
        if (diffCount <= 2) {
          return {
            similarTo: criticalDomain,
            similarity: 75
          };
        }
      }
    }
    
    return null;
  }
}

// Основная функция для запуска тестирования
function main() {
  // Получаем URL из аргументов командной строки
  const testUrl = process.argv[2] || 'http://localhost:3000/demo_sites/bank-phish/';
  
  console.log('============================================');
  console.log('   CorgPhish - Тестирование модели фишинга   ');
  console.log('============================================');
  console.log('');
  
  // Создаем экземпляр тестера
  const tester = new PhishingTester();
  
  // Тестируем URL в обычном режиме
  console.log('\n>>> ОБЫЧНЫЙ РЕЖИМ <<<');
  const normalResult = tester.checkUrl(testUrl);
  
  // Тестируем URL в демо-режиме
  console.log('\n>>> ДЕМО РЕЖИМ <<<');
  const demoResult = tester.checkUrl(testUrl, true);
  
  console.log('\n============================================');
  console.log(`Итоговый результат для ${testUrl}:`);
  console.log(`- Обычный режим: ${normalResult.is_phishing ? 'ФИШИНГ' : 'БЕЗОПАСНО'} (${normalResult.score}%)`);
  console.log(`- Демо режим: ${demoResult.is_phishing ? 'ФИШИНГ' : 'БЕЗОПАСНО'} (${demoResult.score}%)`);
  console.log('============================================\n');
  
  // Тестируем предопределенный набор URL для демонстрации
  const testUrls = [
    'https://google.com',
    'https://bank.secure-login-verify.com',
    'http://sberbank-online.ru.secure.com',
    'https://paypal-account.com/login',
    'https://mail.ru',
    'http://192.168.1.1/admin'
  ];
  
  console.log('Тестирование предопределенных URL:');
  testUrls.forEach(url => {
    const result = tester.checkUrl(url);
    console.log(`- ${url}: ${result.is_phishing ? 'ФИШИНГ' : 'БЕЗОПАСНО'} (${result.score}%)`);
  });
}

// Запускаем основную функцию
main(); 