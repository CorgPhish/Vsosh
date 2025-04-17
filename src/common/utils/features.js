/**
 * features.js - Утилиты для извлечения признаков из URL
 * 
 * Этот файл содержит функции для извлечения признаков из URL,
 * которые используются для обнаружения фишинговых сайтов.
 */

// Список доверенных российских доменов, которые не являются фишинговыми
const RUSSIAN_TRUSTED_DOMAINS = [
    // Поисковые системы
    "yandex.ru", "ya.ru", "mail.ru", "rambler.ru", "go.mail.ru", "nova.rambler.ru",
    
    // Социальные сети
    "vk.com", "ok.ru", "instagram.com", "odnoklassniki.ru", "facebook.com", "twitter.com",
    "rutube.ru", "zen.yandex.ru", "dzen.ru", "tiktok.com", "t.me", "telegram.org",
    
    // Интернет-магазины
    "ozon.ru", "wildberries.ru", "aliexpress.ru", "dns-shop.ru", "mvideo.ru", 
    "eldorado.ru", "citilink.ru", "lamoda.ru", "avito.ru", "market.yandex.ru",
    
    // Банки
    "sberbank.ru", "online.sberbank.ru", "tinkoff.ru", "alfabank.ru", "vtb.ru",
    "gazprombank.ru", "raiffeisen.ru", "rshb.ru", "psbank.ru", "mtsbank.ru",
    "open.ru", "sovcombank.ru", "otpbank.ru", "homecredit.ru", "pochtabank.ru",
    
    // Госуслуги и официальные сайты
    "gosuslugi.ru", "mos.ru", "kremlin.ru", "government.ru", "pfr.gov.ru",
    "nalog.gov.ru", "edu.gov.ru", "minzdrav.gov.ru", "rostrud.gov.ru", "rkn.gov.ru",
    
    // Новости
    "rbc.ru", "lenta.ru", "ria.ru", "gazeta.ru", "kp.ru", "aif.ru", 
    "kommersant.ru", "vedomosti.ru", "tass.ru", "interfax.ru", "iz.ru",
    
    // Медиа и развлечения
    "kinopoisk.ru", "ivi.ru", "okko.tv", "premier.one", "more.tv", "start.ru",
    "kp.ru", "sports.ru", "championat.com", "sportbox.ru", "film.ru", "afisha.ru",
    
    // Авто
    "auto.ru", "drom.ru", "avto.ru", "drive2.ru", "avtovaz.ru", "avtogermes.ru",
    
    // Транспорт
    "rzd.ru", "tutu.ru", "aeroflot.ru", "s7.ru", "pobeda.aero", "blablacar.ru",
    "metro.spb.ru", "mosmetro.ru", "transport.mos.ru", "avtovokzaly.ru", "busfor.ru",
    
    // Телеком
    "mts.ru", "megafon.ru", "beeline.ru", "tele2.ru", "yota.ru", "rt.ru",
    "rostelecom.ru", "dom.ru", "2gis.ru", "gismeteo.ru"
];

/**
 * Извлекает признаки из URL для анализа
 * @param {string} url URL для анализа
 * @returns {Object} Объект с признаками
 */
function extractFeatures(url) {
    // Базовые признаки URL
    const features = {
        domain_length: 0,
        tld_length: 0,
        has_ip: 0,
        has_at_symbol: 0,
        has_double_slash: 0,
        has_dash_in_domain: 0,
        has_https: 0,
        domain_registration_length: 0,
        domain_age: 0,
        has_suspicious_strings: 0,
        url_length: 0,
        domain_in_brand: 0,
        brand_in_subdomain: 0,
        brand_in_path: 0,
        suspicious_tld: 0,
        statistical_report: 0,
        has_cyrillic: 0,
        punycode_suspicious: 0,
    };
    
    // Мы не можем получить настоящую информацию о домене без API, поэтому устанавливаем примерные значения
    try {
        // Очищаем URL
        url = url.toLowerCase().trim();
        
        // Длина URL
        features.url_length = url.length;
        
        // Извлекаем домен
        let domain = "";
        try {
            const urlObj = new URL(url);
            domain = urlObj.hostname;
        } catch (e) {
            // В случае ошибки, пытаемся вытащить домен из строки
            const domainMatch = url.match(/:\/\/(www\.)?([^\/]+)/);
            domain = domainMatch ? domainMatch[2] : url;
        }
        
        // Длина домена
        features.domain_length = domain.length;
        
        // Проверка протокола
        features.has_https = url.startsWith("https://") ? 1 : 0;
        
        // Проверка на IP адрес
        features.has_ip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain) ? 1 : 0;
        
        // Проверка на символ @
        features.has_at_symbol = url.includes("@") ? 1 : 0;
        
        // Проверка на двойной слеш в пути
        features.has_double_slash = url.substring(url.indexOf("://") + 3).includes("//") ? 1 : 0;
        
        // Проверка на дефис в домене
        features.has_dash_in_domain = domain.includes("-") ? 1 : 0;
        
        // Проверка на подозрительные строки
        const suspiciousStrings = ["login", "signin", "verify", "secure", "account", "password", "security"];
        features.has_suspicious_strings = suspiciousStrings.some(str => url.includes(str)) ? 1 : 0;
        
        // Проверка на подозрительные TLD
        const suspiciousTLDs = ["xyz", "top", "club", "online", "site", "info", "tech"];
        features.suspicious_tld = suspiciousTLDs.some(tld => domain.endsWith("." + tld)) ? 1 : 0;
        
        // Длина TLD
        const tldMatch = domain.match(/\.([^.]+)$/);
        if (tldMatch) {
            features.tld_length = tldMatch[1].length;
        }
        
        // Проверка на кириллические символы
        features.has_cyrillic = /[а-яА-Я]/.test(url) ? 1 : 0;
        
        // Проверка на punycode (используется для интернационализированных доменных имен)
        features.punycode_suspicious = domain.includes("xn--") ? 1 : 0;
    } catch (error) {
        console.error("Ошибка при извлечении признаков:", error);
    }
    
    return features;
}

/**
 * Проверяет, является ли домен доверенным
 * @param {string} domain Домен для проверки
 * @returns {boolean} true, если домен доверенный
 */
function isTrustedDomain(domain) {
    // Преобразуем домен в нижний регистр и удаляем www.
    domain = domain.toLowerCase().replace(/^www\./, "");
    
    // Проверяем, есть ли домен в списке доверенных
    return RUSSIAN_TRUSTED_DOMAINS.includes(domain);
}

// Экспортируем функции
if (typeof module !== 'undefined') {
    module.exports = {
        extractFeatures,
        isTrustedDomain,
        RUSSIAN_TRUSTED_DOMAINS
    };
}

// Для использования в браузере
if (typeof window !== 'undefined') {
    window.extractFeatures = extractFeatures;
    window.isTrustedDomain = isTrustedDomain;
    window.RUSSIAN_TRUSTED_DOMAINS = RUSSIAN_TRUSTED_DOMAINS;
}

// Для использования в service worker
if (typeof self !== 'undefined') {
    self.extractFeatures = extractFeatures;
    self.isTrustedDomain = isTrustedDomain;
    self.RUSSIAN_TRUSTED_DOMAINS = RUSSIAN_TRUSTED_DOMAINS;
} 