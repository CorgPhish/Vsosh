/**
 * settings.js - Настройки расширения CorgPhish
 * 
 * Этот файл содержит настройки по умолчанию и функции
 * для работы с настройками расширения.
 */

// Настройки по умолчанию
const DEFAULT_SETTINGS = {
    // Уровень защиты: 1 - низкий, 2 - средний, 3 - высокий
    protectionLevel: 2,
    
    // Показывать уведомления
    showNotifications: true,
    
    // Автоматически блокировать опасные сайты
    autoBlock: true,
    
    // Пороговое значение для фишинга (от 0 до 1)
    phishingThreshold: 0.5,
    
    // Белый список пользовательских доменов
    whitelist: [],
    
    // Черный список пользовательских доменов
    blacklist: [],
    
    // Проверять кириллические домены
    checkCyrillicDomains: true,
    
    // Проверять пуникод
    checkPunycode: true,
    
    // Дата последнего обновления настроек
    lastUpdate: new Date().toISOString()
};

/**
 * Загружает настройки из хранилища браузера
 * @returns {Promise<Object>} Настройки
 */
async function loadSettings() {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get('settings', (result) => {
                if (result.settings) {
                    resolve(Object.assign({}, DEFAULT_SETTINGS, result.settings));
                } else {
                    resolve(DEFAULT_SETTINGS);
                }
            });
        } else {
            // Для использования вне браузера или при отсутствии доступа к хранилищу
            resolve(DEFAULT_SETTINGS);
        }
    });
}

/**
 * Сохраняет настройки в хранилище браузера
 * @param {Object} settings Настройки для сохранения
 * @returns {Promise<void>}
 */
async function saveSettings(settings) {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            // Обновляем дату последнего обновления
            settings.lastUpdate = new Date().toISOString();
            
            chrome.storage.sync.set({ settings }, () => {
                resolve();
            });
        } else {
            // Для использования вне браузера или при отсутствии доступа к хранилищу
            resolve();
        }
    });
}

/**
 * Получает настройки порогового значения в зависимости от уровня защиты
 * @param {Object} settings Настройки
 * @returns {number} Пороговое значение
 */
function getThresholdByProtectionLevel(settings) {
    const level = settings.protectionLevel || DEFAULT_SETTINGS.protectionLevel;
    
    switch (level) {
        case 1: // Низкий
            return 0.7;
        case 2: // Средний
            return 0.5;
        case 3: // Высокий
            return 0.3;
        default:
            return DEFAULT_SETTINGS.phishingThreshold;
    }
}

/**
 * Проверяет, находится ли домен в белом списке
 * @param {string} domain Домен для проверки
 * @param {Object} settings Настройки
 * @returns {boolean} true, если домен в белом списке
 */
function isWhitelisted(domain, settings) {
    if (!domain) return false;
    
    // Нормализуем домен для сравнения
    domain = domain.toLowerCase().replace(/^www\./, '');
    
    const whitelist = settings.whitelist || DEFAULT_SETTINGS.whitelist;
    return whitelist.some(item => domain === item.toLowerCase().replace(/^www\./, ''));
}

/**
 * Проверяет, находится ли домен в черном списке
 * @param {string} domain Домен для проверки
 * @param {Object} settings Настройки
 * @returns {boolean} true, если домен в черном списке
 */
function isBlacklisted(domain, settings) {
    if (!domain) return false;
    
    // Нормализуем домен для сравнения
    domain = domain.toLowerCase().replace(/^www\./, '');
    
    const blacklist = settings.blacklist || DEFAULT_SETTINGS.blacklist;
    return blacklist.some(item => domain === item.toLowerCase().replace(/^www\./, ''));
}

/**
 * Добавляет домен в белый список
 * @param {string} domain Домен для добавления
 * @param {Object} settings Настройки
 * @returns {Object} Обновленные настройки
 */
function addToWhitelist(domain, settings) {
    if (!domain) return settings;
    
    // Нормализуем домен
    domain = domain.toLowerCase().replace(/^www\./, '');
    
    // Копируем настройки, чтобы не изменять оригинал
    const updatedSettings = Object.assign({}, settings);
    
    // Удаляем из черного списка, если там есть
    if (isBlacklisted(domain, updatedSettings)) {
        updatedSettings.blacklist = (updatedSettings.blacklist || [])
            .filter(item => item.toLowerCase().replace(/^www\./, '') !== domain);
    }
    
    // Проверяем, есть ли уже в белом списке
    if (!isWhitelisted(domain, updatedSettings)) {
        updatedSettings.whitelist = [...(updatedSettings.whitelist || []), domain];
    }
    
    return updatedSettings;
}

/**
 * Добавляет домен в черный список
 * @param {string} domain Домен для добавления
 * @param {Object} settings Настройки
 * @returns {Object} Обновленные настройки
 */
function addToBlacklist(domain, settings) {
    if (!domain) return settings;
    
    // Нормализуем домен
    domain = domain.toLowerCase().replace(/^www\./, '');
    
    // Копируем настройки, чтобы не изменять оригинал
    const updatedSettings = Object.assign({}, settings);
    
    // Удаляем из белого списка, если там есть
    if (isWhitelisted(domain, updatedSettings)) {
        updatedSettings.whitelist = (updatedSettings.whitelist || [])
            .filter(item => item.toLowerCase().replace(/^www\./, '') !== domain);
    }
    
    // Проверяем, есть ли уже в черном списке
    if (!isBlacklisted(domain, updatedSettings)) {
        updatedSettings.blacklist = [...(updatedSettings.blacklist || []), domain];
    }
    
    return updatedSettings;
}

// Экспортируем функции и константы
if (typeof module !== 'undefined') {
    module.exports = {
        DEFAULT_SETTINGS,
        loadSettings,
        saveSettings,
        getThresholdByProtectionLevel,
        isWhitelisted,
        isBlacklisted,
        addToWhitelist,
        addToBlacklist
    };
}

// Для использования в браузере
if (typeof window !== 'undefined') {
    window.CorgPhishSettings = {
        DEFAULT_SETTINGS,
        loadSettings,
        saveSettings,
        getThresholdByProtectionLevel,
        isWhitelisted,
        isBlacklisted,
        addToWhitelist,
        addToBlacklist
    };
}

// Для использования в service worker
if (typeof self !== 'undefined') {
    self.CorgPhishSettings = {
        DEFAULT_SETTINGS,
        loadSettings,
        saveSettings,
        getThresholdByProtectionLevel,
        isWhitelisted,
        isBlacklisted,
        addToWhitelist,
        addToBlacklist
    };
} 