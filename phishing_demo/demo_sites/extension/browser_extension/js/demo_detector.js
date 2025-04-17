// CACHE-BUSTING: 1743845084 - Sat Apr  5 12:24:44 MSK 2025
/**
 * demo_detector.js - Принудительное определение демо-страниц
 * Этот скрипт специально создан для демонстрационных целей и будет
 * принудительно показывать предупреждение о фишинге на демо-сайтах
 */

console.log('[CorgPhish] ДЕМО ДЕТЕКТОР АКТИВИРОВАН!');

// Проверяем, является ли текущая страница демо-страницей
const isDemoSite = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.hostname.startsWith('localhost:') || 
                window.location.hostname.startsWith('127.0.0.1:');

if (isDemoSite) {
  console.log('[CorgPhish] ⚠️ ОБНАРУЖЕН ДЕМО-САЙТ! Показываем предупреждение');
  
  // Добавим HTML-элемент предупреждения о фишинге после загрузки страницы
  function createPhishingWarning() {
    try {
      // Защита от повторного добавления
      if (document.getElementById('corgphish-demo-warning')) {
        return;
      }
      
      console.log('[CorgPhish] Создаем предупреждение о фишинге');
      
      // Создаем главный контейнер
      const warningContainer = document.createElement('div');
      warningContainer.id = 'corgphish-demo-warning';
      warningContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(220, 0, 0, 0.9);
        z-index: 999999999;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
      `;
      
      // Внутренний контейнер с предупреждением
      const warningContent = document.createElement('div');
      warningContent.style.cssText = `
        background-color: white;
        border-radius: 10px;
        padding: 25px;
        max-width: 450px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
      `;
      
      // Содержимое предупреждения
      warningContent.innerHTML = `
        <h1 style="color: #d32f2f; margin-top: 0; font-size: 24px;">⚠️ ФИШИНГОВЫЙ САЙТ!</h1>
        <p style="font-size: 16px; margin: 20px 0; line-height: 1.5;">
          Сайт <strong>${window.location.host}</strong> определен как фишинговый.
        </p>
        <div style="background-color: #ffe6e6; border-radius: 5px; padding: 15px; margin: 15px 0; text-align: left;">
          <h2 style="margin: 0 0 10px 0; font-size: 16px;">Причины:</h2>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Демонстрационный фишинговый сайт</li>
            <li>Обнаружены признаки имитации банковской страницы</li>
            <li>Локальный тестовый сайт</li>
          </ul>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 25px;">
          <button id="corgphish-leave-button" style="background-color: #d32f2f; color: white; border: none; border-radius: 5px; padding: 10px 20px; font-size: 16px; cursor: pointer; font-weight: bold;">Покинуть сайт</button>
          <button id="corgphish-ignore-button" style="background-color: #f5f5f5; color: #333; border: none; border-radius: 5px; padding: 10px 20px; font-size: 16px; cursor: pointer;">Игнорировать</button>
        </div>
      `;
      
      // Добавляем контент в контейнер
      warningContainer.appendChild(warningContent);
      
      // Добавляем на страницу
      document.body.appendChild(warningContainer);
      
      // Добавляем обработчики событий для кнопок
      document.getElementById('corgphish-leave-button').addEventListener('click', function() {
        window.location.href = 'https://www.google.com';
      });
      
      document.getElementById('corgphish-ignore-button').addEventListener('click', function() {
        warningContainer.remove();
      });
      
      console.log('[CorgPhish] Предупреждение добавлено на страницу');
    } catch (error) {
      console.error('[CorgPhish] Ошибка при создании предупреждения:', error);
    }
  }
  
  // Функция для проверки готовности DOM
  function checkAndCreateWarning() {
    if (document.body) {
      createPhishingWarning();
    } else {
      // Если body еще не загружен, ждем немного и пробуем снова
      setTimeout(checkAndCreateWarning, 50);
    }
  }
  
  // Попытка сразу добавить предупреждение
  checkAndCreateWarning();
  
  // Также добавим с событием DOMContentLoaded
  document.addEventListener('DOMContentLoaded', createPhishingWarning);
  
  // И еще одна попытка через 1 секунду после загрузки страницы
  window.addEventListener('load', function() {
    setTimeout(createPhishingWarning, 1000);
  });
}

console.log('[CorgPhish] ДЕМО ДЕТЕКТОР ЗАВЕРШИЛ РАБОТУ'); 