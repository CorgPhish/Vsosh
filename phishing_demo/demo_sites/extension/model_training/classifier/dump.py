/**
 * dump.py - Скрипт для сериализации модели Random Forest в JSON формат
 * 
 * Этот скрипт отвечает за:
 * 1. Преобразование дерева решений в JSON структуру
 * 2. Сериализацию всей модели Random Forest
 * 3. Сохранение структуры модели для использования в браузере
 */

# coding: utf-8

# In[9]:


from sklearn.tree import _tree


# In[10]:


def tree_to_json(tree):
    """
    Преобразует дерево решений в JSON структуру
    
    Args:
        tree: Объект дерева решений из scikit-learn
        
    Returns:
        dict: JSON структура дерева решений
    """
    tree_ = tree.tree_
    feature_names = range(30)
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]
    def recurse(node):
        """
        Рекурсивно обходит дерево и строит JSON структуру
        
        Args:
            node: Текущий узел дерева
            
        Returns:
            dict: JSON структура узла
        """
        tree_json = dict()
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            tree_json['type'] = 'split'
            threshold = tree_.threshold[node]
            tree_json['threshold'] = "{} <= {}".format(feature_name[node], threshold)
            tree_json['left'] = recurse(tree_.children_left[node])
            tree_json['right'] = recurse(tree_.children_right[node])
        else:
            tree_json['type'] = 'leaf'
            tree_json['value'] = tree_.value[node].tolist()
        return tree_json

    return recurse(0)


# In[11]:


def forest_to_json(forest):
    """
    Преобразует модель Random Forest в JSON структуру
    
    Args:
        forest: Объект Random Forest из scikit-learn
        
    Returns:
        dict: JSON структура модели Random Forest
    """
    forest_json = dict()
    forest_json['n_features'] = forest.n_features_
    forest_json['n_classes'] = forest.n_classes_
    forest_json['classes'] = forest.classes_.tolist()
    forest_json['n_outputs'] = forest.n_outputs_
    forest_json['n_estimators'] = forest.n_estimators
    forest_json['estimators'] = [tree_to_json(estimator) for estimator in forest.estimators_]
    return forest_json

