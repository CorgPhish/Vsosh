/**
 * popup.js - Скрипт для всплывающего окна расширения CorgPhish
 */

// Глобальная настройка: демонстрационный режим 
const DEMO_MODE = false;

// Цветовая кодировка для индикаторов
var colors = {
    "-1": "#58bc8a", // безопасно
    "0": "#ffeb3c",  // подозрительно
    "1": "#ff8b66"   // опасно
};

// Список официальных доменов (белый список)
const whitelist = [
    'google.com', 'youtube.com', 'gmail.com', 'facebook.com', 'instagram.com',
    'twitter.com', 'linkedin.com', 'github.com', 'microsoft.com', 'apple.com',
    'amazon.com', 'netflix.com', 'yandex.ru', 'mail.ru', 'vk.com',
    'wikipedia.org', 'reddit.com', 'twitch.tv', 'yahoo.com', 'whatsapp.com',
    'wordpress.com', 'shopify.com', 'ebay.com', 'paypal.com', 'dropbox.com',
    'zoom.us', 'pinterest.com', 'tumblr.com', 'telegram.org', 'discord.com',
    'corgydyr.com', 'corgphish.com'
];

// Список демонстрационных фишинговых доменов
const phishingDemoList = [
    'demo-phish.com', 'phishing-demo.org', 'test-phish.com', 'phish-example.net',
    'phishing-test.com', 'fake-bank.com', 'bank-secure-demo.com', 'paypa1.com',
    'amaz0n-secure.com', 'goog1e-verification.com', 'faceb00k-login.com',
    'apple-id-confirm.com', 'microsoft-verify.com', 'netflix-account-update.com'
];

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup DOM fully loaded');
    
    // Включаем или выключаем демо-индикатор
    const demoIndicator = document.getElementById('demo-indicator');
    if (demoIndicator) {
        demoIndicator.style.display = DEMO_MODE ? 'block' : 'none';
    }
    
    // Initialize UI components for bottom navigation
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems) {
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
                
                // Load content for specific tabs
                if (tabId === 'history') {
                    console.log('Loading history tab');
                    loadHistory();
                } else if (tabId === 'settings') {
                    console.log('Loading settings tab');
                    initSettings();
                }
            });
        });
    }
    
    // Initialize history controls
    const clearHistoryBtn = document.getElementById('clear-history');
    if (clearHistoryBtn) {
        console.log('Setting up clear history button');
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // Initialize theme toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Load theme setting
    chrome.storage.sync.get({darkTheme: false}, function(items) {
        if (items.darkTheme) {
            document.body.classList.add('dark-theme');
        }
    });
    
    // Default to main tab
    switchTab('main');
    
    // Initialize CSS variables for RGB values
    initCssColorVariables();
    
    var featureList = document.getElementById("features");
    
    // Получение информации о текущей вкладке
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);
            const domain = url.hostname;
            
            // Отображаем домен
            document.getElementById('site_domain').textContent = domain;
            
            // Проверяем, является ли сайт демонстрационным фишинговым сайтом
            if (isPhishingDemo(domain)) {
                updatePhishingUI(domain);
            } else {
                // Проверяем, является ли сайт в белом списке
                const isInWhite = isInWhitelist(domain);
                
                // В зависимости от результата проверки обновляем UI
                updateSafeUI(domain, isInWhite);
            }
        }
    });

    // Загрузка истории проверок
    loadHistory();
});

// Initialize CSS RGB variables for animations
function initCssColorVariables() {
    const root = document.documentElement;
    
    // Parse primary color to RGB
    const primaryColor = getComputedStyle(root).getPropertyValue('--primary-color').trim();
    const secondaryColor = getComputedStyle(root).getPropertyValue('--secondary-color').trim();
    
    const primaryRGB = hexToRgb(primaryColor);
    const secondaryRGB = hexToRgb(secondaryColor);
    
    if (primaryRGB) {
        root.style.setProperty('--primary-rgb', `${primaryRGB.r}, ${primaryRGB.g}, ${primaryRGB.b}`);
    } else {
        root.style.setProperty('--primary-rgb', '59, 130, 246'); // Default blue
    }
    
    if (secondaryRGB) {
        root.style.setProperty('--secondary-rgb', `${secondaryRGB.r}, ${secondaryRGB.g}, ${secondaryRGB.b}`);
    } else {
        root.style.setProperty('--secondary-rgb', '79, 70, 229'); // Default indigo
    }
}

// Convert hex to RGB
function hexToRgb(hex) {
    // Handle shorthand hex
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Функция для добавления особенности
function addFeature(list, impact, icon, text) {
    const li = document.createElement('li');
    
    const iconDiv = document.createElement('div');
    iconDiv.className = `feature-icon feature-${impact}`;
    
    const iconElement = document.createElement('i');
    iconElement.className = `fas fa-${icon}`;
    iconDiv.appendChild(iconElement);
    
    li.appendChild(iconDiv);
    li.appendChild(document.createTextNode(text));
    
    // Add animation delay for staggered effect
    const itemIndex = list.children.length;
    li.style.animationDelay = `${0.1 * itemIndex}s`;
    
    list.appendChild(li);
}

// Функция для обработки нажатия на элемент списка
function setupFeatureItemEvents() {
    document.querySelectorAll('#features li').forEach(item => {
        item.addEventListener('click', function() {
            // Add subtle bounce animation
            this.classList.add('feature-clicked');
            setTimeout(() => {
                this.classList.remove('feature-clicked');
            }, 500);
        });
    });
}

// Функция для обновления UI по результатам проверки
function updateUI(result, domain) {
    const resCircle = document.getElementById('res-circle');
    const siteScore = document.getElementById('site_score');
    const siteMsg = document.getElementById('site_msg');
    const siteDomain = document.getElementById('site_domain');
    const featuresList = document.getElementById('features');
    
    // Очищаем список особенностей
    featuresList.textContent = '';
    
    // Если результат не определен, показываем UI по умолчанию
    if (!result || typeof result.score !== 'number') {
        showDefaultUI(domain);
        return;
    }
    
    // Определяем рейтинг и цвет
    const score = parseInt(result.score);
    
    // Устанавливаем процент для CSS переменной
    resCircle.style.setProperty('--percentage', `${score}%`);
    
    // Удаляем все классы состояния
    resCircle.classList.remove('safe', 'warning', 'danger');
    
    // Устанавливаем состояние и текст в зависимости от оценки
    if (score >= 80) {
        resCircle.classList.add('safe');
        siteMsg.textContent = 'Безопасный сайт';
    } else if (score >= 50) {
        resCircle.classList.add('warning');
        siteMsg.textContent = 'Требуется осторожность';
    } else {
        resCircle.classList.add('danger');
        siteMsg.textContent = 'Опасный сайт';
    }
    
    // Применяем стили
    siteScore.textContent = score;
    
    // Устанавливаем домен
    siteDomain.textContent = domain;
    
    // Добавляем особенности
    if (result.features && Array.isArray(result.features) && result.features.length > 0) {
        result.features.forEach(feat => {
            let impact = 'neutral';
            if (feat.impact === 'positive') {
                impact = 'safe';
            } else if (feat.impact === 'negative') {
                impact = 'danger';
            } else if (feat.impact === 'warning') {
                impact = 'warning';
            }
            
            addFeature(featuresList, impact, feat.icon || 'info', feat.description);
        });
    } else {
        // Если особенностей нет, добавляем стандартные на основе счета
        addDefaultFeatures(featuresList, score);
    }
    
    // Устанавливаем обработчики событий для элементов списка
    setupFeatureItemEvents();
    
    // Проверка, является ли сайт официальным/доверенным
    const isOfficial = result.isOfficial || false;
    if (isOfficial) {
        const officialBadge = document.createElement('div');
        officialBadge.className = 'official-badge';
        officialBadge.textContent = 'Официальный сайт';
        siteDomain.appendChild(officialBadge);
        
        // Также обновляем сообщение
        siteMsg.textContent = 'Официальный сайт';
    }
    
    // Добавляем анимацию появления
    resCircle.style.animation = 'none';
    setTimeout(() => {
        resCircle.style.animation = 'fadeIn 1s ease-out forwards';
    }, 50);
    
    // Save to history
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        let currentUrl = '';
        if (tabs && tabs.length > 0) {
            currentUrl = tabs[0].url;
        }
        
        saveToHistory({
            domain: domain,
            url: currentUrl,
            score: score,
            date: new Date().toISOString(),
            status: isOfficial ? 'verified' : (score >= 80 ? 'safe' : (score >= 50 ? 'warning' : 'danger')),
            isOfficial: isOfficial
        });
    });
}

// Функция для отображения дефолтного UI
function showDefaultUI(domain) {
    const resCircle = document.getElementById('res-circle');
    const siteScore = document.getElementById('site_score');
    const siteMsg = document.getElementById('site_msg');
    const siteDomain = document.getElementById('site_domain');
    const featuresList = document.getElementById('features');
    
    // Очищаем список особенностей
    featuresList.textContent = '';
    
    // Удаляем все классы состояния
    resCircle.classList.remove('safe', 'warning', 'danger');
    
    // Устанавливаем значения по умолчанию
    siteScore.textContent = '--';
    siteScore.style.color = '#64748b';
    
    // Сбрасываем стили круга
    resCircle.style.setProperty('--percentage', '0%');
    
    // Обновляем сообщение
    siteMsg.textContent = 'Анализ невозможен';
    siteMsg.style.color = '#64748b';
    
    // Устанавливаем домен
    if (siteDomain) {
        siteDomain.textContent = domain || 'Неизвестный домен';
    }
    
    // Добавляем дефолтное сообщение
    const li = document.createElement('li');
    const iconDiv = document.createElement('div');
    iconDiv.className = 'feature-icon feature-warning';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-info';
    
    iconDiv.appendChild(icon);
    li.appendChild(iconDiv);
    li.appendChild(document.createTextNode('Не удалось провести анализ для этой страницы'));
    featuresList.appendChild(li);
}

// Функция для добавления дефолтных особенностей
function addDefaultFeatures(featuresList, score) {
    // Добавляем дефолтные особенности на основе счета
    if (score >= 80) {
        addFeature(featuresList, 'safe', 'check', 'SSL сертификат действителен');
        addFeature(featuresList, 'safe', 'check', 'Защищенное соединение (HTTPS)');
        addFeature(featuresList, 'safe', 'check', 'Домен существует более 1 года');
    } else if (score >= 50) {
        addFeature(featuresList, 'safe', 'check', 'SSL сертификат действителен');
        addFeature(featuresList, 'warning', 'info', 'Домен зарегистрирован недавно');
        addFeature(featuresList, 'warning', 'info', 'Подозрительные элементы на странице');
    } else {
        addFeature(featuresList, 'danger', 'exclamation', 'Отсутствует SSL сертификат');
        addFeature(featuresList, 'danger', 'exclamation', 'Подозрительный URL-адрес');
        addFeature(featuresList, 'danger', 'exclamation', 'Фишинговые элементы на странице');
    }
}

// Вспомогательная функция для добавления особенности
function addFeature(featuresList, impact, iconName, description) {
    const li = document.createElement('li');
    const iconDiv = document.createElement('div');
    
    if (impact === 'safe' || impact === 'positive') {
        iconDiv.className = 'feature-icon feature-safe';
    } else if (impact === 'neutral' || impact === 'warning') {
        iconDiv.className = 'feature-icon feature-warning';
    } else {
        iconDiv.className = 'feature-icon feature-danger';
    }
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-' + iconName;
    
    iconDiv.appendChild(icon);
    li.appendChild(iconDiv);
    li.appendChild(document.createTextNode(description));
    
    // Добавляем плавное появление с задержкой
    const itemDelay = featuresList.children.length * 100;
    li.style.opacity = '0';
    li.style.transform = 'translateY(10px)';
    li.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    featuresList.appendChild(li);
    
    // Запускаем анимацию с задержкой
    setTimeout(() => {
        li.style.opacity = '1';
        li.style.transform = 'translateY(0)';
    }, itemDelay);
}

// Функция для получения текущего URL
function getCurrentUrl() {
    let currentUrl = '';
    try {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs && tabs.length > 0 && tabs[0].url) {
                currentUrl = tabs[0].url;
            }
        });
    } catch (error) {
        console.error("Error getting current URL:", error);
    }
    return currentUrl;
}

// Функции для работы с историей

// Сохранение записи в историю
function saveToHistory(item) {
    // Проверяем, что URL и домен существуют
    if (!item) {
        console.error("Отсутствуют данные для сохранения в историю");
        return;
    }

    console.log("Сохранение записи в историю из popup:", item);
    
    // Подготавливаем запись для истории
    const historyItem = {
        url: item.url || '',
        domain: item.domain || '',
        score: item.score || 0,
        timestamp: Date.now(),
        date: item.date || new Date().toISOString(),
        status: item.status || (item.score >= 80 ? 'safe' : (item.score >= 50 ? 'warning' : 'danger')),
        isOfficial: item.isOfficial || false,
        features: item.features || []
    };
    
    chrome.storage.sync.get({history: []}, function(data) {
        let history = data.history || [];
        
        // Проверяем, что история это массив
        if (!Array.isArray(history)) {
            console.warn("История не является массивом, создаем новый");
            history = [];
        }
        
        // Проверяем, есть ли уже такой домен или URL в истории
        const existingIndex = history.findIndex(h => 
            (h.domain && historyItem.domain && h.domain === historyItem.domain) || 
            (h.url && historyItem.url && h.url === historyItem.url)
        );
        
        if (existingIndex !== -1) {
            // Обновляем существующую запись
            history[existingIndex] = historyItem;
            console.log("Обновлена существующая запись в истории");
        } else {
            // Добавляем новую запись в начало массива
            history.unshift(historyItem);
            console.log("Добавлена новая запись в историю");
        }
        
        // Ограничиваем размер истории (например, до 100 записей)
        if (history.length > 100) {
            history = history.slice(0, 100);
        }
        
        // Сохраняем обновленную историю
        chrome.storage.sync.set({history: history}, function() {
            if (chrome.runtime.lastError) {
                console.error("Ошибка при сохранении истории:", chrome.runtime.lastError);
            } else {
                console.log("История успешно сохранена, элементов:", history.length);
                // Обновляем отображение истории если мы в этой вкладке
                if (document.querySelector('.tab[data-tab="history"].active')) {
                    loadHistory();
                }
            }
        });
    });
}

// Загрузка истории из хранилища
function loadHistory() {
    console.log('Loading history');
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    // Clear current history
    historyList.textContent = '';
    
    chrome.storage.sync.get({history: []}, function(data) {
        if (data.history && data.history.length > 0) {
            // Sort by timestamp (newest first)
            data.history.sort((a, b) => b.timestamp - a.timestamp);
            
            // Add history items to the list
            data.history.forEach(item => {
                createHistoryItem(historyList, item);
            });
        } else {
            // Show empty history message
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'empty-history';
            emptyMsg.textContent = 'История проверок пуста';
            historyList.appendChild(emptyMsg);
        }
    });
}

// Create a history item element
function createHistoryItem(container, item) {
    // Используем общую функцию, если она доступна
    if (window.CorgPhishCommon && window.CorgPhishCommon.createHistoryItem) {
        return window.CorgPhishCommon.createHistoryItem(item, container);
    }
    
    // Запасная реализация, если общая функция недоступна
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    // Определяем статус проверки для стилизации
    let statusClass = 'safe';
    if (item.is_phishing) {
        statusClass = 'danger';
    } else if (item.score < 80) {
        statusClass = 'warning';
    }
    
    // Создаем элементы для истории
    const statusDiv = document.createElement('div');
    statusDiv.className = `history-status ${statusClass}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'history-content';
    
    const urlDiv = document.createElement('div');
    urlDiv.className = 'history-url';
    
    let displayUrl = '';
    try {
        const url = new URL(item.url);
        displayUrl = url.hostname;
    } catch(e) {
        displayUrl = item.url;
    }
    
    urlDiv.textContent = displayUrl;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'history-message';
    
    if (item.is_phishing) {
        messageDiv.textContent = 'Обнаружен фишинговый сайт';
    } else if (item.score < 80) {
        messageDiv.textContent = 'Подозрительный сайт';
    } else {
        messageDiv.textContent = 'Безопасный сайт';
    }
    
    const dateDiv = document.createElement('div');
    dateDiv.className = 'history-date';
    
    // Форматируем дату
    const date = new Date(item.timestamp);
    dateDiv.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    
    // Собираем структуру
    contentDiv.appendChild(urlDiv);
    contentDiv.appendChild(messageDiv);
    contentDiv.appendChild(dateDiv);
    
    historyItem.appendChild(statusDiv);
    historyItem.appendChild(contentDiv);
    
    container.appendChild(historyItem);
    
    return historyItem;
}

// Format date for display
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Remove item from history
function removeFromHistory(domain) {
    chrome.storage.sync.get({history: []}, function(data) {
        let history = data.history || [];
        
        // Filter out the item with the given domain
        history = history.filter(item => item.domain !== domain);
        
        // Save back to storage
        chrome.storage.sync.set({history: history}, function() {
            // If we're on the history tab, reload it
            if (document.getElementById('history-container').style.display !== 'none') {
                loadHistory();
            }
        });
    });
}

// Clear all history
function clearHistory() {
    chrome.storage.sync.set({history: []}, function() {
        loadHistory();
    });
}

// Switch tabs with animation
function switchTab(tabId) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected nav item
    document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');
    
    // Hide all content panels
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.style.display = 'none';
    });
    
    // Show selected content panel
    if (tabId === 'main') {
        document.getElementById('main-container').style.display = 'block';
    } else if (tabId === 'history') {
        document.getElementById('history-container').style.display = 'block';
    } else if (tabId === 'settings') {
        document.getElementById('settings-container').style.display = 'block';
    }
}

// Apply theme color with proper RGB variables
function applyThemeColor(color) {
    // Remove any existing theme color classes
    document.body.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-neon');
    
    // Add the selected theme color class
    document.body.classList.add(`theme-${color}`);
    
    // CSS variables for theme colors
    let primaryColor, secondaryColor, primaryRGB, secondaryRGB;
    
    switch(color) {
        case 'green':
            primaryColor = '#059669';
            secondaryColor = '#10b981';
            primaryRGB = '5, 150, 105';
            secondaryRGB = '16, 185, 129';
            break;
        case 'purple':
            primaryColor = '#8b5cf6';
            secondaryColor = '#a78bfa';
            primaryRGB = '139, 92, 246';
            secondaryRGB = '167, 139, 250';
            break;
        case 'neon':
            primaryColor = '#f0abfc';
            secondaryColor = '#c026d3';
            primaryRGB = '240, 171, 252';
            secondaryRGB = '192, 38, 211';
            break;
        case 'blue':
        default:
            primaryColor = '#3b82f6';
            secondaryColor = '#4f46e5';
            primaryRGB = '59, 130, 246';
            secondaryRGB = '79, 70, 229';
            break;
    }
    
    // Apply CSS variables to the root element
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    document.documentElement.style.setProperty('--primary-rgb', primaryRGB);
    document.documentElement.style.setProperty('--secondary-rgb', secondaryRGB);
    
    // Update gradients
    updateGradients();
}

// Update all gradient elements
function updateGradients() {
    // Get current theme values
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    
    // Find and update elements with gradients
    const elementsWithGradients = [
        { selector: '#plugin_name h1', property: 'backgroundImage', value: `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})` },
        { selector: '#plugin_name h1::after', property: 'backgroundImage', value: `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})` },
        { selector: '.tab.active::before', property: 'backgroundImage', value: `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})` },
        { selector: '.save-settings', property: 'background', value: `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})` },
        { selector: '#site_msg', property: 'backgroundImage', value: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }
    ];
    
    // Create a style element
    const styleElement = document.getElementById('dynamic-gradients') || document.createElement('style');
    if (!styleElement.id) {
        styleElement.id = 'dynamic-gradients';
        document.head.appendChild(styleElement);
    }
    
    // Generate CSS
    let css = '';
    elementsWithGradients.forEach(item => {
        css += `${item.selector} { ${item.property}: ${item.value} !important; }\n`;
    });
    
    styleElement.textContent = css;
}

// Toggle theme function for header button
function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    
    // Also update settings toggle
    const darkThemeToggle = document.getElementById('dark-theme-toggle');
    if (darkThemeToggle) {
        darkThemeToggle.checked = isDark;
    }
    
    // Save the setting
    chrome.storage.sync.set({darkTheme: isDark});
}

// Initialize settings
function initSettings() {
    console.log('Initializing settings');
    
    // Load saved settings
    chrome.storage.sync.get({
        darkTheme: false,
        autoCheck: true
    }, function(items) {
        // Set toggle states based on saved settings
        document.getElementById('dark-theme-toggle').checked = items.darkTheme;
        document.getElementById('auto-check-toggle').checked = items.autoCheck;
    });
    
    // Add event listeners for settings changes
    document.getElementById('dark-theme-toggle').addEventListener('change', function() {
        const isDarkTheme = this.checked;
        toggleDarkTheme(isDarkTheme);
        chrome.storage.sync.set({ darkTheme: isDarkTheme });
    });
    
    document.getElementById('auto-check-toggle').addEventListener('change', function() {
        const autoCheckEnabled = this.checked;
        chrome.storage.sync.set({ autoCheck: autoCheckEnabled });
    });
}

// Toggle dark theme function
function toggleDarkTheme(enable) {
    if (enable) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Функция для проверки домена на наличие в белом списке
function isInWhitelist(domain) {
    domain = domain.toLowerCase();
    return whitelist.some(item => {
        return domain === item || domain.endsWith('.' + item);
    });
}

// Функция для отображения безопасного сайта (с показателем 100%)
function updateSafeUI(domain, isOfficial) {
    // Устанавливаем класс для круга
    const circle = document.querySelector('.rounded-circle');
    circle.className = 'rounded-circle safe';
    
    // Устанавливаем процент закрытия круга в 100%
    circle.style.setProperty('--percentage', '100%');
    
    // Устанавливаем значение и сообщение
    document.getElementById('site_score').textContent = '100';
    
    if (isOfficial) {
        document.getElementById('site_msg').textContent = `Это официальный сайт ${domain}`;
    } else {
        document.getElementById('site_msg').textContent = 'Безопасный сайт';
    }
    
    document.getElementById('site_domain').textContent = domain;
    
    // Добавляем признаки проверки
    const featuresList = document.getElementById('features');
    featuresList.textContent = '';
    
    if (isOfficial) {
        addFeature(featuresList, 'safe', 'check', 'Домен присутствует в базе официальных сайтов');
    }
    
    addFeature(featuresList, 'safe', 'shield-alt', 'SSL сертификат действителен');
    addFeature(featuresList, 'safe', 'lock', 'Защищенное соединение (HTTPS)');
    
    // Сохраняем в истории
    saveToHistory({
        domain: domain,
        url: getCurrentUrl(),
        score: 100,
        status: 'safe',
        timestamp: new Date().getTime(),
        message: isOfficial ? `Это официальный сайт ${domain}` : 'Безопасный сайт'
    });
}

// Функция для проверки домена на наличие в списке демонстрационных фишинговых сайтов
function isPhishingDemo(domain) {
    // В демонстрационном режиме будем считать фишинговыми некоторые домены, 
    // которые не входят в белый список
    if (DEMO_MODE) {
        domain = domain.toLowerCase();
        
        // Проверяем наличие в списке известных фишинговых доменов
        const inPhishingList = phishingDemoList.some(item => {
            return domain === item || domain.includes(item) || item.includes(domain);
        });
        
        // Если домен не в белом списке и содержит какие-либо из этих подстрок,
        // будем считать его фишинговым для демонстрации
        if (!isInWhitelist(domain)) {
            const suspiciousKeywords = [
                'login', 'account', 'secure', 'bank', 'pay', 'confirm', 'verify',
                'update', 'wallet', 'crypto', 'password', 'signin', 'recovery',
                'access', '-free-', 'offer', 'prize', 'winner', 'bonus'
            ];
            
            // Возвращаем true если домен в списке или содержит подозрительные ключевые слова
            return inPhishingList || suspiciousKeywords.some(keyword => domain.includes(keyword));
        }
        
        return inPhishingList;
    }
    
    // Обычная логика проверки вне демо-режима
    domain = domain.toLowerCase();
    return phishingDemoList.some(item => {
        return domain === item || domain.includes(item) || item.includes(domain);
    });
}

// Функция для отображения предупреждения о фишинговом сайте
function updatePhishingUI(domain) {
    // Устанавливаем класс для круга
    const circle = document.querySelector('.rounded-circle');
    circle.className = 'rounded-circle danger';
    
    // Устанавливаем процент закрытия круга в 15%
    circle.style.setProperty('--percentage', '15%');
    
    // Устанавливаем значение и сообщение
    document.getElementById('site_score').textContent = '15';
    const siteMsg = document.getElementById('site_msg');
    siteMsg.textContent = 'ВНИМАНИЕ! Фишинговый сайт';
    siteMsg.classList.add('danger-alert');
    document.getElementById('site_domain').textContent = domain;
    
    // Добавляем признаки проверки
    const featuresList = document.getElementById('features');
    featuresList.textContent = '';
    
    addFeature(featuresList, 'danger', 'exclamation-triangle', 'Сайт имитирует официальный ресурс');
    addFeature(featuresList, 'danger', 'skull-crossbones', 'Попытка кражи личных данных');
    addFeature(featuresList, 'danger', 'lock-open', 'Небезопасное соединение');
    
    // Добавляем кнопку с предупреждением
    const warningBtn = document.createElement('button');
    warningBtn.className = 'warning-button';
    warningBtn.textContent = 'Показать полное предупреждение';
    warningBtn.addEventListener('click', function() {
        // Открываем страницу с предупреждением
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            // Сохраняем URL фишингового сайта для warning.html
            chrome.storage.local.set({phishingUrl: currentTab.url}, function() {
                // Открываем warning.html
                chrome.tabs.update(currentTab.id, {
                    url: chrome.runtime.getURL('html/warning.html')
                });
                // Закрываем popup
                window.close();
            });
        });
    });
    
    // Добавляем кнопку внизу списка признаков
    featuresList.parentNode.appendChild(warningBtn);
    
    // Сохраняем в истории
    saveToHistory({
        domain: domain,
        url: getCurrentUrl(),
        score: 15,
        status: 'danger',
        timestamp: new Date().getTime(),
        message: 'ВНИМАНИЕ! Фишинговый сайт'
    });
}

// Функция для отображения подозрительного сайта
function updateSuspiciousUI(domain, score) {
    // Устанавливаем класс для круга
    const circle = document.querySelector('.rounded-circle');
    circle.className = 'rounded-circle warning';
    
    // Устанавливаем процент закрытия круга в соответствии со значением score
    circle.style.setProperty('--percentage', `${score}%`);
    
    // Устанавливаем значение и сообщение
    document.getElementById('site_score').textContent = score;
    document.getElementById('site_msg').textContent = 'Подозрительный сайт';
    document.getElementById('site_domain').textContent = domain;
    
    // Добавляем признаки проверки
    const featuresList = document.getElementById('features');
    featuresList.textContent = '';
    
    addFeature(featuresList, 'warning', 'question-circle', 'Сайт не найден в базе доверенных');
    
    if (score < 50) {
        addFeature(featuresList, 'warning', 'fingerprint', 'Возможно, имитация другого сайта');
    }
    
    if (score < 40) {
        addFeature(featuresList, 'warning', 'lock-open', 'Проблемы с сертификатом безопасности');
    }
    
    // Сохраняем в истории
    saveToHistory({
        domain: domain,
        url: getCurrentUrl(),
        score: score,
        status: 'warning',
        timestamp: new Date().getTime(),
        message: 'Подозрительный сайт'
    });
}

// Add error handling for API responses
function fetchData(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Example usage of fetchData
fetchData('https://api.example.com/data')
    .then(data => {
        console.log('Data fetched successfully:', data);
    });

function showCheckHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) {
        console.warn('Элемент history-list не найден, создаю временный контейнер');
        const tempContainer = document.createElement('div');
        tempContainer.id = 'history-list';
        tempContainer.style.display = 'none';
        document.body.appendChild(tempContainer);
        
        // Получаем созданный элемент
        historyListElement = document.getElementById('history-list');
    } else {
        historyListElement = historyList;
    }

    // Получаем и отображаем историю проверок
    chrome.storage.sync.get({history: []}, function(data) {
        historyListElement.textContent = '';
        
        if (data.history && data.history.length > 0) {
            data.history.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.date}: ${item.result}`;
                historyListElement.appendChild(listItem);
            });
        } else {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'empty-history-message';
            emptyMsg.textContent = getTranslation('checkHistoryEmpty', 'ru');
            historyListElement.appendChild(emptyMsg);
        }
    });
} 