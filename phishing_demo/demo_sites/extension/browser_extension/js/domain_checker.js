/**
 * domain_checker.js - Модуль проверки доменов для расширения CorgPhish
 * 
 * Этот файл содержит функции для проверки сходства доменов
 * и выявления возможных фишинговых доменов.
 */

console.log('[CorgPhish] Загрузка модуля проверки доменов');

// Получаем доступ к общему хранилищу данных
if (!self.CorgPhishData) {
  console.error('[CorgPhish] Ошибка: CorgPhishData не инициализирован. Запустите сначала xgboost_model.js');
  self.CorgPhishData = {
    officialDomains: [],
    criticalDomains: [],
    initialized: false
  };
}

// Локальная ссылка на списки доменов
const popularDomainsForChecker = self.CorgPhishData.officialDomains || [];
const criticalDomainsForChecker = self.CorgPhishData.criticalDomains || [];

/**
 * Вычисляет сходство между двумя строками
 * @param {string} s1 - Первая строка
 * @param {string} s2 - Вторая строка
 * @returns {number} Процент сходства (от 0 до 100)
 */
function stringSimilarity(s1, s2) {
  // Здесь можно использовать любой алгоритм сравнения строк, например:
  // - Расстояние Левенштейна
  // - N-граммное сравнение и т.д.
  
  // Для примера используем простой алгоритм на основе расстояния Левенштейна
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 100; // Обе строки пустые
  
  const distance = levenshteinDistance(s1, s2);
  return Math.round((1 - distance / maxLength) * 100);
}

/**
 * Вычисляет расстояние Левенштейна между двумя строками
 * @param {string} a - Первая строка
 * @param {string} b - Вторая строка
 * @returns {number} Расстояние Левенштейна
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Инициализация
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  // Заполнение матрицы
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Замена
          matrix[i][j - 1] + 1,     // Вставка
          matrix[i - 1][j] + 1      // Удаление
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Проверяет, является ли домен подозрительным
 * @param {string} domain - Домен для проверки
 * @returns {object} Результат проверки
 */
function isDomainSuspicious(domain) {
  if (!domain) return { suspicious: false };
  
  // Очищаем домен от www и других распространенных префиксов
  const cleanDomain = domain.replace(/^(www\.|m\.|login\.|secure\.|app\.|mail\.)/i, '').toLowerCase();
  
  for (const popularDomain of popularDomainsForChecker) {
    // Пропускаем, если домен точно совпадает с популярным или является его поддоменом
    if (cleanDomain === popularDomain.toLowerCase() || 
        cleanDomain.endsWith('.' + popularDomain.toLowerCase())) {
      continue;
    }
    
    // Проверяем на случай опечаток или похожей замены букв
    if (cleanDomain.includes(popularDomain.split('.')[0].toLowerCase())) {
      // Домен содержит популярное название, но не является точным совпадением
      return {
        suspicious: true,
        similarTo: popularDomain,
        similarity: 80,
        reason: `Домен содержит название ${popularDomain.split('.')[0]} в своем имени`
      };
    }
    
    // Проверка на опечатки с помощью расстояния Левенштейна
    const baseDomainA = cleanDomain.split('.')[0];
    const baseDomainB = popularDomain.split('.')[0].toLowerCase();
    
    // Строки должны быть не слишком короткими для сравнения
    if (baseDomainB.length >= 4 && baseDomainA.length >= 4) {
      const similarity = stringSimilarity(baseDomainA, baseDomainB);
      
      // Если сходство высокое, но не идентичное
      if (similarity >= 70 && similarity < 100) {
        return {
          suspicious: true,
          similarTo: popularDomain,
          similarity: similarity,
          reason: `Домен похож на ${popularDomain} (${similarity}% сходства)`
        };
      }
    }
  }
  
  // Отдельно проверяем критичные домены с более строгими критериями
  for (const criticalDomain of criticalDomainsForChecker) {
    // Проверка на сходство с критичными доменами
    const baseDomainA = cleanDomain.split('.')[0];
    const baseDomainB = criticalDomain.split('.')[0].toLowerCase();
    
    // Для критичных доменов используем более низкий порог
    if (baseDomainB.length >= 3 && baseDomainA.length >= 3) {
      const similarity = stringSimilarity(baseDomainA, baseDomainB);
      
      // Более строгий порог для критичных доменов
      if (similarity >= 65) {
        return {
          suspicious: true,
          similarTo: criticalDomain,
          similarity: similarity,
          reason: `Домен похож на критически важный ${criticalDomain} (${similarity}% сходства)`
        };
      }
    }
  }
  
  return { suspicious: false };
}

/**
 * Проверяет домен на опечатки и сходство с популярными сайтами
 * @param {string} domain - Домен для проверки
 * @returns {object} Результат проверки
 */
function checkDomainTypos(domain) {
  console.log(`[CorgPhish] Проверка опечаток для домена: ${domain}`);
  
  try {
    const result = isDomainSuspicious(domain);
    
    if (result.suspicious) {
      console.log(`[CorgPhish] Домен ${domain} подозрительный: ${result.reason}`);
    } else {
      console.log(`[CorgPhish] Домен ${domain} не похож на популярные сайты`);
    }
    
    return result;
  } catch (error) {
    console.error('[CorgPhish] Ошибка при проверке домена на опечатки:', error);
    return { suspicious: false };
  }
}

// Экспортируем функции для использования в других модулях
self.isDomainSuspicious = isDomainSuspicious;
self.checkDomainTypos = checkDomainTypos;
self.stringSimilarity = stringSimilarity;

console.log('[CorgPhish] Модуль проверки доменов успешно загружен'); 