# Contributing to CorgPhish

Thank you for your interest in contributing to CorgPhish! This document provides guidelines and instructions for contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Making Contributions](#making-contributions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](../CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Set up the development environment** (see below)
4. **Create a new branch** for your feature or fix
5. **Make your changes**
6. **Submit a pull request**

## Development Environment

### Prerequisites

- Node.js (v14 or higher)
- Python 3.8+ (for ML model training)
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/CorgPhish.git
cd CorgPhish

# Install dependencies
npm install

# Install Python dependencies (for ML development)
pip install -r requirements.txt

# Build the extension
npm run build
```

### Running Locally

To load the extension in Chrome for testing:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` directory from your project

## Making Contributions

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: If you find a bug, please open an issue first, then submit a pull request with the fix
- **Feature enhancements**: New features that improve the functionality of CorgPhish
- **Documentation**: Improvements to documentation, tutorials, or examples
- **Machine learning model improvements**: Enhancements to our phishing detection model
- **UI/UX improvements**: Making the extension more user-friendly

### Choosing Issues

- Check the [Issues](https://github.com/physcorgi/CorgPhish/issues) page for open tasks
- Look for issues labeled `good-first-issue` if you're new to the project
- Comment on an issue if you're planning to work on it

## Pull Request Process

1. **Create a new branch** from `main` (or `develop` if it exists)
2. **Make your changes** in that branch
3. **Write or update tests** if necessary
4. **Update documentation** to reflect your changes
5. **Run the test suite** to ensure everything passes
6. **Submit your pull request** targeting the appropriate branch

### Pull Request Checklist

Before submitting your pull request, make sure:

- Your code follows our coding standards
- All tests pass
- You've added new tests for your feature/fix if applicable
- Documentation is updated
- The PR description clearly describes the changes

## Coding Standards

We follow strict coding standards to maintain code quality:

### JavaScript/TypeScript

- Follow the [ESLint](../.eslintrc.json) rules in the project
- Use ES6+ features where appropriate
- Add JSDoc comments for functions and classes

### Python (ML Components)

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide
- Use type hints where appropriate
- Document functions and modules

### General Guidelines

- Write clear, descriptive commit messages
- Keep code modular and maintainable
- Avoid duplicating code
- Prefer readability over clever code

## Testing

All code contributions should be tested:

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test interactions between components
- **End-to-end tests**: Test the full user flow

Run tests with:

```bash
# Run JavaScript tests
npm test

# Run Python tests (for ML components)
python -m pytest tests/
```

## Documentation

Good documentation is crucial:

- Update the README if you change key functionality
- Add JSDoc comments to your code
- Update or create tutorial docs for new features
- Keep API documentation up to date

## Community

Join our community:

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Chat**: Join our [Telegram group](https://t.me/corgphish_community)
- **Issues**: Report bugs or suggest features through GitHub Issues

---

Thank you for contributing to CorgPhish! Your efforts help make the web a safer place. 