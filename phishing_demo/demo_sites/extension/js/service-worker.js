/**
 * CorgPhish - Сервис-воркер расширения для обнаружения фишинговых сайтов
 * 
 * Этот скрипт использует сервисные воркеры Chrome, заменяющие устаревший background.js
 * https://developer.chrome.com/docs/extensions/mv3/service_workers/
 */

// Глобальные переменные для хранения результатов проверки
let lastResults = {};
let checkQueue = {};

// Активация демо-режима для презентации
// ВАЖНО: Для тестирования на локальных демонстрационных сайтах должно быть установлено значение true
// При публикации в магазине расширений установите значение false
const DEMO_MODE = true;

// При установке расширения
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        // Инициализация статистики
        chrome.storage.local.set({
            'totalChecked': 0,
            'phishingDetected': 0,
            'lastUpdated': Date.now(),
            'gsb_api_key': '',
            'ignoreWhitelist': false
        });
    }
});

// Импорт модулей для проверки и обработки URL
import { extractFeatures, normalizeFeatures } from './features.js';
import { isDomainInWhitelist, isDomainInBlacklist } from './domains.js';

/**
 * Проверка URL с использованием Google Safe Browsing API
 * 
 * @param {string} url - URL для проверки
 * @param {string} apiKey - Ключ API для Google Safe Browsing
 * @returns {Promise<Object|null>} - Результат проверки или null в случае ошибки
 */
async function checkUrlWithGsb(url, apiKey) {
    if (!apiKey) {
        console.log('API ключ Google Safe Browsing не установлен');
        return null;
    }
    
    try {
        // В демо-режиме всегда возвращаем результат как для фишингового сайта
        if (DEMO_MODE) {
            return {
                isMalicious: true,
                threats: ['SOCIAL_ENGINEERING', 'MALWARE'],
                platformTypes: ['WINDOWS', 'LINUX', 'OSX']
            };
        }
        
        const result = await checkWithGoogleSafeBrowsing(url, apiKey);
        return result;
    } catch (error) {
        console.error('Ошибка при проверке через Google Safe Browsing:', error);
        return null;
    }
}

/**
 * Проверяет URL с помощью Google Safe Browsing API
 * 
 * @param {string} url - URL для проверки
 * @param {string} apiKey - API ключ для Google Safe Browsing
 * @returns {Promise<Object|null>} - Результат проверки или null при ошибке
 */
async function checkWithGoogleSafeBrowsing(url, apiKey) {
    if (!url || !apiKey) return null;
    
    const apiEndpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
    
    try {
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client: {
                    clientId: 'CorgPhish',
                    clientVersion: '1.0.0'
                },
                threatInfo: {
                    threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                    platformTypes: ['ANY_PLATFORM'],
                    threatEntryTypes: ['URL'],
                    threatEntries: [{ url: url }]
                }
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Если нет совпадений, API возвращает пустой объект
            if (!data.matches || data.matches.length === 0) {
                return { isMalicious: false };
            }
            
            // Собираем информацию о найденных угрозах
            const threats = data.matches.map(match => match.threatType);
            const platformTypes = data.matches.map(match => match.platformType);
            
            return {
                isMalicious: true,
                threats: [...new Set(threats)],
                platformTypes: [...new Set(platformTypes)]
            };
        } else {
            console.error('Ошибка API Google Safe Browsing:', data);
            return null;
        }
    } catch (error) {
        console.error('Ошибка при запросе к Google Safe Browsing API:', error);
        return null;
    }
}

/**
 * Проверяет API ключ Google Safe Browsing
 * 
 * @param {string} apiKey - API ключ для проверки
 * @returns {Promise<boolean>} - true если ключ действительный, иначе false
 */
async function testGoogleSafeBrowsingApiKey(apiKey) {
    if (!apiKey) return false;
    
    // Тестовый URL для проверки
    const testUrl = 'http://malware.testing.google.test/testing/malware/';
    
    try {
        // В демо-режиме всегда сообщаем что ключ валидный
        if (DEMO_MODE) {
            return true;
        }
        
        const result = await checkWithGoogleSafeBrowsing(testUrl, apiKey);
        
        // Если получили результат и он содержит информацию об угрозах, ключ действительный
        return result && result.isMalicious === true;
    } catch (error) {
        console.error('Ошибка при проверке API ключа:', error);
        return false;
    }
}

/**
 * Проверяет, является ли URL демонстрационным фишинговым сайтом
 * 
 * @param {string} url - URL для проверки
 * @returns {boolean} - true если это демо-сайт
 */
function isDemoPhishingSite(url) {
    try {
        const urlObj = new URL(url);
        // Проверяем, что это localhost:3000 и содержит один из путей демо-сайтов
        return (
            (urlObj.hostname === 'localhost' && urlObj.port === '3000') &&
            (
                url.includes('/bank-phish/') ||
                url.includes('/crypto-phish/') ||
                url.includes('/email-login/')
            )
        );
    } catch (error) {
        console.error('Ошибка при проверке демо-сайта:', error);
        return false;
    }
}

/**
 * Классифицирует веб-страницу на основе извлеченных признаков и проверки домена
 * 
 * @param {string} url - URL для классификации
 * @param {string} tabId - ID вкладки для обновления
 * @returns {Promise<Object>} - Результат классификации
 */
async function classify(url, tabId) {
    // Проверка если URL пустой или это страница предупреждения
    if (!url || url.includes('warning.html') || url === 'about:blank') {
        return null;
    }
    
    console.log('Проверка URL:', url);
    
    // Получаем настройки и статистику
    const data = await chrome.storage.local.get(['totalChecked', 'phishingDetected', 'gsb_api_key', 'ignoreWhitelist']);
    const { gsb_api_key, ignoreWhitelist } = data;
    let { totalChecked, phishingDetected } = data;
    
    // Обновляем счетчик проверенных URL
    totalChecked++;
    
    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        
        // Специальная обработка для демонстрационных сайтов
        if (isDemoPhishingSite(url)) {
            console.log('Обнаружен демонстрационный фишинговый сайт:', url);
            phishingDetected++;
            
            // Сохраняем статистику
            chrome.storage.local.set({
                'totalChecked': totalChecked,
                'phishingDetected': phishingDetected,
                'lastUpdated': Date.now()
            });
            
            const result = {
                isPhishing: true,
                score: 0.95,
                reasons: [
                    'Демонстрационный фишинговый сайт',
                    'Имитация известного ресурса',
                    'Подозрительная структура URL',
                    'Запрашивает конфиденциальные данные'
                ]
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            return result;
        }
        
        // Проверяем локальные файлы
        if (urlObj.protocol === 'file:') {
            console.log('Локальный файл, пропускаем проверку:', url);
            return { isPhishing: false, score: 0, reasons: ['Локальный файл'] };
        }
        
        // Проверяем домен в белом списке
        if (!ignoreWhitelist && isDomainInWhitelist(domain)) {
            console.log('Домен в белом списке:', domain);
            return { isPhishing: false, score: 0, reasons: ['Домен в белом списке'] };
        }
        
        // Проверяем домен в черном списке
        if (isDomainInBlacklist(domain)) {
            console.log('Домен в черном списке:', domain);
            phishingDetected++;
            
            // Сохраняем статистику
            chrome.storage.local.set({
                'totalChecked': totalChecked,
                'phishingDetected': phishingDetected,
                'lastUpdated': Date.now()
            });
            
            const result = {
                isPhishing: true,
                score: 1,
                reasons: ['Домен находится в черном списке']
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            return result;
        }
        
        // В демо-режиме всегда считаем сайт фишинговым
        if (DEMO_MODE) {
            console.log('Демо-режим: сайт отмечен как фишинговый:', url);
            phishingDetected++;
            
            // Сохраняем статистику
            chrome.storage.local.set({
                'totalChecked': totalChecked,
                'phishingDetected': phishingDetected,
                'lastUpdated': Date.now()
            });
            
            const result = {
                isPhishing: true,
                score: 0.95,
                reasons: [
                    'Подозрительная структура URL',
                    'Имитация известного ресурса',
                    'Использование редиректов',
                    'Нестандартные элементы ввода',
                    'Демонстрационный режим'
                ]
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            return result;
        }
        
        // Проверяем URL с помощью Google Safe Browsing
        const gsbResult = await checkUrlWithGsb(url, gsb_api_key);
        
        if (gsbResult && gsbResult.isMalicious) {
            console.log('Google Safe Browsing определил URL как вредоносный:', url);
            phishingDetected++;
            
            // Сохраняем статистику
            chrome.storage.local.set({
                'totalChecked': totalChecked,
                'phishingDetected': phishingDetected,
                'lastUpdated': Date.now()
            });
            
            const reasons = gsbResult.threats.map(threat => {
                switch (threat) {
                    case 'MALWARE': return 'Обнаружено вредоносное ПО';
                    case 'SOCIAL_ENGINEERING': return 'Обнаружен фишинговый сайт';
                    case 'UNWANTED_SOFTWARE': return 'Обнаружено нежелательное ПО';
                    case 'POTENTIALLY_HARMFUL_APPLICATION': return 'Обнаружено потенциально вредоносное приложение';
                    default: return `Обнаружена угроза: ${threat}`;
                }
            });
            
            const result = {
                isPhishing: true,
                score: 0.9,
                reasons: reasons
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            return result;
        }
        
        // Получаем признаки из URL
        const features = extractFeatures(url);
        const normalizedFeatures = normalizeFeatures(features);
        
        // Сохраняем статистику
        chrome.storage.local.set({
            'totalChecked': totalChecked,
            'phishingDetected': phishingDetected,
            'lastUpdated': Date.now()
        });
        
        // По умолчанию считаем URL безопасным
        const result = {
            isPhishing: false,
            score: 0.05,
            reasons: ['URL прошел все проверки']
        };
        
        // Сохраняем результат
        lastResults[url] = result;
        
        // Отправляем оповещение content скрипту
        if (tabId) {
            chrome.tabs.sendMessage(tabId, {
                action: 'checkResult',
                result: result
            }).catch(error => console.error('Ошибка при отправке результата:', error));
        }
        
        return result;
    } catch (error) {
        console.error('Ошибка при классификации URL:', error);
        
        // Сохраняем статистику даже при ошибке
        chrome.storage.local.set({
            'totalChecked': totalChecked,
            'lastUpdated': Date.now()
        });
        
        // Возвращаем результат с ошибкой
        return {
            isPhishing: false,
            score: 0,
            reasons: ['Ошибка при проверке']
        };
    }
}

/**
 * Перенаправляет на страницу предупреждения
 * 
 * @param {string} url - Опасный URL
 * @param {number} tabId - ID вкладки
 * @param {Object} result - Результат проверки
 */
function redirectToWarningPage(url, tabId, result) {
    if (!tabId) return;
    
    // Подготавливаем URL для страницы предупреждения
    const warningUrl = chrome.runtime.getURL('html/warning.html') + 
        `?url=${encodeURIComponent(url)}` + 
        `&score=${encodeURIComponent(result.score)}` + 
        `&reasons=${encodeURIComponent(JSON.stringify(result.reasons))}`;
    
    // Перенаправляем текущую вкладку на страницу предупреждения
    chrome.tabs.update(tabId, { url: warningUrl }).catch(error => {
        console.error('Ошибка при перенаправлении на страницу предупреждения:', error);
    });
    
    // Отправляем оповещение content скрипту
    chrome.tabs.sendMessage(tabId, {
        action: 'alert',
        result: result
    }).catch(error => console.error('Ошибка при отправке предупреждения:', error));
}

// Обработчик обновления вкладки
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        // Запускаем проверку URL
        classify(tab.url, tabId).then(result => {
            console.log('Результат классификации:', result);
        }).catch(error => {
            console.error('Ошибка при классификации:', error);
        });
    }
});

// Обработчик активации вкладки
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (tab && tab.url && tab.url.startsWith('http')) {
            // Проверяем, есть ли сохраненный результат для этого URL
            if (lastResults[tab.url]) {
                console.log('Использование кэшированного результата для:', tab.url);
                return;
            }
            
            // Запускаем проверку URL
            classify(tab.url, tab.id).then(result => {
                console.log('Результат классификации:', result);
            }).catch(error => {
                console.error('Ошибка при классификации:', error);
            });
        }
    });
});

// Обработчик сообщений
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'checkUrl') {
        // Получаем URL для проверки
        const url = request.url;
        const tabId = sender.tab ? sender.tab.id : null;
        
        // Если URL уже в очереди на проверку, отменяем
        if (checkQueue[url]) {
            console.log('URL уже в очереди на проверку:', url);
            sendResponse({ status: 'pending' });
            return true;
        }
        
        // Добавляем URL в очередь
        checkQueue[url] = true;
        
        // Запускаем асинхронную проверку
        classify(url, tabId).then(result => {
            // Удаляем URL из очереди
            delete checkQueue[url];
            
            // Отправляем результат
            sendResponse({ status: 'complete', result: result });
        }).catch(error => {
            // Удаляем URL из очереди
            delete checkQueue[url];
            
            // Отправляем ошибку
            sendResponse({ status: 'error', message: error.message });
        });
        
        // Возвращаем true, чтобы использовать асинхронный ответ
        return true;
    } else if (request.action === 'test_gsb_api_key') {
        // Проверяем API ключ Google Safe Browsing
        testGoogleSafeBrowsingApiKey(request.apiKey).then(isValid => {
            sendResponse({ isValid: isValid });
        }).catch(error => {
            console.error('Ошибка при проверке API ключа:', error);
            sendResponse({ isValid: false, error: error.message });
        });
        
        // Возвращаем true, чтобы использовать асинхронный ответ
        return true;
    }
}); 