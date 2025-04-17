/**
 * Content Script Adapter
 * Этот скрипт создает переходник для совместимости со старым подходом
 */

console.log('[CorgPhish] Загрузка адаптера контент-скрипта');

// Проверяем наличие скрипта-коннектора
if (!window.connectorLoaded) {
    // Загружаем коннектор 
    const script = document.createElement('script');
    script.src = '/extension/connector.js';
    script.onload = function() {
        console.log('[CorgPhish] Connector загружен через адаптер');
    };
    script.onerror = function(error) {
        console.error('[CorgPhish] Ошибка загрузки коннектора:', error);
    };
    document.head.appendChild(script);
}

console.log('[CorgPhish] Адаптер контент-скрипта успешно загружен'); 