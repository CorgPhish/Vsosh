/**
 * popup.js - Скрипт для всплывающего окна расширения CorgPhish
 */

// DOM-элементы
let siteScoreElement = null;
let siteMsgElement = null;
let roundedCircle = null;
let detailFeaturesElement = null;
let sitesCheckedElement = null;
let phishingDetectedElement = null;
let safetyScoreElement = null;
let themeToggle = null;
let analysisMethodSelect = null;
let binaryResultElement = null;

// Данные статистики
let stats = {
  sitesChecked: 0,
  phishingDetected: 0
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  // Инициализируем DOM-элементы
  initElements();
  
  // Загружаем данные и обновляем интерфейс
  loadStats();
  getCurrentTabInfo();
  loadAnalysisMethod();
  
  // Устанавливаем обработчики событий
  setupEventListeners();
});

/**
 * Инициализация элементов DOM
 */
function initElements() {
  try {
    siteScoreElement = document.getElementById('site_score');
    siteMsgElement = document.getElementById('site_msg');
    roundedCircle = document.querySelector('.rounded-circle');
    detailFeaturesElement = document.getElementById('detail_features');
    sitesCheckedElement = document.getElementById('sitesChecked');
    phishingDetectedElement = document.getElementById('phishingDetected');
    safetyScoreElement = document.getElementById('safetyScore');
    themeToggle = document.getElementById('theme-toggle');
    analysisMethodSelect = document.getElementById('analysis-method');
    binaryResultElement = document.getElementById('binary-result');
    
    console.log('[CorgPhish] Инициализация элементов DOM завершена');
  } catch (error) {
    console.error('[CorgPhish] Ошибка при инициализации элементов DOM:', error);
  }
}

/**
 * Настройка обработчиков событий
 */
function setupEventListeners() {
  try {
    // Проверка на null
    if (!themeToggle) {
      console.error('[CorgPhish] Элемент #theme-toggle не найден');
      return;
    }
    
    // Обработчик переключения темы
    themeToggle.addEventListener('click', toggleTheme);

    // Обработчик выбора метода анализа
    if (analysisMethodSelect) {
      analysisMethodSelect.addEventListener('change', function() {
        const selectedMethod = this.value;
        setAnalysisMethod(selectedMethod);
      });
    }

    // Обработчики для навигации
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function() {
        const label = this.querySelector('span')?.textContent;
        
        // Обновляем активный элемент
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        
        // Обрабатываем клик в зависимости от выбранного раздела
        if (label === 'Защита') {
          checkCurrentSite();
        } else if (label === 'История') {
          showHistory();
        } else if (label === 'Настройки') {
          showSettings();
        }
      });
    });
  } catch (error) {
    console.error('[CorgPhish] Ошибка при настройке обработчиков событий:', error);
  }
}

/**
 * Показывает настройки расширения
 */
function showSettings() {
  try {
    if (!detailFeaturesElement) {
      console.error('[CorgPhish] Элемент #detail_features не найден');
      return;
    }
    
    // Скрываем бинарный результат на странице настроек
    if (binaryResultElement) {
      binaryResultElement.style.display = 'none';
    }
    
    // Получаем текущий API ключ из хранилища
    chrome.storage.local.get(['gsb_api_key'], function(data) {
      const apiKey = data.gsb_api_key || '';
      
      // Создаем форму настроек
      const settingsHTML = `
        <div class="settings-container">
          <h3 class="settings-title">Настройки CorgPhish</h3>
          
          <div class="setting-group">
            <label for="analysis-method">Метод проверки:</label>
            <select id="analysis-method" class="form-control">
              <option value="combined">Комбинированный анализ</option>
              <option value="corgphish">Только CorgPhish</option>
              <option value="google_safe_browsing">Google Safe Browsing API</option>
            </select>
            <small class="text-muted">Выберите способ проверки сайтов</small>
          </div>
          
          <div class="setting-group">
            <label for="gsb-api-key">API ключ Google Safe Browsing:</label>
            <div class="api-key-input">
              <input type="text" id="gsb-api-key" class="form-control" value="${apiKey}" placeholder="Введите API ключ">
              <button id="save-api-key" class="btn btn-primary">Сохранить</button>
              <button id="validate-api-key" class="btn btn-info">Проверить</button>
            </div>
            <small class="text-muted">Необходим для использования Google Safe Browsing API</small>
            <div id="api-key-status"></div>
          </div>
          
          <div class="setting-group">
            <label>Тема оформления:</label>
            <button id="theme-switch" class="btn btn-secondary">
              <i class="fas fa-moon"></i> Переключить тему
            </button>
            <small class="text-muted">Переключение между светлой и темной темой</small>
          </div>
          
          <div class="setting-group">
            <h3>О расширении</h3>
            <p>CorgPhish - расширение для защиты от фишинговых сайтов.</p>
            <p>Версия: 1.0.0</p>
            <p class="credits">© 2023 CorgPhish Team</p>
          </div>
        </div>
      `;
      
      // Устанавливаем HTML настроек
      detailFeaturesElement.innerHTML = settingsHTML;
      
      // Обновляем текст в шапке
      if (siteMsgElement) {
        siteMsgElement.textContent = 'Настройки';
      }
      if (siteScoreElement) {
        siteScoreElement.textContent = '⚙️';
      }
      
      // Устанавливаем цвет круга
      if (roundedCircle) {
        roundedCircle.classList.remove('success', 'warning', 'danger');
        roundedCircle.style.background = 'var(--primary-color)';
      }
      
      // Получаем новые элементы после добавления HTML
      const analysisMethodSelect = document.getElementById('analysis-method');
      const saveApiKeyBtn = document.getElementById('save-api-key');
      const validateApiKeyBtn = document.getElementById('validate-api-key');
      const apiKeyInput = document.getElementById('gsb-api-key');
      const apiKeyStatus = document.getElementById('api-key-status');
      const themeSwitch = document.getElementById('theme-switch');
      
      // Загружаем текущий метод анализа
      loadAnalysisMethod(analysisMethodSelect);
      
      // Добавляем обработчики событий
      if (analysisMethodSelect) {
        analysisMethodSelect.addEventListener('change', function() {
          setAnalysisMethod(this.value);
        });
      }
      
      if (saveApiKeyBtn && apiKeyInput) {
        saveApiKeyBtn.addEventListener('click', function() {
          const newApiKey = apiKeyInput.value.trim();
          saveApiKey(newApiKey, apiKeyStatus);
        });
      }
      
      if (validateApiKeyBtn && apiKeyInput) {
        validateApiKeyBtn.addEventListener('click', function() {
          const apiKey = apiKeyInput.value.trim();
          validateApiKey(apiKey, apiKeyStatus);
        });
      }
      
      if (themeSwitch) {
        themeSwitch.addEventListener('click', toggleTheme);
      }
    });
  } catch (error) {
    console.error('[CorgPhish] Ошибка при отображении настроек:', error);
    if (siteMsgElement) {
      siteMsgElement.textContent = 'Ошибка загрузки настроек';
    }
  }
}

/**
 * Сохраняет API ключ в хранилище
 * @param {string} apiKey - API ключ
 * @param {HTMLElement} statusElement - Элемент для отображения статуса
 */
function saveApiKey(apiKey, statusElement) {
  chrome.storage.local.set({ 'gsb_api_key': apiKey }, function() {
    if (chrome.runtime.lastError) {
      statusElement.innerHTML = `<div class="alert alert-danger">Ошибка при сохранении ключа</div>`;
      console.error('[CorgPhish] Ошибка при сохранении API ключа:', chrome.runtime.lastError);
      return;
    }
    
    statusElement.innerHTML = `<div class="alert alert-success">API ключ успешно сохранен</div>`;
    console.log('[CorgPhish] API ключ успешно сохранен');
    
    // Сообщаем сервис-воркеру о новом API ключе
    chrome.runtime.sendMessage({
      action: "update_api_key",
      api_key: apiKey
    });
  });
}

/**
 * Валидирует API ключ
 * @param {string} apiKey - API ключ для проверки
 * @param {HTMLElement} statusElement - Элемент для отображения статуса
 */
function validateApiKey(apiKey, statusElement) {
  if (!apiKey) {
    statusElement.innerHTML = `<div class="alert alert-warning">API ключ не может быть пустым</div>`;
    return;
  }
  
  statusElement.innerHTML = `<div class="alert alert-info">Проверка ключа...</div>`;
  
  // Отправляем запрос сервис-воркеру на проверку API ключа
  chrome.runtime.sendMessage({
    action: "validate_api_key",
    api_key: apiKey
  }, function(response) {
    if (chrome.runtime.lastError) {
      statusElement.innerHTML = `<div class="alert alert-danger">Ошибка при проверке ключа</div>`;
      console.error('[CorgPhish] Ошибка при проверке API ключа:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.valid) {
      statusElement.innerHTML = `<div class="alert alert-success">API ключ действителен</div>`;
      
      // Если метод анализа был комбинированным, но ключ не был валидным ранее, 
      // уведомляем пользователя о возможности использования комбинированного анализа
      if (response.analysis_method === 'corgphish') {
        statusElement.innerHTML += `<div class="alert alert-info mt-2">Теперь вы можете использовать комбинированный анализ!</div>`;
      }
    } else {
      statusElement.innerHTML = `<div class="alert alert-danger">API ключ недействителен: ${response?.reason || 'неизвестная ошибка'}</div>`;
      
      // Если метод анализа был комбинированным, но ключ недействителен, уведомляем пользователя
      if (response && response.analysis_method === 'combined') {
        statusElement.innerHTML += `<div class="alert alert-warning mt-2">Комбинированный анализ недоступен с недействительным ключом. Переключитесь на CorgPhish.</div>`;
      }
    }
  });
}

/**
 * Устанавливает метод анализа
 * @param {string} method - Метод анализа
 */
function setAnalysisMethod(method) {
  chrome.runtime.sendMessage({
    action: "set_analysis_method",
    method: method
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('[CorgPhish] Ошибка при установке метода анализа:', chrome.runtime.lastError);
      return;
    }
    
    if (response && response.success) {
      console.log(`[CorgPhish] Метод анализа установлен: ${method}`);
    } else {
      console.error('[CorgPhish] Ошибка при установке метода анализа:', response?.error);
    }
  });
}

/**
 * Загружает текущий метод анализа
 * @param {HTMLSelectElement} selectElement - Элемент select для обновления
 */
function loadAnalysisMethod(selectElement = null) {
  chrome.runtime.sendMessage({
    action: "get_analysis_method"
  }, function(response) {
    if (chrome.runtime.lastError) {
      console.error('[CorgPhish] Ошибка при получении метода анализа:', chrome.runtime.lastError);
      return;
    }
    
    // Используем переданный элемент или глобальный элемент
    const select = selectElement || analysisMethodSelect;
    
    if (response && response.method && select) {
      select.value = response.method;
      console.log(`[CorgPhish] Загружен метод анализа: ${response.method}`);
    }
  });
}

/**
 * Показывает историю проверок
 */
function showHistory() {
  try {
    if (!detailFeaturesElement) {
      console.error('[CorgPhish] Элемент #detail_features не найден');
      return;
    }
    
    // Скрываем бинарный результат
    if (binaryResultElement) {
      binaryResultElement.style.display = 'none';
    }
    
    // Создаем разметку для истории
    const historyHTML = `
      <div class="history-container">
        <h3 class="settings-title">История проверок</h3>
        <div id="history-list">
          <div class="loading-message">Загрузка истории...</div>
        </div>
      </div>
    `;
    
    detailFeaturesElement.innerHTML = historyHTML;
    
    // Обновляем текст в шапке
    if (siteMsgElement) {
      siteMsgElement.textContent = 'История проверок';
    }
    if (siteScoreElement) {
      siteScoreElement.textContent = '🕒';
    }
    
    // Устанавливаем цвет круга
    if (roundedCircle) {
      roundedCircle.classList.remove('success', 'warning', 'danger');
      roundedCircle.style.background = 'var(--primary-color)';
    }
    
    // Загружаем историю из хранилища
    chrome.storage.local.get(['history'], function(result) {
      const historyList = document.getElementById('history-list');
      
      if (!historyList) {
        console.error('[CorgPhish] Элемент #history-list не найден');
        return;
      }
      
      const history = result.history || [];
      
      if (history.length === 0) {
        historyList.innerHTML = `
          <div class="empty-history">
            <p>История проверок пуста</p>
            <p>Информация появится после проверки сайтов</p>
          </div>
        `;
        return;
      }
      
      // Сортируем историю по времени (самые последние - вверху)
      history.sort((a, b) => b.timestamp - a.timestamp);
      
      // Ограничиваем количество отображаемых записей
      const recentHistory = history.slice(0, 20);
      
      // Генерируем HTML для каждой записи в истории
      let historyItemsHTML = '';
      
      recentHistory.forEach(item => {
        const date = new Date(item.timestamp);
        const dateString = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        const url = item.url || 'Неизвестный URL';
        const domain = extractDomain(url);
        const status = item.is_phishing ? 'phishing' : 'safe';
        const statusText = item.is_phishing ? 'ФИШИНГ' : 'БЕЗОПАСНО';
        
        historyItemsHTML += `
          <div class="history-item ${status}">
            <div class="history-url" title="${url}">${domain}</div>
            <div class="history-meta">
              <span>${dateString}</span>
              <span class="history-status ${status}">${statusText}</span>
            </div>
          </div>
        `;
      });
      
      historyList.innerHTML = historyItemsHTML;
    });
  } catch (error) {
    console.error('[CorgPhish] Ошибка при отображении истории:', error);
    if (siteMsgElement) {
      siteMsgElement.textContent = 'Ошибка загрузки истории';
    }
  }
}

/**
 * Извлекает домен из URL
 * @param {string} url - URL для обработки
 * @returns {string} - Домен
 */
function extractDomain(url) {
  try {
    if (!url) return 'Неизвестный домен';
    
    // Создаем URL объект
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    console.error('[CorgPhish] Ошибка при извлечении домена:', error);
    return url.substring(0, 30) + '...';
  }
}

/**
 * Переключает темную/светлую тему
 */
function toggleTheme() {
  try {
    const body = document.body;
    const icon = themeToggle.querySelector('i');
    
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.add('dark-theme');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      localStorage.setItem('theme', 'dark');
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при переключении темы:', error);
  }
}

/**
 * Загружает статистику из хранилища
 */
function loadStats() {
  try {
    chrome.storage.local.get(['stats'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('[CorgPhish] Ошибка при загрузке статистики:', chrome.runtime.lastError);
        return;
      }
      
      if (result.stats) {
        stats = result.stats;
        updateStatsDisplay();
      }
    });

    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      
      const icon = themeToggle?.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
      }
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при загрузке статистики:', error);
  }
}

/**
 * Обновляет отображение статистики
 */
function updateStatsDisplay() {
  try {
    if (sitesCheckedElement) {
      sitesCheckedElement.textContent = stats.sitesChecked || 0;
    }
    
    if (phishingDetectedElement) {
      phishingDetectedElement.textContent = stats.phishingDetected || 0;
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при обновлении статистики:', error);
  }
}

/**
 * Получает информацию о текущей вкладке
 */
function getCurrentTabInfo() {
  try {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (chrome.runtime.lastError) {
        console.error('[CorgPhish] Ошибка при получении текущей вкладки:', chrome.runtime.lastError);
        updateStatusDisplay(false, 50);
        return;
      }
      
      if (!tabs || tabs.length === 0) {
        console.error('[CorgPhish] Не удалось получить текущую вкладку');
        updateStatusDisplay(false, 50);
        return;
      }
      
      const currentTab = tabs[0];
      
      // Получаем результаты проверки текущего сайта
      chrome.runtime.sendMessage({
        action: "get_results",
        tabId: currentTab.id
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('[CorgPhish] Ошибка при получении данных:', chrome.runtime.lastError);
          return;
        }
        
        const isPhishing = response.isPhishing;
        const safetyScore = response.safetyScore;
        const details = response.details;
        
        console.log(`[CorgPhish] Данные для вкладки ${currentTab.id}:`, {
          isPhishing: isPhishing,
          safetyScore: safetyScore,
          details: details
        });
        
        updateStatusDisplay(isPhishing, safetyScore, details);
      });
    });
  } catch (error) {
    console.error('[CorgPhish] Ошибка при получении информации о вкладке:', error);
    updateStatusDisplay(false, 50);
  }
}

/**
 * Обновляет отображение статуса сайта
 * @param {boolean} isPhishing - Флаг фишингового сайта
 * @param {number} safetyScore - Оценка безопасности (0-100)
 * @param {object} details - Дополнительные детали проверки
 */
function updateStatusDisplay(isPhishing, safetyScore, details = {}) {
  try {
    // Проверка наличия DOM-элементов
    if (!siteScoreElement || !siteMsgElement || !roundedCircle || !detailFeaturesElement || !binaryResultElement) {
      console.error('[CorgPhish] Не удалось найти элементы DOM для обновления статуса');
      return;
    }
    
    // Обновляем класс круга в зависимости от безопасности
    roundedCircle.classList.remove('success', 'warning', 'danger');
    
    // Обновляем бинарный результат
    binaryResultElement.classList.remove('safe', 'phishing');
    
    // Устанавливаем соответствующий цвет и текст в зависимости от безопасности
    if (isPhishing) {
      // Сайт является фишинговым
      roundedCircle.classList.add('danger');
      roundedCircle.style.background = 'var(--danger-color)';
      
      siteScoreElement.textContent = `${safetyScore}%`;
      siteMsgElement.textContent = 'Обнаружены признаки фишинга!';
      
      // Обновляем бинарный результат
      binaryResultElement.textContent = 'ФИШИНГ';
      binaryResultElement.classList.add('phishing');
    } else {
      // Сайт безопасен
      if (safetyScore >= 80) {
        roundedCircle.classList.add('success');
        roundedCircle.style.background = 'var(--success-color)';
        siteMsgElement.textContent = 'Сайт безопасен';
      } else if (safetyScore >= 50) {
        roundedCircle.classList.add('warning');
        roundedCircle.style.background = 'var(--warning-color)';
        siteMsgElement.textContent = 'Сайт вероятно безопасен';
      } else {
        roundedCircle.classList.add('warning');
        roundedCircle.style.background = 'var(--warning-color)';
        siteMsgElement.textContent = 'Проявите осторожность';
      }
      
      siteScoreElement.textContent = `${safetyScore}%`;
      
      // Обновляем бинарный результат
      binaryResultElement.textContent = 'БЕЗОПАСНО';
      binaryResultElement.classList.add('safe');
    }
    
    // Обновляем детали проверки, если они есть
    if (details && details.reasons && Array.isArray(details.reasons)) {
      // Очищаем предыдущие детали
      detailFeaturesElement.innerHTML = '';
      
      // Добавляем новые детали
      details.reasons.forEach(reason => {
        if (reason && reason.trim()) {
          const li = document.createElement('li');
          li.textContent = reason;
          detailFeaturesElement.appendChild(li);
        }
      });
      
      // Если причин нет, добавляем сообщение по умолчанию
      if (detailFeaturesElement.children.length === 0) {
        const li = document.createElement('li');
        li.textContent = isPhishing 
          ? 'Обнаружены признаки фишинга' 
          : 'Подозрительных признаков не обнаружено';
        detailFeaturesElement.appendChild(li);
      }
    }
    
    // Обновляем отображаемый бинарный результат в зависимости от binary_result в details
    if (details && details.binary_result) {
      binaryResultElement.textContent = details.binary_result;
      
      if (details.binary_result === "БЕЗОПАСНО") {
        binaryResultElement.classList.remove('phishing');
        binaryResultElement.classList.add('safe');
      } else if (details.binary_result === "ФИШИНГ") {
        binaryResultElement.classList.remove('safe');
        binaryResultElement.classList.add('phishing');
      }
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при обновлении статуса:', error);
  }
}

/**
 * Проверяет текущий сайт
 */
function checkCurrentSite() {
  try {
    // Показываем сообщение о проверке
    if (siteMsgElement) {
      siteMsgElement.textContent = 'Проверка сайта...';
    }
    
    // Обновляем отображение кружка
    if (roundedCircle) {
      roundedCircle.classList.remove('success', 'warning', 'danger');
      roundedCircle.classList.add('warning');
      roundedCircle.style.background = 'var(--warning-color)';
    }
    
    // Обновляем счетчик точек
    if (siteScoreElement) {
      siteScoreElement.textContent = '';
      
      let dots = 0;
      const loadingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        siteScoreElement.textContent = '.'.repeat(dots);
        
        if (!siteScoreElement) {
          clearInterval(loadingInterval);
        }
      }, 300);
      
      // Получаем ID текущей вкладки
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs && tabs.length > 0) {
          const tabId = tabs[0].id;
          const url = tabs[0].url;
          
          // Проверяем, является ли URL валидным HTTP/HTTPS
          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            // Отправляем запрос на проверку URL
            chrome.runtime.sendMessage(
              {
                action: "check_url", 
                url: url, 
                tabId: tabId,
                priority: "high" // Помечаем запрос как высокоприоритетный
              }, 
              function(response) {
                // Останавливаем анимацию
                clearInterval(loadingInterval);
                
                if (chrome.runtime.lastError) {
                  console.error('[CorgPhish] Ошибка при проверке сайта:', chrome.runtime.lastError);
                  
                  // Показываем сообщение об ошибке
                  if (siteMsgElement) {
                    siteMsgElement.textContent = 'Ошибка при проверке';
                  }
                  if (siteScoreElement) {
                    siteScoreElement.textContent = '!';
                  }
                  return;
                }
                
                if (response) {
                  // Обновляем статистику
                  stats.sitesChecked++;
                  if (response.is_phishing) {
                    stats.phishingDetected++;
                  }
                  saveStats();
                  
                  // Обновляем отображение
                  updateStatusDisplay(
                    response.is_phishing, 
                    response.score, 
                    {
                      reasons: response.reasons,
                      source: response.source,
                      binary_result: response.binary_result
                    }
                  );
                  updateStatsDisplay();
                } else {
                  // Обработка ошибки
                  if (siteMsgElement) {
                    siteMsgElement.textContent = 'Нет данных';
                  }
                  if (siteScoreElement) {
                    siteScoreElement.textContent = '?';
                  }
                }
              }
            );
          } else {
            // URL не HTTP/HTTPS
            clearInterval(loadingInterval);
            
            if (siteMsgElement) {
              siteMsgElement.textContent = 'Это не веб-сайт';
            }
            if (siteScoreElement) {
              siteScoreElement.textContent = '-';
            }
            
            // Очищаем детали
            if (detailFeaturesElement) {
              detailFeaturesElement.innerHTML = '<li>Проверка поддерживается только для HTTP/HTTPS URL</li>';
            }
            
            // Скрываем бинарный результат
            if (binaryResultElement) {
              binaryResultElement.style.display = 'none';
            }
          }
        } else {
          // Вкладка не найдена
          clearInterval(loadingInterval);
          
          if (siteMsgElement) {
            siteMsgElement.textContent = 'Ошибка: вкладка не найдена';
          }
          if (siteScoreElement) {
            siteScoreElement.textContent = '!';
          }
        }
      });
    }
  } catch (error) {
    console.error('[CorgPhish] Ошибка при проверке текущего сайта:', error);
    
    if (siteMsgElement) {
      siteMsgElement.textContent = 'Произошла ошибка';
    }
    if (siteScoreElement) {
      siteScoreElement.textContent = '!';
    }
  }
}

/**
 * Открывает страницу настроек
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Открывает страницу "О расширении"
 */
function openAboutPage() {
  chrome.tabs.create({url: "html/about.html"});
}

/**
 * Сохраняет статистику в хранилище
 */
function saveStats() {
  try {
    chrome.storage.local.set({ stats: stats }, function() {
      if (chrome.runtime.lastError) {
        console.error('[CorgPhish] Ошибка при сохранении статистики:', chrome.runtime.lastError);
      } else {
        console.log('[CorgPhish] Статистика успешно сохранена');
      }
    });
  } catch (error) {
    console.error('[CorgPhish] Ошибка при сохранении статистики:', error);
  }
} 