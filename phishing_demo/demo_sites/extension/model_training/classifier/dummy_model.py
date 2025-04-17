#!/usr/bin/env python3
"""
dummy_model.py - Скрипт для создания тестовой XGBoost модели

Создает простую XGBoost модель с несколькими деревьями для тестирования экспорта в JavaScript.
"""

import os
import sys
import json
import numpy as np
import pickle
import xgboost as xgb
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("CorgPhish-Dummy")

# Определение путей
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_model.pkl")
FEATURES_PATH = os.path.join(MODELS_DIR, "features.json")

# Список признаков для фишинг-детекции
FEATURE_NAMES = [
    "url_length", "domain_dot_count", "domain_length", "has_ip", 
    "has_at_symbol", "subdomain_count", "path_length", "query_param_count",
    "has_cyrillic", "is_https", "has_tilde", "has_underscore", 
    "special_char_count", "domain_digit_count", "domain_digit_ratio", 
    "has_redirect_param", "tld_length", "has_suspicious_words", 
    "subdomain_level", "has_port", "domain_hyphen_count", "domain_hyphen_ratio"
]

def create_dummy_data():
    """
    Создает синтетические данные для обучения тестовой модели
    
    Returns:
        tuple: X_train, X_test, y_train, y_test
    """
    logger.info("Создание синтетических данных для модели")
    
    # Создаем синтетические данные с 22 признаками (как в нашем списке)
    X, y = make_classification(
        n_samples=1000,
        n_features=len(FEATURE_NAMES),
        n_informative=10,
        n_redundant=2,
        n_repeated=0,
        n_classes=2,
        random_state=42
    )
    
    # Разделяем на тренировочные и тестовые данные
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    logger.info(f"Создано {len(X_train)} тренировочных и {len(X_test)} тестовых примеров")
    return X_train, X_test, y_train, y_test

def train_dummy_model(X_train, y_train):
    """
    Обучает простую XGBoost модель на синтетических данных
    
    Args:
        X_train (numpy.ndarray): Тренировочные данные
        y_train (numpy.ndarray): Метки классов
    
    Returns:
        xgboost.XGBClassifier: Обученная модель
    """
    logger.info("Обучение тестовой XGBoost модели")
    
    # Создаем и обучаем модель
    model = xgb.XGBClassifier(
        n_estimators=5,  # Всего 5 деревьев для простоты
        max_depth=3,     # Небольшая глубина деревьев
        learning_rate=0.1,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    logger.info("Модель успешно обучена")
    
    return model

def save_model_and_features(model, feature_names):
    """
    Сохраняет модель и имена признаков в файлы
    
    Args:
        model (xgboost.XGBClassifier): Обученная модель
        feature_names (list): Список имен признаков
    """
    # Создаем директорию для моделей, если не существует
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Сохраняем модель
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"Модель сохранена в {MODEL_PATH}")
    
    # Сохраняем имена признаков
    with open(FEATURES_PATH, 'w') as f:
        json.dump(feature_names, f)
    logger.info(f"Имена признаков сохранены в {FEATURES_PATH}")

def main():
    """
    Основная функция для создания и сохранения тестовой модели
    """
    logger.info("Создание тестовой XGBoost модели")
    
    # Создаем тестовые данные
    X_train, X_test, y_train, y_test = create_dummy_data()
    
    # Обучаем модель
    model = train_dummy_model(X_train, y_train)
    
    # Сохраняем модель и признаки
    save_model_and_features(model, FEATURE_NAMES)
    
    logger.info("Тестовая модель успешно создана")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 