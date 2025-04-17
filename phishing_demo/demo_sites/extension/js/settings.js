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
    // Загружаем сохраненные настройки
    loadSettings();
    
    // Обработчики событий для кнопок и переключателей
    setupEventListeners();
});

/**
 * Загружает сохраненные настройки из chrome.storage
 */
function loadSettings() {
    chrome.storage.local.get([
        'enableProtection',
        'blockPhishing',
        'showNotifications',
        'useLocalModel',
        'useDomainCheck',
        'gsbApiKey',
        'whitelist'
    ], function(data) {
        // Устанавливаем значения переключателей
        document.getElementById('enableProtection').checked = 
            data.enableProtection !== undefined ? data.enableProtection : true;
        
        document.getElementById('blockPhishing').checked = 
            data.blockPhishing !== undefined ? data.blockPhishing : true;
        
        document.getElementById('showNotifications').checked = 
            data.showNotifications !== undefined ? data.showNotifications : true;
        
        document.getElementById('useLocalModel').checked = 
            data.useLocalModel !== undefined ? data.useLocalModel : true;
        
        document.getElementById('useDomainCheck').checked = 
            data.useDomainCheck !== undefined ? data.useDomainCheck : true;
        
        // Устанавливаем значение API ключа
        if (data.gsbApiKey) {
            document.getElementById('gsbApiKey').value = data.gsbApiKey;
        }
        
        // Устанавливаем значение белого списка
        if (data.whitelist && Array.isArray(data.whitelist)) {
            document.getElementById('whitelist').value = data.whitelist.join('\n');
        }
    });
}

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