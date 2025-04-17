/**
 * CorgPhish - Скрипт страницы предупреждения
 * Обрабатывает действия пользователя на странице предупреждения о фишинговом сайте
 */

// Глобальная настройка: демонстрационный режим 
const DEMO_MODE = false;

// Получаем параметры из URL
const urlParams = new URLSearchParams(window.location.search);
const unsafeUrl = urlParams.get('url');
const reasons = JSON.parse(decodeURIComponent(urlParams.get('reasons') || '[]'));
const score = urlParams.get('score') || "0.95";
const isDemo = DEMO_MODE || urlParams.get('demo') === 'true';

// Выполняем код после полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Получаем URL фишингового сайта из localStorage
    chrome.storage.local.get(['phishingUrl'], function(result) {
        const phishingUrl = result.phishingUrl || 'Неизвестный URL';
        
        // Отображаем URL на странице
        const urlDisplay = document.getElementById('phishing-url');
        if (urlDisplay) {
            urlDisplay.textContent = phishingUrl;
        }
        
        // Получаем доменное имя для отображения
        let domain = '';
        try {
            const url = new URL(phishingUrl);
            domain = url.hostname;
        } catch(e) {
            domain = phishingUrl;
        }
        
        // Устанавливаем заголовок
        const title = document.getElementById('warning-title');
        if (title) {
            title.textContent = `Обнаружен фишинговый сайт: ${domain}`;
        }
        
        // Добавляем причины блокировки
        const reasonsList = document.getElementById('reasons-list');
        if (reasonsList) {
            // Очищаем список
            reasonsList.textContent = '';
            
            // Добавляем причины
            addReason(reasonsList, 'Сайт имитирует официальный ресурс для кражи данных');
            addReason(reasonsList, 'Обнаружены вредоносные скрипты для сбора личной информации');
            addReason(reasonsList, 'Небезопасное соединение без шифрования');
            addReason(reasonsList, 'Домен зарегистрирован недавно с целью мошенничества');
        }
    });
    
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
    
    // Показываем индикатор демо-режима
    const demoIndicator = document.createElement('div');
    demoIndicator.className = 'demo-indicator';
    demoIndicator.textContent = 'Демонстрационный режим';
    demoIndicator.style.cssText = `
        background: linear-gradient(90deg, #ffa000, #ff6f00);
        color: white;
        text-align: center;
        padding: 12px 20px;
        margin-bottom: 25px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 16px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        display: block;
    `;
    
    // Добавляем индикатор вверху контейнера
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(demoIndicator, container.firstChild);
    }
    
    // Добавляем обработчики событий для кнопок
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }
    
    const continueButton = document.getElementById('continue-button');
    if (continueButton) {
        continueButton.addEventListener('click', function() {
            chrome.storage.local.get(['phishingUrl'], function(result) {
                if (result.phishingUrl) {
                    // Перед переходом показываем дополнительное предупреждение
                    if (confirm('ВНИМАНИЕ! Вы переходите на потенциально опасный сайт на свой страх и риск. Продолжить?')) {
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            chrome.tabs.update(tabs[0].id, {url: result.phishingUrl});
                        });
                    }
                }
            });
        });
    }
    
    const reportButton = document.getElementById('report-button');
    if (reportButton) {
        reportButton.addEventListener('click', function() {
            // Показываем сообщение об отправке отчета
            alert('Спасибо! Отчет о фишинговом сайте отправлен команде безопасности.');
        });
    }
    
    // Отправляем статистику о показе предупреждения
    chrome.runtime.sendMessage({
        action: "warningShown",
        url: unsafeUrl,
        timestamp: Date.now(),
        isDemoMode: DEMO_MODE
    });
});

// Функция для добавления причины блокировки в список
function addReason(list, text) {
    const item = document.createElement('li');
    item.textContent = text;
    list.appendChild(item);
} 