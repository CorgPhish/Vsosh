/**
 * CorgPhish - Скрипт страницы предупреждения
 * Обрабатывает действия пользователя на странице предупреждения о фишинговом сайте
 */

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const unsafeUrl = urlParams.get('url');
const reasons = JSON.parse(decodeURIComponent(urlParams.get('reasons') || '[]'));
const score = urlParams.get('score') || "0.95";
const isDemo = urlParams.get('demo') === 'true';

// Выполняем код после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Отображаем опасный URL
    const urlDisplay = document.getElementById('url-display');
    if (urlDisplay) {
        urlDisplay.textContent = unsafeUrl || 'URL не определен';
    }

    // Отображаем причины блокировки
    const reasonsList = document.getElementById('reasons-list');
    if (reasonsList) {
        // Очищаем список перед заполнением
        reasonsList.innerHTML = '';
        
        if (reasons && reasons.length > 0) {
            // Добавляем каждую причину в список
            reasons.forEach(reason => {
                const li = document.createElement('li');
                li.textContent = reason;
                reasonsList.appendChild(li);
            });
        } else {
            // Если причины не указаны, добавляем стандартное сообщение
            const li = document.createElement('li');
            li.textContent = 'Подозрительная структура URL или домена';
            reasonsList.appendChild(li);
        }
    }
    
    // Отображаем оценку риска
    const riskScore = document.getElementById('riskScore');
    if (riskScore) {
        const scoreValue = parseFloat(score);
        
        if (scoreValue >= 0.7) {
            riskScore.textContent = 'Высокий';
            riskScore.className = 'high-risk';
        } else if (scoreValue >= 0.4) {
            riskScore.textContent = 'Средний';
            riskScore.className = 'medium-risk';
        } else {
            riskScore.textContent = 'Низкий';
            riskScore.className = 'low-risk';
        }
    }
    
    // Показываем индикатор демо-режима если нужно
    const demoMode = document.getElementById('demoMode');
    if (demoMode && isDemo) {
        demoMode.style.display = 'block';
    }
    
    // Обработчики кнопок
    const leaveBtn = document.getElementById('leaveBtn');
    const detailsBtn = document.getElementById('detailsBtn');
    const ignoreBtn = document.getElementById('ignoreBtn');
    const detailsContainer = document.getElementById('details');
    
    // Кнопка "Вернуться назад"
    if (leaveBtn) {
        leaveBtn.addEventListener('click', function() {
            history.back();
        });
    }
    
    // Кнопка "Подробности"
    if (detailsBtn && detailsContainer) {
        detailsBtn.addEventListener('click', function() {
            // Переключаем видимость контейнера с деталями
            if (detailsContainer.style.display === 'block') {
                detailsContainer.style.display = 'none';
                detailsBtn.innerHTML = '<i class="fas fa-info-circle"></i> Подробности';
            } else {
                detailsContainer.style.display = 'block';
                detailsBtn.innerHTML = '<i class="fas fa-times-circle"></i> Скрыть детали';
                
                // Загружаем технические детали
                const technicalDetails = document.getElementById('technical-details');
                if (technicalDetails) {
                    technicalDetails.innerHTML = `
                        <p><strong>URL:</strong> ${unsafeUrl}</p>
                        <p><strong>Оценка риска:</strong> ${(parseFloat(score) * 100).toFixed(1)}%</p>
                        <p><strong>Метод обнаружения:</strong> XGBoost модель машинного обучения + Google Safe Browsing API</p>
                        <p><strong>Время проверки:</strong> ${new Date().toLocaleString()}</p>
                    `;
                }
            }
        });
    }
    
    // Кнопка "Игнорировать риск"
    if (ignoreBtn) {
        ignoreBtn.addEventListener('click', function() {
            if (confirm('Вы действительно хотите продолжить на потенциально опасный сайт? Это может привести к краже ваших данных или заражению вашего устройства.')) {
                // Отправляем сообщение в background скрипт об игнорировании предупреждения
                chrome.runtime.sendMessage({
                    action: "ignoreWarning",
                    url: unsafeUrl
                }, function(response) {
                    // Перенаправляем на целевой URL
                    window.location.href = unsafeUrl;
                });
            }
        });
    }
    
    // Отправляем статистику о показе предупреждения
    chrome.runtime.sendMessage({
        action: "warningShown",
        url: unsafeUrl,
        timestamp: Date.now()
    });
}); 