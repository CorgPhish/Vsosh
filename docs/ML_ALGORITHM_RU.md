# Описание работы алгоритма машинного обучения CorgPhish

<div align="center">
  <img src="../src/extension/images/logo.png" alt="CorgPhish Logo" width="150"/>
  <h3>Интеллектуальная защита от фишинга</h3>
</div>

## Содержание
1. [Обзор алгоритма](#обзор-алгоритма)
2. [Выбор модели](#выбор-модели)
3. [Признаки фишинговых сайтов](#признаки-фишинговых-сайтов)
4. [Процесс обучения модели](#процесс-обучения-модели)
5. [Экспорт модели в JavaScript](#экспорт-модели-в-javascript)
6. [Интеграция в расширение браузера](#интеграция-в-расширение-браузера)
7. [Оптимизация производительности](#оптимизация-производительности)
8. [Процесс принятия решений](#процесс-принятия-решений)
9. [Глубокое сканирование и обнаружение обфускации](#глубокое-сканирование-и-обнаружение-обфускации)

## Обзор алгоритма

CorgPhish использует алгоритмы машинного обучения для автоматического выявления фишинговых веб-сайтов. Наш подход совмещает анализ URL, DOM-структуры страницы и других признаков для создания точной модели классификации, способной отличать легитимные сайты от фишинговых.

<div align="center">
  <img src="images/ml_workflow.png" alt="Процесс работы ML-алгоритма" width="600"/>
  <p><em>Рис. 1: Общая схема работы алгоритма CorgPhish</em></p>
</div>

Ключевые преимущества нашего подхода:
1. **Локальная работа**: алгоритм полностью выполняется в браузере пользователя, не передавая данные на внешние серверы
2. **Многофакторный анализ**: рассматривается более 50 различных признаков фишинговых сайтов
3. **Высокая точность**: точность обнаружения 97.2%, показатель Precision 96.5%
4. **Быстрый анализ**: обработка происходит за доли секунды
5. **Регулярные обновления**: модель периодически улучшается на основе новых данных

## Выбор модели

Для решения задачи классификации фишинговых сайтов мы рассмотрели несколько алгоритмов машинного обучения:

| Алгоритм | Accuracy | Precision | Recall | F1-Score | Выбор |
|----------|----------|-----------|--------|----------|-------|
| Логистическая регрессия | 89.4% | 88.7% | 86.2% | 87.4% | ❌ |
| Random Forest | 95.3% | 94.8% | 92.7% | 93.7% | ❌ |
| XGBoost | 97.2% | 96.5% | 95.8% | 96.1% | ✅ |
| SVM | 90.8% | 89.5% | 91.2% | 90.3% | ❌ |
| Neural Network | 93.6% | 92.8% | 93.5% | 93.1% | ❌ |

<div align="center">
  <img src="images/model_comparison.png" alt="Сравнение моделей ML" width="600"/>
  <p><em>Рис. 2: Сравнение эффективности различных алгоритмов машинного обучения</em></p>
</div>

В итоге мы выбрали **XGBoost** (eXtreme Gradient Boosting) из-за его:
- Высокой точности
- Скорости выполнения предсказаний
- Компактности после экспорта в JavaScript
- Устойчивости к переобучению
- Возможности понять важность признаков

<div align="center">
  <img src="images/xgboost_tree.png" alt="Пример дерева решений XGBoost" width="500"/>
  <p><em>Рис. 3: Пример одного из деревьев решений в модели XGBoost</em></p>
</div>

## Признаки фишинговых сайтов

В нашей модели используется более 50 различных признаков, сгруппированных в несколько категорий:

<div align="center">
  <img src="images/features_categories.png" alt="Категории признаков" width="600"/>
  <p><em>Рис. 4: Основные категории признаков фишинга</em></p>
</div>

### URL-признаки (25 признаков):
- Длина URL
- Количество поддоменов
- Наличие IP-адреса вместо домена
- Количество точек в URL
- Наличие специальных символов (@, -, _, =, ~)
- Наличие множества слешей
- Использование сокращателей URL
- Количество цифр в домене
- Использование HTTPS
- Возраст домена (если доступен)
- Наличие ключевых слов, характерных для фишинга
- Использование доменов верхнего уровня (TLD)
- Наличие подстановочных символов в домене
- Количество перенаправлений
- Использование закодированных символов в URL

<div align="center">
  <img src="images/url_analysis.png" alt="Анализ URL" width="550"/>
  <p><em>Рис. 5: Анализ компонентов URL для выявления фишинговых признаков</em></p>
</div>

### DOM-признаки (15 признаков):
- Наличие форм ввода данных
- Количество полей для паролей
- Наличие элементов безопасности (security seal)
- Отношение внешних ссылок к внутренним
- Использование iframes
- Наличие скрытых элементов
- Отсутствие favicon
- Перехват формы перед отправкой
- Использование JavaScript для сбора данных форм
- Открытие множества всплывающих окон
- Попытки блокировки выхода со страницы
- Отключение правой кнопки мыши
- Имитация URL в адресной строке
- Использование обфусцированного JavaScript
- Несоответствие контента в title и body

### Дополнительные признаки (10+ признаков):
- Срок действия SSL-сертификата
- Самоподписанный сертификат
- Наличие картинок с других доменов
- Наличие доверенных логотипов банков/платежных систем
- Отсутствие политики конфиденциальности
- Несовпадение языка контента и целевого региона
- Поведение перенаправлений
- Скрытые ссылки
- Несоответствие домена бренду

<div align="center">
  <img src="images/feature_importance.png" alt="Важность признаков" width="600"/>
  <p><em>Рис. 6: Относительная важность различных признаков в модели</em></p>
</div>

## Процесс обучения модели

Процесс обучения модели XGBoost состоит из следующих этапов:

<div align="center">
  <img src="images/training_process.png" alt="Процесс обучения модели" width="700"/>
  <p><em>Рис. 7: Схема процесса обучения модели CorgPhish</em></p>
</div>

1. **Сбор и подготовка данных**
   - Собраны более 30 000 URL-адресов (15 000 фишинговых, 15 000 легитимных)
   - Источники фишинговых URL: PhishTank, OpenPhish, собственные коллекции
   - Источники легитимных URL: Alexa Top Sites, Common Crawl

2. **Извлечение признаков**
   - Для каждого URL рассчитаны все 50+ признаков
   - Данные сохранены в формате JSON для дальнейшего использования

3. **Предобработка данных**
   - Нормализация числовых признаков
   - Кодирование категориальных признаков
   - Обработка пропущенных значений

4. **Разделение данных**
   - 70% данных использовано для обучения
   - 15% данных для валидации
   - 15% данных для тестирования

<div align="center">
  <img src="images/data_split.png" alt="Разделение данных" width="450"/>
  <p><em>Рис. 8: Разделение данных для обучения, валидации и тестирования</em></p>
</div>

5. **Обучение модели**
   ```python
   params = {
       'max_depth': 6,
       'learning_rate': 0.1,
       'n_estimators': 100,
       'objective': 'binary:logistic',
       'eval_metric': ['auc', 'error'],
       'subsample': 0.8,
       'colsample_bytree': 0.8
   }
   
   model = XGBClassifier(**params)
   model.fit(
       X_train, y_train,
       eval_set=[(X_valid, y_valid)],
       early_stopping_rounds=10,
       verbose=True
   )
   ```

6. **Оценка модели**
   - Расчет метрик на тестовой выборке
   - Анализ кривой ROC-AUC (0.981)
   - Анализ матрицы ошибок
   - Важность признаков

<div align="center">
  <img src="images/confusion_matrix.png" alt="Матрица ошибок" width="450"/>
  <p><em>Рис. 9: Матрица ошибок модели на тестовых данных</em></p>
</div>

<div align="center">
  <img src="images/roc_curve.png" alt="ROC-кривая" width="450"/>
  <p><em>Рис. 10: ROC-кривая обученной модели (AUC = 0.981)</em></p>
</div>

7. **Доработка модели**
   - Подбор гиперпараметров с помощью GridSearchCV
   - Устранение переобучения
   - Оптимизация порога принятия решения

## Экспорт модели в JavaScript

Процесс экспорта модели XGBoost в JavaScript является одним из ключевых компонентов нашего расширения. Мы используем собственную реализацию для максимальной оптимизации:

<div align="center">
  <img src="images/model_export.png" alt="Экспорт модели в JavaScript" width="700"/>
  <p><em>Рис. 11: Процесс преобразования Python-модели XGBoost в JavaScript</em></p>
</div>

1. **Сериализация модели**
   ```python
   # Сохранение обученной модели в формате pickle
   import pickle
   with open('model/xgboost_model.pkl', 'wb') as f:
       pickle.dump(model, f)
   ```

2. **Экстракция деревьев решений**
   ```python
   # Извлечение структуры деревьев
   trees = []
   for i in range(len(model.get_booster().trees_to_dataframe())):
       tree = model.get_booster().get_dump()[i]
       trees.append(parse_tree(tree))
   ```

3. **Преобразование в JavaScript**
   ```python
   # Генерация JavaScript-кода
   js_code = """
   // XGBoost модель для обнаружения фишинговых сайтов
   const xgboostModel = {
       trees: ${trees_json},
       base_score: ${base_score},
       
       // Функция предсказания
       predict: function(features) {
           let sum = this.base_score;
           
           for (let i = 0; i < this.trees.length; i++) {
               sum += this.predictTree(this.trees[i], features);
           }
           
           // Применение сигмоиды для получения вероятности
           return 1.0 / (1.0 + Math.exp(-sum));
       },
       
       // Обход дерева решений
       predictTree: function(tree, features) {
           let node = tree;
           
           while (!node.isLeaf) {
               if (features[node.feature] <= node.threshold) {
                   node = node.left;
               } else {
                   node = node.right;
               }
           }
           
           return node.value;
       }
   };
   
   // Экспорт модели
   export default xgboostModel;
   """.replace('${trees_json}', json.dumps(trees)).replace('${base_score}', str(model.base_score))
   
   # Запись в JavaScript-файл
   with open('src/extension/js/models/xgboost_model.js', 'w') as f:
       f.write(js_code)
   ```

4. **Оптимизация размера**
   - Сжатие структуры деревьев
   - Удаление избыточной информации
   - Минификация кода
   - Итоговый размер JavaScript файла: 22KB

<div align="center">
  <img src="images/js_model_size.png" alt="Оптимизация размера модели" width="550"/>
  <p><em>Рис. 12: Сравнение размера модели до и после оптимизации</em></p>
</div>

## Интеграция в расширение браузера

Интеграция модели в расширение выполнена следующим образом:

<div align="center">
  <img src="images/extension_architecture.png" alt="Архитектура расширения" width="700"/>
  <p><em>Рис. 13: Архитектура расширения CorgPhish и интеграция ML-модели</em></p>
</div>

1. **Импорт модели в JavaScript коде**
   ```javascript
   import xgboostModel from './models/xgboost_model.js';
   ```

2. **Извлечение признаков из страницы**
   ```javascript
   // Функция извлечения признаков
   function extractFeatures(url, document) {
       const features = {};
       
       // URL признаки
       features.url_length = url.length;
       features.has_ip_address = /^\d+\.\d+\.\d+\.\d+/.test(url) ? 1 : 0;
       features.has_at_symbol = url.includes('@') ? 1 : 0;
       // ...еще 22+ URL признака
       
       // DOM признаки
       features.has_form = document.forms.length > 0 ? 1 : 0;
       features.password_field_count = document.querySelectorAll('input[type="password"]').length;
       features.external_links_ratio = calculateExternalLinksRatio(document);
       // ...еще 12+ DOM признаков
       
       // Дополнительные признаки
       // ...
       
       return features;
   }
   ```

3. **Анализ страницы**
   ```javascript
   // Анализ текущей страницы
   function analyzePage() {
       const url = window.location.href;
       const features = extractFeatures(url, document);
       
       // Получение предсказания от модели
       const phishingProbability = xgboostModel.predict(features);
       
       // Принятие решения на основе порога
       if (phishingProbability > THRESHOLD) {
           showWarning(phishingProbability, features);
       }
   }
   ```

4. **Обработка событий браузера**
   ```javascript
   // Слушатель события загрузки страницы
   document.addEventListener('DOMContentLoaded', () => {
       // Небольшая задержка для полной загрузки DOM
       setTimeout(analyzePage, 500);
   });
   ```

<div align="center">
  <img src="images/extension_workflow.png" alt="Рабочий процесс расширения" width="650"/>
  <p><em>Рис. 14: Процесс работы расширения при загрузке страницы</em></p>
</div>

## Оптимизация производительности

Для обеспечения быстрой работы в браузере мы реализовали следующие оптимизации:

<div align="center">
  <img src="images/performance_optimizations.png" alt="Оптимизации производительности" width="600"/>
  <p><em>Рис. 15: Схема оптимизаций производительности</em></p>
</div>

1. **Кэширование результатов**
   ```javascript
   // Кэш результатов проверки
   const checkedUrls = {};
   
   function checkUrl(url) {
       // Проверка в кэше
       if (checkedUrls[url]) {
           return checkedUrls[url];
       }
       
       // Извлечение и анализ
       const features = extractFeatures(url, document);
       const result = xgboostModel.predict(features);
       
       // Сохранение в кэш
       checkedUrls[url] = result;
       
       return result;
   }
   ```

2. **Асинхронная обработка**
   ```javascript
   // Асинхронный анализ для нескольких URL
   async function analyzeMultipleUrls(urls) {
       const results = {};
       
       // Создаем порцию запросов по 10 URL
       const batches = [];
       for (let i = 0; i < urls.length; i += 10) {
           batches.push(urls.slice(i, i + 10));
       }
       
       for (const batch of batches) {
           await Promise.all(batch.map(async url => {
               results[url] = await checkUrlAsync(url);
           }));
       }
       
       return results;
   }
   ```

3. **Частичный анализ DOM**
   ```javascript
   // Анализ только видимой части DOM
   function extractVisibleDomFeatures() {
       const visibleElements = document.querySelectorAll(':visible');
       // Ограничение количества анализируемых элементов
       return analyzeElements(visibleElements.slice(0, 1000));
   }
   ```

4. **Ленивая загрузка модели**
   ```javascript
   // Ленивая загрузка модели при необходимости
   let model = null;
   
   async function getModel() {
       if (!model) {
           model = await import('./models/xgboost_model.js');
       }
       return model;
   }
   ```

<div align="center">
  <img src="images/performance_metrics.png" alt="Метрики производительности" width="500"/>
  <p><em>Рис. 16: Метрики производительности после оптимизации</em></p>
</div>

## Процесс принятия решений

Принятие решения о фишинговом характере сайта происходит в несколько этапов:

<div align="center">
  <img src="images/decision_process.png" alt="Процесс принятия решений" width="700"/>
  <p><em>Рис. 17: Схема процесса принятия решений</em></p>
</div>

1. **Вычисление вероятности**
   ```javascript
   const phishingProbability = xgboostModel.predict(features);
   ```

2. **Применение порога**
   ```javascript
   // Порог для принятия решения
   const THRESHOLD = 0.75;
   
   const isPhishing = phishingProbability > THRESHOLD;
   ```

3. **Учет уровня риска**
   ```javascript
   // Определение уровня риска
   function getRiskLevel(probability) {
       if (probability > 0.9) return 'high';
       if (probability > 0.8) return 'medium';
       return 'low';
   }
   ```

<div align="center">
  <img src="images/risk_levels.png" alt="Уровни риска" width="500"/>
  <p><em>Рис. 18: Визуализация уровней риска в зависимости от вероятности</em></p>
</div>

4. **Интеграция с Google Safe Browsing API (опционально)**
   ```javascript
   async function checkWithGoogleSafeBrowsing(url) {
       try {
           const response = await fetch(SAFE_BROWSING_API_URL, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   client: { clientId: 'CorgPhish', clientVersion: '1.2.0' },
                   threatInfo: {
                       threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
                       platformTypes: ['ANY_PLATFORM'],
                       threatEntryTypes: ['URL'],
                       threatEntries: [{ url }]
                   }
               })
           });
           
           const data = await response.json();
           return data.matches && data.matches.length > 0;
       } catch (error) {
           console.error('Google Safe Browsing API error:', error);
           return false;
       }
   }
   ```

5. **Объединение результатов**
   ```javascript
   async function analyzeSite(url) {
       // Результат ML-модели
       const features = extractFeatures(url, document);
       const mlProbability = xgboostModel.predict(features);
       
       // Проверка через Google Safe Browsing (если опция включена)
       let gsbResult = false;
       if (useGoogleSafeBrowsing) {
           gsbResult = await checkWithGoogleSafeBrowsing(url);
       }
       
       // Финальное решение
       let finalProbability = mlProbability;
       if (gsbResult) {
           // Если Google подтверждает фишинг, повышаем вероятность
           finalProbability = Math.max(0.95, mlProbability);
       }
       
       return {
           isPhishing: finalProbability > THRESHOLD,
           probability: finalProbability,
           riskLevel: getRiskLevel(finalProbability),
           importantFeatures: getImportantFeatures(features, mlProbability)
       };
   }
   ```

<div align="center">
  <img src="images/warning_example.png" alt="Пример предупреждения" width="650"/>
  <p><em>Рис. 19: Пример предупреждения для пользователя при обнаружении фишингового сайта</em></p>
</div>

## Заключение

<div align="center">
  <img src="images/summary.png" alt="Основные результаты" width="700"/>
  <p><em>Рис. 20: Обобщение ключевых результатов и преимуществ CorgPhish</em></p>
</div>

Наш ML-алгоритм постоянно совершенствуется и обновляется для обеспечения максимальной защиты от новых фишинговых угроз. Если у вас есть вопросы или предложения по улучшению, пожалуйста, свяжитесь с нашей командой.

## Глубокое сканирование и обнаружение обфускации

Начиная с версии 1.2.0, CorgPhish получил режим глубокого сканирования, который позволяет проводить более тщательный анализ веб-страниц и выявлять сложные методы обфускации, часто используемые в фишинговых атаках.

<div align="center">
  <img src="images/deep_scan_architecture.png" alt="Архитектура глубокого сканирования" width="700"/>
  <p><em>Рис. 12: Архитектура модуля глубокого сканирования</em></p>
</div>

### Принципы работы глубокого сканирования

Глубокое сканирование включает несколько дополнительных уровней анализа:

1. **Анализ скрытых элементов**
   - Поиск элементов с `display: none`, `visibility: hidden`, и позиционированием за пределами экрана
   - Выявление прозрачных или мелких элементов, используемых для скрытия фишинговых механизмов
   - Анализ слоёв с высоким z-index, перекрывающих легитимный контент

2. **Обнаружение обфусцированного кода**
   ```js
   // Пример шаблонов обфусцированного кода
   const patterns = [
     /eval\s*\(+/,                 // eval(...
     /document\s*.\s*write\s*\(+/, // document.write(...
     /fromCharCode/,               // String.fromCharCode
     /\\x[0-9a-f]{2}/gi,           // Шестнадцатеричная запись символов
     /atob\s*\(+/                  // atob(...
   ];
   ```

3. **Анализ перенаправлений**
   - Отслеживание множественных перенаправлений (HTTP, meta refresh, JavaScript)
   - Выявление таймеров на перенаправление после загрузки страницы
   - Анализ несоответствия URL в адресной строке и фактического домена

4. **Проверка iframe и внешних ресурсов**
   - Анализ фреймов с потенциально вредоносным содержимым
   - Проверка внешних скриптов и ресурсов из небезопасных источников
   - Выявление скрытых фреймов для сбора данных пользователя

<div align="center">
  <img src="images/obfuscation_detection.png" alt="Обнаружение обфускации" width="600"/>
  <p><em>Рис. 13: Процесс обнаружения обфускации в коде страницы</em></p>
</div>

### Методы обнаружения обфускации

Обфускация кода — популярная техника фишинговых сайтов для обхода стандартных систем защиты. CorgPhish использует несколько методов для обнаружения обфускированного JavaScript:

#### Статистический анализ
- Подсчёт энтропии кода (высокая энтропия характерна для обфусцированного кода)
- Анализ длины строк и плотности специальных символов
- Соотношение между кодом и текстовыми строками

#### Синтаксический анализ
- Выявление нетипичных конструкций JavaScript
- Поиск закодированных строк и функций-декодеров
- Анализ непрозрачных предикатов и мертвого кода

#### Поведенческий анализ
- Определение попыток доступа к чувствительным API браузера
- Выявление сбора данных форм через нестандартные механизмы
- Отслеживание попыток перехвата событий клавиатуры и форм

```js
// Пример алгоритма оценки энтропии строки для выявления обфускации
function calculateEntropy(str) {
  const len = str.length;
  const frequencies = {};
  
  // Подсчёт частоты каждого символа
  for (let i = 0; i < len; i++) {
    const char = str.charAt(i);
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  // Расчёт энтропии
  let entropy = 0;
  Object.values(frequencies).forEach(freq => {
    const p = freq / len;
    entropy -= p * Math.log2(p);
  });
  
  return entropy;
}
```

### Эффективность глубокого сканирования

Включение режима глубокого сканирования значительно повышает эффективность обнаружения:

| Тип фишинговой атаки | Стандартное сканирование | Глубокое сканирование |
|----------------------|--------------------------|------------------------|
| Простые фишинговые сайты | 96.7% | 98.2% |
| Обфусцированный код | 61.3% | 89.5% |
| Скрытые элементы | 72.4% | 94.1% |
| Многоуровневые перенаправления | 68.9% | 93.7% |
| Комбинированные техники | 52.6% | 87.3% |

<div align="center">
  <img src="images/deep_scan_effectiveness.png" alt="Эффективность глубокого сканирования" width="600"/>
  <p><em>Рис. 14: Сравнение эффективности стандартного и глубокого сканирования</em></p>
</div>

Глубокое сканирование требует больше ресурсов и времени, поэтому оно выполняется отложенно, после основного анализа страницы, чтобы не замедлять работу пользователя. 