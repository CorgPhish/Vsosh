// CACHE-BUSTING: 1743845084 - Sat Apr  5 12:24:44 MSK 2025
/**
 * inject_warning.js - Инъекция CSS-стилей для предупреждения о фишинге
 * Этот скрипт добавляет стили, которые изменяют внешний вид страницы и добавляют
 * визуальные индикаторы фишингового сайта даже если остальные методы не сработали
 */

(function() {
  // Только для локальных сайтов
  if (location.hostname !== 'localhost' && 
      location.hostname !== '127.0.0.1' && 
      !location.host.startsWith('localhost:') && 
      !location.host.startsWith('127.0.0.1:')) {
    return;
  }
  
  console.log('[CorgPhish] Инъекция CSS с предупреждением');
  
  // Создаем стили
  const style = document.createElement('style');
  style.id = 'corgphish-warning-styles';
  style.textContent = `
    /* Добавляем фон ко всей странице */
    body::before {
      content: "⚠️ ФИШИНГОВЫЙ САЙТ ⚠️";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(220, 0, 0, 0.3);
      z-index: 99999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 48px;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      font-family: Arial, sans-serif;
      font-weight: bold;
    }
    
    /* Добавляем предупреждение вверху страницы */
    body::after {
      content: "⚠️ ВНИМАНИЕ! Этот сайт определен как фишинговый! Не вводите свои данные!";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      padding: 10px;
      background-color: #d32f2f;
      color: white;
      text-align: center;
      z-index: 100000;
      font-family: Arial, sans-serif;
      font-weight: bold;
      font-size: 16px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }
    
    /* Переопределяем стили для всех форм на странице */
    input, textarea, select, button {
      border: 2px solid #d32f2f !important;
      background-color: #ffe6e6 !important;
      position: relative;
    }
    
    /* Добавляем предупреждение к полям ввода */
    input::before, textarea::before {
      content: "⚠️";
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
    }
  `;
  
  // Функция для добавления стилей
  function injectStyles() {
    if (document.head) {
      document.head.appendChild(style);
    } else if (document.documentElement) {
      document.documentElement.appendChild(style);
    }
  }
  
  // Добавляем стили сразу
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }
  
  // Проверяем, добавились ли стили
  setTimeout(function() {
    if (!document.getElementById('corgphish-warning-styles') || 
        !document.getElementById('corgphish-warning-styles').parentNode) {
      injectStyles();
    }
  }, 500);
  
  // Предупреждение при попытке ввода данных
  document.addEventListener('input', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      alert('⚠️ ВНИМАНИЕ! Этот сайт определен как фишинговый. Не вводите свои данные!');
      e.preventDefault();
      e.target.blur();
    }
  }, true);
  
  // Предупреждение при отправке формы
  document.addEventListener('submit', function(e) {
    alert('⚠️ ВНИМАНИЕ! Отправка данных на фишинговый сайт заблокирована!');
    e.preventDefault();
    return false;
  }, true);
})(); 