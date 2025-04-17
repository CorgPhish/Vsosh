#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Скрипт предобработки данных для обучения модели фишинг-детектора
с акцентом на русскоязычные сайты.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import time
import logging
import requests
from tqdm import tqdm
from urllib.parse import urlparse
import re
from bs4 import BeautifulSoup
import tldextract

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("preprocess_ru.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("PreprocessRU")

# Глобальные константы
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
RUSSIAN_PHISHING_DATA = os.path.join(DATA_DIR, "russian_phishing_urls.csv")
RUSSIAN_LEGITIMATE_DATA = os.path.join(DATA_DIR, "russian_legitimate_urls.csv")
FEATURES_DIR = os.path.join(DATA_DIR, "features")
OUTPUT_DIR = os.path.join(DATA_DIR, "processed")

# Убедимся, что директории существуют
for directory in [DATA_DIR, FEATURES_DIR, OUTPUT_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# Список признаков, которые будут извлекаться
FEATURES = [
    "url_length",
    "domain_length",
    "has_ip",
    "has_at_symbol",
    "has_double_slash_redirect",
    "has_prefix_suffix",
    "has_subdomain",
    "ssl_validity",
    "domain_registration_length",
    "has_https_token",
    "has_cyrillic",
    "punycode_conversion",
    "url_shortening_service",
    "redirect_count",
    "favicon_domain_match",
    "domain_age",
    "domain_is_registered",
    "has_suspicious_tld",
    "suspicious_url_pattern",
    "foreign_request_ratio",
    "external_favicon",
    "links_pointing_to_page",
    "statistical_report",
    "google_index"
]

def load_data():
    """Загружает данные из исходных файлов."""
    if not (os.path.exists(RUSSIAN_PHISHING_DATA) and os.path.exists(RUSSIAN_LEGITIMATE_DATA)):
        logger.error("Файлы данных не найдены. Пожалуйста, убедитесь, что они существуют.")
        sys.exit(1)
    
    phishing_df = pd.read_csv(RUSSIAN_PHISHING_DATA)
    legitimate_df = pd.read_csv(RUSSIAN_LEGITIMATE_DATA)
    
    # Добавляем метки классов
    phishing_df["label"] = 1  # Фишинг
    legitimate_df["label"] = 0  # Легитимный
    
    # Объединяем данные
    df = pd.concat([phishing_df, legitimate_df], ignore_index=True)
    logger.info(f"Загружено {len(df)} URL-адресов: {len(phishing_df)} фишинговых и {len(legitimate_df)} легитимных")
    
    return df

def extract_url_features(url):
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

def preprocess_data(df):
    """Предобрабатывает данные, извлекая признаки из URL-адресов."""
    
    # Создаем массив для хранения признаков
    X = []
    y = df["label"].values
    
    logger.info("Извлечение признаков из URL-адресов...")
    for _, row in tqdm(df.iterrows(), total=len(df)):
        url = row["url"]
        features = extract_url_features(url)
        
        if features:
            feature_values = [features[feature] for feature in FEATURES]
            X.append(feature_values)
    
    X = np.array(X)
    
    logger.info(f"Извлечены признаки из {len(X)} URL-адресов")
    
    # Проверяем, что все значения валидны
    if np.isnan(X).any():
        logger.warning("Найдены пропущенные значения в признаках. Заменяем их нулями.")
        X = np.nan_to_num(X)
    
    return X, y

def save_data(X, y):
    """Сохраняет предобработанные данные."""
    # Разделяем данные на обучающую и тестовую выборки
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Масштабируем признаки
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Сохраняем обработанные данные
    np.save(os.path.join(OUTPUT_DIR, "X_train_ru.npy"), X_train_scaled)
    np.save(os.path.join(OUTPUT_DIR, "X_test_ru.npy"), X_test_scaled)
    np.save(os.path.join(OUTPUT_DIR, "y_train_ru.npy"), y_train)
    np.save(os.path.join(OUTPUT_DIR, "y_test_ru.npy"), y_test)
    
    # Сохраняем скейлер
    with open(os.path.join(OUTPUT_DIR, "scaler_ru.pkl"), "wb") as f:
        pickle.dump(scaler, f)
    
    # Сохраняем информацию о признаках
    feature_info = {
        "feature_names": FEATURES,
        "num_samples": len(X),
        "num_features": len(FEATURES),
        "class_distribution": {
            "phishing": int(np.sum(y)),
            "legitimate": int(len(y) - np.sum(y))
        }
    }
    
    with open(os.path.join(OUTPUT_DIR, "feature_info_ru.json"), "w", encoding="utf-8") as f:
        json.dump(feature_info, f, indent=4, ensure_ascii=False)
    
    logger.info(f"Данные успешно сохранены в {OUTPUT_DIR}")
    logger.info(f"Обучающая выборка: {X_train.shape}, Тестовая выборка: {X_test.shape}")

def main():
    start_time = time.time()
    logger.info("Начало предобработки данных...")
    
    # Загрузка данных
    df = load_data()
    
    # Предобработка данных
    X, y = preprocess_data(df)
    
    # Сохранение данных
    save_data(X, y)
    
    logger.info(f"Предобработка завершена за {time.time() - start_time:.2f} секунд")

if __name__ == "__main__":
    main() 