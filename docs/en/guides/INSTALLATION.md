# CorgPhish Installation Guide

This guide provides detailed instructions for installing CorgPhish in different browsers and environments.

## Table of Contents

- [Browser Extension Installation](#browser-extension-installation)
  - [Chrome](#chrome)
  - [Firefox](#firefox)
  - [Edge](#edge)
  - [Opera](#opera)
- [Installation from Source](#installation-from-source)
  - [Prerequisites](#prerequisites)
  - [Build and Install](#build-and-install)
- [Verifying Installation](#verifying-installation)
- [Troubleshooting](#troubleshooting)

## Browser Extension Installation

### Chrome

1. Visit the [CorgPhish page on Chrome Web Store](https://chrome.google.com/webstore/detail/corgphish/)
2. Click **Add to Chrome**
3. In the popup dialog, click **Add extension**
4. After installation, a CorgPhish icon will appear in your browser toolbar
5. Click the icon to complete the initial setup

### Firefox

1. Visit the [CorgPhish page on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/corgphish/)
2. Click **Add to Firefox**
3. In the popup dialog, click **Add**
4. If prompted, click **Okay, Got It** to confirm the permissions
5. After installation, a CorgPhish icon will appear in your browser toolbar
6. Click the icon to complete the initial setup

### Edge

1. Visit the [CorgPhish page on Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/corgphish/)
2. Click **Get**
3. In the popup dialog, click **Add extension**
4. After installation, a CorgPhish icon will appear in your browser toolbar
5. Click the icon to complete the initial setup

### Opera

1. Visit the [CorgPhish page on Opera Add-ons](https://addons.opera.com/en/extensions/details/corgphish/)
2. Click **Add to Opera**
3. In the popup dialog, click **Install**
4. After installation, a CorgPhish icon will appear in your browser toolbar
5. Click the icon to complete the initial setup

## Installation from Source

### Prerequisites

- Git
- Node.js (version 14 or higher)
- npm (version 6 or higher)

To check if you have Node.js and npm installed, run:

```bash
node --version
npm --version
```

### Build and Install

1. Clone the repository:

```bash
git clone https://github.com/physcorgi/CorgPhish.git
cd CorgPhish
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

This creates a `dist` directory with the built extension files.

4. Install in your browser:

#### Chrome/Edge/Opera:
- Navigate to `chrome://extensions/` (Chrome), `edge://extensions/` (Edge), or `opera://extensions/` (Opera)
- Enable **Developer mode** by toggling the switch in the top-right corner
- Click **Load unpacked**
- Select the `dist` directory from your CorgPhish folder

#### Firefox:
- Navigate to `about:debugging#/runtime/this-firefox`
- Click **Load Temporary Add-on**
- Select the `manifest.json` file in the `dist` directory

## Verifying Installation

After installation, you should:

1. See the CorgPhish icon in your browser toolbar
2. Click the icon to open the extension popup
3. Complete the initial setup process by following the on-screen instructions
4. The extension status should show as "Active"
5. Visit a known safe website (like google.com) and check that CorgPhish shows a green "Safe" indicator

## Troubleshooting

If you encounter issues during installation:

- **Extension not appearing in toolbar**: Try restarting your browser
- **Permissions denied**: Make sure you accept all required permissions during installation
- **Build errors**: Check that you're using compatible versions of Node.js and npm
- **Extension not working after installation**: 
  - Check if the extension is enabled in your browser's extension settings
  - Try reinstalling the extension
  - Ensure your browser is updated to the latest version

If problems persist, please:
1. Check our [FAQ](./FAQ.md) for common issues
2. Search for similar issues in our [GitHub Issues](https://github.com/physcorgi/CorgPhish/issues)
3. Create a new issue with details about your problem

---

For additional information about using CorgPhish after installation, please refer to the [User Guide](USER_GUIDE.md). 