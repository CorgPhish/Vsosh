# CorgPhish: Intelligent Phishing Protection System

<div align="center">
  <img src="docs/images/corgphish_logo.png" alt="CorgPhish Logo" width="200"/>
  <br/>
  
  [![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/physcorgi/CorgPhish/releases)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.md)
  [![Build Status](https://img.shields.io/github/workflow/status/physcorgi/CorgPhish/Build%20and%20Test)](https://github.com/physcorgi/CorgPhish/actions)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)
  [![Stars](https://img.shields.io/github/stars/physcorgi/CorgPhish?style=social)](https://github.com/physcorgi/CorgPhish/stargazers)
  [![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](docs/CODE_OF_CONDUCT.md)
  [![Security Policy](https://img.shields.io/badge/security-policy-brightgreen.svg)](docs/SECURITY.md)
  [![Last Commit](https://img.shields.io/github/last-commit/physcorgi/CorgPhish)](https://github.com/physcorgi/CorgPhish/commits/master)
  
  <h3>🔒 Smart Real-time Phishing Protection 🔒</h3>
  
  <p>
    <a href="docs/en/INSTALLATION.md">Installation</a> •
    <a href="docs/en/guides/USER_GUIDE.md">Documentation</a> •
    <a href="docs/en/CONTRIBUTING.md">Contribute</a> •
    <a href="https://github.com/physcorgi/CorgPhish/issues">Report Bug</a> •
    <a href="https://github.com/physcorgi/CorgPhish/discussions">Discussions</a>
  </p>
  
  <img src="docs/images/demo.gif" alt="CorgPhish Demo" width="700"/>
</div>

## 🚀 Key Features

- **Real-time Phishing Detection**: Analyzes web pages in real-time to identify potential phishing attempts.
- **Autonomous Operation**: Works independently without requiring constant user input.
- **Multi-factor Analysis**: Uses over 58 indicators to accurately identify phishing, including URL structure, domain age, SSL certificates, and page content.
- **Visual Alerts**: Provides clear visual warnings when phishing is detected.
- **Google Safe Browsing Integration**: Leverages Google's database of known malicious sites for enhanced protection.
- **Deep Scanning Mode**: Performs thorough analysis of hidden elements, obfuscated code, and redirects for advanced protection.
- **Analytics Dashboard**: View statistics on checked sites, detected threats, and phishing feature distribution.
- **Machine Learning Model Updates**: Keeps the detection system current with the latest phishing techniques.

## 📊 Effectiveness

Our intelligent detection system has demonstrated high effectiveness in identifying phishing sites:

| Metric | Value |
|--------|-------|
| Accuracy | 96.8% |
| Precision | 95.2% |
| Recall | 94.5% |
| F1 Score | 0.949 |

## 🔍 How It Works

CorgPhish uses a combination of machine learning algorithms and heuristic analysis to protect you from phishing:

1. **Data Collection**: When you visit a website, CorgPhish analyzes its structure and content.
2. **Feature Extraction**: The system extracts over 58 different features from the website.
3. **Analysis**: Our ML model processes these features to determine if the site is legitimate or a phishing attempt.
4. **Decision**: Based on the analysis, CorgPhish provides an instant alert if it detects a potential threat.
5. **Deep Scan**: For suspicious pages, a more thorough analysis can be performed to detect hidden malicious elements.

## 📷 Screenshots

<div align="center">
  <img src="docs/images/screenshot1.png" alt="CorgPhish Detection" width="400"/>
  <img src="docs/images/screenshot2.png" alt="CorgPhish Settings" width="400"/>
</div>

## ⚡ Quick Start

### Install from Chrome Web Store

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "CorgPhish"
3. Click "Add to Chrome"

### Install from Source

```bash
# Clone the repository
git clone https://github.com/physcorgi/CorgPhish.git

# Navigate to the extension directory
cd CorgPhish

# Install dependencies
npm install

# Build the extension
npm run build

# Load the extension in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the "dist" folder
```

## 🛠️ Technologies

### Frontend
- HTML/CSS/JavaScript
- React
- Redux
- D3.js (for analytics visualizations)

### Machine Learning
- TensorFlow.js
- scikit-learn (for model training)
- Feature extraction algorithms

## 📚 Documentation

- [Installation Guide](docs/en/INSTALLATION.md)
- [User Guide](docs/en/guides/USER_GUIDE.md)
- [Developer Guide](docs/en/guides/DEVELOPER_GUIDE.md)
- [API Documentation](docs/en/API.md)
- [Machine Learning Model](docs/en/ML_MODEL.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](docs/en/CONTRIBUTING.md) and [Code of Conduct](docs/en/CODE_OF_CONDUCT.md) before submitting a pull request.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## 📢 Contact

- Project Website: [https://physcorgi.github.io/CorgPhish](https://physcorgi.github.io/CorgPhish)
- GitHub: [https://github.com/physcorgi/CorgPhish](https://github.com/physcorgi/CorgPhish)
- Email: physcorgi@proton.me
- Telegram: @physcorgi

---

<div align="center">
    <p>
        <em>Protect your data.<br/>
        Stay one step ahead of cybercriminals.</em>
    </p>
    <p>
        <strong>CorgPhish</strong> - Intelligent Phishing Protection<br/>
        <strong>Release Date:</strong> April 18, 2025 | <strong>Version:</strong> 1.0.1
    </p>
    <img src="https://img.shields.io/github/stars/physcorgi/CorgPhish?style=social" alt="Stars"/>
    <img src="https://img.shields.io/github/forks/physcorgi/CorgPhish?style=social" alt="Forks"/>
</div> 