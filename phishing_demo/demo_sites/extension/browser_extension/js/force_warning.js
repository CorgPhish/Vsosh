// CACHE-BUSTING: 1743845084 - Sat Apr  5 12:24:44 MSK 2025
/**
 * force_warning.js - Принудительное предупреждение о фишинге
 * Этот скрипт показывает предупреждение о фишинге на всех демонстрационных сайтах.
 */

// Выполняем сразу после загрузки скрипта
console.log('[CorgPhish] ПРИНУДИТЕЛЬНОЕ ПРЕДУПРЕЖДЕНИЕ АКТИВИРОВАНО');

// Функция для создания предупреждения
function forcePhishingWarning() {
  console.log('[CorgPhish] Создаем принудительное предупреждение');
  
  try {
    // Создаем оверлей
    const warningOverlay = document.createElement('div');
    warningOverlay.id = 'corgphish-warning-overlay';
    warningOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(220, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: Arial, sans-serif;
    `;
    
    // Создаем контейнер предупреждения
    const warningContainer = document.createElement('div');
    warningContainer.style.cssText = `
      background-color: white;
      border-radius: 10px;
      padding: 30px;
      max-width: 500px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      text-align: center;
    `;
    
    // Заголовок
    const title = document.createElement('h2');
    title.innerText = '⚠️ ВНИМАНИЕ! ФИШИНГОВЫЙ САЙТ!';
    title.style.cssText = `
      color: #d32f2f;
      margin-top: 0;
      font-size: 24px;
    `;
    
    // Текст предупреждения
    const message = document.createElement('p');
    message.innerHTML = `Этот сайт <strong>${window.location.host}</strong> был определен как фишинговый. Рекомендуем немедленно покинуть его!`;
    message.style.cssText = `
      font-size: 16px;
      margin: 20px 0;
      line-height: 1.5;
    `;
    
    // Причины
    const reasons = document.createElement('div');
    reasons.style.cssText = `
      background-color: #ffe6e6;
      border-radius: 5px;
      padding: 15px;
      margin: 15px 0;
      text-align: left;
    `;
    
    const reasonsTitle = document.createElement('h3');
    reasonsTitle.innerText = 'Причины:';
    reasonsTitle.style.cssText = `
      margin: 0 0 10px 0;
      font-size: 16px;
    `;
    
    const reasonsList = document.createElement('ul');
    reasonsList.style.cssText = `
      margin: 0;
      padding-left: 20px;
    `;
    
    // Добавляем причины
    const reasonItems = [
      'Этот сайт имитирует известный банковский портал',
      'URL содержит подозрительные признаки',
      'Сайт пытается собрать конфиденциальные данные',
      'Обнаружены признаки фишинговых манипуляций'
    ];
    
    reasonItems.forEach(item => {
      const li = document.createElement('li');
      li.innerText = item;
      li.style.cssText = `
        margin-bottom: 5px;
      `;
      reasonsList.appendChild(li);
    });
    
    reasons.appendChild(reasonsTitle);
    reasons.appendChild(reasonsList);
    
    // Кнопки
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 25px;
    `;
    
    // Кнопка "Покинуть сайт"
    const leaveButton = document.createElement('button');
    leaveButton.innerText = 'Покинуть сайт';
    leaveButton.style.cssText = `
      background-color: #d32f2f;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      font-weight: bold;
    `;
    leaveButton.onclick = function() {
      window.location.href = 'https://www.google.com';
    };
    
    // Кнопка "Игнорировать"
    const ignoreButton = document.createElement('button');
    ignoreButton.innerText = 'Игнорировать';
    ignoreButton.style.cssText = `
      background-color: #f5f5f5;
      color: #333;
      border: none;
      border-radius: 5px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    `;
    ignoreButton.onclick = function() {
      warningOverlay.remove();
    };
    
    // Собираем всё вместе
    buttonsContainer.appendChild(leaveButton);
    buttonsContainer.appendChild(ignoreButton);
    
    warningContainer.appendChild(title);
    warningContainer.appendChild(message);
    warningContainer.appendChild(reasons);
    warningContainer.appendChild(buttonsContainer);
    
    warningOverlay.appendChild(warningContainer);
    
    // Добавляем оверлей на страницу
    document.body.appendChild(warningOverlay);
    
    console.log('[CorgPhish] Предупреждение успешно добавлено на страницу');
  } catch (error) {
    console.error('[CorgPhish] Ошибка при создании предупреждения:', error);
  }
}

// Запускаем предупреждение после полной загрузки страницы
if (document.readyState === 'complete') {
  forcePhishingWarning();
} else {
  window.addEventListener('load', forcePhishingWarning);
}

// Резервная проверка - если DOM уже загружен, но load событие не сработало
document.addEventListener('DOMContentLoaded', function() {
  // Запускаем с небольшой задержкой, чтобы дать странице полностью загрузиться
  setTimeout(forcePhishingWarning, 500);
});

// Прямое добавление на страницу для максимальной надежности 
// Выполняем через 1 секунду после загрузки скрипта
setTimeout(forcePhishingWarning, 1000); 