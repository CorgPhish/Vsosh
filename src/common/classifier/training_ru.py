#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Скрипт для обучения модели фишинг-детектора
с акцентом на русскоязычные сайты и использованием XGBoost.
"""

import os
import sys
import json
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.metrics import roc_curve, auc, classification_report
import pickle
import time
import logging
import seaborn as sns
from xgboost import XGBClassifier
from datetime import datetime
import subprocess

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("training_ru.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("TrainingRU")

# Глобальные константы
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
RESULTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results")

# Убедимся, что директории существуют
for directory in [DATA_DIR, PROCESSED_DIR, MODELS_DIR, RESULTS_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

def check_data():
    """Проверяет наличие данных и загружает их."""
    X_train_path = os.path.join(PROCESSED_DIR, "X_train_ru.npy")
    X_test_path = os.path.join(PROCESSED_DIR, "X_test_ru.npy")
    y_train_path = os.path.join(PROCESSED_DIR, "y_train_ru.npy")
    y_test_path = os.path.join(PROCESSED_DIR, "y_test_ru.npy")
    
    # Проверяем наличие файлов
    if not all(os.path.exists(f) for f in [X_train_path, X_test_path, y_train_path, y_test_path]):
        logger.warning("Файлы данных не найдены. Запуск скрипта предобработки...")
        try:
            subprocess.run([sys.executable, "preprocess_ru.py"], check=True)
        except subprocess.CalledProcessError:
            logger.error("Не удалось выполнить скрипт предобработки.")
            sys.exit(1)
    
    # Загружаем данные
    X_train = np.load(X_train_path)
    X_test = np.load(X_test_path)
    y_train = np.load(y_train_path)
    y_test = np.load(y_test_path)
    
    logger.info(f"Данные загружены. Обучающая выборка: {X_train.shape}, Тестовая выборка: {X_test.shape}")
    
    return X_train, X_test, y_train, y_test

def load_feature_names():
    """Загружает имена признаков из информационного файла."""
    info_path = os.path.join(PROCESSED_DIR, "feature_info_ru.json")
    
    if not os.path.exists(info_path):
        logger.warning("Информационный файл не найден. Используем общие имена признаков.")
        # Возвращаем общие имена признаков
        return [f"feature_{i}" for i in range(24)]
    
    with open(info_path, "r", encoding="utf-8") as f:
        feature_info = json.load(f)
    
    return feature_info["feature_names"]

def plot_feature_importance(model, feature_names, model_name, top_n=15):
    """Визуализирует важность признаков."""
    plt.figure(figsize=(12, 8))
    
    if isinstance(model, XGBClassifier):
        importance = model.feature_importances_
    else:
        importance = model.feature_importances_
    
    # Создаем DataFrame для удобства сортировки
    importance_df = pd.DataFrame({
        "Feature": feature_names,
        "Importance": importance
    })
    
    # Сортируем и выбираем top_n
    importance_df = importance_df.sort_values("Importance", ascending=False).head(top_n)
    
    # Строим график
    sns.barplot(x="Importance", y="Feature", data=importance_df)
    plt.title(f"Top {top_n} важных признаков - {model_name}")
    plt.tight_layout()
    
    # Сохраняем
    output_path = os.path.join(RESULTS_DIR, f"{model_name}_feature_importance_ru.png")
    plt.savefig(output_path, dpi=300)
    logger.info(f"График важности признаков сохранен в {output_path}")
    
    return importance_df

def plot_roc_curve(model, X_test, y_test, model_name):
    """Строит ROC-кривую для модели."""
    y_proba = model.predict_proba(X_test)[:, 1]
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(10, 8))
    plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve - {model_name}')
    plt.legend(loc="lower right")
    
    # Сохраняем
    output_path = os.path.join(RESULTS_DIR, f"{model_name}_roc_curve_ru.png")
    plt.savefig(output_path, dpi=300)
    logger.info(f"ROC-кривая сохранена в {output_path}")
    
    return roc_auc

def plot_confusion_matrix(y_true, y_pred, model_name):
    """Строит матрицу ошибок."""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False,
                xticklabels=["Легитимный", "Фишинг"],
                yticklabels=["Легитимный", "Фишинг"])
    plt.xlabel("Предсказанные")
    plt.ylabel("Истинные")
    plt.title(f"Матрица ошибок - {model_name}")
    
    # Сохраняем
    output_path = os.path.join(RESULTS_DIR, f"{model_name}_confusion_matrix_ru.png")
    plt.savefig(output_path, dpi=300)
    logger.info(f"Матрица ошибок сохранена в {output_path}")

def evaluate_model(model, X_test, y_test):
    """Вычисляет метрики качества модели."""
    y_pred = model.predict(X_test)
    
    # Вычисляем метрики
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "predictions": y_pred
    }

def train_and_evaluate_models(X_train, X_test, y_train, y_test, feature_names):
    """Обучает и оценивает модели классификации."""
    models = {
        "RandomForest": RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=10,
            min_samples_leaf=4,
            n_jobs=-1,
            random_state=42
        ),
        "XGBoost": XGBClassifier(
            n_estimators=300,
            max_depth=10,
            learning_rate=0.01,
            subsample=0.8,
            colsample_bytree=0.8,
            gamma=1,
            reg_alpha=0.5,
            reg_lambda=0.5,
            random_state=42,
            n_jobs=-1
        )
    }
    
    results = {}
    
    # Обучаем и оцениваем каждую модель
    for model_name, model in models.items():
        start_time = time.time()
        logger.info(f"Обучение модели {model_name}...")
        
        # Обучаем модель
        model.fit(X_train, y_train)
        
        # Вычисляем метрики
        metrics = evaluate_model(model, X_test, y_test)
        training_time = time.time() - start_time
        
        # Сохраняем модель
        model_path = os.path.join(MODELS_DIR, f"{model_name.lower()}_ru.pkl")
        with open(model_path, "wb") as f:
            pickle.dump(model, f)
        
        # Записываем отчет о классификации
        report = classification_report(y_test, metrics["predictions"], target_names=["Легитимный", "Фишинг"])
        report_path = os.path.join(RESULTS_DIR, f"{model_name}_classification_report_ru.txt")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(f"Модель: {model_name}\n")
            f.write(f"Время обучения: {training_time:.2f} секунд\n")
            f.write(f"Точность: {metrics['accuracy']:.4f}\n")
            f.write(f"Precision: {metrics['precision']:.4f}\n")
            f.write(f"Recall: {metrics['recall']:.4f}\n")
            f.write(f"F1-score: {metrics['f1_score']:.4f}\n\n")
            f.write("Отчет о классификации:\n")
            f.write(report)
        
        # Сохраняем метрики в results
        results[model_name] = {
            "accuracy": metrics["accuracy"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1_score": metrics["f1_score"],
            "training_time": training_time,
            "model_path": model_path
        }
        
        # Визуализируем важность признаков
        importance_df = plot_feature_importance(model, feature_names, model_name)
        
        # Строим ROC-кривую
        roc_auc = plot_roc_curve(model, X_test, y_test, model_name)
        results[model_name]["roc_auc"] = roc_auc
        
        # Строим матрицу ошибок
        plot_confusion_matrix(y_test, metrics["predictions"], model_name)
        
        logger.info(f"Модель {model_name} обучена за {training_time:.2f} секунд")
        logger.info(f"Accuracy: {metrics['accuracy']:.4f}, F1-score: {metrics['f1_score']:.4f}")
    
    # Сохраняем общие результаты
    results_path = os.path.join(RESULTS_DIR, "model_comparison_ru.json")
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)
    
    # Определяем лучшую модель по F1-score
    best_model = max(results.items(), key=lambda x: x[1]["f1_score"])
    logger.info(f"Лучшая модель: {best_model[0]} с F1-score: {best_model[1]['f1_score']:.4f}")
    
    # Создаем ссылку на лучшую модель
    best_model_path = os.path.join(MODELS_DIR, "best_model_ru.pkl")
    try:
        if os.path.exists(best_model_path):
            os.remove(best_model_path)
        os.symlink(best_model[1]["model_path"], best_model_path)
        logger.info(f"Создана ссылка на лучшую модель: {best_model_path}")
    except Exception as e:
        logger.warning(f"Не удалось создать символическую ссылку: {e}")
        # Копируем модель вместо создания ссылки
        with open(best_model[1]["model_path"], "rb") as src, open(best_model_path, "wb") as dst:
            dst.write(src.read())
        logger.info(f"Создана копия лучшей модели: {best_model_path}")
    
    return results

def main():
    start_time = time.time()
    logger.info("Начало обучения моделей...")
    
    # Проверяем и загружаем данные
    X_train, X_test, y_train, y_test = check_data()
    
    # Загружаем названия признаков
    feature_names = load_feature_names()
    
    # Обучаем и оцениваем модели
    results = train_and_evaluate_models(X_train, X_test, y_train, y_test, feature_names)
    
    logger.info(f"Обучение моделей завершено за {time.time() - start_time:.2f} секунд")
    
    # Сравниваем результаты
    best_model = max(results.items(), key=lambda x: x[1]["f1_score"])
    logger.info(f"Итоговые результаты:")
    for model_name, metrics in results.items():
        logger.info(f"{model_name}: F1-score = {metrics['f1_score']:.4f}, Accuracy = {metrics['accuracy']:.4f}")
    
    logger.info(f"Лучшая модель: {best_model[0]} с F1-score: {best_model[1]['f1_score']:.4f}")
    logger.info(f"Все результаты сохранены в {RESULTS_DIR}")

if __name__ == "__main__":
    main() 