# Настройка среды разработки CorgPhish

Это руководство поможет вам настроить среду разработки для работы с проектом CorgPhish.

## Содержание

- [Предварительные требования](#предварительные-требования)
- [Настройка среды для разработки расширения](#настройка-среды-для-разработки-расширения)
- [Настройка среды для работы с ML-моделью](#настройка-среды-для-работы-с-ml-моделью)
- [Настройка IDE](#настройка-ide)
- [Настройка Git-hooks](#настройка-git-hooks)
- [Проверка настройки](#проверка-настройки)
- [Решение проблем](#решение-проблем)

## Предварительные требования

Для работы с проектом CorgPhish вам понадобится:

- **Python** 3.8 или выше
- **Node.js** 14.x или выше
- **Git**
- **Chrome** или **Firefox** для тестирования расширения
- Доступ к командной строке

## Настройка среды для разработки расширения

### 1. Клонирование репозитория

```bash
git clone https://github.com/physcorgi/CorgPhish.git
cd CorgPhish
```

### 2. Установка зависимостей

```bash
# Установка Python-зависимостей
pip install -r requirements.txt

# Установка Node.js-зависимостей (если используются)
npm install
```

### 3. Создание файла конфигурации

Создайте файл `.env` в корневой директории проекта:

```
# .env
GOOGLE_SAFE_BROWSING_API_KEY=YOUR_API_KEY
DEBUG_MODE=true
```

> Примечание: Замените `YOUR_API_KEY` на ваш ключ Google Safe Browsing API или используйте значение по умолчанию для разработки.

## Настройка среды для работы с ML-моделью

### 1. Установка дополнительных зависимостей для ML

```bash
pip install -r requirements-ml.txt
```

### 2. Загрузка предварительно обученной модели (опционально)

```bash
python scripts/download_model.py
```

## Настройка IDE

### Visual Studio Code

1. Установите расширения:
   - Python
   - JavaScript (ES6) code snippets
   - ESLint
   - Prettier
   - Web Extension

2. Рекомендуемые настройки VSCode (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "javascript.format.enable": true,
  "eslint.validate": ["javascript"],
  "files.associations": {
    "manifest.json": "jsonc"
  }
}
```

### PyCharm

1. Откройте директорию проекта
2. Настройте интерпретатор Python:
   - Настройки → Проект → Интерпретатор Python
   - Выберите Python 3.8+
3. Настройте форматирование кода:
   - Настройки → Редактор → Стиль кода
   - Для Python: используйте PEP 8
   - Для JavaScript: используйте ESLint

## Настройка Git-hooks

Для настройки pre-commit хуков:

```bash
# Установка pre-commit
pip install pre-commit

# Настройка хуков
pre-commit install
```

Это настроит автоматические проверки перед коммитом, включая форматирование кода и линтинг.

## Проверка настройки

Чтобы проверить, что все настроено правильно:

```bash
# Сборка проекта
python build.py

# Запуск тестов
pytest tests/

# Запуск линтера
flake8 src/
```

## Запуск расширения в режиме разработки

### Chrome

1. Откройте `chrome://extensions/`
2. Включите "Режим разработчика"
3. Нажмите "Загрузить распакованное"
4. Выберите папку `dist/browser_extension` в проекте

### Firefox

1. Откройте `about:debugging#/runtime/this-firefox`
2. Нажмите "Загрузить временное дополнение..."
3. Выберите файл `manifest.json` в папке `dist/browser_extension`

## Решение проблем

### Проблемы с зависимостями Python

Если у вас возникли проблемы с установкой зависимостей:

```bash
# Обновите pip
pip install --upgrade pip

# Создайте виртуальное окружение
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate

# Установите зависимости в виртуальное окружение
pip install -r requirements.txt
```

### Проблемы с доступом в Chrome/Firefox

Если расширение не получает необходимые разрешения:
1. Убедитесь, что в `manifest.json` указаны все необходимые разрешения
2. Переустановите расширение
3. Перезапустите браузер

### Проблемы с загрузкой модели

Если возникли проблемы с загрузкой ML-модели:
1. Проверьте подключение к интернету
2. Убедитесь, что у вас достаточно места на диске
3. Попробуйте загрузить модель вручную из [репозитория моделей](https://github.com/physcorgi/CorgPhish-models)

## Дополнительные ресурсы

- [Руководство по разработке расширений Chrome](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [Руководство по разработке расширений Firefox](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Документация TensorFlow.js](https://www.tensorflow.org/js) 