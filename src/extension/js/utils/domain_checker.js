/**
 * domain_checker.js - Библиотека для проверки доменов на фишинг
 */

/**
 * Проверяет домен на предмет фишинга
 * @param {string} url - URL для проверки
 * @returns {object} - Результат проверки
 */
function checkDomain(url) {
  // Если нет URL, возвращаем ошибку
  if (!url) {
    return {
      status: 'error',
      message: 'URL не указан',
      domain: null
    };
  }

  // Извлекаем домен из URL
  const domain = extractDomain(url);
  
  // Проверяем на наличие в белом списке
  if (isInWhitelist(domain)) {
    return {
      status: 'official',
      message: 'Домен находится в белом списке',
      domain: domain
    };
  }
  
  // Проверяем, похож ли домен на брендовый домен
  const brandCheck = checkForBrandSpoofing(domain);
  if (brandCheck.isSpoofed) {
    return {
      status: 'phishing',
      message: `Домен похож на ${brandCheck.originalBrand}`,
      domain: brandCheck.originalBrand
    };
  }
  
  // Проверяем на подозрительные признаки
  if (hasSuspiciousFeatures(domain)) {
    return {
      status: 'suspicious',
      message: 'Домен имеет подозрительные признаки',
      domain: domain
    };
  }
  
  // Если ничего не найдено, считаем домен условно безопасным
  return {
    status: 'unknown',
    message: 'Домен не найден в базе данных',
    domain: domain
  };
}

/**
 * Извлекает домен из URL
 * @param {string} url - URL для обработки
 * @returns {string} - Извлеченный домен
 */
function extractDomain(url) {
  try {
    // Пробуем создать URL объект
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      // Если URL невалидный, пробуем добавить протокол
      urlObj = new URL('http://' + url);
    }
    
    return urlObj.hostname;
  } catch (e) {
    console.error('Ошибка при извлечении домена:', e);
    return url;
  }
}

/**
 * Проверяет, находится ли домен в белом списке
 * @param {string} domain - Домен для проверки
 * @returns {boolean} - Результат проверки
 */
function isInWhitelist(domain) {
  // Список популярных доменов
  const whitelist = [
    // Популярные международные домены
    'google.com', 'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
    'amazon.com', 'netflix.com', 'microsoft.com', 'apple.com', 'linkedin.com',
    'github.com', 'wikipedia.org', 'reddit.com', 'twitch.tv', 'spotify.com',
    
    // Популярные российские домены
    'yandex.ru', 'mail.ru', 'vk.com', 'ok.ru', 'rambler.ru',
    'avito.ru', 'ozon.ru', 'wildberries.ru', 'sberbank.ru', 'gosuslugi.ru',
    'mos.ru', 'rbc.ru', 'lenta.ru', 'kinopoisk.ru', 'ria.ru',
    'ivi.ru', '2gis.ru', 'hh.ru', 'drom.ru', 'auto.ru'
  ];
  
  // Проверяем точное совпадение
  if (whitelist.includes(domain)) {
    return true;
  }
  
  // Проверяем поддомены популярных доменов
  for (const trusted of whitelist) {
    if (domain.endsWith('.' + trusted)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Проверяет, похож ли домен на брендовый домен
 * @param {string} domain - Домен для проверки
 * @returns {object} - Результат проверки
 */
function checkForBrandSpoofing(domain) {
  // Список брендов и их основных доменов
  const brands = {
    'google': ['google.com', 'google.ru'],
    'yandex': ['yandex.ru', 'yandex.com'],
    'sberbank': ['sberbank.ru', 'sber.ru'],
    'vkontakte': ['vk.com', 'vkontakte.ru'],
    'mail': ['mail.ru'],
    'facebook': ['facebook.com', 'fb.com'],
    'instagram': ['instagram.com'],
    'twitter': ['twitter.com'],
    'gosuslugi': ['gosuslugi.ru'],
    'alfabank': ['alfabank.ru'],
    'tinkoff': ['tinkoff.ru']
  };
  
  // Проверяем каждый бренд
  for (const [brand, domains] of Object.entries(brands)) {
    // Проверяем на наличие бренда в домене
    if (domain.includes(brand) && !domains.some(d => domain === d || domain.endsWith('.' + d))) {
      return {
        isSpoofed: true,
        originalBrand: domains[0],
        brandName: brand
      };
    }
    
    // Проверяем на опечатки (очень простой алгоритм)
    for (const brandDomain of domains) {
      if (isTypoSimilar(domain, brandDomain)) {
        return {
          isSpoofed: true,
          originalBrand: brandDomain,
          brandName: brand
        };
      }
    }
  }
  
  return {
    isSpoofed: false
  };
}

/**
 * Проверяет, является ли один домен опечаткой другого
 * @param {string} domain1 - Первый домен
 * @param {string} domain2 - Второй домен
 * @returns {boolean} - Результат проверки
 */
function isTypoSimilar(domain1, domain2) {
  // Удаляем протокол и www, если есть
  const d1 = domain1.replace(/^(https?:\/\/)?(www\.)?/, '');
  const d2 = domain2.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  // Если домены слишком разные по длине, они не похожи
  if (Math.abs(d1.length - d2.length) > 3) {
    return false;
  }
  
  // Расстояние Левенштейна (простая реализация)
  const levenshteinDistance = (a, b) => {
    const matrix = [];
    
    // Инициализация матрицы
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Заполнение матрицы
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // замена
            Math.min(
              matrix[i][j - 1] + 1,   // вставка
              matrix[i - 1][j] + 1    // удаление
            )
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  };
  
  // Расстояние между доменами
  const distance = levenshteinDistance(d1, d2);
  
  // Если расстояние меньше 2 или меньше 20% от длины домена, считаем похожими
  return distance <= 2 || distance / Math.max(d1.length, d2.length) < 0.2;
}

/**
 * Проверяет наличие подозрительных признаков в домене
 * @param {string} domain - Домен для проверки
 * @returns {boolean} - Результат проверки
 */
function hasSuspiciousFeatures(domain) {
  // Проверка на наличие IP-адреса вместо домена
  if (/\d+\.\d+\.\d+\.\d+/.test(domain)) {
    return true;
  }
  
  // Проверка на нетипично длинный домен
  if (domain.length > 30) {
    return true;
  }
  
  // Проверка на необычно большое количество точек
  const dotCount = (domain.match(/\./g) || []).length;
  if (dotCount > 3) {
    return true;
  }
  
  // Проверка на необычно большое количество дефисов
  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount > 2) {
    return true;
  }
  
  // Проверка на подозрительные TLD
  const suspiciousTLDs = ['top', 'xyz', 'club', 'online', 'site', 'info', 'fun'];
  const tld = domain.split('.').pop();
  if (suspiciousTLDs.includes(tld)) {
    return true;
  }
  
  // Проверка на смешение кириллицы и латиницы
  const hasCyrillic = /[а-яА-Я]/.test(domain);
  const hasLatin = /[a-zA-Z]/.test(domain);
  if (hasCyrillic && hasLatin) {
    return true;
  }
  
  // Проверка на подозрительные ключевые слова
  const suspiciousKeywords = ['login', 'account', 'secure', 'banking', 'verify', 'signin', 
    'update', 'auth', 'confirm', 'password', 'vhod', 'cabinet', 'lichnyj'];
  if (suspiciousKeywords.some(word => domain.includes(word))) {
    return true;
  }
  
  return false;
}

// Экспортируем функции
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkDomain,
    extractDomain,
    isInWhitelist,
    checkForBrandSpoofing,
    isTypoSimilar,
    hasSuspiciousFeatures
  };
} 