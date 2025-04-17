# CorgPhish: Complete Project Overview

<div align="center">
  <img src="../src/extension/images/logo.png" alt="CorgPhish Logo" width="200"/>
  <h3>Intelligent Phishing Protection</h3>
</div>

## Table of Contents
1. [General Description](#general-description)
2. [Project Architecture](#project-architecture)
3. [Technology Stack](#technology-stack)
4. [Machine Learning](#machine-learning)
5. [Browser Extension](#browser-extension)
6. [Build Process](#build-process)
7. [Testing](#testing)
8. [Mobile Platforms](#mobile-platforms)
9. [Additional Features](#additional-features)
10. [Development Roadmap](#development-roadmap)

## General Description

CorgPhish is a comprehensive solution for protection against phishing attacks, implemented as a browser extension. Using advanced machine learning technologies, CorgPhish analyzes web pages in real-time, identifying potentially dangerous sites and warning users about possible threats.

<div align="center">
  <img src="images/project_overview.png" alt="Project Overview" width="700"/>
  <p><em>General concept of the CorgPhish project</em></p>
</div>

### Key Features:

- **Fully Local Analysis**: All computations occur in the user's browser, without sending data to a server
- **Multi-factor Detection**: Analysis of more than 50 different indicators of phishing sites
- **High Accuracy**: Detection accuracy of 97.2%, with a minimal number of false positives
- **Instant Response**: Warnings appear immediately upon detection of danger
- **API Integration**: Optional verification through Google Safe Browsing API to enhance reliability
- **Low Resource Consumption**: Optimized code and efficient memory usage
- **Adaptation to New Threats**: Periodic model updates to combat new types of attacks

## Project Architecture

The CorgPhish project has a modular architecture consisting of several key components:

<div align="center">
  <img src="images/architecture.png" alt="Project Architecture" width="700"/>
  <p><em>General architecture of the CorgPhish project</em></p>
</div>

### Main Components:

1. **URL Analysis Module**
   - Feature extraction from URL addresses
   - Domain and query parameter verification
   - URL structure analysis

2. **DOM Analysis Module**
   - Analysis of page HTML structure
   - Identification of suspicious elements (forms, hidden fields)
   - Verification of scripts and redirects

3. **Machine Learning Module**
   - XGBoost model for site classification
   - JavaScript integration
   - Decision-making mechanism

4. **User Interface**
   - Popup window with verification results
   - Phishing site warnings
   - Settings and configuration

5. **API Integration Module**
   - Interaction with Google Safe Browsing API
   - Result caching to reduce load
   - Combining external verification results with local analysis

### Code Organization:

The project is organized into the following directory structure:

```
CorgPhish/
├── src/                  # Source code
│   ├── extension/        # Browser extension code
│   │   ├── css/          # CSS styles
│   │   ├── html/         # UI HTML files
│   │   ├── icons/        # Extension icons
│   │   ├── images/       # Images 
│   │   ├── js/           # JavaScript files
│   │   │   ├── models/   # JavaScript ML models
│   │   │   └── utils/    # Helper utilities
│   │   └── manifest.json # Extension manifest
│   └── common/           # Common components
│       ├── classifier/   # ML classifiers
│       ├── dataset/      # Training data
│       └── utilities/    # Common utilities
├── dist/                 # Build files
├── docs/                 # Documentation
├── tests/                # Tests
├── scripts/              # Helper scripts
├── phishing_demo/        # Demonstration environment
└── build.py              # Build script
```

## Technology Stack

CorgPhish uses a modern technology stack to ensure high performance and development convenience:

<div align="center">
  <img src="images/tech_stack.png" alt="Technology Stack" width="650"/>
  <p><em>Technology stack of the CorgPhish project</em></p>
</div>

### Frontend (Browser Extension):

- **JavaScript (ES6+)**: Main development language
- **HTML5 / CSS3**: For building the user interface
- **Chrome Extensions API**: For accessing Chrome browser API
- **Firefox Add-ons API**: For cross-browser support
- **Web Extensions API**: Standardized extensions API

### Backend and Machine Learning:

- **Python 3.8+**: For development, training, and exporting models
- **XGBoost**: Main classification algorithm
- **Scikit-learn**: For data processing and model evaluation
- **NumPy / Pandas**: For working with datasets
- **TensorFlow.js**: For model optimization during export

### Development Tools:

- **Git / GitHub**: Version control system
- **Jest**: For JavaScript code testing
- **Pytest**: For Python code testing
- **ESLint / Prettier**: For maintaining code quality
- **Webpack**: For extension building and packaging

## Machine Learning

The heart of CorgPhish is a machine learning model capable of identifying phishing sites with high accuracy.

<div align="center">
  <img src="images/ml_overview.png" alt="Machine Learning Overview" width="700"/>
  <p><em>Overview of the CorgPhish machine learning system</em></p>
</div>

### Training Process:

1. **Data Collection**:
   - More than 30,000 URLs for training
   - Balance between phishing and legitimate sites
   - Regular dataset updates with new examples

2. **Feature Extraction**:
   - URL analysis
   - HTML structure parsing
   - Identification of key phishing signals

3. **Model Training**:
   - Selection of optimal algorithm (XGBoost)
   - Hyperparameter tuning
   - Cross-validation to prevent overfitting

4. **Performance Evaluation**:
   - Accuracy: 97.2%
   - Precision: 96.5%
   - Recall: 95.8%
   - F1-Score: 96.1%

5. **Export to JavaScript**:
   - Conversion of the model into optimized JS code
   - Size minimization for fast loading
   - Maintaining high prediction speed

More information about machine learning in CorgPhish can be found in the [ML Algorithm documentation](ML_ALGORITHM.md).

## Browser Extension

The user part of CorgPhish is implemented as an extension for Chrome and Firefox browsers.

<div align="center">
  <img src="images/extension_ui.png" alt="Extension Interface" width="700"/>
  <p><em>CorgPhish extension user interface</em></p>
</div>

### Extension Components:

1. **Background Script** (service-worker.js):
   - Extension initialization
   - Browser event handling
   - Component coordination

2. **Content Script** (content.js):
   - Injection into page context
   - Real-time DOM analysis
   - Feature extraction for analysis

3. **Popup UI** (popup.html, popup.js):
   - Main extension interface
   - Security status display
   - Access to settings

4. **Warning Page** (warning.html, warning.js):
   - Displayed when phishing is detected
   - Explanation of blocking reasons
   - Option to proceed at your own risk

### Verification Lifecycle:

1. User opens a web page
2. Content Script activates and analyzes the page
3. Features are passed to the machine learning model
4. If the page is identified as phishing, a warning is shown
5. User makes a decision about further actions

## Build Process

CorgPhish uses an automated build process to create the ready-to-use extension.

<div align="center">
  <img src="images/build_process.png" alt="Build Process" width="650"/>
  <p><em>Project build process diagram</em></p>
</div>

### Build Stages:

1. **Model Preparation**:
   - Loading the trained XGBoost model
   - Export to JavaScript
   - Size and performance optimization

2. **Extension Assembly**:
   - Copying files to the build directory
   - JavaScript and CSS minification
   - Image optimization

3. **Distribution Creation**:
   - Packaging the extension in a ZIP archive for Chrome
   - Creating an XPI package for Firefox
   - Generating metadata for extension stores

### Automation:

The build process is automated using Python scripts:
- **build.py**: Main build script
- **scripts/cleanup.py**: Temporary file cleanup
- **scripts/package.py**: Creating distribution packages

## Testing

CorgPhish includes a comprehensive testing system to ensure high quality and reliability.

<div align="center">
  <img src="images/testing.png" alt="Testing System" width="600"/>
  <p><em>CorgPhish testing system</em></p>
</div>

### Test Types:

1. **Unit Tests**:
   - Testing individual components
   - Checking feature extraction functions
   - Testing the model on control examples

2. **Integration Tests**:
   - Verifying interaction between components
   - Testing API communication
   - Joint operation of modules

3. **Functional Tests**:
   - Testing the complete analysis process
   - Checking UI and user scenarios
   - Testing on real phishing examples

4. **Performance**:
   - Measuring page analysis time
   - Checking memory consumption
   - Testing under high load

### Demonstration Environment:

A special demonstration environment has been created for testing under controlled conditions:
- Set of phishing page examples for testing
- Legitimate sites with similar characteristics
- Local server for emulating various conditions

## Mobile Platforms

As part of expanding CorgPhish functionality, a mobile version is being developed.

<div align="center">
  <img src="images/mobile.png" alt="Mobile Version" width="550"/>
  <p><em>CorgPhish mobile version concept</em></p>
</div>

### Mobile Components:

1. **Mobile SDK**:
   - Integration with mobile browsers
   - Optimized version of the ML model
   - UI adaptation for mobile devices

2. **Mobile Version Features**:
   - Increased energy efficiency
   - Optimization for operation on low-end devices
   - Integration with mobile OS security systems

3. **Current Status**:
   - Android prototype development
   - Research on iOS possibilities
   - ML model adaptation for mobile devices

## Additional Features

CorgPhish offers a number of additional features to enhance user security.

<div align="center">
  <img src="images/additional_features.png" alt="Additional Features" width="650"/>
  <p><em>Additional security features of CorgPhish</em></p>
</div>

### Advanced Features:

1. **Google Safe Browsing Integration**:
   - URL verification through Google API
   - Combination with local analysis results
   - Increasing detection reliability

2. **Verification History**:
   - Saving results of previous checks
   - Ability to view history
   - Statistics of detected threats

3. **Security Settings**:
   - Adjusting detection sensitivity level
   - Selecting actions when phishing is detected
   - Notification settings

4. **Feedback**:
   - Ability to report false positives
   - Submitting reports about new phishing sites
   - Using feedback to improve the model

## Development Roadmap

The CorgPhish project is actively developing, taking into account new threats and security technologies.

<div align="center">
  <img src="images/roadmap.png" alt="Development Roadmap" width="700"/>
  <p><em>CorgPhish project development roadmap</em></p>
</div>

### Short-term Plans (3-6 months):

1. **Improving Model Accuracy**:
   - Expanding the training dataset
   - Adding new phishing indicators
   - Optimizing the classification algorithm

2. **Expanding Functionality**:
   - Adding verification history
   - Improving the user interface
   - Expanding integration with external APIs

3. **Performance Enhancement**:
   - JavaScript code optimization
   - Reducing memory consumption
   - Accelerating page analysis

### Medium-term Plans (6-12 months):

1. **Mobile Support**:
   - Releasing mobile version for Android
   - Developing solution for iOS
   - Cross-platform synchronization

2. **Cloud Integration**:
   - Creating cloud API for model updates
   - Anonymous statistics collection system
   - Centralized updating of phishing indicators

3. **Advanced Protection**:
   - Malware detection
   - Protection from scam sites
   - Warning about potential frauds

### Long-term Plans (1-2 years):

1. **Creating a Security Ecosystem**:
   - Integration with antivirus products
   - Corporate security solutions
   - API for developers

2. **Research on New Detection Methods**:
   - Applying neural networks for image analysis
   - Detection of complex attacks using AI
   - Proactive protection against emerging threats

3. **International Expansion**:
   - Support for additional languages
   - Adaptation to regional phishing characteristics
   - Collaboration with international security organizations

## Conclusion

CorgPhish represents a comprehensive solution for protection against phishing attacks, combining advanced machine learning technologies with a user-friendly interface. Local operation, multi-factor analysis, and high detection accuracy make CorgPhish an effective tool for ensuring security on the internet.

Project development continues, with constant improvement of functionality and adaptation to new types of threats. An active community of users and developers contributes to the development and improvement of CorgPhish.

For additional information, visit the [official project repository](https://github.com/physcorgi/CorgPhish) or contact the development team. 