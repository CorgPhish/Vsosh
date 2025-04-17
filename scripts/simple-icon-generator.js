/**
 * Простой генератор иконок для расширения CorgPhish
 * 
 * Этот скрипт создает базовые PNG иконки размером 16, 48 и 128 пикселей,
 * а также предупреждающую иконку для уведомлений.
 * 
 * Для запуска: node simple-icon-generator.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Пути к папкам
const iconsDir = path.join(__dirname, '../src/extension/icons');
const notificationDir = path.join(iconsDir, 'notification');

// Создаем папки, если они не существуют
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(notificationDir)) {
  fs.mkdirSync(notificationDir, { recursive: true });
}

/**
 * Создает простую иконку расширения
 * @param {number} size - Размер иконки в пикселях
 */
function createExtensionIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Фон
  ctx.fillStyle = '#1a73e8';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Щит
  const shieldWidth = size * 0.6;
  const shieldHeight = size * 0.7;
  const shieldX = (size - shieldWidth) / 2;
  const shieldY = (size - shieldHeight) / 2;
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(shieldX, shieldY + shieldHeight * 0.2);
  ctx.lineTo(shieldX, shieldY + shieldHeight * 0.8);
  ctx.quadraticCurveTo(
    shieldX, shieldY + shieldHeight,
    shieldX + shieldWidth / 2, shieldY + shieldHeight
  );
  ctx.quadraticCurveTo(
    shieldX + shieldWidth, shieldY + shieldHeight,
    shieldX + shieldWidth, shieldY + shieldHeight * 0.8
  );
  ctx.lineTo(shieldX + shieldWidth, shieldY + shieldHeight * 0.2);
  ctx.quadraticCurveTo(
    shieldX + shieldWidth / 2, shieldY - shieldHeight * 0.1,
    shieldX, shieldY + shieldHeight * 0.2
  );
  ctx.fill();
  
  // Галочка внутри щита
  const checkSize = size * 0.3;
  const checkX = size / 2 - checkSize / 2;
  const checkY = size / 2;
  
  ctx.strokeStyle = '#1a73e8';
  ctx.lineWidth = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(checkX, checkY);
  ctx.lineTo(checkX + checkSize * 0.4, checkY + checkSize * 0.5);
  ctx.lineTo(checkX + checkSize, checkY - checkSize * 0.5);
  ctx.stroke();
  
  // Сохраняем иконку
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buffer);
  console.log(`Создана иконка размером ${size}x${size}`);
}

/**
 * Создает предупреждающую иконку
 */
function createWarningIcon() {
  const size = 128;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Фон
  ctx.fillStyle = '#d93025';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Треугольник предупреждения
  const triangleSize = size * 0.6;
  const triangleX = (size - triangleSize) / 2;
  const triangleY = (size - triangleSize) / 2;
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(triangleX + triangleSize / 2, triangleY);
  ctx.lineTo(triangleX + triangleSize, triangleY + triangleSize);
  ctx.lineTo(triangleX, triangleY + triangleSize);
  ctx.closePath();
  ctx.fill();
  
  // Восклицательный знак
  const exclamationWidth = size * 0.08;
  const exclamationHeight = size * 0.3;
  const exclamationX = size / 2 - exclamationWidth / 2;
  const exclamationY = triangleY + triangleSize * 0.3;
  
  ctx.fillStyle = '#d93025';
  ctx.beginPath();
  ctx.rect(exclamationX, exclamationY, exclamationWidth, exclamationHeight);
  ctx.fill();
  
  // Точка восклицательного знака
  const dotSize = size * 0.08;
  const dotX = size / 2 - dotSize / 2;
  const dotY = exclamationY + exclamationHeight + size * 0.05;
  
  ctx.beginPath();
  ctx.arc(dotX + dotSize / 2, dotY + dotSize / 2, dotSize / 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Сохраняем иконку
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, 'warning-icon.png'), buffer);
  
  // Сохраняем копию в папку уведомлений
  fs.writeFileSync(path.join(notificationDir, 'warning.png'), buffer);
  console.log('Создана предупреждающая иконка');
}

// Создаем все необходимые иконки
createExtensionIcon(16);
createExtensionIcon(48);
createExtensionIcon(128);
createWarningIcon();

console.log('Все иконки созданы успешно'); 