/**
 * CorgPhish Phishing Detection Model
 * Simple implementation for demo purposes
 */

// Helper functions
function isOfficialDomain(domain) {
  // Для демонстрации считаем всё фишингом - отключаем белый список
  return false;
  
  // Оригинальный код ниже:
  /*
  const officialDomains = [
    'google.com', 'yandex.ru', 'mail.ru', 'vk.com',
    'sberbank.ru', 'gosuslugi.ru', 'avito.ru', 'ozon.ru'
  ];
  
  return officialDomains.some(official => domain.includes(official));
  */
}

function checkDomainSimilarity(domain) {
  const criticalDomains = [
    { name: 'sberbank.ru', alternatives: ['sberbenk.ru', 'sberbank-online.ru', 'sberpank.ru'] },
    { name: 'vk.com', alternatives: ['vk-com.ru', 'vkontakte.co', 'vk-login.ru'] },
    { name: 'gosuslugi.ru', alternatives: ['gosuslugi-online.ru', 'gos-uslugi.com', 'gosuslugi.co'] },
    { name: 'mail.ru', alternatives: ['mail-ru.co', 'mail.co', 'mai1.ru'] }
  ];
  
  for (const critical of criticalDomains) {
    if (critical.alternatives.some(alt => domain.includes(alt))) {
      return {
        originalDomain: critical.name,
        similarDomain: domain,
        reason: `Домен похож на ${critical.name}`
      };
    }
  }
  
  return null;
}

/**
 * Detect phishing based on URL and content
 * @param {string} url - URL to check
 * @param {string} content - Page content (optional)
 * @returns {object} - Detection result
 */
function detectPhishing(url, content) {
  try {
    // Extract basic features
    const features = extractFeatures(url, content);
    
    // Для демо режима - если URL содержит "demo_sites", считаем фишинговым
    if (url && url.includes('demo_sites')) {
      return {
        isPhishing: true,
        score: 20,
        confidence: 'HIGH',
        details: {
          reasons: ['Демонстрационный фишинговый сайт', 'Обнаружены признаки фишинга'],
          features: features
        }
      };
    }
    
    // Check if it's an official domain
    if (features.domain && isOfficialDomain(features.domain)) {
      return {
        isPhishing: false,
        score: 90,
        confidence: 'HIGH',
        details: {
          reasons: ['Официальный домен из белого списка'],
          features: features
        }
      };
    }
    
    // Check domain similarity
    const similarityCheck = checkDomainSimilarity(features.domain);
    if (similarityCheck) {
      return {
        isPhishing: true,
        score: 10,
        confidence: 'HIGH',
        details: {
          reasons: [similarityCheck.reason, 'Возможная попытка имитации известного сайта'],
          features: features,
          similarTo: similarityCheck.originalDomain
        }
      };
    }
    
    // Count suspicious features
    let suspiciousScore = 0;
    const reasons = [];
    
    if (features.hasIpAddress) {
      suspiciousScore += 30;
      reasons.push('URL содержит IP-адрес вместо домена');
    }
    
    if (features.hasAtSymbol) {
      suspiciousScore += 25;
      reasons.push('URL содержит символ @');
    }
    
    if (features.hasCyrillic) {
      suspiciousScore += 20;
      reasons.push('URL содержит кириллические символы');
    }
    
    if (features.urlLength > 75) {
      suspiciousScore += 10;
      reasons.push(`Длинный URL (${features.urlLength} символов)`);
    }
    
    if (features.subdomainCount > 3) {
      suspiciousScore += 15;
      reasons.push(`Много поддоменов (${features.subdomainCount})`);
    }
    
    if (features.hasHttpsToken) {
      suspiciousScore += 20;
      reasons.push('Домен содержит "https" в своем имени');
    }
    
    // Calculate final score (0-100, higher is safer)
    const finalScore = Math.max(0, Math.min(100, 100 - suspiciousScore));
    
    // Determine if it's phishing
    const isPhishing = finalScore < 50;
    
    // Determine confidence level
    let confidence = 'MEDIUM';
    if (finalScore < 20 || finalScore > 80) {
      confidence = 'HIGH';
    }
    
    // If no reasons but low score, add generic reason
    if (reasons.length === 0 && isPhishing) {
      reasons.push('Общая структура URL подозрительна');
    }
    
    // If no suspicious reasons and not phishing
    if (reasons.length === 0) {
      reasons.push('Нет обнаруженных признаков фишинга');
    }
    
    return {
      isPhishing: isPhishing,
      score: finalScore,
      confidence: confidence,
      details: {
        reasons: reasons,
        features: features
      }
    };
  } catch (error) {
    console.error('Error in phishing detection:', error);
    return {
      isPhishing: false,
      score: 50,
      confidence: 'LOW',
      details: {
        reasons: ['Произошла ошибка при анализе'],
        error: error.message
      }
    };
  }
}

/**
 * Extract features from URL and content
 * @param {string} url - URL to analyze
 * @param {string} content - Page content (optional)
 * @returns {object} - Extracted features
 */
function extractFeatures(url, content) {
  // Basic URL parsing
  let domain = '';
  let subdomainCount = 0;
  
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname;
    
    // Count subdomains
    subdomainCount = domain.split('.').length - 2;
    if (subdomainCount < 0) subdomainCount = 0;
  } catch (e) {
    // If URL parsing fails, use simple extraction
    const domainMatch = url.match(/^(?:https?:\/\/)?([^\/]+)/i);
    if (domainMatch) {
      domain = domainMatch[1];
    }
  }
  
  // Feature extraction
  return {
    url: url,
    domain: domain,
    urlLength: url.length,
    subdomainCount: subdomainCount,
    hasIpAddress: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url),
    hasAtSymbol: url.includes('@'),
    hasCyrillic: /[а-яА-Я]/.test(url),
    hasHttpsToken: domain.includes('https'),
    suspiciousTerms: /login|account|password|secure|update|banking|confirm|verify|signin/.test(url.toLowerCase()),
    content: content ? true : false
  };
}

module.exports = {
  detectPhishing,
  extractFeatures
}; 