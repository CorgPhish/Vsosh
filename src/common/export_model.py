#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
export_model.py - Скрипт для экспорта модели XGBoost в формат JavaScript

Этот скрипт загружает обученную модель XGBoost, сериализует её в JavaScript-совместимый формат
и создаёт файл xgboost_model.js, который можно использовать в браузерном расширении.
"""

import os
import sys
import json
import numpy as np
import pickle
import logging
from datetime import datetime
from pathlib import Path

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("CorgPhish-Export")

# Определение путей
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR
MODELS_DIR = os.path.join(BACKEND_DIR, "classifier", "models")
FRONTEND_DIR = os.path.join(Path(BASE_DIR).parent, "frontend")
FRONTEND_JS_DIR = os.path.join(FRONTEND_DIR, "js")
OUTPUT_FILE = os.path.join(FRONTEND_JS_DIR, "xgboost_model.js")

def load_model(model_path):
    """
    Загружает модель XGBoost из файла
    
    Args:
        model_path (str): Путь к файлу модели
    
    Returns:
        object: Загруженная модель XGBoost или None в случае ошибки
    """
    try:
        logger.info(f"Загрузка модели из {model_path}")
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        logger.info(f"Модель успешно загружена")
        return model
    except Exception as e:
        logger.error(f"Ошибка при загрузке модели: {e}")
        return None

def export_xgboost_trees(model):
    """
    Экспортирует деревья из модели XGBoost в JSON-формат
    
    Args:
        model: Модель XGBoost
    
    Returns:
        list: Список деревьев в JSON-формате
    """
    try:
        # Получаем все деревья из модели
        trees = []
        booster = model.get_booster()
        tree_info = booster.get_dump(dump_format='json')
        
        for i, tree_str in enumerate(tree_info):
            tree = json.loads(tree_str)
            trees.append(tree)
        
        logger.info(f"Успешно экспортировано {len(trees)} деревьев")
        return trees
    except Exception as e:
        logger.error(f"Ошибка при экспорте деревьев: {e}")
        return []

def generate_javascript_code(trees, feature_names):
    """
    Генерирует JavaScript-код для модели XGBoost
    
    Args:
        trees (list): Список деревьев в JSON-формате
        feature_names (list): Список имен признаков
    
    Returns:
        str: JavaScript-код модели
    """
    # Преобразуем деревья в JSON-строку
    trees_json = json.dumps(trees, indent=2)
    
    # Создаем JavaScript код
    javascript_code = f"""
/**
 * xgboost_model.js - CorgPhish XGBoost модель для детекции фишинга
 * 
 * Сгенерировано автоматически: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
 * Количество деревьев: {len(trees)}
 */

const XGBoostModel = (function() {{
  // Модель XGBoost (деревья решений)
  const trees = {trees_json};
  
  // Имена признаков
  const featureNames = {json.dumps(feature_names)};
  
  /**
   * Извлекает признаки из URL для классификации
   * @param {{string}} url - URL для анализа
   * @returns {{Object}} Объект с признаками
   */
  function extractFeatures(url) {{
    // Создаем URL объект для разбора
    let urlObj;
    try {{
      urlObj = new URL(url);
    }} catch (e) {{
      // Если URL невалидный, пробуем добавить протокол
      try {{
        urlObj = new URL('http://' + url);
      }} catch (e2) {{
        console.error('Невозможно разобрать URL:', url);
        return null;
      }}
    }}
    
    // Полный URL
    const fullUrl = url;
    
    // Домен и путь
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    // Признаки на основе URL
    const features = {{
      // Длина URL
      url_length: fullUrl.length,
      
      // Количество точек в домене
      domain_dot_count: (domain.match(/\./g) || []).length,
      
      // Длина домена
      domain_length: domain.length,
      
      // Содержит ли URL IP-адрес
      has_ip: /\\d+\\.\\d+\\.\\d+\\.\\d+/.test(domain) ? 1 : 0,
      
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
      special_char_count: (fullUrl.match(/[!$%^&*()+=|/\\\\{{}}\\[\\]:;"'<>?#]/g) || []).length,
      
      // Количество цифр в домене
      domain_digit_count: (domain.match(/\\d/g) || []).length,
      
      // Соотношение цифр к длине домена
      domain_digit_ratio: domain.length > 0 ? ((domain.match(/\\d/g) || []).length / domain.length) : 0,
      
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
    }};
    
    return features;
  }}
  
  /**
   * Выполняет предсказание по одному дереву
   * @param {{Object}} features - Признаки для классификации
   * @param {{Object}} tree - Дерево решений
   * @returns {{number}} Предсказание дерева
   */
  function predictTree(features, tree) {{
    // Рекурсивная функция для обхода дерева
    function traverse(node) {{
      // Если узел является листом, возвращаем его значение
      if ('leaf' in node) {{
        return node.leaf;
      }}
      
      // Получаем значение признака
      const featureName = featureNames[node.split_feature];
      const featureValue = features[featureName] || 0;
      
      // Переходим к левому или правому поддереву
      if (featureValue <= node.threshold) {{
        return traverse(node.yes);
      }} else {{
        return traverse(node.no);
      }}
    }}
    
    // Начинаем с корня дерева
    return traverse(tree);
  }}
  
  /**
   * Выполняет предсказание на основе модели XGBoost
   * @param {{Object}} features - Признаки для классификации
   * @returns {{Object}} Результат предсказания
   */
  function predict(features) {{
    // Если признаки не получены, возвращаем ошибку
    if (!features) {{
      return {{
        is_phishing: false,
        probability: 0.5,
        score: 50,
        reasons: ["Не удалось извлечь признаки из URL"]
      }};
    }}
    
    // Получаем предсказания всех деревьев
    let sum = 0;
    for (let i = 0; i < trees.length; i++) {{
      sum += predictTree(features, trees[i]);
    }}
    
    // Применяем сигмоидную функцию для получения вероятности
    const probability = 1 / (1 + Math.exp(-sum));
    
    // Определяем причины (feature importance)
    const reasons = getReasons(features);
    
    // Возвращаем результат
    return {{
      is_phishing: probability > 0.5,
      probability: probability,
      score: Math.round((1 - probability) * 100),
      reasons: reasons
    }};
  }}
  
  /**
   * Получает список причин (на основе наиболее важных признаков)
   * @param {{Object}} features - Признаки для классификации
   * @returns {{Array}} Список причин
   */
  function getReasons(features) {{
    const reasons = [];
    
    // Проверяем наиболее важные признаки и добавляем соответствующие причины
    if (features.has_ip === 1) {{
      reasons.push("URL содержит IP-адрес вместо доменного имени");
    }}
    
    if (features.has_at_symbol === 1) {{
      reasons.push("URL содержит символ @, что может использоваться для маскировки настоящего домена");
    }}
    
    if (features.url_length > 100) {{
      reasons.push("URL слишком длинный, что может указывать на попытку скрыть перенаправление");
    }}
    
    if (features.has_suspicious_words === 1) {{
      reasons.push("URL содержит подозрительные слова (login, bank, secure и т.д.)");
    }}
    
    if (features.has_cyrillic === 1) {{
      reasons.push("URL содержит кириллические символы, что может использоваться для маскировки");
    }}
    
    if (features.subdomain_level > 3) {{
      reasons.push("URL содержит слишком много поддоменов");
    }}
    
    if (features.has_redirect_param === 1) {{
      reasons.push("URL содержит параметры перенаправления");
    }}
    
    if (features.special_char_count > 5) {{
      reasons.push("URL содержит необычно много специальных символов");
    }}
    
    if (features.domain_hyphen_count > 2) {{
      reasons.push("Домен содержит много дефисов, что может использоваться для фишинга");
    }}
    
    if (features.is_https === 0) {{
      reasons.push("Сайт не использует защищенное соединение (HTTPS)");
    }}
    
    // Если причин нет, но вероятность высокая, добавляем общую причину
    if (reasons.length === 0) {{
      reasons.push("Комбинация признаков URL соответствует фишинговым сайтам");
    }}
    
    return reasons;
  }}
  
  /**
   * Проверяет URL на фишинг
   * @param {{string}} url - URL для проверки
   * @returns {{Object}} Результат проверки
   */
  function checkUrl(url) {{
    console.log(`[XGBoostModel] Проверка URL: ${{url}}`);
    
    // Извлекаем признаки из URL
    const features = extractFeatures(url);
    console.log('[XGBoostModel] Извлеченные признаки:', features);
    
    // Выполняем предсказание
    const result = predict(features);
    console.log('[XGBoostModel] Результат предсказания:', result);
    
    return result;
  }}
  
  // Публичное API
  return {{
    checkUrl,
    predict,
    extractFeatures
  }};
}}());

// Для работы в Node.js (если скрипт запускается в Node)
if (typeof module !== 'undefined' && module.exports) {{
  module.exports = XGBoostModel;
}}
"""
    return javascript_code


def main():
    """
    Основная функция для экспорта модели
    """
    logger.info("Запуск экспорта XGBoost модели в JavaScript")
    
    # Проверяем наличие необходимых директорий
    if not os.path.exists(MODELS_DIR):
        logger.error(f"Директория моделей не найдена: {MODELS_DIR}")
        return False
    
    # Проверяем и создаем директорию для JavaScript-файлов
    if not os.path.exists(FRONTEND_JS_DIR):
        os.makedirs(FRONTEND_JS_DIR)
        logger.info(f"Создана директория: {FRONTEND_JS_DIR}")
    
    # Путь к модели (сначала проверяем наличие модели для русскоязычных сайтов)
    model_ru_path = os.path.join(MODELS_DIR, "xgboost_model_ru.pkl")
    model_path = os.path.join(MODELS_DIR, "xgboost_model.pkl")
    
    if os.path.exists(model_ru_path):
        logger.info(f"Найдена модель для русскоязычных сайтов: {model_ru_path}")
        model_file = model_ru_path
    elif os.path.exists(model_path):
        logger.info(f"Найдена общая модель: {model_path}")
        model_file = model_path
    else:
        logger.error("Модель XGBoost не найдена. Убедитесь, что вы обучили модель.")
        return False
    
    # Загружаем модель
    model = load_model(model_file)
    if model is None:
        logger.error("Не удалось загрузить модель. Прерывание экспорта.")
        return False
    
    # Получаем имена признаков
    features_path = os.path.join(MODELS_DIR, "features.json")
    if os.path.exists(features_path):
        with open(features_path, 'r') as f:
            feature_names = json.load(f)
    else:
        # Если файл с признаками не найден, используем стандартный набор
        logger.warning("Файл с признаками не найден. Используем стандартный набор признаков.")
        feature_names = [
            "url_length", "domain_dot_count", "domain_length", "has_ip", 
            "has_at_symbol", "subdomain_count", "path_length", "query_param_count",
            "has_cyrillic", "is_https", "has_tilde", "has_underscore", 
            "special_char_count", "domain_digit_count", "domain_digit_ratio", 
            "has_redirect_param", "tld_length", "has_suspicious_words", 
            "subdomain_level", "has_port", "domain_hyphen_count", "domain_hyphen_ratio"
        ]
    
    # Экспортируем деревья из модели
    trees = export_xgboost_trees(model)
    if not trees:
        logger.error("Не удалось экспортировать деревья из модели. Прерывание экспорта.")
        return False
    
    # Генерируем JavaScript-код
    js_code = generate_javascript_code(trees, feature_names)
    
    # Сохраняем JavaScript-код в файл
    try:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(js_code)
        logger.info(f"JavaScript-файл успешно сохранен: {OUTPUT_FILE}")
        return True
    except Exception as e:
        logger.error(f"Ошибка при сохранении JavaScript-файла: {e}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 