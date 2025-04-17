# Инструкция по исправлению проекта CorgPhish

## Выявленные проблемы

1. Дублирующаяся структура файлов в папках `src/model` и `src/extension`
2. Отсутствуют некоторые важные файлы в папке `src/model` (about.html, warning.html, settings.js и др.)
3. Скрипт сборки `build.py` не согласован с текущей структурой проекта

## Шаги по исправлению

### 1. Удалить папку `src/model` и использовать только `src/extension`

Структура папки `src/extension` уже содержит все необходимые файлы. Нужно внести изменения в скрипт сборки `build.py`, чтобы он использовал только эту структуру.

### 2. Исправить скрипт сборки build.py

Замените следующие строки в файле `build.py`:

```python
# Пути директорий
SRC_DIR = "src"
DIST_DIR = "dist"
EXTENSION_SRC = os.path.join(SRC_DIR, "extension")
EXTENSION_DIST = os.path.join(DIST_DIR, "browser_extension")
MODEL_SRC = os.path.join(SRC_DIR, "model")
MODEL_TRAINING_DIST = os.path.join(DIST_DIR, "model_training")
DOCS_DIR = "docs"
```

на:

```python
# Пути директорий
SRC_DIR = "src"
DIST_DIR = "dist"
EXTENSION_SRC = os.path.join(SRC_DIR, "extension")
EXTENSION_DIST = os.path.join(DIST_DIR, "browser_extension")
MODEL_TRAINING_DIST = os.path.join(DIST_DIR, "model_training")
DOCS_DIR = "docs"
```

### 3. Исправить функцию build_model() в build.py

Замените функцию `build_model()` на следующую:

```python
def build_model():
    """Собирает и экспортирует модель машинного обучения"""
    print_header("Подготовка модели машинного обучения")
    
    # Проверяем, существует ли скрипт экспорта модели
    export_script = os.path.join(SRC_DIR, "common", "export_model.py")
    
    if os.path.exists(export_script):
        print("Запуск скрипта экспорта модели...")
        try:
            subprocess.run([sys.executable, export_script], check=True)
            print("Модель успешно экспортирована.")
        except subprocess.CalledProcessError:
            print("ОШИБКА: Не удалось экспортировать модель!")
    else:
        print("ВНИМАНИЕ: Скрипт экспорта модели не найден. Используем предварительно обученную модель.")
    
    # Копируем модель в директорию расширения
    model_js = os.path.join(EXTENSION_SRC, "js", "models", "xgboost_model.js")
    dst_model_js = os.path.join(EXTENSION_DIST, "js", "models", "xgboost_model.js")
    
    if os.path.exists(model_js):
        ensure_dir(os.path.dirname(dst_model_js))
        shutil.copy2(model_js, dst_model_js)
        print("Модель скопирована в директорию расширения.")
    else:
        print("ОШИБКА: Модель не найдена!")
```

### 4. Исправить функцию build_model_training_tools() в build.py

Замените функцию `build_model_training_tools()` на следующую:

```python
def build_model_training_tools():
    """Подготавливает инструменты для обучения модели"""
    print_header("Подготовка инструментов для обучения модели")
    
    # Создаем директории
    ensure_dir(MODEL_TRAINING_DIST)
    ensure_dir(os.path.join(MODEL_TRAINING_DIST, "classifier"))
    ensure_dir(os.path.join(MODEL_TRAINING_DIST, "dataset"))
    ensure_dir(os.path.join(MODEL_TRAINING_DIST, "utilities"))
    
    # Копируем файлы из исходной директории
    print("Копирование файлов классификатора...")
    if os.path.exists(os.path.join(SRC_DIR, "common", "classifier")):
        copy_directory(
            os.path.join(SRC_DIR, "common", "classifier"),
            os.path.join(MODEL_TRAINING_DIST, "classifier")
        )
    
    print("Копирование файлов датасета...")
    if os.path.exists(os.path.join(SRC_DIR, "common", "dataset")):
        copy_directory(
            os.path.join(SRC_DIR, "common", "dataset"),
            os.path.join(MODEL_TRAINING_DIST, "dataset")
        )
    
    print("Копирование утилит...")
    if os.path.exists(os.path.join(SRC_DIR, "common", "utilities")):
        copy_directory(
            os.path.join(SRC_DIR, "common", "utilities"),
            os.path.join(MODEL_TRAINING_DIST, "utilities")
        )
    
    print("Подготовка инструментов для обучения модели завершена.")
```

### 5. Перенести export_model.py в папку src/common

Файл `export_model.py` находится в `src/model`, но его нужно перенести в `src/common`.

### 6. Проверить работоспособность после исправлений

После внесения всех изменений запустите скрипт сборки и проверьте, что все работает корректно:

```bash
python build.py
```

## Дополнительные рекомендации

1. Добавьте комментарии к коду для лучшей читаемости
2. Убедитесь, что все пути в `manifest.json` правильно указывают на существующие файлы
3. Рассмотрите возможность добавления автоматических тестов для проверки работоспособности расширения

## Итоговая структура проекта

```
CorgPhish/
├── src/
│   ├── extension/        # Основная директория расширения
│   │   ├── css/          # CSS стили
│   │   ├── html/         # HTML файлы интерфейса
│   │   │   ├── about.html
│   │   │   ├── popup.html
│   │   │   └── warning.html
│   │   ├── icons/        # Иконки расширения
│   │   ├── images/       # Изображения для интерфейса
│   │   ├── js/           # JavaScript файлы
│   │   │   ├── content.js
│   │   │   ├── popup.js
│   │   │   ├── service-worker.js
│   │   │   ├── settings.js
│   │   │   ├── models/   # Файлы моделей ML
│   │   │   └── utils/    # Вспомогательные утилиты
│   │   └── manifest.json # Манифест расширения
│   └── common/           # Общие компоненты
│       ├── classifier/    # Код классификатора
│       ├── dataset/       # Датасеты для обучения
│       ├── utilities/     # Общие утилиты
│       └── export_model.py # Скрипт экспорта модели
├── dist/                 # Директория для сборки (создается автоматически)
├── docs/                 # Документация
├── build.py              # Скрипт сборки
├── README.md             # Общее описание проекта
├── LICENSE.md            # Лицензия
└── CONTRIBUTING.md       # Информация для контрибьюторов
``` 