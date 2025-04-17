/**
 * common.js - Общие утилиты и функции для расширения CorgPhish
 */

// Форматирование даты
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Получение домена из URL
function getDomainFromURL(url) {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return url;
    }
}

// Определение класса статуса для отображения в интерфейсе
function getStatusClass(score, isPhishing) {
    if (isPhishing) {
        return 'danger';
    } else if (score < 80) {
        return 'warning';
    } else {
        return 'safe';
    }
}

// Создание элемента истории проверок
function createHistoryItem(item, container) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    // Определяем класс для статуса
    const statusClass = getStatusClass(item.score, item.is_phishing);
    
    // Создаем элементы для истории
    const statusDiv = document.createElement('div');
    statusDiv.className = `history-status ${statusClass}`;
    
    // Добавляем иконку в зависимости от статуса
    const statusIcon = document.createElement('i');
    if (statusClass === 'danger') {
        statusIcon.className = 'fas fa-exclamation-triangle';
    } else if (statusClass === 'warning') {
        statusIcon.className = 'fas fa-exclamation-circle';
    } else {
        statusIcon.className = 'fas fa-check-circle';
    }
    statusDiv.appendChild(statusIcon);
    
    // Создаем контент
    const contentDiv = document.createElement('div');
    contentDiv.className = 'history-content';
    
    // URL/Домен
    const urlDiv = document.createElement('div');
    urlDiv.className = 'history-url';
    urlDiv.textContent = getDomainFromURL(item.url);
    
    // Сообщение
    const messageDiv = document.createElement('div');
    messageDiv.className = 'history-message';
    
    if (item.is_phishing) {
        messageDiv.textContent = 'Обнаружен фишинговый сайт';
    } else if (item.score < 80) {
        messageDiv.textContent = 'Подозрительный сайт';
    } else {
        messageDiv.textContent = 'Безопасный сайт';
    }
    
    // Дата
    const dateDiv = document.createElement('div');
    dateDiv.className = 'history-date';
    dateDiv.textContent = formatDate(item.timestamp);
    
    // Собираем всё вместе
    contentDiv.appendChild(urlDiv);
    contentDiv.appendChild(messageDiv);
    contentDiv.appendChild(dateDiv);
    
    historyItem.appendChild(statusDiv);
    historyItem.appendChild(contentDiv);
    
    // Если передан контейнер, добавляем в него
    if (container) {
        container.appendChild(historyItem);
    }
    
    return historyItem;
}

// Экспортируем функции в глобальный объект window 
window.CorgPhishCommon = {
    formatDate,
    getDomainFromURL,
    getStatusClass,
    createHistoryItem
}; 