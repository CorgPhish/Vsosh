/**
 * history.js - Скрипт для страницы истории проверок CorgPhish
 */

document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы DOM
    const historyList = document.getElementById('history-list');
    const emptyHistory = document.getElementById('empty-history');
    const clearHistoryBtn = document.getElementById('clear-history');
    const backButton = document.getElementById('back-button');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Инициализация темы
    initTheme();
    
    // Загрузка истории проверок
    loadHistory();
    
    // Обработчики событий
    clearHistoryBtn.addEventListener('click', clearHistory);
    backButton.addEventListener('click', goBack);
    themeToggle.addEventListener('click', toggleTheme);
    
    /**
     * Инициализирует тему на основе сохраненных настроек
     */
    function initTheme() {
        chrome.storage.local.get(['darkTheme'], function(result) {
            if (result.darkTheme) {
                document.body.classList.add('dark-theme');
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        });
    }
    
    /**
     * Переключает между светлой и темной темами
     */
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        
        if (isDark) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        
        // Сохраняем настройку темы
        chrome.storage.local.set({'darkTheme': isDark});
    }
    
    /**
     * Загружает историю проверок из chrome.storage
     */
    function loadHistory() {
        chrome.storage.local.get(['history'], function(result) {
            const history = result.history || [];
            
            if (history.length === 0) {
                // Если история пуста, показываем заглушку
                historyList.style.display = 'none';
                emptyHistory.style.display = 'block';
            } else {
                // Если история есть, отображаем записи
                historyList.style.display = 'flex';
                emptyHistory.style.display = 'none';
                
                // Очищаем текущий список перед добавлением новых элементов
                historyList.textContent = '';
                
                // Сортируем историю по дате (сначала новые)
                history.sort((a, b) => b.timestamp - a.timestamp);
                
                // Добавляем записи в список
                history.forEach(item => {
                    const historyItem = createHistoryItem(item);
                    historyList.appendChild(historyItem);
                });
            }
        });
    }
    
    /**
     * Создает элемент с информацией о проверке
     * @param {Object} item - Запись из истории проверок
     * @returns {HTMLElement} - DOM элемент для отображения в списке
     */
    function createHistoryItem(item) {
        // Используем общую функцию, если она доступна
        if (window.CorgPhishCommon && window.CorgPhishCommon.createHistoryItem) {
            const historyItem = window.CorgPhishCommon.createHistoryItem(item);
            
            // Добавляем кнопку удаления
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'history-actions';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'history-action delete-item';
            deleteButton.dataset.url = item.url;
            deleteButton.dataset.timestamp = item.timestamp;
            
            const trashIcon = document.createElement('i');
            trashIcon.className = 'fas fa-trash';
            deleteButton.appendChild(trashIcon);
            
            actionsDiv.appendChild(deleteButton);
            historyItem.appendChild(actionsDiv);
            
            // Добавляем обработчик для кнопки удаления
            deleteButton.addEventListener('click', function() {
                deleteHistoryItem(this.dataset.url, parseInt(this.dataset.timestamp));
            });
            
            return historyItem;
        }
        
        // Запасная реализация остается без изменений...
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // Определяем класс для статуса
        let statusClass = 'status-safe';
        let statusIcon = 'fa-check-circle';
        
        if (item.is_phishing) {
            statusClass = 'status-danger';
            statusIcon = 'fa-exclamation-triangle';
        } else if (item.score < 80) {
            statusClass = 'status-warning';
            statusIcon = 'fa-exclamation-circle';
        }
        
        // Форматируем дату
        const date = new Date(item.timestamp);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        // Форматируем домен
        let domain = '';
        try {
            domain = new URL(item.url).hostname;
        } catch (e) {
            domain = item.url;
        }
        
        // Сообщение в зависимости от результата проверки
        let message = 'Сайт безопасен';
        if (item.is_phishing) {
            message = 'Обнаружен фишинговый сайт';
        } else if (item.score < 80) {
            message = 'Сайт вызывает подозрения';
        }
        
        // Создаем структуру элемента
        const statusDiv = document.createElement('div');
        statusDiv.className = `history-status ${statusClass}`;
        
        const statusIconElement = document.createElement('i');
        statusIconElement.className = `fas ${statusIcon}`;
        statusDiv.appendChild(statusIconElement);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'history-content';
        
        const urlDiv = document.createElement('div');
        urlDiv.className = 'history-url';
        urlDiv.textContent = domain;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'history-message';
        messageDiv.textContent = message;
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'history-date';
        dateDiv.textContent = formattedDate;
        
        contentDiv.appendChild(urlDiv);
        contentDiv.appendChild(messageDiv);
        contentDiv.appendChild(dateDiv);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'history-actions';
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'history-action delete-item';
        deleteButton.dataset.url = item.url;
        deleteButton.dataset.timestamp = item.timestamp;
        
        const trashIcon = document.createElement('i');
        trashIcon.className = 'fas fa-trash';
        deleteButton.appendChild(trashIcon);
        
        actionsDiv.appendChild(deleteButton);
        
        historyItem.appendChild(statusDiv);
        historyItem.appendChild(contentDiv);
        historyItem.appendChild(actionsDiv);
        
        // Добавляем обработчик для кнопки удаления
        deleteButton.addEventListener('click', function() {
            deleteHistoryItem(this.dataset.url, parseInt(this.dataset.timestamp));
        });
        
        return historyItem;
    }
    
    /**
     * Удаляет запись из истории проверок
     * @param {string} url - URL сайта
     * @param {number} timestamp - Временная метка записи
     */
    function deleteHistoryItem(url, timestamp) {
        chrome.storage.local.get(['history'], function(result) {
            let history = result.history || [];
            
            // Находим индекс записи для удаления
            const index = history.findIndex(item => 
                item.url === url && item.timestamp === timestamp
            );
            
            if (index !== -1) {
                // Удаляем запись
                history.splice(index, 1);
                
                // Сохраняем обновленную историю
                chrome.storage.local.set({ 'history': history }, function() {
                    // Перезагружаем историю для обновления интерфейса
                    loadHistory();
                });
            }
        });
    }
    
    /**
     * Очищает всю историю проверок
     */
    function clearHistory() {
        if (confirm('Вы уверены, что хотите очистить всю историю проверок?')) {
            chrome.storage.local.set({ 'history': [] }, function() {
                // Перезагружаем интерфейс
                loadHistory();
            });
        }
    }
    
    /**
     * Возвращает на предыдущую страницу
     */
    function goBack() {
        window.close();
    }
}); 