/**
 * domains.js - Функции для работы с белыми и черными списками доменов
 */

// Встроенный список известных фишинговых доменов для демонстрации
const BLACKLISTED_DOMAINS = [
  'phishing-example.com',
  'secure-banking-login.info',
  'login-account-secure.com',
  'verification-required-account.com',
  'account-security-check.info',
  'login-verification-service.com',
  'secure-payment-verify.com',
  'account-confirm-secure.com',
  'banking-secure-login.com',
  'verify-account-now.info'
];

// Встроенный список известных безопасных доменов для демонстрации
const WHITELISTED_DOMAINS = [
  'google.com',
  'yandex.ru',
  'mail.ru',
  'github.com',
  'youtube.com',
  'wikipedia.org',
  'vk.com',
  'ok.ru',
  'apple.com',
  'microsoft.com'
];

/**
 * Проверяет, находится ли домен в белом списке
 * 
 * @param {string} domain - Домен для проверки
 * @returns {boolean} - true если домен в белом списке
 */
export function isDomainInWhitelist(domain) {
  if (!domain) return false;
  
  // Сначала проверяем встроенные домены
  if (isInList(domain, WHITELISTED_DOMAINS)) {
    return true;
  }
  
  // Затем проверяем пользовательский белый список
  const userWhitelist = getUserWhitelist();
  return isInList(domain, userWhitelist);
}

/**
 * Проверяет, находится ли домен в черном списке
 * 
 * @param {string} domain - Домен для проверки
 * @returns {boolean} - true если домен в черном списке
 */
export function isDomainInBlacklist(domain) {
  if (!domain) return false;
  
  // Проверяем встроенные домены
  if (isInList(domain, BLACKLISTED_DOMAINS)) {
    return true;
  }
  
  // Проверяем пользовательский черный список
  const userBlacklist = getUserBlacklist();
  return isInList(domain, userBlacklist);
}

/**
 * Получает пользовательский белый список из хранилища
 * 
 * @returns {Array<string>} - Список доменов
 */
function getUserWhitelist() {
  // Это синхронная функция, но в реальном расширении
  // здесь будет асинхронное получение данных из хранилища
  try {
    // В демо-режиме просто возвращаем пустой массив
    return [];
  } catch (error) {
    console.error('Ошибка при получении белого списка:', error);
    return [];
  }
}

/**
 * Получает пользовательский черный список из хранилища
 * 
 * @returns {Array<string>} - Список доменов
 */
function getUserBlacklist() {
  // Это синхронная функция, но в реальном расширении
  // здесь будет асинхронное получение данных из хранилища
  try {
    // В демо-режиме просто возвращаем пустой массив
    return [];
  } catch (error) {
    console.error('Ошибка при получении черного списка:', error);
    return [];
  }
}

/**
 * Проверяет, входит ли домен в список доменов
 * 
 * @param {string} domain - Домен для проверки
 * @param {Array<string>} list - Список доменов
 * @returns {boolean} - true если домен или его родительский домен в списке
 */
function isInList(domain, list) {
  // Проверяем точное совпадение
  if (list.includes(domain)) {
    return true;
  }
  
  // Проверяем, является ли домен поддоменом любого домена из списка
  return list.some(item => {
    // Проверяем, заканчивается ли домен на .item
    return domain.endsWith(`.${item}`);
  });
}

/**
 * Добавляет домен в пользовательский белый список
 * 
 * @param {string} domain - Домен для добавления
 */
export function addToWhitelist(domain) {
  if (!domain) return;
  
  // В реальном расширении здесь будет асинхронное сохранение в хранилище
  console.log(`Добавление домена ${domain} в белый список`);
}

/**
 * Добавляет домен в пользовательский черный список
 * 
 * @param {string} domain - Домен для добавления
 */
export function addToBlacklist(domain) {
  if (!domain) return;
  
  // В реальном расширении здесь будет асинхронное сохранение в хранилище
  console.log(`Добавление домена ${domain} в черный список`);
}

/**
 * Удаляет домен из пользовательского белого списка
 * 
 * @param {string} domain - Домен для удаления
 */
export function removeFromWhitelist(domain) {
  if (!domain) return;
  
  // В реальном расширении здесь будет асинхронное удаление из хранилища
  console.log(`Удаление домена ${domain} из белого списка`);
}

/**
 * Удаляет домен из пользовательского черного списка
 * 
 * @param {string} domain - Домен для удаления
 */
export function removeFromBlacklist(domain) {
  if (!domain) return;
  
  // В реальном расширении здесь будет асинхронное удаление из хранилища
  console.log(`Удаление домена ${domain} из черного списка`);
} 