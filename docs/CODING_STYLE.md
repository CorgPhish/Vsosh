# Руководство по стилю кодирования CorgPhish

Этот документ содержит руководство по стилю кодирования для проекта CorgPhish. Следование этим правилам обеспечивает единообразие кода и упрощает его поддержку.

## Общие принципы

- **Читаемость**: Код должен быть легко читаемым и понятным
- **Простота**: Предпочитайте простые решения сложным
- **Документация**: Документируйте код, особенно публичные API
- **Тестирование**: Пишите тесты для нового кода
- **Последовательность**: Следуйте установленным правилам

## JavaScript

### Форматирование

- Используйте 2 пробела для отступов
- Максимальная длина строки: 100 символов
- Используйте одинарные кавычки (`'`) для строк
- Добавляйте точку с запятой (`;`) в конце выражений
- Используйте фигурные скобки для всех блоков, даже однострочных

```javascript
// Плохо
if (condition) doSomething();

// Хорошо
if (condition) {
  doSomething();
}
```

### Именование

- Используйте `camelCase` для переменных и функций
- Используйте `PascalCase` для классов и конструкторов
- Используйте `UPPER_CASE` для констант
- Используйте описательные имена

```javascript
// Плохо
const x = 5;
function fn() {}

// Хорошо
const MAX_ITEMS = 5;
function calculateTotalScore() {}
```

### Современные возможности JavaScript

- Используйте ES6+ синтаксис
- Предпочитайте стрелочные функции для анонимных функций
- Используйте деструктуризацию для объектов и массивов
- Используйте `const` по умолчанию, `let` при необходимости, избегайте `var`
- Используйте шаблонные строки для сложных строк
- Используйте spread и rest операторы где уместно

```javascript
// Пример правильного кода
const processData = (data) => {
  const { id, name } = data;
  const items = [...data.items];
  
  return {
    id,
    name,
    items: items.map((item) => ({
      ...item,
      processed: true
    }))
  };
};
```

### Комментарии

- Используйте JSDoc для документации функций и классов
- Комментируйте сложные участки кода
- Избегайте очевидных комментариев

```javascript
/**
 * Вычисляет риск фишинга на основе анализа URL и содержимого страницы
 * @param {Object} pageData Данные страницы
 * @param {string} pageData.url URL страницы
 * @param {Object} pageData.content Содержимое страницы
 * @returns {number} Оценка риска от 0 до 1
 */
function calculatePhishingRisk(pageData) {
  // Реализация
}
```

## Python

### Форматирование

- Следуйте PEP 8
- Используйте 4 пробела для отступов
- Максимальная длина строки: 88 символов (как в Black)
- Используйте двойные кавычки (`"`) для строк

### Именование

- Используйте `snake_case` для переменных и функций
- Используйте `PascalCase` для классов
- Используйте `UPPER_CASE` для констант
- Префикс `_` для "приватных" атрибутов и методов

```python
# Пример правильного именования
DEFAULT_TIMEOUT = 60

def calculate_feature_vector(url_data):
    pass

class FeatureExtractor:
    def extract(self, url):
        pass
    
    def _preprocess_url(self, url):
        pass
```

### Типизация

- Используйте аннотации типов для параметров и возвращаемых значений
- Используйте модуль `typing` для сложных типов

```python
from typing import Dict, List, Optional, Tuple

def extract_features(url: str) -> Dict[str, float]:
    """
    Извлекает признаки из URL для анализа.
    
    Args:
        url: URL для анализа
        
    Returns:
        Словарь признаков с их значениями
    """
    # Реализация
    return {}
```

### Документация

- Используйте docstrings в формате Google или NumPy
- Документируйте все публичные функции и классы
- Включайте примеры использования, где это полезно

## HTML/CSS

### HTML

- Используйте 2 пробела для отступов
- Используйте семантические теги HTML5
- Атрибуты оборачивайте в двойные кавычки
- Всегда указывайте альтернативный текст для изображений

```html
<section class="dashboard">
  <h2>Статистика обнаружения</h2>
  <div class="chart-container">
    <img src="chart.png" alt="График обнаружения фишинга">
  </div>
</section>
```

### CSS

- Используйте 2 пробела для отступов
- Используйте kebab-case для классов и идентификаторов
- Одно свойство на строку
- Пробел после двоеточия

```css
.phishing-alert {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}
```

## Исключения из правил

В некоторых случаях допустимо отклонение от принятых правил:

1. Когда следование правилу ухудшает читаемость кода
2. Для совместимости с существующим кодом
3. При использовании внешних библиотек с иными соглашениями

При отклонении от правил, добавляйте комментарий с объяснением.

## Инструменты форматирования

Для автоматизации форматирования рекомендуется использовать:

- **JavaScript**: ESLint + Prettier
- **Python**: Black + isort + flake8
- **HTML/CSS**: Prettier

В репозитории настроены pre-commit хуки для автоматической проверки стиля.

## Процесс ревью кода

Весь код должен проходить ревью перед принятием в основную ветку. При ревью кода обращайте внимание:

1. Соответствие стилю кодирования
2. Корректность реализации
3. Тестирование
4. Производительность
5. Безопасность

## Заключение

Это руководство не является исчерпывающим и может обновляться. В случаях, не описанных здесь, следуйте общепринятым соглашениям для соответствующего языка программирования. 