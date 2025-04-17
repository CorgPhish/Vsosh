#!/bin/bash

# CorgPhish Demo Server Launcher Script
# Использует встроенный Python HTTP-сервер вместо Node.js

echo "Запуск демонстрационного сервера CorgPhish..."

# Проверяем, установлен ли Python
if ! command -v python3 &> /dev/null; then
    if command -v python &> /dev/null; then
        PYTHON_CMD="python"
        echo "Используем команду python для запуска сервера."
    else
        echo "Ошибка: Python не установлен. Пожалуйста, убедитесь, что Python установлен в вашей системе."
        exit 1
    fi
else
    PYTHON_CMD="python3"
    echo "Используем команду python3 для запуска сервера."
fi

# Получаем абсолютный путь к директории скрипта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DIST_DIR="$(cd "$SCRIPT_DIR/../dist" &> /dev/null && pwd)"

# Проверяем, существует ли директория dist
if [ ! -d "$DIST_DIR/browser_extension" ]; then
    echo "Ошибка: Директория с собранным расширением не найдена."
    echo "Сначала запустите сборку проекта: python3 build.py"
    exit 1
fi

# Генерируем изображения для демо-сайтов
echo "Генерация изображений для демо-сайтов..."
if [ -f "$SCRIPT_DIR/generate_demo_images.sh" ]; then
    bash "$SCRIPT_DIR/generate_demo_images.sh"
else
    echo "Предупреждение: Скрипт generate_demo_images.sh не найден. Изображения могут отсутствовать."
fi

# Создаем директорию для копии расширения
echo "Настройка интеграции с расширением..."
mkdir -p "$SCRIPT_DIR/demo_sites/extension"
cp -r "$DIST_DIR/browser_extension/"* "$SCRIPT_DIR/demo_sites/extension/"

# Переходим в директорию demo_sites
cd "$SCRIPT_DIR/demo_sites" || exit 1

# Создаем индексный файл для корневой директории
cat > index.html << EOL
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CorgPhish Демонстрационные Сайты</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .phishing-warning {
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px 15px;
            margin: 20px 0;
            border-radius: 4px;
            border-left: 4px solid #f5c6cb;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            margin-bottom: 10px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        li a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }
        li a:hover {
            text-decoration: underline;
        }
        .status {
            font-size: 0.8em;
            padding: 3px 8px;
            border-radius: 10px;
        }
        .ready {
            background-color: #d4edda;
            color: #155724;
        }
        .description {
            margin-bottom: 30px;
        }
        .extension-info {
            background-color: #e7f5ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .extension-instructions {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
        }
        .instruction-step {
            margin-bottom: 10px;
            padding-left: 20px;
            position: relative;
        }
        .instruction-step:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #007bff;
        }
        .chrome-install {
            margin-top: 20px;
            padding: 15px;
            background-color: #f0f9ff;
            border-radius: 4px;
        }
        .chrome-install ol {
            margin-left: 20px;
        }
        .demo-url {
            font-family: monospace;
            background-color: #f5f5f5;
            padding: 3px 5px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>CorgPhish Демонстрационные Сайты</h1>
    
    <div class="phishing-warning">
        <strong>Внимание:</strong> Следующие ссылки ведут на симулированные фишинговые сайты, созданные исключительно в образовательных и тестовых целях. 
        Эти сайты предназначены для демонстрации того, как CorgPhish обнаруживает различные типы фишинговых попыток.
    </div>
    
    <div class="extension-info">
        <strong>Расширение CorgPhish:</strong> Этот демо-сервер интегрирован с браузерным расширением CorgPhish.
        <div class="extension-instructions">
            <p><strong>Чтобы использовать расширение с этими демо-сайтами:</strong></p>
            <div class="instruction-step">Убедитесь, что расширение CorgPhish установлено в вашем браузере</div>
            <div class="instruction-step">Если оно не установлено, установите его через Chrome Web Store или из директории расширения</div>
            <div class="instruction-step">После установки расширение должно автоматически обнаруживать фишинговые сайты</div>
        </div>
        
        <div class="chrome-install">
            <p><strong>Установка из директории расширения:</strong></p>
            <ol>
                <li>Откройте <span class="demo-url">chrome://extensions/</span> в браузере Chrome</li>
                <li>Включите «Режим разработчика» в правом верхнем углу</li>
                <li>Нажмите «Загрузить распакованное расширение»</li>
                <li>Выберите папку <span class="demo-url">$DIST_DIR/browser_extension</span></li>
            </ol>
        </div>
    </div>
    
    <div class="description">
        <p>Эти демо-сайты демонстрируют различные типы фишинговых атак, которые CorgPhish предназначен обнаруживать. 
        Каждый сайт был создан для имитации распространенных фишинговых сценариев, оставаясь при этом полностью безопасным для тестирования.</p>
        <p>Выберите сайт ниже для изучения:</p>
    </div>
    
    <ul>
        <li>
            <span>Bank Phish</span>
            <a href="/bank-phish/index.html">Посетить демо-сайт</a>
        </li>
        <li>
            <span>Crypto Phish</span>
            <a href="/crypto-phish/index.html">Посетить демо-сайт</a>
        </li>
        <li>
            <span>Email Login</span>
            <a href="/email-login/index.html">Посетить демо-сайт</a>
        </li>
    </ul>
</body>
</html>
EOL

# Запускаем Python HTTP-сервер на порту 3000
echo "Запуск HTTP-сервера на http://localhost:3000"
echo "Демонстрационные сайты доступны по адресу: http://localhost:3000/"
echo "Нажмите Ctrl+C для остановки сервера"

# Проверяем, свободен ли порт 3000
if command -v nc &> /dev/null && command -v lsof &> /dev/null; then
    if lsof -i:3000 &> /dev/null; then
        echo "Порт 3000 уже занят. Пожалуйста, закройте процесс, использующий этот порт, и попробуйте снова."
        exit 1
    fi
fi

# Запускаем сервер в фоновом режиме с записью логов
"$PYTHON_CMD" -m http.server 3000 > "$SCRIPT_DIR/phishing_demo.log" 2>&1 &

PYTHON_PID=$!
echo "Сервер запущен с PID: $PYTHON_PID"
echo "Демонстрационный сервер запущен в фоновом режиме."
echo "Для просмотра логов используйте: tail -f $SCRIPT_DIR/phishing_demo.log"
echo "Чтобы остановить сервер, выполните: kill $PYTHON_PID"

# Открываем браузер с демо-страницей (если доступно)
if command -v open &> /dev/null; then
    echo "Открываем демо-страницу в браузере..."
    open "http://localhost:3000/"
elif command -v xdg-open &> /dev/null; then
    echo "Открываем демо-страницу в браузере..."
    xdg-open "http://localhost:3000/"
elif command -v start &> /dev/null; then
    echo "Открываем демо-страницу в браузере..."
    start "http://localhost:3000/"
else
    echo "Демо-страница доступна по адресу: http://localhost:3000/"
fi

# Создаем скрипт для остановки сервера
cat > "$SCRIPT_DIR/stop_demo.sh" << EOL
#!/bin/bash
echo "Останавливаем демонстрационный сервер CorgPhish..."
if ps -p $PYTHON_PID > /dev/null; then
    kill $PYTHON_PID
    echo "Сервер остановлен."
else
    echo "Сервер уже остановлен."
fi
EOL

chmod +x "$SCRIPT_DIR/stop_demo.sh"
echo "Для остановки сервера запустите: $SCRIPT_DIR/stop_demo.sh" 