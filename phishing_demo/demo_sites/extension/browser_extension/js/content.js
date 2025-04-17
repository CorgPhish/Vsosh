/**
 * content.js - Контентный скрипт для расширения CorgPhish
 *
 * Этот скрипт внедряется в страницы и отвечает за:
 * 1. Проверку сайта на фишинг
 * 2. Отображение предупреждений для пользователя
 * 3. Взаимодействие с сервис-воркером
 */

// Глобальные переменные
let pageChecked = false;
let isCheckingInProgress = false;

// Элементы интерфейса
let warningOverlay = null;
let warningPopup = null;

// Автоматически проверяем сайт при загрузке
document.addEventListener('DOMContentLoaded', function() {
  console.log('[CorgPhish] Страница загружена, запускаем проверку');
  // Запускаем проверку немедленно без задержки
  checkSite();
});

/**
 * Проверяет сайт на фишинг
 */
function checkSite() {
  if (pageChecked || isCheckingInProgress) {
    console.log('[CorgPhish] Проверка уже выполняется или завершена');
    return;
  }
  
  isCheckingInProgress = true;
  
  // Получаем текущий URL
  const currentUrl = window.location.href;
  console.log(`[CorgPhish] Проверка сайта: ${currentUrl}`);
  
  // Создаем обработчик таймаута для повторной попытки в случае проблем
  const requestTimeout = setTimeout(function() {
    if (isCheckingInProgress) {
      console.warn('[CorgPhish] Превышено время ожидания ответа от сервис-воркера. Повторная попытка...');
      isCheckingInProgress = false;
      pageChecked = false;
      
      // Пытаемся заново через небольшую задержку
      setTimeout(checkSite, 500);
    }
  }, 3000); // Таймаут 3 секунды
  
  // Отправляем запрос на проверку в сервис-воркер с высоким приоритетом
  try {
    chrome.runtime.sendMessage(
      {action: "check_url", url: currentUrl, priority: "high"},
      function(response) {
        // Очищаем таймаут, так как получили ответ
        clearTimeout(requestTimeout);
        isCheckingInProgress = false;
        
        // Проверяем на ошибку подключения к сервис-воркеру
        if (chrome.runtime.lastError) {
          console.error('[CorgPhish] Ошибка при отправке сообщения:', chrome.runtime.lastError);
          pageChecked = false; // Позволяем повторную проверку
          
          // Пытаемся переинициализировать соединение
          reconnectServiceWorker();
          
          // Повторная попытка через небольшой промежуток времени
          setTimeout(checkSite, 1000);
          return;
        }
        
        // Проверяем, получили ли мы действительный ответ
        if (!response) {
          console.warn('[CorgPhish] Получен пустой ответ от сервис-воркера');
          pageChecked = false; // Позволяем повторную проверку
          setTimeout(checkSite, 1000); // Повторная попытка
          return;
        }
        
        pageChecked = true;
        
        if (response.is_phishing) {
          console.log(`[CorgPhish] Сайт определен как фишинговый: ${currentUrl}`);
          showWarning(response);
        } else {
          console.log(`[CorgPhish] Сайт определен как безопасный (${response.score}%): ${currentUrl}`);
          // Дополнительно можно показать небольшое уведомление о безопасности
          showSafetyIndicator(response);
        }
      }
    );
  } catch (error) {
    // Очищаем таймаут в случае ошибки
    clearTimeout(requestTimeout);
    
    console.error('[CorgPhish] Ошибка при отправке сообщения:', error);
    isCheckingInProgress = false;
    pageChecked = false; // Позволяем повторную проверку
    
    // Пытаемся переинициализировать соединение
    reconnectServiceWorker();
    
    // Повторная попытка через небольшой промежуток времени
    setTimeout(checkSite, 1500);
  }
}

/**
 * Пытается восстановить соединение с сервис-воркером
 */
function reconnectServiceWorker() {
  console.log('[CorgPhish] Попытка восстановления соединения с сервис-воркером...');
  
  try {
    // Принудительная переактивация сервис-воркера
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(function(registration) {
        console.log('[CorgPhish] Сервис-воркер найден, переактивация...');
        
        // Отправка сообщения для проверки доступности
        registration.active.postMessage({
          action: "ping",
          timestamp: Date.now()
        });
      }).catch(function(error) {
        console.error('[CorgPhish] Ошибка при работе с сервис-воркером:', error);
      });
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при переактивации сервис-воркера:', error);
  }
}

/**
 * Показывает небольшой индикатор безопасного сайта
 * @param {object} data - Данные о проверке
 */
function showSafetyIndicator(data) {
  // Проверяем, существует ли уже индикатор
  if (document.getElementById('corgphish-safety-indicator')) {
    return;
  }
  
  try {
    // Создаем индикатор безопасности
    const safetyIndicator = document.createElement('div');
    safetyIndicator.id = 'corgphish-safety-indicator';
    safetyIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(76, 175, 80, 0.9);
      color: white;
      border-radius: 8px;
      padding: 8px 12px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s, transform 0.3s;
    `;
    
    safetyIndicator.innerHTML = `
      <span style="margin-right: 8px;">✓</span>
      <span>Сайт безопасен (${data.score}%)</span>
    `;
    
    document.body.appendChild(safetyIndicator);
    
    // Анимируем появление
    setTimeout(function() {
      safetyIndicator.style.opacity = '1';
      safetyIndicator.style.transform = 'translateY(0)';
      
      // Скрываем через 5 секунд
      setTimeout(function() {
        safetyIndicator.style.opacity = '0';
        safetyIndicator.style.transform = 'translateY(20px)';
        
        // Удаляем элемент после скрытия
        setTimeout(function() {
          if (safetyIndicator.parentNode) {
            safetyIndicator.parentNode.removeChild(safetyIndicator);
          }
        }, 300);
      }, 5000);
    }, 100);
  } catch (error) {
    console.error('[CorgPhish] Ошибка при отображении индикатора безопасности:', error);
  }
}

/**
 * Отображает предупреждение о фишинговом сайте
 * @param {object} data - Данные о проверке
 */
function showWarning(data) {
  // Проверяем, существует ли предупреждение
  if (warningOverlay) {
    return;
  }
  
  try {
    // Создаем оверлей
    warningOverlay = document.createElement('div');
    warningOverlay.id = 'corgphish-warning-overlay';
    warningOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
    `;
    
    // Создаем всплывающее окно
    warningPopup = document.createElement('div');
    warningPopup.id = 'corgphish-warning-popup';
    warningPopup.style.cssText = `
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
      width: 500px;
      max-width: 90%;
      padding: 20px;
      position: relative;
      font-family: Arial, sans-serif;
    `;
    
    // Создаем заголовок
    const title = document.createElement('h2');
    title.style.cssText = `
      color: #d32f2f;
      margin-top: 0;
      font-size: 20px;
      display: flex;
      align-items: center;
    `;
    title.innerHTML = `⚠️ Внимание! Обнаружен подозрительный сайт`;
    
    // Информация о сайте
    const siteInfo = document.createElement('p');
    siteInfo.innerHTML = `Этот сайт <strong>${window.location.hostname}</strong> может быть фишинговым.`;
    siteInfo.style.cssText = `
      margin-bottom: 15px;
      font-size: 16px;
    `;
    
    // Оценка безопасности
    const securityScore = document.createElement('div');
    securityScore.style.cssText = `
      margin: 15px 0;
      text-align: center;
    `;
    
    const scoreLabel = document.createElement('div');
    scoreLabel.innerHTML = `Оценка безопасности: <strong>${data.score}%</strong>`;
    scoreLabel.style.cssText = `
      font-size: 16px;
      margin-bottom: 5px;
    `;
    
    const scoreBar = document.createElement('div');
    scoreBar.style.cssText = `
      width: 100%;
      height: 10px;
      background-color: #f5f5f5;
      border-radius: 5px;
      overflow: hidden;
    `;
    
    const scoreBarFill = document.createElement('div');
    scoreBarFill.style.cssText = `
      width: ${data.score}%;
      height: 100%;
      background-color: ${data.score < 40 ? '#d32f2f' : data.score < 70 ? '#ff9800' : '#4caf50'};
    `;
    
    scoreBar.appendChild(scoreBarFill);
    securityScore.appendChild(scoreLabel);
    securityScore.appendChild(scoreBar);
    
    // Причины
    const reasonsTitle = document.createElement('h3');
    reasonsTitle.innerHTML = 'Причины подозрений:';
    reasonsTitle.style.cssText = `
      font-size: 16px;
      margin: 15px 0 10px;
    `;
    
    const reasonsList = document.createElement('ul');
    reasonsList.style.cssText = `
      margin: 0 0 15px;
      padding-left: 20px;
    `;
    
    if (data.reasons && data.reasons.length > 0) {
      data.reasons.forEach(reason => {
        const reasonItem = document.createElement('li');
        reasonItem.innerHTML = reason;
        reasonItem.style.cssText = `
          margin-bottom: 5px;
          font-size: 14px;
        `;
        reasonsList.appendChild(reasonItem);
      });
    } else {
      const reasonItem = document.createElement('li');
      reasonItem.innerHTML = 'Сайт имеет признаки фишинговой страницы';
      reasonItem.style.cssText = `
        margin-bottom: 5px;
        font-size: 14px;
      `;
      reasonsList.appendChild(reasonItem);
    }
    
    // Кнопки действий
    const buttons = document.createElement('div');
    buttons.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    `;
    
    const leaveButton = document.createElement('button');
    leaveButton.innerHTML = 'Покинуть сайт';
    leaveButton.style.cssText = `
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
      font-weight: bold;
    `;
    leaveButton.addEventListener('click', () => {
      window.location.href = 'https://google.com';
    });
    
    const ignoreButton = document.createElement('button');
    ignoreButton.innerHTML = 'Игнорировать предупреждение';
    ignoreButton.style.cssText = `
      background-color: #f5f5f5;
      color: #333;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      font-size: 14px;
      cursor: pointer;
    `;
    ignoreButton.addEventListener('click', () => {
      warningOverlay.remove();
      warningOverlay = null;
      warningPopup = null;
    });
    
    // Собираем все элементы
    buttons.appendChild(leaveButton);
    buttons.appendChild(ignoreButton);
    
    warningPopup.appendChild(title);
    warningPopup.appendChild(siteInfo);
    warningPopup.appendChild(securityScore);
    warningPopup.appendChild(reasonsTitle);
    warningPopup.appendChild(reasonsList);
    warningPopup.appendChild(buttons);
    
    warningOverlay.appendChild(warningPopup);
    document.body.appendChild(warningOverlay);
  } catch (error) {
    console.error('[CorgPhish] Ошибка при отображении предупреждения:', error);
  }
}

// Слушаем сообщения от popup.js и service-worker.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  try {
    console.log('[CorgPhish] Получено сообщение в content.js:', request);
    
    if (request.action === "checkSite") {
      checkSite();
      sendResponse({status: "checking"});
      return true;
    }
    
    return true; // Для асинхронных ответов
  } catch (error) {
    console.error('[CorgPhish] Ошибка при обработке сообщения:', error);
    sendResponse({error: error.message});
    return true;
  }
});

console.log('[CorgPhish] Контентный скрипт успешно загружен'); 