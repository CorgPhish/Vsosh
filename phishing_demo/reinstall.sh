#!/bin/bash

echo "===== ПОЛНАЯ ПЕРЕУСТАНОВКА РАСШИРЕНИЯ CORGPHISH ====="

# Остановка демо-сервера
echo "1. Останавливаем демо-сервер..."
./phishing_demo/stop_demo.sh

# Удаление кэша расширения
echo "2. Удаляем временные файлы..."
rm -rf phishing_demo/demo_sites/extension/browser_extension/temp/* 2>/dev/null

# Обновление версии расширения
echo "3. Обновляем версию расширения..."
TIMESTAMP=$(date +%s)
MANIFEST_FILE="phishing_demo/demo_sites/extension/browser_extension/manifest.json"
TMP_FILE=$(mktemp)

# Меняем версию в manifest
cat $MANIFEST_FILE | sed "s/\"version\": \".*\"/\"version\": \"1.0.$TIMESTAMP\"/" > $TMP_FILE
cp $TMP_FILE $MANIFEST_FILE

# Добавляем cache-busting комментарии в Javascript файлы
echo "4. Обновляем кэш в JavaScript файлах..."
JS_FILES=(
  "phishing_demo/demo_sites/extension/browser_extension/js/content.js"
  "phishing_demo/demo_sites/extension/browser_extension/js/xgboost_model.js"
  "phishing_demo/demo_sites/extension/browser_extension/js/service-worker.js"
  "phishing_demo/demo_sites/extension/browser_extension/js/demo_detector.js"
  "phishing_demo/demo_sites/extension/browser_extension/js/force_warning.js"
  "phishing_demo/demo_sites/extension/browser_extension/js/block_localhost.js"
  "phishing_demo/demo_sites/extension/browser_extension/js/inject_warning.js"
)

for js_file in "${JS_FILES[@]}"; do
  if [ -f "$js_file" ]; then
    echo "   - Обновляем $js_file"
    echo "// CACHE-BUSTING: $TIMESTAMP - $(date)" > $TMP_FILE
    cat "$js_file" >> $TMP_FILE
    cp $TMP_FILE "$js_file"
  fi
done

# Создадим инструкции для переустановки расширения
echo "5. Создаем инструкции для переустановки расширения..."
cat > phishing_demo/demo_sites/extension/REINSTALL.txt << EOL
=== ИНСТРУКЦИИ ПО ПЕРЕУСТАНОВКЕ РАСШИРЕНИЯ ===

1. Откройте chrome://extensions/
2. Найдите расширение CorgPhish и нажмите на корзину (удалить)
3. Включите "Режим разработчика" (переключатель в правом верхнем углу)
4. Нажмите "Загрузить распакованное расширение"
5. Выберите папку: 
   $PWD/phishing_demo/demo_sites/extension/browser_extension
6. Перезагрузите страницы с демо-сайтами

Версия расширения: 1.0.$TIMESTAMP ($(date))
EOL

# Удаляем временный файл
rm -f $TMP_FILE

echo "6. Обновление завершено! Новая версия: 1.0.$TIMESTAMP"
echo ""
echo "=== ВАЖНО: НЕОБХОДИМО ВРУЧНУЮ ПЕРЕУСТАНОВИТЬ РАСШИРЕНИЕ ==="
echo "Инструкции: phishing_demo/demo_sites/extension/REINSTALL.txt"
echo ""
echo "7. Запускаем демо-сервер..."

# Запускаем демо-сервер заново
cd phishing_demo && bash run_demo.sh 