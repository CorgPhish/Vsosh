/**
 * features.js - Функции для извлечения и анализа признаков веб-сайтов
 * 
 * Модуль содержит:
 * - Списки доверенных доменов (русских и международных)
 * - Функции для анализа URL и DOM структуры страницы
 * - Функции для извлечения признаков для модели машинного обучения
 */

// Список доверенных российских доменов для белого списка
const RUSSIAN_TRUSTED_DOMAINS = [
  // Поисковые системы
  "yandex.ru", "yandex.by", "yandex.kz", "ya.ru", 
  "mail.ru", "go.mail.ru", "rambler.ru", "rambler.co",
  
  // Социальные сети
  "vk.com", "vkontakte.ru", "ok.ru", "odnoklassniki.ru",
  "t.me", "telegram.org", "tg.dev", "rutube.ru", "dzen.ru",
  
  // Маркетплейсы
  "ozon.ru", "wildberries.ru", "lamoda.ru", "avito.ru",
  "dns-shop.ru", "mvideo.ru", "citilink.ru", "eldorado.ru",
  "aliexpress.ru", "market.yandex.ru", "sbermegamarket.ru",
  
  // Банки и финансы
  "sberbank.ru", "sber.ru", "vtb.ru", "alfabank.ru",
  "gazprombank.ru", "raiffeisen.ru", "tinkoff.ru",
  "moex.com", "open.ru", "qiwi.com", "sovcombank.ru",
  
  // Государственные службы
  "gosuslugi.ru", "mos.ru", "kremlin.ru", "government.ru",
  "nalog.gov.ru", "pfr.gov.ru", "fssp.gov.ru", "fas.gov.ru",
  "customs.gov.ru", "cbr.ru", "rkn.gov.ru", "mvd.ru",
  
  // Новости и СМИ
  "rbc.ru", "ria.ru", "tass.ru", "interfax.ru", "rt.com",
  "iz.ru", "kp.ru", "kommersant.ru", "aif.ru", "gazeta.ru",
  "mk.ru", "lenta.ru", "vesti.ru", "rg.ru", "news.ru",
  
  // Контент и медиа
  "ivi.ru", "kinopoisk.ru", "okko.tv", "afisha.ru", 
  "premier.one", "start.ru", "more.tv", "wink.ru",
  "youtube.ru", "youtube.com", "vimeo.com", "tiktok.com",
  
  // Автомобильные
  "auto.ru", "drom.ru", "avito.ru/avtomobili", "avtovaz.ru",
  "drive2.ru", "autonews.ru", "kolesa.ru", "av.by",
  
  // Транспорт
  "rzd.ru", "tutu.ru", "aeroflot.ru", "s7.ru", "pobeda.aero",
  "utair.ru", "rossiya-airlines.com", "nordwindairlines.ru",
  
  // Телекоммуникации
  "mts.ru", "tele2.ru", "megafon.ru", "beeline.ru", "yota.ru",
  "rostelecom.ru", "ttk.ru", "domru.ru"
];

// Список основных международных доверенных доменов
const GLOBAL_TRUSTED_DOMAINS = [
  // Поисковые системы
  "google.com", "google.ru", "bing.com", "yahoo.com", "duckduckgo.com",
  
  // Социальные сети
  "facebook.com", "twitter.com", "linkedin.com", "instagram.com",
  "pinterest.com", "reddit.com", "tumblr.com", "discord.com",
  
  // Почтовые сервисы
  "gmail.com", "outlook.com", "protonmail.com", "zoho.com",
  
  // Облачные службы и продуктивность
  "microsoft.com", "office.com", "live.com", "apple.com",
  "dropbox.com", "box.com", "onedrive.com", "icloud.com",
  
  // Маркетплейсы
  "amazon.com", "ebay.com", "walmart.com", "alibaba.com",
  
  // Видеохостинги
  "youtube.com", "vimeo.com", "twitch.tv", "netflix.com"
];

/**
 * Извлекает все признаки из URL и возвращает их как объект
 * @param {string} url - URL для анализа
 * @return {Object} - Объект с признаками
 */
function extractFeaturesFromUrl(url) {
  const features = {};
  
  try {
    const urlObj = new URL(url);
    
    // Основные компоненты URL
    features.protocol = urlObj.protocol;
    features.hostname = urlObj.hostname;
    features.pathname = urlObj.pathname;
    features.search = urlObj.search;
    features.hash = urlObj.hash;
    
    // Количество поддоменов
    features.subdomainCount = urlObj.hostname.split('.').length - 1;
    
    // Является ли домен IP-адресом
    features.isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname);
    
    // Содержит ли URL '@' символ
    features.hasAtSymbol = url.includes('@');
    
    // Длина URL
    features.urlLength = url.length;
    
    // Содержит ли подозрительные слова
    const suspiciousWords = ['login', 'signin', 'verify', 'secure', 'account', 'update', 'confirm'];
    features.hasSuspiciousWords = suspiciousWords.some(word => url.toLowerCase().includes(word));
    
    // Количество запросов параметров
    features.queryParamsCount = urlObj.searchParams.size;
    
    // Является ли домен доверенным
    features.isTrustedDomain = [...RUSSIAN_TRUSTED_DOMAINS, ...GLOBAL_TRUSTED_DOMAINS]
      .some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`));
    
    // Содержит ли URL редирект
    features.hasRedirect = url.includes('redirect') || url.includes('redir') || url.includes('url=');
    
  } catch (error) {
    console.error('Ошибка при извлечении признаков из URL:', error);
  }
  
  return features;
}

/**
 * Проверяет, является ли URL потенциально фишинговым на основе простых правил
 * @param {string} url - URL для проверки
 * @return {boolean} - true если URL подозрительный, иначе false
 */
function isUrlSuspicious(url) {
  const features = extractFeaturesFromUrl(url);
  
  // Простые правила для проверки
  if (features.isIpAddress) return true;
  if (features.hasAtSymbol) return true;
  if (features.urlLength > 100) return true;
  if (features.hasSuspiciousWords && !features.isTrustedDomain) return true;
  if (features.hasRedirect && !features.isTrustedDomain) return true;
  
  return false;
}

// Экспорт функций и констант для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RUSSIAN_TRUSTED_DOMAINS,
    GLOBAL_TRUSTED_DOMAINS,
    extractFeaturesFromUrl,
    isUrlSuspicious
  };
} 