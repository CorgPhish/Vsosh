// CACHE-BUSTING: 1743845084 - Sat Apr  5 12:24:44 MSK 2025
/**
 * block_localhost.js
 * Этот скрипт полностью блокирует доступ к демо сайтам и показывает предупреждение о фишинге
 * Он имеет самый высокий приоритет и запускается до загрузки страницы
 */

(function() {
  console.log('%c[БЛОКИРОВЩИК] АКТИВИРОВАН!', 'color:red; font-weight:bold; font-size:20px;');
  
  // Немедленная блокировка страницы
  function blockPage() {
    // Проверяем, является ли сайт локальным
    const isLocalhost = location.hostname === 'localhost' || 
                         location.hostname === '127.0.0.1' || 
                         location.host.indexOf('localhost:') === 0 ||
                         location.host.indexOf('127.0.0.1:') === 0;
                         
    if (!isLocalhost) return;
    
    console.log('%c[БЛОКИРОВЩИК] Обнаружен демо-сайт! БЛОКИРУЮ!', 'color:red; font-weight:bold; font-size:16px;');
    
    // Метод 1: Перенаправление на страницу предупреждения
    const redirectToWarning = function() {
      const extensionURL = chrome.runtime.getURL("html/phishing_warning.html");
      location.href = extensionURL;
    };
    
    // Метод 2: Замена всего содержимого страницы
    const createWarningOverlay = function() {
      // Удаляем всё существующее содержимое
      document.documentElement.innerHTML = '';
      
      // Создаем новый DOM
      const head = document.createElement('head');
      const meta = document.createElement('meta');
      meta.setAttribute('charset', 'UTF-8');
      
      const title = document.createElement('title');
      title.textContent = 'Предупреждение CorgPhish: обнаружен фишинговый сайт!';
      
      const style = document.createElement('style');
      style.textContent = `
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #fee;
          color: #333;
        }
        .warning-container {
          max-width: 550px;
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 5px 30px rgba(0,0,0,0.2);
          text-align: center;
        }
        h1 {
          color: #d32f2f;
          margin-top: 0;
        }
        .reasons {
          background-color: #ffe6e6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 6px;
          text-align: left;
        }
        button {
          padding: 12px 25px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin: 0 10px;
        }
        .btn-leave {
          background-color: #d32f2f;
          color: white;
          font-weight: bold;
        }
        .btn-ignore {
          background-color: #f5f5f5;
          color: #333;
        }
        .buttons {
          margin-top: 25px;
        }
      `;
      
      head.appendChild(meta);
      head.appendChild(title);
      head.appendChild(style);
      
      const body = document.createElement('body');
      const warningContainer = document.createElement('div');
      warningContainer.className = 'warning-container';
      
      const warningHeader = document.createElement('h1');
      warningHeader.textContent = '⚠️ ВНИМАНИЕ! ФИШИНГОВЫЙ САЙТ!';
      
      const warningText = document.createElement('p');
      warningText.textContent = 'Сайт ';
      
      const domainEl = document.createElement('strong');
      domainEl.textContent = location.host;
      warningText.appendChild(domainEl);
      warningText.appendChild(document.createTextNode(' определен как фишинговый!'));
      
      const reasonsContainer = document.createElement('div');
      reasonsContainer.className = 'reasons';
      
      const reasonsTitle = document.createElement('h2');
      reasonsTitle.textContent = 'Причины:';
      reasonsTitle.style.marginTop = '0';
      
      const reasonsList = document.createElement('ul');
      const reasons = [
        'Демонстрационный фишинговый сайт',
        'Локальный тестовый сайт',
        'Имитация официального финансового ресурса',
        'Попытка сбора конфиденциальных данных'
      ];
      
      reasons.forEach(reason => {
        const reasonItem = document.createElement('li');
        reasonItem.textContent = reason;
        reasonsList.appendChild(reasonItem);
      });
      
      reasonsContainer.appendChild(reasonsTitle);
      reasonsContainer.appendChild(reasonsList);
      
      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'buttons';
      
      const leaveButton = document.createElement('button');
      leaveButton.className = 'btn-leave';
      leaveButton.textContent = 'Покинуть сайт';
      leaveButton.addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
      });
      
      const ignoreButton = document.createElement('button');
      ignoreButton.className = 'btn-ignore';
      ignoreButton.textContent = 'Игнорировать';
      ignoreButton.addEventListener('click', function() {
        window.location.reload();
      });
      
      buttonsContainer.appendChild(leaveButton);
      buttonsContainer.appendChild(ignoreButton);
      
      warningContainer.appendChild(warningHeader);
      warningContainer.appendChild(warningText);
      warningContainer.appendChild(reasonsContainer);
      warningContainer.appendChild(buttonsContainer);
      
      body.appendChild(warningContainer);
      
      document.documentElement.appendChild(head);
      document.documentElement.appendChild(body);
    };
    
    // Метод 3: Создание предупреждения поверх текущего содержимого
    const createWarningPopup = function() {
      // Проверяем, существует ли уже предупреждение
      if (document.getElementById('corgphish-blocker-overlay')) return;
      
      // Создаем контейнер
      const warningOverlay = document.createElement('div');
      warningOverlay.id = 'corgphish-blocker-overlay';
      warningOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(220, 0, 0, 0.95);
        z-index: 2147483647;
        display: flex;
        justify-content: center;
        align-items: center;
      `;
      
      const warningContent = document.createElement('div');
      warningContent.style.cssText = `
        background-color: white;
        border-radius: 10px;
        padding: 30px;
        max-width: 500px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
        text-align: center;
        color: #333;
      `;
      
      warningContent.innerHTML = '';
      // Создаем заголовок
      const warningTitle = document.createElement('h1');
      warningTitle.style.cssText = 'color: #d32f2f; margin-top: 0; font-size: 28px;';
      
      warningTitle.textContent = '⚠️ ВНИМАНИЕ! ФИШИНГОВЫЙ САЙТ!';
      
      const warningText = document.createElement('p');
      warningText.textContent = 'Сайт ';
      
      const domainEl = document.createElement('strong');
      domainEl.textContent = location.host;
      warningText.appendChild(domainEl);
      warningText.appendChild(document.createTextNode(' определен как фишинговый!'));
      
      // Создаем блок с причинами
      const reasonsBlock = document.createElement('div');
      reasonsBlock.style.cssText = 'background-color: #ffe6e6; border-radius: 5px; padding: 15px; margin: 15px 0; text-align: left;';
      
      const reasonsTitle = document.createElement('h2');
      reasonsTitle.style.marginTop = '0';
      reasonsTitle.textContent = 'Причины:';
      
      const reasonsList = document.createElement('ul');
      
      const reasons = [
        'Демонстрационный фишинговый сайт',
        'Локальный тестовый сайт',
        'Имитация официального финансового ресурса',
        'Попытка сбора конфиденциальных данных'
      ];
      
      reasons.forEach(reason => {
        const reasonItem = document.createElement('li');
        reasonItem.textContent = reason;
        reasonsList.appendChild(reasonItem);
      });
      
      reasonsBlock.appendChild(reasonsTitle);
      reasonsBlock.appendChild(reasonsList);
      
      // Создаем кнопки
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.cssText = 'display: flex; justify-content: space-between; margin-top: 25px;';
      
      const leaveButton = document.createElement('button');
      leaveButton.id = 'corgphish-leave-btn';
      leaveButton.style.cssText = 'background-color: #d32f2f; color: white; border: none; border-radius: 5px; padding: 10px 20px; font-size: 16px; cursor: pointer; font-weight: bold;';
      leaveButton.textContent = 'Покинуть сайт';
      
      const ignoreButton = document.createElement('button');
      ignoreButton.id = 'corgphish-ignore-btn';
      ignoreButton.style.cssText = 'background-color: #f5f5f5; color: #333; border: none; border-radius: 5px; padding: 10px 20px; font-size: 16px; cursor: pointer;';
      ignoreButton.textContent = 'Игнорировать';
      
      buttonsContainer.appendChild(leaveButton);
      buttonsContainer.appendChild(ignoreButton);
      
      // Собираем все вместе
      warningContent.appendChild(warningTitle);
      warningContent.appendChild(warningText);
      warningContent.appendChild(reasonsBlock);
      warningContent.appendChild(buttonsContainer);
      
      warningOverlay.appendChild(warningContent);
      
      // Вставляем в DOM
      if (document.body) {
        document.body.appendChild(warningOverlay);
        
        // Добавляем обработчики событий
        document.getElementById('corgphish-leave-btn').addEventListener('click', function() {
          window.location.href = 'https://www.google.com';
        });
        
        document.getElementById('corgphish-ignore-btn').addEventListener('click', function() {
          warningOverlay.remove();
        });
      } else {
        // Если body еще не загружен, ждем и пробуем снова
        document.addEventListener('DOMContentLoaded', function() {
          document.body.appendChild(warningOverlay);
          
          // Добавляем обработчики событий
          document.getElementById('corgphish-leave-btn').addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
          });
          
          document.getElementById('corgphish-ignore-btn').addEventListener('click', function() {
            warningOverlay.remove();
          });
        });
      }
    };
    
    // Выбираем метод в зависимости от состояния загрузки страницы
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      createWarningOverlay(); // Полная замена содержимого
    } else {
      document.addEventListener('DOMContentLoaded', createWarningOverlay);
    }
    
    // Также пробуем создать всплывающее окно как запасной вариант
    setTimeout(createWarningPopup, 500);
  }
  
  // Запускаем блокировку
  blockPage();
  
  // На всякий случай еще раз при полной загрузке
  window.addEventListener('load', blockPage);
})(); 