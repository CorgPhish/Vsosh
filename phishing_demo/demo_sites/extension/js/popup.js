/**
 * popup.js - Скрипт для всплывающего окна расширения CorgPhish
 */

document.addEventListener('DOMContentLoaded', function() {
  // Инициализация элементов DOM
  const statusCircle = document.getElementById('status-circle');
  const siteScore = document.getElementById('site_score');
  const siteMsg = document.getElementById('site_msg');
  const featuresList = document.getElementById('features');
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  const navItems = document.querySelectorAll('.nav-item');

  // Инициализация темы
  initTheme();

  // Получаем информацию о текущей вкладке и анализируем сайт
  getCurrentTabInfo();

  // Обработчики событий
  themeToggle.addEventListener('click', toggleTheme);
  
  // Настройка навигации
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Убираем активный класс со всех элементов
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Добавляем активный класс на текущий элемент
      this.classList.add('active');
      
      // Обработка действий на основе ID
      switch(this.id) {
        case 'nav-home':
          // Обновляем информацию о текущем сайте
          getCurrentTabInfo();
          break;
        case 'nav-settings':
          // Открываем страницу настроек
          chrome.runtime.openOptionsPage();
          break;
        case 'nav-history':
          // Показываем историю проверок
          showCheckHistory();
          break;
        case 'nav-about':
          // Открываем страницу "О нас"
          chrome.tabs.create({url: chrome.runtime.getURL("html/about.html")});
          break;
      }
    });
  });

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
   * Получает информацию о текущей вкладке и проверяет сайт
   */
  function getCurrentTabInfo() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs && tabs.length > 0) {
        const currentTab = tabs[0];
        checkSite(currentTab);
      }
    });
  }

  /**
   * Проверяет безопасность сайта
   * @param {Object} tab - Объект вкладки браузера
   */
  function checkSite(tab) {
    // Показываем индикатор загрузки
    showLoadingState();
    
    // Через chrome.storage получаем результаты проверки сайта или запускаем проверку
    chrome.storage.local.get(['siteChecks'], function(result) {
      const siteChecks = result.siteChecks || {};
      
      // Если результатов нет или они устарели, запускаем проверку
      if (!siteChecks[tab.url] || isCheckExpired(siteChecks[tab.url].timestamp)) {
        // В реальном расширении здесь будет отправка запроса на проверку сайта
        // Для демонстрации используем случайные результаты
        performSiteCheck(tab);
      } else {
        // Используем сохраненные результаты
        displayResults(siteChecks[tab.url]);
      }
    });
  }

  /**
   * Проверяет, истек ли срок действия проверки сайта
   * @param {number} timestamp - Временная метка проверки
   * @returns {boolean} - true если проверка устарела
   */
  function isCheckExpired(timestamp) {
    const now = Date.now();
    const expiryTime = 15 * 60 * 1000; // 15 минут
    return (now - timestamp) > expiryTime;
  }

  /**
   * Выполняет проверку сайта (демонстрационная функция)
   * @param {Object} tab - Объект вкладки браузера
   */
  function performSiteCheck(tab) {
    // Имитация задержки сетевого запроса
    setTimeout(() => {
      // Демонстрационные данные (в реальном расширении будут результаты анализа)
      const score = 100; // Оценка безопасности 0-100
      const isSafe = true;
      
      // Факторы безопасности
      const factors = [
        {name: "Безопасное соединение", status: "safe"},
        {name: "Надежный домен", status: "safe"},
        {name: "Проверенный сертификат", status: "safe"},
        {name: "Безопасная форма входа", status: "safe"},
        {name: "Официальный сайт", status: "safe"}
      ];
      
      // Результаты проверки
      const results = {
        score: score,
        isSafe: isSafe,
        factors: factors,
        url: tab.url,
        timestamp: Date.now()
      };
      
      // Сохраняем результаты
      saveResults(results);
      
      // Отображаем результаты
      displayResults(results);
    }, 500);
  }

  /**
   * Сохраняет результаты проверки сайта
   * @param {Object} results - Результаты проверки
   */
  function saveResults(results) {
    chrome.storage.local.get(['siteChecks'], function(data) {
      const siteChecks = data.siteChecks || {};
      siteChecks[results.url] = results;
      
      chrome.storage.local.set({siteChecks: siteChecks});
    });
  }

  /**
   * Отображает индикатор загрузки
   */
  function showLoadingState() {
    statusCircle.className = 'rounded-circle';
    siteScore.textContent = '...';
    siteMsg.textContent = 'Проверка сайта...';
    
    // Очищаем список факторов
    featuresList.textContent = '';
    
    // Добавляем индикатор загрузки
    const loadingItem = document.createElement('li');
    const spinner = document.createElement('i');
    spinner.className = 'fas fa-spinner fa-spin';
    loadingItem.appendChild(spinner);
    loadingItem.appendChild(document.createTextNode('Анализ сайта...'));
    featuresList.appendChild(loadingItem);
  }

  /**
   * Отображает результаты проверки
   * @param {Object} results - Результаты проверки
   */
  function displayResults(results) {
    // Устанавливаем оценку
    siteScore.textContent = results.score + '%';
    
    // Определяем класс для индикатора на основе оценки
    if (results.score >= 80) {
      statusCircle.className = 'rounded-circle';
      siteMsg.textContent = 'Это официальный сайт! Проверено';
    } else if (results.score >= 50) {
      statusCircle.className = 'rounded-circle warning';
      siteMsg.textContent = 'Соблюдайте осторожность!';
    } else {
      statusCircle.className = 'rounded-circle danger';
      siteMsg.textContent = 'Внимание! Возможно фишинг!';
    }
    
    // Очищаем список факторов
    featuresList.textContent = '';
    
    // Добавляем факторы безопасности
    results.factors.forEach(factor => {
      const li = document.createElement('li');
      
      const icon = document.createElement('i');
      if (factor.status === 'safe') {
        icon.className = 'fas fa-check-circle';
        li.appendChild(icon);
        li.appendChild(document.createTextNode(factor.name));
      } else if (factor.status === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
        li.appendChild(icon);
        li.appendChild(document.createTextNode(factor.name));
        li.className = 'warning';
      } else {
        icon.className = 'fas fa-times-circle';
        li.appendChild(icon);
        li.appendChild(document.createTextNode(factor.name));
        li.className = 'danger';
      }
      
      featuresList.appendChild(li);
    });
  }

  // Implement the feature to show check history
  function showCheckHistory() {
    // Retrieve and display the check history
    chrome.storage.sync.get({history: []}, function(data) {
      const historyList = document.getElementById('history-list');
      historyList.textContent = '';
      data.history.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.date}: ${item.result}`;
        historyList.appendChild(listItem);
      });
    });
  }

  // Call the function to show check history
  showCheckHistory();
}); 