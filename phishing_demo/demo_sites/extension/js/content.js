/**
 * content.js - Контентный скрипт для расширения CorgPhish
 *
 * Проверяет страницы на фишинг и отображает предупреждения
 */

console.log('[CorgPhish] Контентный скрипт загружен');

// Флаг для демонстрационного режима - в реальной версии установите в false
const DEMO_MODE = true;

// Глобальные переменные
let currentUrl = window.location.href;
let isWarningShown = false;

// Внедрение стилей для предупреждений
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .corgphish-warning {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background-color: #ffebee;
      border-bottom: 2px solid #f44336;
      color: #d32f2f;
      padding: 10px 20px;
      text-align: center;
      font-family: Arial, sans-serif;
      z-index: 2147483647;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    
    .corgphish-warning-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .corgphish-warning-message {
      font-weight: bold;
      flex-grow: 1;
    }
    
    .corgphish-warning-buttons {
      display: flex;
      gap: 10px;
    }
    
    .corgphish-warning-button {
      padding: 5px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      border: none;
    }
    
    .corgphish-warning-button-back {
      background-color: #f44336;
      color: white;
    }
    
    .corgphish-warning-button-more {
      background-color: #f5f5f5;
      border: 1px solid #ddd;
    }
  `;
  document.head.appendChild(style);
}

// Показать предупреждение пользователю
function showWarning(message, reasons) {
  // Если предупреждение уже показано, не дублируем
  if (isWarningShown) return;
  
  injectStyles();
  
  const warningDiv = document.createElement('div');
  warningDiv.className = 'corgphish-warning';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'corgphish-warning-content';
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'corgphish-warning-message';
  messageDiv.textContent = message;
  
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'corgphish-warning-buttons';
  
  const backButton = document.createElement('button');
  backButton.className = 'corgphish-warning-button corgphish-warning-button-back';
  backButton.textContent = 'Вернуться назад';
  backButton.addEventListener('click', () => {
    history.back();
  });
  
  const moreButton = document.createElement('button');
  moreButton.className = 'corgphish-warning-button corgphish-warning-button-more';
  moreButton.textContent = 'Подробнее';
  moreButton.addEventListener('click', () => {
    // Формируем URL для страницы предупреждения
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedReasons = encodeURIComponent(JSON.stringify(reasons || ['Сайт определен как потенциально опасный']));
    
    const warningUrl = chrome.runtime.getURL(`html/warning.html?url=${encodedUrl}&reasons=${encodedReasons}`);
    window.location.href = warningUrl;
  });
  
  buttonsDiv.appendChild(backButton);
  buttonsDiv.appendChild(moreButton);
  
  contentDiv.appendChild(messageDiv);
  contentDiv.appendChild(buttonsDiv);
  
  warningDiv.appendChild(contentDiv);
  document.body.prepend(warningDiv);
  
  isWarningShown = true;
}

// Проверка текущего URL при загрузке страницы
function checkCurrentUrl() {
  console.log("[CorgPhish] Проверка URL:", currentUrl);
  
  if (DEMO_MODE) {
    // В демо-режиме предупреждаем о фишинге с небольшой задержкой
    // для имитации проверки
    setTimeout(() => {
      if (!isWarningShown) {
        showWarning(
          "⚠️ Внимание! CorgPhish обнаружил, что этот сайт может быть фишинговым.", 
          ["Демонстрационный режим", "URL содержит подозрительные признаки"]
        );
      }
    }, 1500);
  } else {
    // В обычном режиме отправляем запрос в сервис-воркер
    chrome.runtime.sendMessage(
      { action: "check_url", url: currentUrl },
      function(response) {
        if (response && response.is_phishing) {
          showWarning(
            "⚠️ Внимание! CorgPhish обнаружил, что этот сайт может быть фишинговым.", 
            response.reasons
          );
        }
      }
    );
  }
}

// Обработчик сообщений от сервис-воркера
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "alert_user") {
    showWarning(request.message, request.reasons);
    sendResponse({ success: true });
  }
});

// Запускаем проверку при загрузке страницы
window.addEventListener('load', function() {
  // Небольшая задержка для полной загрузки DOM
  setTimeout(checkCurrentUrl, 500);
});

// Наблюдаем за изменениями в URL (для SPA)
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    currentUrl = url;
    isWarningShown = false;
    checkCurrentUrl();
  }
}).observe(document, { subtree: true, childList: true }); 