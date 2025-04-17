/**
 * settings.js - Настройки расширения CorgPhish
 * 
 * Этот файл содержит общие настройки и конфигурации для расширения CorgPhish.
 * Все важные константы и параметры должны быть определены здесь для удобства 
 * централизованного управления.
 */

// Версия расширения
const VERSION = '1.0.1';

// Настройки для анализа фишинга
const PHISHING_SETTINGS = {
  // Пороговое значение для определения фишингового сайта (в процентах)
  threshold: 75,
  
  // Максимальное время ожидания ответа от API (в миллисекундах)
  apiTimeout: 5000,
  
  // Частота обновления списка фишинговых сайтов (в часах)
  updateInterval: 24,
  
  // Максимальное число URL в истории
  maxHistoryItems: 50,
  
  // Включить расширенную проверку по API (может работать медленнее)
  enableExtendedCheck: true,
  
  // Включить оповещения о фишинге
  enableNotifications: true,
  
  // Использовать локальную модель для проверки
  useLocalModel: true,
  
  // Использовать API сервер для проверки
  useApiServer: false,
  
  // Сохранять статистику проверок
  collectStats: true,

  // Особое внимание российскому сегменту интернета
  focusOnRussianWeb: true
};

// Настройки интерфейса
const UI_SETTINGS = {
  // Тема интерфейса (light, dark, system)
  theme: 'system',
  
  // Язык интерфейса (ru, en)
  language: 'ru',
  
  // Показывать всплывающие уведомления
  showPopupNotifications: true,
  
  // Воспроизводить звуковое оповещение
  playSound: false,
  
  // Показывать подробную информацию о проверке
  showDetailedInfo: true,
  
  // Анимации в интерфейсе
  enableAnimations: true
};

// Ключевые URL-адреса
const URLS = {
  // Домашняя страница расширения
  homepage: 'https://corgphish.ru',
  
  // Страница справки
  help: 'https://corgphish.ru/help',
  
  // Страница для сообщения о ложном срабатывании
  reportFalsePositive: 'https://corgphish.ru/report',
  
  // API для проверки URL
  api: 'https://api.corgphish.ru'
};

// Параметры для локальной базы данных
const DB_SETTINGS = {
  // Название базы данных
  name: 'corgphish',
  
  // Версия базы данных
  version: 1,
  
  // Максимальный размер базы данных (в мегабайтах)
  maxSize: 10
};

// Экспорт всех настроек
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VERSION,
    PHISHING_SETTINGS,
    UI_SETTINGS,
    URLS,
    DB_SETTINGS
  };
}

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы DOM для белого списка
    const whitelistTextarea = document.getElementById('whitelist');
    const saveWhitelistButton = document.getElementById('saveWhitelist');
    const whitelistStatus = document.getElementById('whitelist-status');
    
    // Получаем элементы DOM для настроек Google Safe Browsing
    const gsbApiKey = document.getElementById('gsb-api-key');
    const saveGsbButton = document.getElementById('save-gsb');
    const testGsbButton = document.getElementById('test-gsb');
    const gsbStatus = document.getElementById('gsb-status');
    
    // Получаем элементы чекбоксов для настроек
    const ignoreWhitelistCheckbox = document.getElementById('ignoreWhitelist');
    const darkThemeCheckbox = document.getElementById('darkTheme');
    const enablePushNotificationsCheckbox = document.getElementById('enablePushNotifications');
    
    // Получаем элементы для обновления модели
    const checkForUpdatesButton = document.getElementById('check-for-updates');
    const modelVersion = document.getElementById('model-version');
    const updateStatus = document.getElementById('update-status');
    
    // Получаем элемент переключателя глубокого сканирования
    const deepScanToggle = document.getElementById('deep-scan');
    
    // Загрузка данных при инициализации
    loadSettings();
    
    // Обработчики событий
    saveWhitelistButton.addEventListener('click', saveWhitelist);
    saveGsbButton.addEventListener('click', saveGsbApiKey);
    testGsbButton.addEventListener('click', testGsbApiKey);
    
    // Обработчики событий для чекбоксов
    ignoreWhitelistCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({ 'ignoreWhitelist': this.checked });
    });
    
    darkThemeCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({ 'darkTheme': this.checked });
    });
    
    enablePushNotificationsCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({ 'enablePushNotifications': this.checked });
    });
    
    // Обработчик для кнопки проверки обновлений модели
    checkForUpdatesButton.addEventListener('click', checkModelUpdates);
    
    // Обработчик для переключателя глубокого сканирования
    deepScanToggle.addEventListener('change', toggleDeepScan);
    
    /**
     * Загружает настройки из хранилища
     */
    function loadSettings() {
        // Загрузка белого списка
        chrome.storage.local.get(['whitelist', 'gsb_api_key', 'ignoreWhitelist', 'darkTheme', 'enablePushNotifications', 'modelVersion', 'lastModelCheck', 'deepScanEnabled'], function(result) {
            const whitelist = result.whitelist || '';
            whitelistTextarea.value = whitelist;
            
            gsbApiKey.value = result.gsb_api_key || '';
            
            // Устанавливаем значения чекбоксов
            ignoreWhitelistCheckbox.checked = !!result.ignoreWhitelist;
            darkThemeCheckbox.checked = !!result.darkTheme;
            enablePushNotificationsCheckbox.checked = result.enablePushNotifications !== false; // По умолчанию true
            
            // Если темная тема включена, применяем её к странице настроек
            if (result.darkTheme) {
                document.body.classList.add('dark-theme');
            }
            
            // Обновляем информацию о версии модели
            modelVersion.textContent = result.modelVersion || '1.0.0';
            
            // Обновляем информацию о последней проверке обновлений
            if (result.lastModelCheck) {
                const lastCheck = new Date(result.lastModelCheck);
                updateStatus.textContent = `Последняя проверка: ${lastCheck.toLocaleDateString()} ${lastCheck.toLocaleTimeString()}`;
            } else {
                updateStatus.textContent = 'Последняя проверка: никогда';
            }
            
            // Обновляем состояние переключателя глубокого сканирования
            deepScanToggle.checked = result.deepScanEnabled === true;
        });
    }
    
    /**
     * Проверяет наличие обновлений для модели машинного обучения
     */
    function checkModelUpdates() {
        updateStatus.textContent = 'Проверка обновлений...';
        updateStatus.className = 'status-text loading';
        
        // Получаем текущую версию модели
        chrome.storage.local.get(['modelVersion'], function(result) {
            const currentVersion = result.modelVersion || '1.0.0';
            
            // Демо-режим для показа процесса обновления
            // В реальном приложении здесь должен быть запрос к серверу
            setTimeout(() => {
                // Сравниваем версии
                const serverVersion = '1.0.1'; // В реальном коде получаем с сервера
                
                if (compareVersions(serverVersion, currentVersion) > 0) {
                    // Доступна новая версия
                    updateStatus.textContent = `Доступна новая версия: ${serverVersion}`;
                    updateStatus.className = 'status-text warning';
                    
                    // Спрашиваем пользователя, хочет ли он обновить модель
                    if (confirm(`Доступна новая версия модели: ${serverVersion}. Установить?`)) {
                        // Устанавливаем новую версию
                        installModelUpdate(serverVersion);
                    }
                } else {
                    // Модель актуальна
                    updateStatus.textContent = `Модель актуальна (${currentVersion})`;
                    updateStatus.className = 'status-text success';
                    
                    // Обновляем время последней проверки
                    chrome.storage.local.set({ 'lastModelCheck': Date.now() });
                }
            }, 1500);
        });
    }
    
    /**
     * Устанавливает обновление модели
     * @param {string} newVersion - Новая версия модели
     */
    function installModelUpdate(newVersion) {
        updateStatus.textContent = 'Установка обновления...';
        updateStatus.className = 'status-text loading';
        
        // Имитация загрузки и установки модели
        // В реальном приложении здесь должна быть загрузка модели с сервера
        setTimeout(() => {
            // Обновляем версию модели
            chrome.storage.local.set({ 
                'modelVersion': newVersion,
                'lastModelCheck': Date.now()
            });
            
            // Обновляем отображение версии
            modelVersion.textContent = newVersion;
            
            // Обновляем статус
            updateStatus.textContent = `Обновление до версии ${newVersion} установлено`;
            updateStatus.className = 'status-text success';
            
            // Уведомляем пользователя
            showAlert('success', `Модель успешно обновлена до версии ${newVersion}`);
        }, 2000);
    }
    
    /**
     * Сравнивает версии по формату semver
     * @param {string} version1 - Первая версия
     * @param {string} version2 - Вторая версия
     * @returns {number} - 1 если version1 > version2, -1 если version1 < version2, 0 если равны
     */
    function compareVersions(version1, version2) {
        const parts1 = version1.split('.').map(Number);
        const parts2 = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const part1 = parts1[i] || 0;
            const part2 = parts2[i] || 0;
            
            if (part1 > part2) return 1;
            if (part1 < part2) return -1;
        }
        
        return 0;
    }
    
    /**
     * Переключает режим глубокого сканирования
     */
    function toggleDeepScan() {
        const isEnabled = deepScanToggle.checked;
        chrome.storage.local.set({ 'deepScanEnabled': isEnabled });
        
        // Показываем сообщение пользователю
        if (isEnabled) {
            showAlert('success', 'Глубокое сканирование включено. Это может повысить точность обнаружения фишинга, но может немного замедлить работу.');
        } else {
            showAlert('info', 'Глубокое сканирование отключено.');
        }
    }
    
    // Обработчики событий для кнопок и переключателей
    setupEventListeners();
});

/**
 * Настраивает обработчики событий для всех элементов управления
 */
function setupEventListeners() {
    // Обработчики для переключателей
    const toggleInputs = document.querySelectorAll('input[type="checkbox"]');
    toggleInputs.forEach(input => {
        input.addEventListener('change', function() {
            saveToggleSettings();
        });
    });
    
    // Обработчик для кнопки сохранения API ключа
    document.getElementById('saveGsbApiKey').addEventListener('click', function() {
        saveGsbApiKey();
    });
    
    // Обработчик для кнопки проверки API ключа
    document.getElementById('testGsbApiKey').addEventListener('click', function() {
        testGsbApiKey();
    });
    
    // Обработчик для кнопки сохранения белого списка
    document.getElementById('saveWhitelist').addEventListener('click', function() {
        saveWhitelist();
    });
}

/**
 * Сохраняет состояние всех переключателей
 */
function saveToggleSettings() {
    const enableProtection = document.getElementById('enableProtection').checked;
    const blockPhishing = document.getElementById('blockPhishing').checked;
    const showNotifications = document.getElementById('showNotifications').checked;
    const useLocalModel = document.getElementById('useLocalModel').checked;
    const useDomainCheck = document.getElementById('useDomainCheck').checked;
    
    chrome.storage.local.set({
        'enableProtection': enableProtection,
        'blockPhishing': blockPhishing,
        'showNotifications': showNotifications,
        'useLocalModel': useLocalModel,
        'useDomainCheck': useDomainCheck
    }, function() {
        showAlert('success', 'Настройки успешно сохранены');
    });
}

/**
 * Сохраняет API ключ Google Safe Browsing
 */
function saveGsbApiKey() {
    const apiKey = document.getElementById('gsbApiKey').value.trim();
    
    if (!apiKey) {
        showAlert('error', 'API ключ не может быть пустым');
        return;
    }
    
    showAlert('info', 'Сохранение API ключа...');
    
    chrome.storage.local.set({
        'gsbApiKey': apiKey
    }, function() {
        showAlert('success', 'API ключ успешно сохранен');
    });
}

/**
 * Проверяет валидность API ключа Google Safe Browsing
 */
function testGsbApiKey() {
    const apiKey = document.getElementById('gsbApiKey').value.trim();
    
    if (!apiKey) {
        showAlert('error', 'Введите API ключ для проверки');
        return;
    }
    
    showAlert('info', 'Проверка API ключа...');
    
    // Отправляем сообщение в фоновый скрипт для проверки API ключа
    chrome.runtime.sendMessage({
        action: 'test_gsb_api_key',
        apiKey: apiKey
    }, function(response) {
        if (response && response.success) {
            showAlert('success', 'API ключ валиден и успешно сохранен');
        } else {
            showAlert('error', 'Неверный API ключ или проблема с подключением');
        }
    });
}

/**
 * Сохраняет белый список доменов
 */
function saveWhitelist() {
    const whitelistText = document.getElementById('whitelist').value;
    const domains = whitelistText.split('\n')
        .map(domain => domain.trim())
        .filter(domain => domain.length > 0);
    
    chrome.storage.local.set({
        'whitelist': domains
    }, function() {
        showAlert('success', `Белый список успешно сохранен (${domains.length} доменов)`);
    });
}

/**
 * Отображает уведомление на странице
 * @param {string} type - Тип уведомления (success/error/info)
 * @param {string} message - Текст уведомления
 */
function showAlert(type, message) {
    const alertContainer = document.getElementById('alert-container');
    
    // Удаляем предыдущие уведомления
    while (alertContainer.firstChild) {
        alertContainer.removeChild(alertContainer.firstChild);
    }
    
    // Создаем новое уведомление
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Добавляем уведомление на страницу
    alertContainer.appendChild(alertDiv);
    
    // Автоматически скрываем уведомление через 5 секунд
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
            if (alertContainer.contains(alertDiv)) {
                alertContainer.removeChild(alertDiv);
            }
        }, 500);
    }, 5000);
}

// Обработчик сообщений от background script
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'api_key_validation_result') {
        if (request.success) {
            showAlert('success', 'API ключ валиден и успешно сохранен');
        } else {
            showAlert('error', request.message || 'Неверный API ключ');
        }
    }
}); 