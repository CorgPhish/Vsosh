# CorgPhish Machine Learning Algorithm Description

<div align="center">
  <img src="../src/extension/images/logo.png" alt="CorgPhish Logo" width="150"/>
  <h3>Intelligent Phishing Protection</h3>
</div>

## Contents
1. [Algorithm Overview](#algorithm-overview)
2. [Model Selection](#model-selection)
3. [Phishing Site Features](#phishing-site-features)
4. [Model Training Process](#model-training-process)
5. [Exporting the Model to JavaScript](#exporting-the-model-to-javascript)
6. [Integration into Browser Extension](#integration-into-browser-extension)
7. [Performance Optimization](#performance-optimization)
8. [Decision-Making Process](#decision-making-process)
9. [Deep Scanning and Obfuscation Detection](#deep-scanning-and-obfuscation-detection)

## Algorithm Overview

CorgPhish uses machine learning algorithms for automatic detection of phishing websites. Our approach combines URL analysis, page DOM structure, and other features to create an accurate classification model capable of distinguishing legitimate sites from phishing ones.

<div align="center">
  <img src="images/ml_workflow.png" alt="ML Algorithm Workflow" width="600"/>
  <p><em>Fig. 1: General workflow of the CorgPhish algorithm</em></p>
</div>

Key advantages of our approach:
1. **Local Operation**: the algorithm runs entirely in the user's browser, without transmitting data to external servers
2. **Multi-factor Analysis**: considers more than 50 different phishing site indicators
3. **High Accuracy**: detection accuracy of 97.2%, Precision score of 96.5%
4. **Fast Analysis**: processing occurs in fractions of a second
5. **Regular Updates**: the model is periodically improved based on new data

## Model Selection

To solve the phishing site classification task, we considered several machine learning algorithms:

| Algorithm | Accuracy | Precision | Recall | F1-Score | Selected |
|----------|----------|-----------|--------|----------|-------|
| Logistic Regression | 89.4% | 88.7% | 86.2% | 87.4% | ❌ |
| Random Forest | 95.3% | 94.8% | 92.7% | 93.7% | ❌ |
| XGBoost | 97.2% | 96.5% | 95.8% | 96.1% | ✅ |
| SVM | 90.8% | 89.5% | 91.2% | 90.3% | ❌ |
| Neural Network | 93.6% | 92.8% | 93.5% | 93.1% | ❌ |

<div align="center">
  <img src="images/model_comparison.png" alt="ML Model Comparison" width="600"/>
  <p><em>Fig. 2: Comparison of effectiveness of various machine learning algorithms</em></p>
</div>

In the end, we chose **XGBoost** (eXtreme Gradient Boosting) due to its:
- High accuracy
- Fast prediction execution
- Compactness after export to JavaScript
- Resistance to overfitting
- Ability to understand feature importance

<div align="center">
  <img src="images/xgboost_tree.png" alt="Example of XGBoost Decision Tree" width="500"/>
  <p><em>Fig. 3: Example of one of the decision trees in the XGBoost model</em></p>
</div>

## Phishing Site Features

Our model uses more than 50 different features, grouped into several categories:

<div align="center">
  <img src="images/features_categories.png" alt="Feature Categories" width="600"/>
  <p><em>Fig. 4: Main categories of phishing indicators</em></p>
</div>

### URL Features (25 features):
- URL length
- Number of subdomains
- Presence of IP address instead of domain
- Number of dots in URL
- Presence of special characters (@, -, _, =, ~)
- Presence of multiple slashes
- Use of URL shorteners
- Number of digits in the domain
- Use of HTTPS
- Domain age (if available)
- Presence of keywords characteristic of phishing
- Use of top-level domains (TLD)
- Presence of wildcard characters in the domain
- Number of redirects
- Use of encoded characters in URL

<div align="center">
  <img src="images/url_analysis.png" alt="URL Analysis" width="550"/>
  <p><em>Fig. 5: Analysis of URL components for identifying phishing indicators</em></p>
</div>

### DOM Features (15 features):
- Presence of data input forms
- Number of password fields
- Presence of security elements (security seal)
- Ratio of external links to internal links
- Use of iframes
- Presence of hidden elements
- Absence of favicon
- Form interception before submission
- Use of JavaScript to collect form data
- Opening multiple popup windows
- Attempts to block exiting the page
- Right mouse button disabling
- URL imitation in the address bar
- Use of obfuscated JavaScript
- Content mismatch in title and body

### Additional Features (10+ features):
- SSL certificate validity period
- Self-signed certificate
- Presence of images from other domains
- Presence of trusted logos of banks/payment systems
- Absence of privacy policy
- Mismatch of content language and target region
- Redirect behavior
- Hidden links
- Domain mismatch with brand

<div align="center">
  <img src="images/feature_importance.png" alt="Feature Importance" width="600"/>
  <p><em>Fig. 6: Relative importance of various features in the model</em></p>
</div>

## Model Training Process

The XGBoost model training process consists of the following stages:

<div align="center">
  <img src="images/training_process.png" alt="Model Training Process" width="700"/>
  <p><em>Fig. 7: CorgPhish model training process diagram</em></p>
</div>

1. **Data Collection and Preparation**
   - Collected more than 30,000 URLs (15,000 phishing, 15,000 legitimate)
   - Sources of phishing URLs: PhishTank, OpenPhish, own collections
   - Sources of legitimate URLs: Alexa Top Sites, Common Crawl

2. **Feature Extraction**
   - All 50+ features were calculated for each URL
   - Data saved in JSON format for further use

3. **Data Preprocessing**
   - Normalization of numerical features
   - Encoding of categorical features
   - Handling missing values

4. **Data Splitting**
   - 70% of data used for training
   - 15% of data for validation
   - 15% of data for testing

<div align="center">
  <img src="images/data_split.png" alt="Data Splitting" width="450"/>
  <p><em>Fig. 8: Data splitting for training, validation, and testing</em></p>
</div>

5. **Model Training**
   ```python
   params = {
       'max_depth': 6,
       'learning_rate': 0.1,
       'n_estimators': 100,
       'objective': 'binary:logistic',
       'eval_metric': ['auc', 'error'],
       'subsample': 0.8,
       'colsample_bytree': 0.8
   }
   
   model = XGBClassifier(**params)
   model.fit(
       X_train, y_train,
       eval_set=[(X_valid, y_valid)],
       early_stopping_rounds=10,
       verbose=True
   )
   ```

6. **Model Evaluation**
   - Calculation of metrics on the test set
   - ROC-AUC curve analysis (0.981)
   - Confusion matrix analysis
   - Feature importance

<div align="center">
  <img src="images/confusion_matrix.png" alt="Confusion Matrix" width="450"/>
  <p><em>Fig. 9: Model confusion matrix on test data</em></p>
</div>

<div align="center">
  <img src="images/roc_curve.png" alt="ROC Curve" width="450"/>
  <p><em>Fig. 10: ROC curve of the trained model (AUC = 0.981)</em></p>
</div>

7. **Model Refinement**
   - Hyperparameter tuning using GridSearchCV
   - Addressing overfitting
   - Optimization of decision threshold

## Exporting the Model to JavaScript

The process of exporting the XGBoost model to JavaScript is one of the key components of our extension. We use our own implementation for maximum optimization:

<div align="center">
  <img src="images/model_export.png" alt="Exporting Model to JavaScript" width="700"/>
  <p><em>Fig. 11: Process of converting Python XGBoost model to JavaScript</em></p>
</div>

1. **Model Serialization**
   ```python
   # Saving the trained model in pickle format
   import pickle
   with open('model/xgboost_model.pkl', 'wb') as f:
       pickle.dump(model, f)
   ```

2. **Decision Tree Extraction**
   ```python
   # Extracting tree structure
   trees = []
   for i in range(len(model.get_booster().trees_to_dataframe())):
       tree = model.get_booster().get_dump()[i]
       trees.append(parse_tree(tree))
   ```

3. **Conversion to JavaScript**
   ```python
   # JavaScript code generation
   js_code = """
   // XGBoost model for phishing site detection
   const xgboostModel = {
       trees: ${trees_json},
       base_score: ${base_score},
       
       // Prediction function
       predict: function(features) {
           let sum = this.base_score;
           
           for (let i = 0; i < this.trees.length; i++) {
               sum += this.predictTree(this.trees[i], features);
           }
           
           // Applying sigmoid to get probability
           return 1.0 / (1.0 + Math.exp(-sum));
       },
       
       // Decision tree traversal
       predictTree: function(tree, features) {
           let node = tree;
           
           while (!node.isLeaf) {
               if (features[node.feature] <= node.threshold) {
                   node = node.left;
               } else {
                   node = node.right;
               }
           }
           
           return node.value;
       }
   };
   
   // Exporting the model
   export default xgboostModel;
   """.replace('${trees_json}', json.dumps(trees)).replace('${base_score}', str(model.base_score))
   
   # Writing to JavaScript file
   with open('src/extension/js/models/xgboost_model.js', 'w') as f:
       f.write(js_code)
   ```

4. **Size Optimization**
   - Compression of tree structure
   - Removal of redundant information
   - Code minification
   - Final JavaScript file size: 22KB

<div align="center">
  <img src="images/js_model_size.png" alt="Model Size Optimization" width="550"/>
  <p><em>Fig. 12: Model size comparison before and after optimization</em></p>
</div>

## Integration into Browser Extension

The model integration into the extension is implemented as follows:

<div align="center">
  <img src="images/extension_architecture.png" alt="Extension Architecture" width="700"/>
  <p><em>Fig. 13: CorgPhish extension architecture and ML model integration</em></p>
</div>

1. **Importing the Model in JavaScript Code**
   ```javascript
   import xgboostModel from './models/xgboost_model.js';
   ```

2. **Feature Extraction from the Page**
   ```javascript
   // Feature extraction function
   function extractFeatures(url, document) {
       const features = {};
       
       // URL features
       features.url_length = url.length;
       features.has_ip_address = /^\d+\.\d+\.\d+\.\d+/.test(url) ? 1 : 0;
       features.has_at_symbol = url.includes('@') ? 1 : 0;
       // ...22+ more URL features
       
       // DOM features
       features.has_form = document.forms.length > 0 ? 1 : 0;
       features.password_field_count = document.querySelectorAll('input[type="password"]').length;
       features.external_links_ratio = calculateExternalLinksRatio(document);
       // ...12+ more DOM features
       
       // Additional features
       // ...
       
       return features;
   }
   ```

3. **Page Analysis**
   ```javascript
   // Current page analysis
   function analyzePage() {
       const url = window.location.href;
       const features = extractFeatures(url, document);
       
       // Getting prediction from the model
       const phishingProbability = xgboostModel.predict(features);
       
       // Making decision based on threshold
       if (phishingProbability > THRESHOLD) {
           showWarning(phishingProbability, features);
       }
   }
   ```

4. **Browser Event Handling**
   ```javascript
   // Page load event listener
   document.addEventListener('DOMContentLoaded', () => {
       // Small delay for complete DOM loading
       setTimeout(analyzePage, 500);
   });
   ```

<div align="center">
  <img src="images/extension_workflow.png" alt="Extension Workflow" width="650"/>
  <p><em>Fig. 14: Extension workflow when loading a page</em></p>
</div>

## Performance Optimization

To ensure fast operation in the browser, we implemented the following optimizations:

<div align="center">
  <img src="images/performance_optimizations.png" alt="Performance Optimizations" width="600"/>
  <p><em>Fig. 15: Performance optimization diagram</em></p>
</div>

1. **Result Caching**
   ```javascript
   // Verification result cache
   const checkedUrls = {};
   
   function checkUrl(url) {
       // Checking in cache
       if (checkedUrls[url]) {
           return checkedUrls[url];
       }
       
       // Extraction and analysis
       const features = extractFeatures(url, document);
       const result = xgboostModel.predict(features);
       
       // Saving to cache
       checkedUrls[url] = result;
       
       return result;
   }
   ```

2. **Asynchronous Processing**
   ```javascript
   // Asynchronous analysis for multiple URLs
   async function analyzeMultipleUrls(urls) {
       const results = {};
       
       // Creating batches of 10 URLs
       const batches = [];
       for (let i = 0; i < urls.length; i += 10) {
           batches.push(urls.slice(i, i + 10));
       }
       
       for (const batch of batches) {
           await Promise.all(batch.map(async url => {
               results[url] = await checkUrlAsync(url);
           }));
       }
       
       return results;
   }
   ```

3. **Partial DOM Analysis**
   ```javascript
   // Analysis of only visible part of DOM
   function extractVisibleDomFeatures() {
       const visibleElements = document.querySelectorAll(':visible');
       // Limiting the number of analyzed elements
       return analyzeElements(visibleElements.slice(0, 1000));
   }
   ```

4. **Lazy Model Loading**
   ```javascript
   // Lazy loading of the model when needed
   let model = null;
   
   async function getModel() {
       if (!model) {
           model = await import('./models/xgboost_model.js');
       }
       return model;
   }
   ```

<div align="center">
  <img src="images/performance_metrics.png" alt="Performance Metrics" width="500"/>
  <p><em>Fig. 16: Performance metrics after optimization</em></p>
</div>

## Decision-Making Process

The decision about the phishing nature of a site occurs in several stages:

<div align="center">
  <img src="images/decision_process.png" alt="Decision Process" width="700"/>
  <p><em>Fig. 17: Decision-making process diagram</em></p>
</div>

1. **Probability Calculation**
   ```javascript
   const phishingProbability = xgboostModel.predict(features);
   ```

2. **Threshold Application**
   ```javascript
   // Threshold for decision making
   const THRESHOLD = 0.75;
   
   const isPhishing = phishingProbability > THRESHOLD;
   ```

3. **Risk Level Consideration**
   ```javascript
   // Determining risk level
   function getRiskLevel(probability) {
       if (probability > 0.9) return 'high';
       if (probability > 0.8) return 'medium';
       return 'low';
   }
   ```

<div align="center">
  <img src="images/risk_levels.png" alt="Risk Levels" width="500"/>
  <p><em>Fig. 18: Visualization of risk levels depending on probability</em></p>
</div>

4. **Integration with Google Safe Browsing API (optional)**
   ```javascript
   async function checkWithGoogleSafeBrowsing(url) {
       try {
           const response = await fetch(SAFE_BROWSING_API_URL, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   client: { clientId: 'CorgPhish', clientVersion: '1.2.0' },
                   threatInfo: {
                       threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING'],
                       platformTypes: ['ANY_PLATFORM'],
                       threatEntryTypes: ['URL'],
                       threatEntries: [{ url }]
                   }
               })
           });
           
           const data = await response.json();
           return data.matches && data.matches.length > 0;
       } catch (error) {
           console.error('Google Safe Browsing API error:', error);
           return false;
       }
   }
   ```

5. **Combining Results**
   ```javascript
   async function analyzeSite(url) {
       // ML model result
       const features = extractFeatures(url, document);
       const mlProbability = xgboostModel.predict(features);
       
       // Check via Google Safe Browsing (if option enabled)
       let gsbResult = false;
       if (useGoogleSafeBrowsing) {
           gsbResult = await checkWithGoogleSafeBrowsing(url);
       }
       
       // Final decision
       let finalProbability = mlProbability;
       if (gsbResult) {
           // If Google confirms phishing, increase probability
           finalProbability = Math.max(0.95, mlProbability);
       }
       
       return {
           isPhishing: finalProbability > THRESHOLD,
           probability: finalProbability,
           riskLevel: getRiskLevel(finalProbability),
           importantFeatures: getImportantFeatures(features, mlProbability)
       };
   }
   ```

<div align="center">
  <img src="images/warning_example.png" alt="Warning Example" width="650"/>
  <p><em>Fig. 19: Example of warning for user when detecting a phishing site</em></p>
</div>

## Deep Scanning and Obfuscation Detection

Starting from version 1.2.0, CorgPhish has received a deep scanning mode that allows for more thorough analysis of web pages and detection of complex obfuscation methods often used in phishing attacks.

<div align="center">
  <img src="images/deep_scan_architecture.png" alt="Deep Scanning Architecture" width="700"/>
  <p><em>Fig. 20: Architecture of the deep scanning module</em></p>
</div>

### Deep Scanning Principles

Deep scanning includes several additional levels of analysis:

1. **Hidden Element Analysis**
   - Search for elements with `display: none`, `visibility: hidden`, and positioning outside the screen
   - Detection of transparent or small elements used to hide phishing mechanisms
   - Analysis of layers with high z-index overlapping legitimate content

2. **Obfuscated Code Detection**
   ```js
   // Example of obfuscated code patterns
   const patterns = [
     /eval\s*\(+/,                 // eval(...
     /document\s*.\s*write\s*\(+/, // document.write(...
     /fromCharCode/,               // String.fromCharCode
     /\\x[0-9a-f]{2}/gi,           // Hexadecimal character notation
     /atob\s*\(+/                  // atob(...
   ];
   ```

3. **Redirect Analysis**
   - Tracking multiple redirects (HTTP, meta refresh, JavaScript)
   - Detection of timers for redirect after page load
   - Analysis of mismatch between URL in address bar and actual domain

4. **Iframe and External Resource Verification**
   - Analysis of frames with potentially malicious content
   - Checking external scripts and resources from unsafe sources
   - Detection of hidden frames for collecting user data

<div align="center">
  <img src="images/obfuscation_detection.png" alt="Obfuscation Detection" width="600"/>
  <p><em>Fig. 21: Process of detecting obfuscation in page code</em></p>
</div>

### Obfuscation Detection Methods

Code obfuscation is a popular technique of phishing sites to bypass standard protection systems. CorgPhish uses several methods to detect obfuscated JavaScript:

#### Statistical Analysis
- Calculating code entropy (high entropy is characteristic of obfuscated code)
- Analysis of string lengths and density of special characters
- Ratio between code and text strings

#### Syntax Analysis
- Detection of atypical JavaScript constructs
- Search for encoded strings and decoder functions
- Analysis of opaque predicates and dead code

#### Behavioral Analysis
- Determining attempts to access sensitive browser APIs
- Detection of form data collection through non-standard mechanisms
- Tracking attempts to intercept keyboard and form events

```js
// Example of string entropy calculation algorithm for detecting obfuscation
function calculateEntropy(str) {
  const len = str.length;
  const frequencies = {};
  
  // Counting frequency of each character
  for (let i = 0; i < len; i++) {
    const char = str.charAt(i);
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  
  // Entropy calculation
  let entropy = 0;
  Object.values(frequencies).forEach(freq => {
    const p = freq / len;
    entropy -= p * Math.log2(p);
  });
  
  return entropy;
}
```

### Deep Scanning Effectiveness

Enabling deep scanning mode significantly increases detection effectiveness:

| Phishing attack type | Standard scanning | Deep scanning |
|----------------------|--------------------------|------------------------|
| Simple phishing sites | 96.7% | 98.2% |
| Obfuscated code | 61.3% | 89.5% |
| Hidden elements | 72.4% | 94.1% |
| Multi-level redirects | 68.9% | 93.7% |
| Combined techniques | 52.6% | 87.3% |

<div align="center">
  <img src="images/deep_scan_effectiveness.png" alt="Deep Scanning Effectiveness" width="600"/>
  <p><em>Fig. 22: Comparison of standard and deep scanning effectiveness</em></p>
</div>

Deep scanning requires more resources and time, so it is performed with a delay, after the main page analysis, to avoid slowing down the user's experience. 