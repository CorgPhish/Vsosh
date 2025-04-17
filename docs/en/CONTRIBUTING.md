# Contributing to CorgPhish

Thank you for your interest in contributing to CorgPhish! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Environment](#development-environment)
  - [Setting Up](#setting-up)
  - [Running Tests](#running-tests)
  - [Building the Extension](#building-the-extension)
- [Coding Guidelines](#coding-guidelines)
  - [JavaScript](#javascript)
  - [HTML and CSS](#html-and-css)
  - [Machine Learning Components](#machine-learning-components)
- [Commit Messages](#commit-messages)
- [Documentation](#documentation)
- [Translation Guidelines](#translation-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by the [CorgPhish Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to maintainers@corgphish.com.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for CorgPhish. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

Before creating bug reports, please check [this list](https://github.com/physcorgi/CorgPhish/issues) to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible.

**How Do I Submit A Good Bug Report?**

Bugs are tracked as [GitHub issues](https://github.com/physcorgi/CorgPhish/issues). Create an issue and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.
* **If the problem is related to performance or memory**, include a CPU profile capture with your report.
* **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for CorgPhish, including completely new features and minor improvements to existing functionality.

**How Do I Submit A Good Enhancement Suggestion?**

Enhancement suggestions are tracked as [GitHub issues](https://github.com/physcorgi/CorgPhish/issues). Create an issue and provide the following information:

* **Use a clear and descriptive title** for the issue to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**.
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part of CorgPhish which the suggestion is related to.
* **Explain why this enhancement would be useful** to most CorgPhish users.
* **List some other tools or applications where this enhancement exists.**
* **Specify which version of CorgPhish you're using.**

### Your First Code Contribution

Unsure where to begin contributing to CorgPhish? You can start by looking through these `beginner` and `help-wanted` issues:

* [Beginner issues](https://github.com/physcorgi/CorgPhish/labels/good%20first%20issue) - issues which should only require a few lines of code, and a test or two.
* [Help wanted issues](https://github.com/physcorgi/CorgPhish/labels/help%20wanted) - issues which should be a bit more involved than `beginner` issues.

### Pull Requests

The process described here has several goals:

- Maintain CorgPhish's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible CorgPhish
- Enable a sustainable system for CorgPhish's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. Follow the [styleguides](#coding-guidelines)
2. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

## Development Environment

### Setting Up

To set up the development environment for CorgPhish, follow these steps:

1. Fork the repository and clone it to your local machine:
   ```bash
   git clone https://github.com/yourusername/CorgPhish.git
   cd CorgPhish
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Create a branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Running Tests

CorgPhish uses automated testing to ensure code quality. Run the tests with:

```bash
npm test
```

For specific test suites:

```bash
npm run test:unit    # Unit tests
npm run test:e2e     # End-to-end tests
npm run test:ml      # Machine learning model tests
```

### Building the Extension

To build the extension for development:

```bash
npm run build:dev
```

For production builds:

```bash
npm run build
```

To load the extension in your browser:

1. Chrome/Edge: Go to `chrome://extensions/`, enable Developer mode, and click "Load unpacked". Select the `dist` directory.
2. Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist` directory.

## Coding Guidelines

### JavaScript

- Use ES6+ features where appropriate
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Include JSDoc comments for functions and complex code blocks
- Ensure code is compatible with supported browsers

Example:

```javascript
/**
 * Analyzes a URL for phishing indicators
 * @param {string} url - The URL to analyze
 * @param {Object} options - Analysis options
 * @return {Object} Analysis results with risk score
 */
function analyzeUrl(url, options = {}) {
  // Implementation
}
```

### HTML and CSS

- Use semantic HTML5 elements
- Follow BEM methodology for CSS class naming
- Ensure responsive design for all UI components
- Maintain accessibility standards (WCAG 2.1)
- Test on all supported browsers

### Machine Learning Components

- Document data preprocessing steps
- Include model evaluation metrics
- Provide sample data for testing
- Ensure feature extraction is efficient and browser-compatible
- Document model limitations and edge cases

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line
- Consider using the following format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

Example:
```
feat: add deep scanning for hidden iframe content

- Implement recursive iframe scanning
- Add detection for cross-domain iframes
- Create tests for iframe analysis

Fixes #123
```

## Documentation

- Update the README.md with details of changes to the interface
- Update the docs with new features, command-line options, or environment changes
- Maintain up-to-date inline documentation and comments
- Create markdown documentation for complex features

## Translation Guidelines

If you're contributing translations:

1. Clone the repository and create a branch for your translation
2. Copy the template files from `docs/en/` to a new directory matching your language code (e.g., `docs/es/` for Spanish)
3. Translate the text, maintaining all markdown formatting and technical terms
4. Do not translate:
   - Code examples
   - Variable names
   - Technical terms without established translations
   - URLs
5. Submit a pull request with your translations

---

Thank you for contributing to CorgPhish! Your efforts help make the web safer for everyone. 