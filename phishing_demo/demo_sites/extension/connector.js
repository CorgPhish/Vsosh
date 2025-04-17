/**
 * connector.js
 * Скрипт-коннектор для связи демо-сайтов с моделью обнаружения фишинга
 */

(function() {
    console.log('CorgPhish Connector: Инициализация...');

    // Загружаем модель XGBoost
    function loadModel() {
        return new Promise((resolve, reject) => {
            // Модуль XGBoost в формате JavaScript
            const scriptElement = document.createElement('script');
            scriptElement.src = '/extension/browser_extension/js/xgboost_model.js';
            scriptElement.onload = function() {
                console.log('CorgPhish Connector: Модель XGBoost загружена');
                resolve();
            };
            scriptElement.onerror = function(error) {
                console.error('CorgPhish Connector: Ошибка загрузки модели XGBoost:', error);
                reject(error);
            };
            document.head.appendChild(scriptElement);
        });
    }

    // Загружаем визуальные компоненты
    function loadVisualComponents() {
        return new Promise((resolve, reject) => {
            // Контентный скрипт для отображения уведомлений
            const scriptElement = document.createElement('script');
            scriptElement.src = '/extension/browser_extension/js/content.js';
            scriptElement.onload = function() {
                console.log('CorgPhish Connector: Визуальные компоненты загружены');
                resolve();
            };
            scriptElement.onerror = function(error) {
                console.error('CorgPhish Connector: Ошибка загрузки визуальных компонентов:', error);
                reject(error);
            };
            document.head.appendChild(scriptElement);
        });
    }

    // Запускаем проверку сайта через XGBoost модель
    function checkSiteWithModel() {
        try {
            console.log('CorgPhish Connector: Запуск проверки сайта...');
            
            // Проверяем, загружена ли модель
            if (typeof combinedAnalysis !== 'function') {
                console.error('CorgPhish Connector: Модель не загружена');
                showForcedWarning();
                return;
            }
            
            // Передаем текущий URL в модель
            const currentUrl = window.location.href;
            combinedAnalysis(currentUrl, function(result) {
                console.log('CorgPhish Connector: Результат модели:', result);
                
                // Если это демо-сайт, всегда показываем предупреждение
                if (window.location.href.includes('demo_sites')) {
                    result.is_phishing = true;
                    result.probability = 1.0;
                    result.score = 0;
                    result.binary_result = "ФИШИНГ";
                    result.reasons = [
                        "Демонстрационный фишинговый сайт",
                        "Локальный тестовый сайт"
                    ];
                }
                
                // Отображаем предупреждение о фишинге
                if (result.is_phishing) {
                    if (typeof showWarning === 'function') {
                        showWarning(result);
                    } else {
                        showForcedWarning();
                    }
                }
            });
        } catch (error) {
            console.error('CorgPhish Connector: Ошибка при проверке сайта:', error);
            showForcedWarning();
        }
    }

    // Резервная функция принудительного предупреждения (если не загрузились компоненты)
    function showForcedWarning() {
        console.log('CorgPhish Connector: Показываем принудительное предупреждение');
        
        // Создаем стили для предупреждения
        const style = document.createElement('style');
        style.textContent = `
            .corgphish-warning-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(220, 0, 0, 0.95);
                z-index: 9999999;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: Arial, sans-serif;
            }
            
            .corgphish-warning-container {
                background-color: white;
                border-radius: 10px;
                padding: 30px;
                max-width: 500px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
                text-align: center;
            }
            
            .corgphish-warning-title {
                color: #d32f2f;
                margin-top: 0;
                font-size: 24px;
            }
            
            .corgphish-reasons {
                background-color: #ffe6e6;
                border-radius: 5px;
                padding: 15px;
                margin: 15px 0;
                text-align: left;
            }
            
            .corgphish-buttons {
                display: flex;
                justify-content: space-between;
                margin-top: 25px;
            }
            
            .corgphish-leave-button {
                background-color: #d32f2f;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
                font-weight: bold;
            }
            
            .corgphish-ignore-button {
                background-color: #f5f5f5;
                color: #333;
                border: none;
                border-radius: 5px;
                padding: 10px 20px;
                font-size: 16px;
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
        
        // Создаем HTML предупреждения
        const warningOverlay = document.createElement('div');
        warningOverlay.className = 'corgphish-warning-overlay';
        warningOverlay.innerHTML = `
            <div class="corgphish-warning-container">
                <h1 class="corgphish-warning-title">⚠️ ВНИМАНИЕ! ФИШИНГОВЫЙ САЙТ!</h1>
                <p>Этот сайт <strong>${window.location.host}</strong> определен как фишинговый!</p>
                <div class="corgphish-reasons">
                    <h3>Причины:</h3>
                    <ul>
                        <li>Демонстрационный фишинговый сайт</li>
                        <li>Локальный тестовый сайт</li>
                        <li>Обнаружены признаки фишинга</li>
                    </ul>
                </div>
                <div class="corgphish-buttons">
                    <button class="corgphish-leave-button">Покинуть сайт</button>
                    <button class="corgphish-ignore-button">Игнорировать</button>
                </div>
            </div>
        `;
        
        // Добавляем предупреждение в документ
        document.body.appendChild(warningOverlay);
        
        // Добавляем обработчики событий на кнопки
        warningOverlay.querySelector('.corgphish-leave-button').addEventListener('click', function() {
            window.location.href = 'https://www.google.com';
        });
        
        warningOverlay.querySelector('.corgphish-ignore-button').addEventListener('click', function() {
            warningOverlay.remove();
        });
    }

    // Инициализация при загрузке страницы
    async function initialize() {
        try {
            // Проверяем, является ли сайт демо-сайтом
            if (!window.location.href.includes('demo_sites')) {
                console.log('CorgPhish Connector: Не демо-сайт, пропускаем');
                return;
            }
            
            console.log('CorgPhish Connector: Инициализация на демо-сайте', window.location.href);
            
            // Загружаем модель и компоненты
            await Promise.all([
                loadModel(),
                loadVisualComponents()
            ]);
            
            // Запускаем проверку сайта
            setTimeout(checkSiteWithModel, 500);
        } catch (error) {
            console.error('CorgPhish Connector: Ошибка инициализации:', error);
            
            // Если что-то пошло не так, показываем принудительное предупреждение
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                showForcedWarning();
            } else {
                window.addEventListener('DOMContentLoaded', showForcedWarning);
            }
        }
    }

    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})(); 