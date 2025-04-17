# CorgPhish

<p align="center">
  <img src="../../assets/logo.png" alt="CorgPhish Logo" width="200"/>
</p>

<p align="center">
  <a href="https://github.com/physcorgi/CorgPhish/releases/latest"><img src="https://img.shields.io/github/v/release/physcorgi/CorgPhish" alt="Latest Release"></a>
  <a href="https://github.com/physcorgi/CorgPhish/blob/master/LICENSE"><img src="https://img.shields.io/github/license/physcorgi/CorgPhish" alt="License"></a>
  <a href="https://github.com/physcorgi/CorgPhish/actions"><img src="https://img.shields.io/github/workflow/status/physcorgi/CorgPhish/build" alt="Build Status"></a>
</p>

## Intelligent Phishing Protection System

CorgPhish is a browser extension that provides real-time protection against phishing attacks using advanced machine learning algorithms and multi-factor analysis. It's designed to be lightweight, effective, and user-friendly.

## Key Features

- **Real-time Detection**: Analyzes websites as you browse to identify phishing attempts immediately
- **AI/ML Powered**: Uses machine learning to detect even sophisticated phishing sites that traditional tools might miss
- **Multi-factor Analysis**: Examines URLs, visual elements, forms, scripts, and more to determine risk level
- **Visual Alerts**: Clear, color-coded warnings when potential threats are detected
- **Deep Scan Mode**: Enhanced analysis for high-risk websites or when entering sensitive information
- **Low Resource Usage**: Designed to run efficiently with minimal impact on browsing experience
- **Google Safe Browsing Integration**: Optional connection to Google's database of unsafe websites
- **Detailed Analytics**: View statistics about protection activity and threat patterns
- **Privacy-focused**: All analysis happens locally on your device

## Installation

### Quick Setup

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/corgphish/), [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/corgphish/) or [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/corgphish/)
2. Click "Add to [Browser]"
3. Complete the first-time setup wizard

### From Source

```bash
# Clone the repository
git clone https://github.com/physcorgi/CorgPhish.git

# Install dependencies
cd CorgPhish
npm install

# Build the extension
npm run build

# Load the extension in your browser from the dist/ directory
```

## Effectiveness

Independent testing of CorgPhish has demonstrated:

- **Accuracy**: 96.8%
- **Precision**: 95.2%
- **Recall**: 94.5%
- **F1-score**: 0.949

## Documentation

- [User Guide](./guides/USER_GUIDE.md) - Comprehensive instructions for using CorgPhish
- [Installation Guide](./guides/INSTALLATION.md) - Detailed installation instructions for different browsers
- [FAQ](./guides/FAQ.md) - Answers to frequently asked questions
- [Security](../SECURITY.md) - Security policies and vulnerability reporting
- [Contributing](../CONTRIBUTING.md) - Guidelines for contributors
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community guidelines

## Technical Details

CorgPhish is built with:

- **Frontend**: JavaScript, HTML, CSS
- **Machine Learning**: TensorFlow.js, Custom Neural Network Architecture
- **Development**: Webpack, Babel, ESLint
- **Testing**: Jest, Puppeteer

## Roadmap

- Mobile browser support
- Enterprise management features
- Real-time threat intelligence sharing (opt-in)
- Enhanced language support
- Additional machine learning model improvements

## Contact

- **Email**: contact@corgphish.com
- **Website**: https://corgphish.com
- **GitHub Issues**: For bug reports and feature requests

## License

CorgPhish is released under the [MIT License](https://github.com/physcorgi/CorgPhish/blob/master/LICENSE). 