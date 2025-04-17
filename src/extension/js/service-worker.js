/**
 * CorgPhish - Сервис-воркер расширения для обнаружения фишинговых сайтов
 * 
 * Этот скрипт использует сервисные воркеры Chrome, заменяющие устаревший background.js
 * https://developer.chrome.com/docs/extensions/mv3/service_workers/
 */

// Глобальные переменные для хранения результатов проверки и статуса
let results = {};
let legitimatePercents = {};
let isPhish = {};

// Активация демо-режима для презентации
// ВАЖНО: Для тестирования на локальных демонстрационных сайтах должно быть установлено значение true
// При публикации в магазине расширений установите значение false
const DEMO_MODE = true;

// Загрузка модели XGBoost
importScripts('models/xgboost_model.js');

// При установке расширения
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        // Инициализация статистики
        chrome.storage.local.set({
            'totalChecked': 0,
            'phishingDetected': 0,
            'lastUpdated': Date.now(),
            'gsb_api_key': '',
            'ignoreWhitelist': false,
            'enablePushNotifications': true,
            'advancedAnalytics': true,
            'phishingStats': {}
        });
        
        // Запрашиваем разрешение на уведомления при установке
        requestNotificationPermission();
    }
    
    // Загружаем статистику фишинга
    loadPhishingStats();
});

// Добавляем обработчик для получения данных от content script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkUrl') {
    // Обработка старого формата запроса
    checkUrl(request.url, sender.tab.id).then(result => {
      sendResponse({ status: 'complete', result: result });
    });
    return true;
  } else {
    // Обработка нового формата (признаки от content script)
    results[sender.tab.id] = request;
    classifyFeatures(sender.tab.id, request);
    sendResponse({received: "result"});
    return true;
  }
});

/**
 * Классифицирует признаки страницы
 * @param {number} tabId - ID вкладки
 * @param {Object} result - Объект с признаками
 */
function classifyFeatures(tabId, result) {
  // Счетчики для признаков
  var legitimateCount = 0;
  var suspiciousCount = 0;
  var phishingCount = 0;

  // Подсчитываем количество признаков каждого типа
  for(var key in result) {
    if(result[key] == "1") phishingCount++;
    else if(result[key] == "0") suspiciousCount++;
    else legitimateCount++;
  }
  
  // Вычисляем процент легитимных признаков
  legitimatePercents[tabId] = legitimateCount / (phishingCount + suspiciousCount + legitimateCount) * 100;

  if(Object.keys(result).length > 0) {
    // Подготавливаем данные для ML модели
    var X = [];
    X[0] = [];
    for(var key in result) {
      X[0].push(parseInt(result[key]));
    }
    
    // Получаем предсказание модели ML
    var prediction = classifyWithXGBoost(X);
    console.log('Результат классификации:', prediction[0][0]);
    
    // Определяем, является ли сайт фишинговым
    if(prediction[0][0]) {
      isPhish[tabId] = true;
      
      // Обновляем статистику
      updatePhishingStatistics({
        url: getUrlFromTabId(tabId),
        isPhishing: true,
        reasons: Object.keys(result).filter(key => result[key] === "1")
      });
      
      // Показываем предупреждение пользователю
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].id === tabId) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "alert_user"}, function(response) {
            // Обработка ответа
          });
        }
      });
    } else {
      isPhish[tabId] = false;
    }
    
    // Сохраняем результаты в хранилище
    chrome.storage.local.set({
      'results': results, 
      'legitimatePercents': legitimatePercents, 
      'isPhish': isPhish
    });
  }
}

/**
 * Получает URL вкладки по ее ID
 * @param {number} tabId - ID вкладки
 * @returns {string} URL вкладки или пустая строка
 */
function getUrlFromTabId(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      resolve(tab ? tab.url : '');
    });
  });
}

/**
 * Классифицирует URL с использованием XGBoost модели
 * @param {Array} features - Массив признаков для классификации
 * @returns {Array} Результат классификации
 */
function classifyWithXGBoost(features) {
  try {
    // Проверяем, загружена ли модель xgboost
    if (typeof xgboost_model !== 'undefined' && typeof xgboost_model.predict === 'function') {
      return xgboost_model.predict(features);
    } else {
      console.error('Модель XGBoost не загружена');
      // Возвращаем фиктивный результат, если модель не загружена
      return [[false, 0.5]];
    }
  } catch (error) {
    console.error('Ошибка при классификации с XGBoost:', error);
    return [[false, 0.5]];
  }
}

// Загрузка статистики фишинга
async function loadPhishingStats() {
    try {
        const result = await chrome.storage.local.get(['phishingStats']);
        phishingStats = result.phishingStats || {
            domainFrequency: {},
            featureFrequency: {},
            timeDistribution: {},
            countryDistribution: {}
        };
    } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
        phishingStats = {
            domainFrequency: {},
            featureFrequency: {},
            timeDistribution: {},
            countryDistribution: {}
        };
    }
}

// Сохранение статистики фишинга
async function savePhishingStats() {
    try {
        await chrome.storage.local.set({ 'phishingStats': phishingStats });
    } catch (error) {
        console.error('Ошибка при сохранении статистики:', error);
    }
}

/**
 * Обновляет статистику фишинга на основе обнаружений
 * @param {Object} result - Результат проверки URL
 */
async function updatePhishingStatistics(result) {
    if (!result || !result.url) return;
    
    const domain = getDomainFromURL(result.url);
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const timeKey = `${dayOfWeek}-${hour}`;
    
    // Проверяем, что включены расширенные аналитики
    const advAnalytics = await chrome.storage.local.get(['advancedAnalytics']);
    if (!advAnalytics || !advAnalytics.advancedAnalytics) return;
    
    // Загружаем текущую статистику, если еще не загружена
    if (Object.keys(phishingStats).length === 0) {
        await loadPhishingStats();
    }
    
    // Если обнаружен фишинг, обновляем статистику
    if (result.isPhishing) {
        // Частота доменов
        phishingStats.domainFrequency[domain] = (phishingStats.domainFrequency[domain] || 0) + 1;
        
        // Распределение по времени
        phishingStats.timeDistribution[timeKey] = (phishingStats.timeDistribution[timeKey] || 0) + 1;
        
        // Частота признаков
        if (result.reasons && Array.isArray(result.reasons)) {
            result.reasons.forEach(reason => {
                const feature = reason.split(':')[0].trim();
                phishingStats.featureFrequency[feature] = (phishingStats.featureFrequency[feature] || 0) + 1;
            });
        }
        
        // Пытаемся получить информацию о стране по IP
        try {
            const ipInfo = await fetchIpInfo(result.url);
            if (ipInfo && ipInfo.country) {
                phishingStats.countryDistribution[ipInfo.country] = 
                    (phishingStats.countryDistribution[ipInfo.country] || 0) + 1;
            }
        } catch (error) {
            console.log('Невозможно получить информацию о стране');
        }
        
        // Сохраняем обновленную статистику
        await savePhishingStats();
    }
}

/**
 * Получает информацию об IP-адресе домена
 * @param {string} url - URL для которого нужно получить информацию
 * @returns {Promise<Object>} - Информация об IP (страна, город, провайдер)
 */
async function fetchIpInfo(url) {
    try {
        const domain = getDomainFromURL(url);
        if (!domain) return null;
        
        // В демо-режиме возвращаем фиктивные данные
        if (DEMO_MODE) {
            return {
                ip: '203.0.113.1',
                hostname: domain,
                country: 'RU',
                city: 'Москва',
                region: 'Москва',
                org: 'Example ISP',
                loc: '55.7558,37.6173',
                postal: '101000',
                timezone: 'Europe/Moscow'
            };
        }
        
        const response = await fetch(`https://ipinfo.io/${domain}/json`);
        if (!response.ok) return null;
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении информации об IP:', error);
        return null;
    }
}

// Запрос разрешений на push-уведомления
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        
        // Сохраняем статус разрешений для будущего использования
        chrome.storage.local.set({ 'notificationPermission': permission === 'granted' });
        
        // Если разрешение получено, отправляем тестовое уведомление
        if (permission === 'granted') {
            showNotification(
                'CorgPhish защитит вас от фишинга',
                'Теперь вы будете получать уведомления о потенциальных угрозах',
                '../icons/icon128.png'
            );
        }
    } catch (error) {
        console.error('Ошибка при запросе разрешений на уведомления:', error);
    }
}

// Функция отправки push-уведомления
function showNotification(title, message, iconUrl) {
    chrome.storage.local.get(['enablePushNotifications'], function(result) {
        if (result.enablePushNotifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: iconUrl || 'icons/icon128.png',
                title: title,
                message: message,
                priority: 2,
                buttons: [
                    {
                        title: 'Подробнее'
                    },
                    {
                        title: 'Закрыть'
                    }
                ]
            });
        }
    });
}

// Обработчик нажатий на кнопки в уведомлениях
chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
    if (buttonIndex === 0) {
        // Кнопка "Подробнее"
        if (lastResults[notificationId]) {
            const url = lastResults[notificationId].url;
            const reasons = lastResults[notificationId].reasons;
            
            // Формируем URL для страницы предупреждения
            const encodedUrl = encodeURIComponent(url);
            const encodedReasons = encodeURIComponent(JSON.stringify(reasons));
            
            const warningUrl = chrome.runtime.getURL(`html/warning.html?url=${encodedUrl}&reasons=${encodedReasons}`);
            
            chrome.tabs.create({ url: warningUrl });
        }
    }
    
    // Закрыть уведомление (для любой кнопки)
    chrome.notifications.clear(notificationId);
});

// Импорт модулей для проверки и обработки URL
import { extractFeatures, normalizeFeatures } from './utils/features.js';
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
    
    // Используем реальный URL для API
    const apiBaseUrl = 'https://physcorgi.github.io/CorgPhish/api';
    
    try {
        // В демо-режиме всегда сообщаем что ключ валидный
        if (DEMO_MODE) {
            return true;
        }
        
        const result = await checkWithGoogleSafeBrowsing(apiBaseUrl, apiKey);
        
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
    
    // Получаем домен из URL
    let domain = '';
    try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
    } catch (error) {
        console.error('Ошибка при обработке URL:', error);
        return null;
    }
    
    // Получаем настройки и статистику
    const data = await chrome.storage.local.get(['totalChecked', 'phishingDetected', 'gsb_api_key', 'ignoreWhitelist']);
    const { gsb_api_key, ignoreWhitelist } = data;
    let { totalChecked, phishingDetected } = data;
    
    // Обновляем счетчик проверенных URL
    totalChecked++;
    
    try {
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
                ],
                timestamp: Date.now()
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            // Отправляем push-уведомление
            const notificationId = 'phishing_' + Date.now();
            showNotification(
                'Обнаружен фишинговый сайт!',
                `CorgPhish заблокировал доступ к подозрительному сайту: ${domain}`,
                '../icons/warning-icon.png'
            );
            
            // Сохраняем информацию о предупреждении для обработки действий в уведомлении
            lastResults[notificationId] = {
                url: url,
                reasons: ['Сайт определен как фишинговый', ...result.reasons]
            };
            
            // Сохраняем результат в истории
            saveToHistory(result);
            
            return result;
        }
        
        // Проверяем локальные файлы
        if (urlObj.protocol === 'file:') {
            console.log('Локальный файл, пропускаем проверку:', url);
            return { isPhishing: false, score: 0, reasons: ['Локальный файл'], timestamp: Date.now() };
        }
        
        // Проверяем домен в белом списке
        if (!ignoreWhitelist && isDomainInWhitelist(domain)) {
            console.log('Домен в белом списке:', domain);
            return { isPhishing: false, score: 0, reasons: ['Домен в белом списке'], timestamp: Date.now() };
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
                reasons: ['Домен находится в черном списке'],
                timestamp: Date.now()
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            // Отправляем push-уведомление
            const notificationId = 'phishing_' + Date.now();
            showNotification(
                'Обнаружен фишинговый сайт!',
                `CorgPhish заблокировал доступ к подозрительному сайту: ${domain}`,
                '../icons/warning-icon.png'
            );
            
            // Сохраняем информацию о предупреждении для обработки действий в уведомлении
            lastResults[notificationId] = {
                url: url,
                reasons: ['Сайт определен как фишинговый', ...result.reasons]
            };
            
            // Сохраняем результат в истории
            saveToHistory(result);
            
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
                ],
                timestamp: Date.now()
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            // Отправляем push-уведомление
            const notificationId = 'phishing_' + Date.now();
            showNotification(
                'Обнаружен фишинговый сайт!',
                `CorgPhish заблокировал доступ к подозрительному сайту: ${domain}`,
                '../icons/warning-icon.png'
            );
            
            // Сохраняем информацию о предупреждении для обработки действий в уведомлении
            lastResults[notificationId] = {
                url: url,
                reasons: ['Сайт определен как фишинговый', ...result.reasons]
            };
            
            // Сохраняем результат в истории
            saveToHistory(result);
            
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
                reasons: reasons,
                timestamp: Date.now()
            };
            
            // Сохраняем результат
            lastResults[url] = result;
            
            // Перенаправляем на страницу предупреждения
            redirectToWarningPage(url, tabId, result);
            
            // Отправляем push-уведомление
            const notificationId = 'phishing_' + Date.now();
            showNotification(
                'Обнаружен фишинговый сайт!',
                `CorgPhish заблокировал доступ к подозрительному сайту: ${domain}`,
                '../icons/warning-icon.png'
            );
            
            // Сохраняем информацию о предупреждении для обработки действий в уведомлении
            lastResults[notificationId] = {
                url: url,
                reasons: ['Сайт определен как фишинговый', ...reasons]
            };
            
            // Сохраняем результат в истории
            saveToHistory(result);
            
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
            reasons: ['URL прошел все проверки'],
            timestamp: Date.now()
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
        
        // Сохраняем результат в истории
        saveToHistory(result);
        
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
            reasons: ['Ошибка при проверке'],
            timestamp: Date.now()
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

/**
 * Сохраняет результат проверки в истории
 * 
 * @param {Object} result - Результат проверки сайта
 */
async function saveToHistory(result) {
    try {
        // Получаем текущую историю
        const data = await chrome.storage.local.get(['history']);
        let history = data.history || [];
        
        // Ограничиваем размер истории (сохраняем максимум 100 записей)
        if (history.length >= 100) {
            // Сортируем по времени (старые записи в начале)
            history.sort((a, b) => a.timestamp - b.timestamp);
            // Удаляем самые старые записи
            history = history.slice(history.length - 99);
        }
        
        // Добавляем новую запись
        history.push(result);
        
        // Сохраняем обновленную историю
        await chrome.storage.local.set({ 'history': history });
        
        console.log('Результат проверки сохранен в историю');
    } catch (error) {
        console.error('Ошибка при сохранении в историю:', error);
    }
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
    } else if (request.action === 'deepScanResults') {
        // Обрабатываем результаты глубокого сканирования
        handleDeepScanResults(request.data, sender.tab ? sender.tab.id : null).then(result => {
            sendResponse({ status: 'complete', result: result });
        }).catch(error => {
            console.error('Ошибка при обработке глубокого сканирования:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        
        // Возвращаем true, чтобы использовать асинхронный ответ
        return true;
    } else if (request.action === 'deepScanWarning') {
        // Обрабатываем предупреждение от глубокого сканирования
        handleDeepScanWarning(request.result);
        sendResponse({ status: 'received' });
        return true;
    }
});

// Вспомогательная функция для извлечения домена из URL
function getDomainFromURL(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (error) {
        console.error('Ошибка при обработке URL:', error);
        return url;
    }
}

/**
 * Обрабатывает результаты глубокого сканирования страницы
 * @param {Object} pageData - Данные, собранные при глубоком сканировании
 * @param {number} tabId - ID вкладки, с которой пришли данные
 * @returns {Promise<Object>} - Результат анализа
 */
async function handleDeepScanResults(pageData, tabId) {
    console.log('Получены данные глубокого сканирования:', pageData);
    
    // Счетчик рисков
    let riskScore = 0;
    const highRiskFactors = [];
    
    // Проверяем скрытые элементы
    if (pageData.hiddenElements && pageData.hiddenElements.count > 5) {
        riskScore += Math.min(pageData.hiddenElements.count * 0.5, 30);
        if (pageData.hiddenElements.count > 10) {
            highRiskFactors.push('Большое количество скрытых элементов: ' + pageData.hiddenElements.count);
        }
    }
    
    // Проверяем обфусцированный код
    if (pageData.obfuscatedCode && pageData.obfuscatedCode.hasObfuscatedCode) {
        riskScore += 30;
        highRiskFactors.push('Обнаружен обфусцированный код: ' + 
                            pageData.obfuscatedCode.obfuscationTechniques.join(', '));
    }
    
    // Проверяем формы
    if (pageData.forms && pageData.forms.length > 0) {
        const passwordForms = pageData.forms.filter(form => form.hasPasswordField);
        if (passwordForms.length > 0) {
            // Проверяем наличие важных полей в формах с паролем
            for (const form of passwordForms) {
                // Форма содержит поле пароля без шифрования
                if (!form.isSecure) {
                    riskScore += 40;
                    highRiskFactors.push('Форма с паролем отправляется без шифрования');
                }
                
                // Если форма имитирует вход в известный сервис
                if (form.potentialImpersonation) {
                    riskScore += 50;
                    highRiskFactors.push('Форма имитирует вход в ' + form.potentialImpersonation);
                }
            }
        }
    }
    
    // Проверяем перенаправления
    if (pageData.redirects && pageData.redirects.hasRedirects) {
        riskScore += 20;
        if (pageData.redirects.immediate) {
            riskScore += 20;
            highRiskFactors.push('Обнаружено немедленное перенаправление');
        }
    }
    
    // Проверяем iframe
    if (pageData.iframesData && pageData.iframesData.count > 0) {
        // Если есть iframe с другим доменом
        if (pageData.iframesData.crossDomain) {
            riskScore += 15;
            if (pageData.iframesData.hiddenIframes > 0) {
                riskScore += 25;
                highRiskFactors.push('Обнаружены скрытые iframe с других доменов');
            }
        }
    }
    
    // Результат анализа
    const result = {
        highRiskDetected: riskScore > 70 || highRiskFactors.length > 1,
        riskScore: riskScore,
        reasons: highRiskFactors,
        domain: pageData.domain
    };
    
    // Сохраняем расширенную информацию для статистики
    if (result.highRiskDetected) {
        storeDeepScanStats(pageData, result);
    }
    
    return result;
}

/**
 * Обрабатывает предупреждение от глубокого сканирования
 * @param {Object} result - Результат анализа глубокого сканирования
 */
function handleDeepScanWarning(result) {
    console.warn('Предупреждение от глубокого сканирования:', result);
    
    // Если обнаружен высокий риск, показываем уведомление
    if (result.highRiskDetected) {
        // Проверяем, включены ли push-уведомления
        chrome.storage.local.get('enablePushNotifications', function(data) {
            if (data.enablePushNotifications !== false) {
                // Создаем уведомление о подозрительной активности
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '../images/icon-128.png',
                    title: 'Предупреждение CorgPhish',
                    message: 'Обнаружены подозрительные элементы: ' + 
                             (result.reasons.length > 0 ? result.reasons[0] : 'повышенный риск фишинга'),
                    priority: 2
                });
            }
        });
    }
}

/**
 * Сохраняет статистику по глубокому сканированию
 * @param {Object} pageData - Данные страницы
 * @param {Object} result - Результат анализа
 */
function storeDeepScanStats(pageData, result) {
    chrome.storage.local.get(['deepScanStats'], function(data) {
        // Инициализируем статистику, если её нет
        const stats = data.deepScanStats || {
            totalDetections: 0,
            byDomain: {},
            byTechnique: {
                obfuscatedCode: 0,
                hiddenElements: 0,
                insecureForms: 0,
                redirects: 0,
                iframes: 0
            },
            recentDetections: []
        };
        
        // Обновляем общий счетчик
        stats.totalDetections++;
        
        // Обновляем счетчик по домену
        const domain = pageData.domain;
        stats.byDomain[domain] = (stats.byDomain[domain] || 0) + 1;
        
        // Обновляем счетчики по техникам
        if (pageData.obfuscatedCode && pageData.obfuscatedCode.hasObfuscatedCode) {
            stats.byTechnique.obfuscatedCode++;
        }
        if (pageData.hiddenElements && pageData.hiddenElements.count > 5) {
            stats.byTechnique.hiddenElements++;
        }
        if (pageData.forms && pageData.forms.some(form => form.hasPasswordField && !form.isSecure)) {
            stats.byTechnique.insecureForms++;
        }
        if (pageData.redirects && pageData.redirects.hasRedirects) {
            stats.byTechnique.redirects++;
        }
        if (pageData.iframesData && pageData.iframesData.crossDomain) {
            stats.byTechnique.iframes++;
        }
        
        // Добавляем в недавние обнаружения
        stats.recentDetections.unshift({
            timestamp: Date.now(),
            domain: domain,
            riskScore: result.riskScore,
            reasons: result.reasons
        });
        
        // Ограничиваем список недавних обнаружений
        if (stats.recentDetections.length > 50) {
            stats.recentDetections = stats.recentDetections.slice(0, 50);
        }
        
        // Сохраняем обновленную статистику
        chrome.storage.local.set({ 'deepScanStats': stats });
    });
} 