#!/bin/bash

# Скрипт для генерации SVG-изображений для демонстрационных сайтов

echo "Генерация SVG-изображений для демонстрационных сайтов..."

# Убедимся, что директории существуют
mkdir -p demo_sites/bank-phish/images
mkdir -p demo_sites/crypto-phish/images
mkdir -p demo_sites/email-login/images

# Создаем SVG для банка
cat > demo_sites/bank-phish/images/fake-bank-logo.svg << EOL
<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="40" fill="#005b96"/>
  <text x="15" y="25" font-family="Arial" font-size="16" font-weight="bold" fill="white">SitiBank</text>
</svg>
EOL

# Создаем SVG для иконки замка
cat > demo_sites/bank-phish/images/lock-icon.svg << EOL
<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6a2 2 0 00-2 2v10c0 1.1.9 2 2 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a3 3 0 110-6 3 3 0 010 6zm3-9H9v-2a3 3 0 116 0v2z" fill="#777777"/>
</svg>
EOL

# Создаем SVG для криптобиржи
cat > demo_sites/crypto-phish/images/fake-crypto-logo.svg << EOL
<svg width="160" height="60" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="80" fill="#4866FF"/>
  <text x="20" y="45" font-family="Arial" font-size="20" font-weight="bold" fill="white">CryptoVault</text>
  <circle cx="160" cy="40" r="15" fill="#ffc107" stroke="white" stroke-width="2"/>
</svg>
EOL

# Создаем SVG для почты
cat > demo_sites/email-login/images/fake-mail-logo.svg << EOL
<svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="40" fill="#ffcc00"/>
  <text x="20" y="25" font-family="Arial" font-size="16" font-weight="bold" fill="black">CloudMail</text>
</svg>
EOL

# Преобразуем SVG в PNG с помощью Base64
echo "<?php
// Этот PHP-скрипт конвертирует SVG в PNG при запросе
header('Content-Type: image/png');
readfile('fake-bank-logo.svg');
?>" > demo_sites/bank-phish/images/fake-bank-logo.png

echo "<?php
header('Content-Type: image/png');
readfile('lock-icon.svg');
?>" > demo_sites/bank-phish/images/lock-icon.png

echo "<?php
header('Content-Type: image/png');
readfile('fake-crypto-logo.svg');
?>" > demo_sites/crypto-phish/images/fake-crypto-logo.png

echo "<?php
header('Content-Type: image/png');
readfile('fake-mail-logo.svg');
?>" > demo_sites/email-login/images/fake-mail-logo.png

# Копируем SVG как PNG если PHP не доступен
cp demo_sites/bank-phish/images/fake-bank-logo.svg demo_sites/bank-phish/images/fake-bank-logo.png
cp demo_sites/bank-phish/images/lock-icon.svg demo_sites/bank-phish/images/lock-icon.png
cp demo_sites/crypto-phish/images/fake-crypto-logo.svg demo_sites/crypto-phish/images/fake-crypto-logo.png
cp demo_sites/email-login/images/fake-mail-logo.svg demo_sites/email-login/images/fake-mail-logo.png

echo "SVG-изображения созданы успешно."
echo "Готово!" 