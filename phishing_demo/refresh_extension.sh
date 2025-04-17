#!/bin/bash

echo "Обновление расширения CorgPhish и очистка кэша..."

# Остановим сервер, если он запущен
./phishing_demo/stop_demo.sh

# Очистка временных файлов расширения (если есть)
rm -rf phishing_demo/demo_sites/extension/browser_extension/temp/* 2>/dev/null

# Добавим временную метку к файлам JavaScript для обхода кэширования
TIMESTAMP=$(date +%s)

# Обновим manifest.json, добавив версию с timestamp
MANIFEST_FILE="phishing_demo/demo_sites/extension/browser_extension/manifest.json"
TMP_FILE=$(mktemp)

# Меняем версию в manifest
cat $MANIFEST_FILE | sed "s/\"version\": \".*\"/\"version\": \"1.0.$TIMESTAMP\"/" > $TMP_FILE
cp $TMP_FILE $MANIFEST_FILE

# Добавляем комментарий в начало content.js, чтобы избежать кэширования
echo "// Cache-busting: $TIMESTAMP" > $TMP_FILE
cat phishing_demo/demo_sites/extension/browser_extension/js/content.js >> $TMP_FILE
cp $TMP_FILE phishing_demo/demo_sites/extension/browser_extension/js/content.js

# Добавляем комментарий в начало xgboost_model.js
echo "// Cache-busting: $TIMESTAMP" > $TMP_FILE
cat phishing_demo/demo_sites/extension/browser_extension/js/xgboost_model.js >> $TMP_FILE
cp $TMP_FILE phishing_demo/demo_sites/extension/browser_extension/js/xgboost_model.js

# Добавляем комментарий в начало service-worker.js
echo "// Cache-busting: $TIMESTAMP" > $TMP_FILE
cat phishing_demo/demo_sites/extension/browser_extension/js/service-worker.js >> $TMP_FILE
cp $TMP_FILE phishing_demo/demo_sites/extension/browser_extension/js/service-worker.js

# Создадим дополнительный файл с инструкциями для пользователя
cat > phishing_demo/demo_sites/extension/browser_extension/REFRESH.txt << EOL
Для полного обновления расширения:
1. Откройте chrome://extensions/
2. Включите "Режим разработчика"
3. Нажмите "Обновить" (круговая стрелка)
4. Перезагрузите страницы с демо-сайтами
EOL

# Удаляем временный файл
rm -f $TMP_FILE

echo "Обновление завершено! Версия: 1.0.$TIMESTAMP"
echo "Запускаем демо-сервер..."

# Запускаем демо-сервер заново
cd phishing_demo && bash run_demo.sh 