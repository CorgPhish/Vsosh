#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Скрипт для прогнозирования фишинговых сайтов с использованием
обученных моделей с акцентом на русскоязычные сайты.
"""

import os
import sys
import json
import numpy as np
import pickle
import logging
import tldextract
from urllib.parse import urlparse
import re
import time
import argparse

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("predict_ru.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("PredictRU")

# Глобальные константы
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

# Проверяем, что необходимые директории существуют
for directory in [MODELS_DIR, PROCESSED_DIR]:
    if not os.path.exists(directory):
        logger.warning(f"Директория {directory} не существует. Создаем...")
        os.makedirs(directory)

def load_model(model_name="best_model_ru.pkl"):
    """Загружает модель из файла."""
    model_path = os.path.join(MODELS_DIR, model_name)
    
    if not os.path.exists(model_path):
        logger.error(f"Модель {model_path} не существует. Убедитесь, что модель обучена.")
        return None
    
    try:
        with open(model_path, "rb") as f:
            model = pickle.load(f)
        logger.info(f"Модель загружена из {model_path}")
        return model
    except Exception as e:
        logger.error(f"Ошибка при загрузке модели: {e}")
        return None

def load_scaler():
    """Загружает скейлер для предобработки признаков."""
    scaler_path = os.path.join(PROCESSED_DIR, "scaler_ru.pkl")
    
    if not os.path.exists(scaler_path):
        logger.error(f"Скейлер {scaler_path} не существует. Убедитесь, что данные предобработаны.")
        return None
    
    try:
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)
        logger.info(f"Скейлер загружен из {scaler_path}")
        return scaler
    except Exception as e:
        logger.error(f"Ошибка при загрузке скейлера: {e}")
        return None

def load_feature_names():
    """Загружает имена признаков."""
    info_path = os.path.join(PROCESSED_DIR, "feature_info_ru.json")
    
    if not os.path.exists(info_path):
        logger.warning("Информационный файл не найден. Используем общие имена признаков.")
        # Возвращаем общие имена признаков
        return [f"feature_{i}" for i in range(24)]
    
    try:
        with open(info_path, "r", encoding="utf-8") as f:
            feature_info = json.load(f)
        return feature_info["feature_names"]
    except Exception as e:
        logger.error(f"Ошибка при загрузке информации о признаках: {e}")
        return [f"feature_{i}" for i in range(24)]

def extract_features_from_url(url):
    """Извлекает признаки из URL-адреса."""
    features = {}
    
    # Анализируем URL
    try:
        parsed_url = urlparse(url)
        domain_info = tldextract.extract(url)
        domain = domain_info.domain + "." + domain_info.suffix
    except Exception as e:
        logger.warning(f"Ошибка при анализе URL {url}: {e}")
        return None
    
    # 1. Длина URL
    features["url_length"] = len(url)
    
    # 2. Длина домена
    features["domain_length"] = len(domain)
    
    # 3. Наличие IP в URL
    features["has_ip"] = 1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0
    
    # 4. Наличие символа @
    features["has_at_symbol"] = 1 if "@" in url else 0
    
    # 5. Наличие двойного слеша (кроме протокола)
    features["has_double_slash_redirect"] = 1 if url.count("//") > 1 else 0
    
    # 6. Наличие префикса или суффикса (дефис в домене)
    features["has_prefix_suffix"] = 1 if "-" in domain_info.domain else 0
    
    # 7. Количество поддоменов
    subdomain = domain_info.subdomain
    features["has_subdomain"] = len(subdomain.split(".")) if subdomain else 0
    
    # 8. HTTPS
    features["ssl_validity"] = 1 if parsed_url.scheme == "https" else 0
    
    # 9. Длина доменного имени (как прокси для регистрационной длины)
    features["domain_registration_length"] = len(domain_info.domain + domain_info.suffix)
    
    # 10. Наличие токена HTTPS в домене
    features["has_https_token"] = 1 if "https" in domain or "http" in domain else 0
    
    # 11. Наличие кириллических символов
    cyrillic_pattern = re.compile(r'[а-яА-Я]')
    features["has_cyrillic"] = 1 if cyrillic_pattern.search(url) else 0
    
    # 12. Punycode конверсия
    features["punycode_conversion"] = 1 if "xn--" in url.lower() else 0
    
    # 13. Использование сервиса сокращения URL
    shortening_services = ['bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'is.gd', 'cli.gs', 'ow.ly', 
                          'l.vk.me', 'clck.ru', 'tiny.cc']
    features["url_shortening_service"] = 1 if any(service in url.lower() for service in shortening_services) else 0
    
    # 14. Подозрительные шаблоны URL
    suspicious_patterns = [
        r'login', r'log-in', r'account', r'password', r'pwd', r'secure', r'update', r'banking',
        r'confirm', r'verify', r'signin', r'вход', r'пароль', r'подтвердить', r'банк', r'личный'
    ]
    features["suspicious_url_pattern"] = 1 if any(re.search(pattern, url.lower()) for pattern in suspicious_patterns) else 0
    
    # 15. Подозрительные TLD
    suspicious_tlds = ['xyz', 'top', 'club', 'online', 'site', 'info', 'fun', 'pro', 'ru', 'win']
    features["has_suspicious_tld"] = 1 if domain_info.suffix in suspicious_tlds else 0
    
    # Дополнительные признаки требуют HTTP-запросы (не включены для избежания сложностей)
    features["redirect_count"] = 0
    features["favicon_domain_match"] = 0
    features["domain_age"] = 0
    features["domain_is_registered"] = 1
    features["external_favicon"] = 0
    features["links_pointing_to_page"] = 0
    features["statistical_report"] = 0
    features["foreign_request_ratio"] = 0
    features["google_index"] = 0
    
    return features

def predict_url(url, model=None, scaler=None, feature_names=None, explain=False):
    """Предсказывает, является ли URL фишинговым."""
    # Загружаем модель, если не передана
    if model is None:
        model = load_model()
        if model is None:
            return {
                "error": "Не удалось загрузить модель",
                "is_phishing": True  # По умолчанию считаем подозрительным
            }
    
    # Загружаем скейлер, если не передан
    if scaler is None:
        scaler = load_scaler()
        if scaler is None:
            return {
                "error": "Не удалось загрузить скейлер",
                "is_phishing": True  # По умолчанию считаем подозрительным
            }
    
    # Загружаем имена признаков, если не переданы
    if feature_names is None:
        feature_names = load_feature_names()
    
    # Извлекаем признаки из URL
    features_dict = extract_features_from_url(url)
    if features_dict is None:
        return {
            "error": "Не удалось извлечь признаки из URL",
            "is_phishing": True  # По умолчанию считаем подозрительным
        }
    
    # Преобразуем признаки в массив
    features_array = np.array([[features_dict[feature] for feature in feature_names]])
    
    # Масштабируем признаки
    scaled_features = scaler.transform(features_array)
    
    # Делаем предсказание
    try:
        prediction = model.predict(scaled_features)[0]
        probability = model.predict_proba(scaled_features)[0][1]  # Вероятность класса "фишинг"
        
        result = {
            "is_phishing": bool(prediction),
            "probability": float(probability),
            "url": url,
            "timestamp": time.time()
        }
        
        # Добавляем объяснение, если требуется
        if explain and hasattr(model, 'feature_importances_'):
            # Создаем объяснение на основе важности признаков
            feature_importance = model.feature_importances_
            sorted_idx = np.argsort(feature_importance)[::-1]
            top_features = []
            
            for idx in sorted_idx[:5]:  # Top 5 признаков
                feature_name = feature_names[idx]
                feature_value = features_dict[feature_name]
                feature_score = feature_importance[idx]
                
                top_features.append({
                    "name": feature_name,
                    "value": feature_value,
                    "importance": float(feature_score)
                })
            
            result["explanation"] = {
                "top_features": top_features
            }
            
            # Добавляем конкретные объяснения
            explanations = []
            if features_dict["has_ip"]:
                explanations.append("URL содержит IP-адрес вместо доменного имени.")
            if features_dict["has_at_symbol"]:
                explanations.append("URL содержит символ @, что может использоваться для обмана.")
            if features_dict["url_length"] > 100:
                explanations.append("URL слишком длинный, что типично для фишинговых сайтов.")
            if features_dict["has_cyrillic"]:
                explanations.append("URL содержит кириллические символы, что может указывать на IDN Homograph Attack.")
            if features_dict["punycode_conversion"]:
                explanations.append("URL использует Punycode преобразование, что может скрывать мошеннические домены.")
            if features_dict["has_https_token"]:
                explanations.append("Домен содержит 'https' в своем имени, что может быть признаком обмана.")
            if features_dict["url_shortening_service"]:
                explanations.append("Используется сервис сокращения URL, что может скрывать мошеннический адрес.")
            if features_dict["suspicious_url_pattern"]:
                explanations.append("URL содержит подозрительные слова типичные для фишинга.")
            
            if explanations:
                result["explanation"]["reasons"] = explanations
        
        return result
    except Exception as e:
        logger.error(f"Ошибка при предсказании: {e}")
        return {
            "error": f"Ошибка при предсказании: {str(e)}",
            "is_phishing": True  # По умолчанию считаем подозрительным
        }

def predict_batch(urls, model=None, scaler=None, feature_names=None, explain=False):
    """Предсказывает для нескольких URL."""
    results = []
    
    # Загружаем модель один раз для всех URL
    if model is None:
        model = load_model()
        if model is None:
            return [{"error": "Не удалось загрузить модель", "is_phishing": True} for _ in urls]
    
    # Загружаем скейлер один раз для всех URL
    if scaler is None:
        scaler = load_scaler()
        if scaler is None:
            return [{"error": "Не удалось загрузить скейлер", "is_phishing": True} for _ in urls]
    
    # Загружаем имена признаков один раз для всех URL
    if feature_names is None:
        feature_names = load_feature_names()
    
    # Предсказываем для каждого URL
    for url in urls:
        result = predict_url(url, model, scaler, feature_names, explain)
        results.append(result)
    
    return results

def main():
    parser = argparse.ArgumentParser(description="Предсказание фишинговых сайтов")
    parser.add_argument("--url", type=str, help="URL для проверки")
    parser.add_argument("--input-file", type=str, help="Файл со списком URL для проверки (по одному URL в строке)")
    parser.add_argument("--output-file", type=str, help="Файл для сохранения результатов")
    parser.add_argument("--explain", action="store_true", help="Включить объяснение предсказаний")
    parser.add_argument("--model", type=str, default="best_model_ru.pkl", help="Имя файла модели")
    
    args = parser.parse_args()
    
    if not args.url and not args.input_file:
        parser.error("Необходимо указать URL (--url) или файл с URL (--input-file)")
    
    # Загружаем модель, скейлер и имена признаков один раз
    model = load_model(args.model)
    scaler = load_scaler()
    feature_names = load_feature_names()
    
    results = []
    
    if args.url:
        # Проверяем один URL
        result = predict_url(args.url, model, scaler, feature_names, args.explain)
        results.append(result)
        
        status = "фишинговый" if result["is_phishing"] else "безопасный"
        logger.info(f"URL: {args.url}")
        logger.info(f"Статус: {status}")
        logger.info(f"Вероятность фишинга: {result.get('probability', 'Н/Д'):.4f}")
        
        if args.explain and "explanation" in result:
            logger.info("Объяснение:")
            if "top_features" in result["explanation"]:
                for feature in result["explanation"]["top_features"]:
                    logger.info(f"  - {feature['name']}: {feature['value']} (важность: {feature['importance']:.4f})")
            
            if "reasons" in result["explanation"]:
                for reason in result["explanation"]["reasons"]:
                    logger.info(f"  - {reason}")
    
    if args.input_file:
        # Проверяем URL из файла
        try:
            with open(args.input_file, "r", encoding="utf-8") as f:
                urls = [line.strip() for line in f if line.strip()]
            
            logger.info(f"Загружено {len(urls)} URL из файла {args.input_file}")
            
            results = predict_batch(urls, model, scaler, feature_names, args.explain)
            
            # Выводим статистику
            phishing_count = sum(1 for r in results if r.get("is_phishing", False))
            logger.info(f"Обнаружено {phishing_count} фишинговых URL из {len(results)}")
        except Exception as e:
            logger.error(f"Ошибка при чтении файла: {e}")
    
    # Сохраняем результаты в файл, если указан
    if args.output_file and results:
        try:
            with open(args.output_file, "w", encoding="utf-8") as f:
                json.dump(results, f, indent=4, ensure_ascii=False)
            logger.info(f"Результаты сохранены в {args.output_file}")
        except Exception as e:
            logger.error(f"Ошибка при сохранении результатов: {e}")

if __name__ == "__main__":
    main() 