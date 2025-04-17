/**
 * xgboost_model.js - Предварительно экспортированная модель XGBoost
 * 
 * Этот файл содержит модель машинного обучения XGBoost, преобразованную в JavaScript.
 * Модель готова к использованию сразу после установки расширения, без необходимости
 * запуска дополнительных скриптов.
 * 
 * Сгенерировано автоматически: 2025-03-29 11:40:24
 * Количество деревьев: 5
 */

const XGBoostModel = (function() {
  // Модель XGBoost (деревья решений)
  const trees = [
  {
    "nodeid": 0,
    "depth": 0,
    "split": "f13",
    "split_condition": 0.786820233,
    "yes": 1,
    "no": 2,
    "missing": 2,
    "children": [
      {
        "nodeid": 1,
        "depth": 1,
        "split": "f3",
        "split_condition": -1.09332025,
        "yes": 3,
        "no": 4,
        "missing": 4,
        "children": [
          {
            "nodeid": 3,
            "depth": 2,
            "split": "f7",
            "split_condition": -1.03770304,
            "yes": 7,
            "no": 8,
            "missing": 8,
            "children": [
              {
                "nodeid": 7,
                "leaf": 0.0817046613
              },
              {
                "nodeid": 8,
                "leaf": -0.157978237
              }
            ]
          },
          {
            "nodeid": 4,
            "depth": 2,
            "split": "f9",
            "split_condition": -1.46130836,
            "yes": 9,
            "no": 10,
            "missing": 10,
            "children": [
              {
                "nodeid": 9,
                "leaf": -0.0361976251
              },
              {
                "nodeid": 10,
                "leaf": 0.127688736
              }
            ]
          }
        ]
      },
      {
        "nodeid": 2,
        "depth": 1,
        "split": "f18",
        "split_condition": 1.41261756,
        "yes": 5,
        "no": 6,
        "missing": 6,
        "children": [
          {
            "nodeid": 5,
            "depth": 2,
            "split": "f3",
            "split_condition": 3.00152564,
            "yes": 11,
            "no": 12,
            "missing": 12,
            "children": [
              {
                "nodeid": 11,
                "leaf": -0.16096808
              },
              {
                "nodeid": 12,
                "leaf": 0.0402327888
              }
            ]
          },
          {
            "nodeid": 6,
            "depth": 2,
            "split": "f2",
            "split_condition": 1.32472181,
            "yes": 13,
            "no": 14,
            "missing": 14,
            "children": [
              {
                "nodeid": 13,
                "leaf": 0.153446347
              },
              {
                "nodeid": 14,
                "leaf": -0.1215114
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "nodeid": 0,
    "depth": 0,
    "split": "f13",
    "split_condition": -0.257033259,
    "yes": 1,
    "no": 2,
    "missing": 2,
    "children": [
      {
        "nodeid": 1,
        "depth": 1,
        "split": "f3",
        "split_condition": -1.70219064,
        "yes": 3,
        "no": 4,
        "missing": 4,
        "children": [
          {
            "nodeid": 3,
            "depth": 2,
            "split": "f16",
            "split_condition": -0.304065257,
            "yes": 7,
            "no": 8,
            "missing": 8,
            "children": [
              {
                "nodeid": 7,
                "leaf": 0.0531848781
              },
              {
                "nodeid": 8,
                "leaf": -0.136085689
              }
            ]
          },
          {
            "nodeid": 4,
            "depth": 2,
            "split": "f9",
            "split_condition": -1.97302902,
            "yes": 9,
            "no": 10,
            "missing": 10,
            "children": [
              {
                "nodeid": 9,
                "leaf": -0.0486483797
              },
              {
                "nodeid": 10,
                "leaf": 0.123803213
              }
            ]
          }
        ]
      },
      {
        "nodeid": 2,
        "depth": 1,
        "split": "f18",
        "split_condition": 0.642312169,
        "yes": 5,
        "no": 6,
        "missing": 6,
        "children": [
          {
            "nodeid": 5,
            "depth": 2,
            "split": "f3",
            "split_condition": 2.24999452,
            "yes": 11,
            "no": 12,
            "missing": 12,
            "children": [
              {
                "nodeid": 11,
                "leaf": -0.129330635
              },
              {
                "nodeid": 12,
                "leaf": 0.00297677936
              }
            ]
          },
          {
            "nodeid": 6,
            "depth": 2,
            "split": "f17",
            "split_condition": -1.46591353,
            "yes": 13,
            "no": 14,
            "missing": 14,
            "children": [
              {
                "nodeid": 13,
                "leaf": -0.156041682
              },
              {
                "nodeid": 14,
                "leaf": 0.121075109
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "nodeid": 0,
    "depth": 0,
    "split": "f13",
    "split_condition": 0.786820233,
    "yes": 1,
    "no": 2,
    "missing": 2,
    "children": [
      {
        "nodeid": 1,
        "depth": 1,
        "split": "f3",
        "split_condition": -1.09332025,
        "yes": 3,
        "no": 4,
        "missing": 4,
        "children": [
          {
            "nodeid": 3,
            "depth": 2,
            "split": "f7",
            "split_condition": -1.03770304,
            "yes": 7,
            "no": 8,
            "missing": 8,
            "children": [
              {
                "nodeid": 7,
                "leaf": 0.0719637349
              },
              {
                "nodeid": 8,
                "leaf": -0.136115611
              }
            ]
          },
          {
            "nodeid": 4,
            "depth": 2,
            "split": "f18",
            "split_condition": 0.052108746,
            "yes": 9,
            "no": 10,
            "missing": 10,
            "children": [
              {
                "nodeid": 9,
                "leaf": 0.0405178405
              },
              {
                "nodeid": 10,
                "leaf": 0.154193625
              }
            ]
          }
        ]
      },
      {
        "nodeid": 2,
        "depth": 1,
        "split": "f2",
        "split_condition": -2.23225117,
        "yes": 5,
        "no": 6,
        "missing": 6,
        "children": [
          {
            "nodeid": 5,
            "depth": 2,
            "split": "f12",
            "split_condition": 0.374072701,
            "yes": 11,
            "no": 12,
            "missing": 12,
            "children": [
              {
                "nodeid": 11,
                "leaf": 0.131405517
              },
              {
                "nodeid": 12,
                "leaf": -0.0987247452
              }
            ]
          },
          {
            "nodeid": 6,
            "depth": 2,
            "split": "f3",
            "split_condition": 3.00152564,
            "yes": 13,
            "no": 14,
            "missing": 14,
            "children": [
              {
                "nodeid": 13,
                "leaf": -0.136400104
              },
              {
                "nodeid": 14,
                "leaf": 0.0146862864
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "nodeid": 0,
    "depth": 0,
    "split": "f13",
    "split_condition": -0.257033259,
    "yes": 1,
    "no": 2,
    "missing": 2,
    "children": [
      {
        "nodeid": 1,
        "depth": 1,
        "split": "f3",
        "split_condition": -1.70219064,
        "yes": 3,
        "no": 4,
        "missing": 4,
        "children": [
          {
            "nodeid": 3,
            "depth": 2,
            "split": "f16",
            "split_condition": -0.304065257,
            "yes": 7,
            "no": 8,
            "missing": 8,
            "children": [
              {
                "nodeid": 7,
                "leaf": 0.0513432026
              },
              {
                "nodeid": 8,
                "leaf": -0.116964363
              }
            ]
          },
          {
            "nodeid": 4,
            "depth": 2,
            "split": "f18",
            "split_condition": 0.120207153,
            "yes": 9,
            "no": 10,
            "missing": 10,
            "children": [
              {
                "nodeid": 9,
                "leaf": 0.0515417717
              },
              {
                "nodeid": 10,
                "leaf": 0.150310069
              }
            ]
          }
        ]
      },
      {
        "nodeid": 2,
        "depth": 1,
        "split": "f2",
        "split_condition": -0.178297728,
        "yes": 5,
        "no": 6,
        "missing": 6,
        "children": [
          {
            "nodeid": 5,
            "depth": 2,
            "split": "f12",
            "split_condition": -0.320037752,
            "yes": 11,
            "no": 12,
            "missing": 12,
            "children": [
              {
                "nodeid": 11,
                "leaf": 0.126779124
              },
              {
                "nodeid": 12,
                "leaf": -0.0826774314
              }
            ]
          },
          {
            "nodeid": 6,
            "depth": 2,
            "split": "f1",
            "split_condition": -1.4080776,
            "yes": 13,
            "no": 14,
            "missing": 14,
            "children": [
              {
                "nodeid": 13,
                "leaf": -0.0244779475
              },
              {
                "nodeid": 14,
                "leaf": -0.128855422
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "nodeid": 0,
    "depth": 0,
    "split": "f13",
    "split_condition": 0.786820233,
    "yes": 1,
    "no": 2,
    "missing": 2,
    "children": [
      {
        "nodeid": 1,
        "depth": 1,
        "split": "f3",
        "split_condition": -0.908301055,
        "yes": 3,
        "no": 4,
        "missing": 4,
        "children": [
          {
            "nodeid": 3,
            "depth": 2,
            "split": "f7",
            "split_condition": -1.03770304,
            "yes": 7,
            "no": 8,
            "missing": 8,
            "children": [
              {
                "nodeid": 7,
                "leaf": 0.078362532
              },
              {
                "nodeid": 8,
                "leaf": -0.122826852
              }
            ]
          },
          {
            "nodeid": 4,
            "depth": 2,
            "split": "f9",
            "split_condition": -0.811125338,
            "yes": 9,
            "no": 10,
            "missing": 10,
            "children": [
              {
                "nodeid": 9,
                "leaf": -0.0168457776
              },
              {
                "nodeid": 10,
                "leaf": 0.108089566
              }
            ]
          }
        ]
      },
      {
        "nodeid": 2,
        "depth": 1,
        "split": "f18",
        "split_condition": 1.45946109,
        "yes": 5,
        "no": 6,
        "missing": 6,
        "children": [
          {
            "nodeid": 5,
            "depth": 2,
            "split": "f3",
            "split_condition": 3.00152564,
            "yes": 11,
            "no": 12,
            "missing": 12,
            "children": [
              {
                "nodeid": 11,
                "leaf": -0.120207027
              },
              {
                "nodeid": 12,
                "leaf": 0.0362144075
              }
            ]
          },
          {
            "nodeid": 6,
            "depth": 2,
            "split": "f2",
            "split_condition": 1.32472181,
            "yes": 13,
            "no": 14,
            "missing": 14,
            "children": [
              {
                "nodeid": 13,
                "leaf": 0.139012054
              },
              {
                "nodeid": 14,
                "leaf": -0.109279789
              }
            ]
          }
        ]
      }
    ]
  }
];
  
  // Имена признаков
  const featureNames = ["url_length", "domain_dot_count", "domain_length", "has_ip", "has_at_symbol", "subdomain_count", "path_length", "query_param_count", "has_cyrillic", "is_https", "has_tilde", "has_underscore", "special_char_count", "domain_digit_count", "domain_digit_ratio", "has_redirect_param", "tld_length", "has_suspicious_words", "subdomain_level", "has_port", "domain_hyphen_count", "domain_hyphen_ratio"];
  
  /**
   * Извлекает признаки из URL для классификации
   * @param {string} url - URL для анализа
   * @returns {Object} Объект с признаками
   */
  function extractFeatures(url) {
    // Создаем URL объект для разбора
    let urlObj;
    try {
      urlObj = new URL(url);
    } catch (e) {
      // Если URL невалидный, пробуем добавить протокол
      try {
        urlObj = new URL('http://' + url);
      } catch (e2) {
        console.error('Невозможно разобрать URL:', url);
        return null;
      }
    }
    
    // Полный URL
    const fullUrl = url;
    
    // Домен и путь
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Признаки на основе URL
    const features = {
      // Длина URL
      url_length: fullUrl.length,
      
      // Количество точек в домене
      domain_dot_count: (domain.match(/\./g) || []).length,
      
      // Длина домена
      domain_length: domain.length,
      
      // Содержит ли URL IP-адрес
      has_ip: /\d+\.\d+\.\d+\.\d+/.test(domain) ? 1 : 0,
      
      // Содержит ли символ @
      has_at_symbol: fullUrl.includes('@') ? 1 : 0,
      
      // Количество поддоменов
      subdomain_count: domain.split('.').length - 1,
      
      // Длина пути
      path_length: path.length,
      
      // Количество параметров в запросе
      query_param_count: Array.from(urlObj.searchParams).length,
      
      // Содержит ли URL кириллические символы
      has_cyrillic: /[а-яА-Я]/.test(fullUrl) ? 1 : 0,
      
      // Использование HTTPS
      is_https: urlObj.protocol === 'https:' ? 1 : 0,
      
      // Содержит ли тильду
      has_tilde: fullUrl.includes('~') ? 1 : 0,
      
      // Содержит ли подчеркивание
      has_underscore: fullUrl.includes('_') ? 1 : 0,
      
      // Другие специальные символы
      special_char_count: (fullUrl.match(/[!$%^&*()+=|/\\{}\[\]:;"'<>?#]/g) || []).length,
      
      // Количество цифр в домене
      domain_digit_count: (domain.match(/\d/g) || []).length,
      
      // Соотношение цифр к длине домена
      domain_digit_ratio: domain.length > 0 ? ((domain.match(/\d/g) || []).length / domain.length) : 0,
      
      // Наличие редиректа в параметрах URL
      has_redirect_param: /[?&](redirect|url|link|goto|return|returnurl|returnto|return_url)=/i.test(fullUrl) ? 1 : 0,
      
      // Длина TLD (домена верхнего уровня)
      tld_length: domain.split('.').pop().length,
      
      // Наличие подозрительных слов в URL
      has_suspicious_words: /login|signin|account|password|secure|update|bank|confirm|verify|ebay|paypal|sign-in/i.test(fullUrl) ? 1 : 0,
      
      // Количество поддоменов
      subdomain_level: domain.split('.').length - 1,
      
      // Присутствие порта в URL
      has_port: urlObj.port ? 1 : 0,
      
      // Дефисы в домене
      domain_hyphen_count: (domain.match(/-/g) || []).length,
      
      // Соотношение дефисов к длине домена
      domain_hyphen_ratio: domain.length > 0 ? ((domain.match(/-/g) || []).length / domain.length) : 0
    };
    
    return features;
  }
  
  /**
   * Выполняет предсказание по одному дереву
   * @param {Object} features - Признаки для классификации
   * @param {Object} tree - Дерево решений
   * @returns {number} Предсказание дерева
   */
  function predictTree(features, tree) {
    // Рекурсивная функция для обхода дерева
    function traverse(node) {
      // Если узел является листом, возвращаем его значение
      if ('leaf' in node) {
        return node.leaf;
      }
      
      // Получаем значение признака
      const featureName = featureNames[node.split_feature];
      const featureValue = features[featureName] || 0;
      
      // Переходим к левому или правому поддереву
      if (featureValue <= node.threshold) {
        return traverse(node.yes);
      } else {
        return traverse(node.no);
      }
    }
    
    // Начинаем с корня дерева
    return traverse(tree);
  }
  
  /**
   * Выполняет предсказание на основе модели XGBoost
   * @param {Object} features - Признаки для классификации
   * @returns {Object} Результат предсказания
   */
  function predict(features) {
    // Если признаки не получены, возвращаем ошибку
    if (!features) {
      return {
        is_phishing: false,
        probability: 0.5,
        score: 50,
        reasons: ["Не удалось извлечь признаки из URL"]
      };
    }
    
    // Получаем предсказания всех деревьев
    let sum = 0;
    for (let i = 0; i < trees.length; i++) {
      sum += predictTree(features, trees[i]);
    }
    
    // Применяем сигмоидную функцию для получения вероятности
    const probability = 1 / (1 + Math.exp(-sum));
    
    // Определяем причины (feature importance)
    const reasons = getReasons(features);
    
    // Возвращаем результат
    return {
      is_phishing: probability > 0.5,
      probability: probability,
      score: Math.round((1 - probability) * 100),
      reasons: reasons
    };
  }
  
  /**
   * Получает список причин (на основе наиболее важных признаков)
   * @param {Object} features - Признаки для классификации
   * @returns {Array} Список причин
   */
  function getReasons(features) {
    const reasons = [];
    
    // Проверяем наиболее важные признаки и добавляем соответствующие причины
    if (features.has_ip === 1) {
      reasons.push("URL содержит IP-адрес вместо доменного имени");
    }
    
    if (features.has_at_symbol === 1) {
      reasons.push("URL содержит символ @, что может использоваться для маскировки настоящего домена");
    }
    
    if (features.url_length > 100) {
      reasons.push("URL слишком длинный, что может указывать на попытку скрыть перенаправление");
    }
    
    if (features.has_suspicious_words === 1) {
      reasons.push("URL содержит подозрительные слова (login, bank, secure и т.д.)");
    }
    
    if (features.has_cyrillic === 1) {
      reasons.push("URL содержит кириллические символы, что может использоваться для маскировки");
    }
    
    if (features.subdomain_level > 3) {
      reasons.push("URL содержит слишком много поддоменов");
    }
    
    if (features.has_redirect_param === 1) {
      reasons.push("URL содержит параметры перенаправления");
    }
    
    if (features.special_char_count > 5) {
      reasons.push("URL содержит необычно много специальных символов");
    }
    
    if (features.domain_hyphen_count > 2) {
      reasons.push("Домен содержит много дефисов, что может использоваться для фишинга");
    }
    
    if (features.is_https === 0) {
      reasons.push("Сайт не использует защищенное соединение (HTTPS)");
    }
    
    // Если причин нет, но вероятность высокая, добавляем общую причину
    if (reasons.length === 0) {
      reasons.push("Комбинация признаков URL соответствует фишинговым сайтам");
    }
    
    return reasons;
  }
  
  /**
   * Проверяет URL на фишинг
   * @param {string} url - URL для проверки
   * @returns {Object} Результат проверки
   */
  function checkUrl(url) {
    console.log(`[XGBoostModel] Проверка URL: ${url}`);
    
    // Извлекаем признаки из URL
    const features = extractFeatures(url);
    console.log('[XGBoostModel] Извлеченные признаки:', features);
    
    // Выполняем предсказание
    const result = predict(features);
    console.log('[XGBoostModel] Результат предсказания:', result);
    
    return result;
  }
  
  // Публичное API
  return {
    checkUrl,
    predict,
    extractFeatures
  };
}());

// Для работы в Node.js (если скрипт запускается в Node)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XGBoostModel;
}
