# CorgPhish User Guide

This comprehensive guide will help you understand and use all the features of CorgPhish effectively to protect yourself from phishing attempts.

## Table of Contents

- [Getting Started](#getting-started)
- [Understanding the Interface](#understanding-the-interface)
- [Security Features](#security-features)
  - [Real-time Protection](#real-time-protection)
  - [Deep Scanning](#deep-scanning)
  - [Google Safe Browsing Integration](#google-safe-browsing-integration)
- [Customizing Settings](#customizing-settings)
- [Managing Alerts](#managing-alerts)
- [Analytics Dashboard](#analytics-dashboard)
- [Whitelisting Websites](#whitelisting-websites)
- [Updating the Extension](#updating-the-extension)
- [Troubleshooting](#troubleshooting)
- [Privacy Information](#privacy-information)

## Getting Started

After [installing CorgPhish](./INSTALLATION.md), you'll see the extension icon in your browser toolbar. The icon will be:
- 🟢 Green when no threats are detected
- 🟠 Orange when suspicious activity is detected
- 🔴 Red when dangerous phishing activity is detected

Click the icon to open the extension popup for more details and options.

## Understanding the Interface

The CorgPhish interface consists of several components:

### Main Popup

When you click the CorgPhish icon, you'll see:
- **Status indicator**: Shows if the current site is safe, suspicious, or dangerous
- **Site details**: Information about the current website
- **Threat details**: If threats are detected, details will be displayed here
- **Quick actions**: Buttons to whitelist the site, report a false positive, or open settings

### Settings Page

Access the settings page by clicking the gear icon in the popup. Here you can:
- Enable/disable protection features
- Customize alert behavior
- Set up the whitelist
- Configure integrations
- Access the analytics dashboard

## Security Features

### Real-time Protection

CorgPhish continuously monitors your browsing activity to detect phishing attempts:

- **URL Analysis**: Checks for suspicious URL patterns and known phishing domains
- **Content Analysis**: Examines page content for phishing indicators
- **Form Detection**: Identifies suspicious forms that might steal your credentials
- **Link Analysis**: Analyzes links on the page for potential deception

This protection runs automatically in the background with minimal performance impact.

### Deep Scanning

For enhanced security, enable Deep Scanning in the settings. This feature:

- Performs a more thorough analysis of web pages
- Detects hidden elements that might be used for phishing
- Identifies obfuscated code that could be malicious
- Monitors redirect chains that might lead to phishing sites
- Analyzes iframes and embedded content

Note: Deep Scanning may slightly increase resource usage.

### Google Safe Browsing Integration

CorgPhish can integrate with Google Safe Browsing API for additional protection:

1. In the Settings page, navigate to the "Google Safe Browsing" section
2. Enter your API key (obtain one from [Google Cloud Console](https://console.cloud.google.com/))
3. Click "Verify & Save" to enable the integration

This provides an additional layer of protection using Google's extensive database of unsafe websites.

## Customizing Settings

To customize CorgPhish settings:

1. Click the CorgPhish icon in your browser toolbar
2. Click the gear icon to open Settings
3. Adjust the following options:

- **Protection Level**: Choose between Standard and Enhanced
- **Notification Settings**: Control how and when you receive alerts
- **Deep Scanning**: Enable or disable thorough page analysis
- **Dark Theme**: Switch between light and dark interface
- **Whitelist Management**: Add trusted sites to bypass checking

## Managing Alerts

When CorgPhish detects potential threats, it will alert you based on your settings:

- **Browser Notifications**: Pop-up notifications for high-risk threats
- **In-page Warnings**: Banners at the top of suspicious pages
- **Icon Changes**: The toolbar icon changes color based on threat level

You can:
- Dismiss alerts after reviewing them
- Report false positives if you believe a site was incorrectly flagged
- Take recommended actions to protect yourself

## Analytics Dashboard

CorgPhish includes an analytics dashboard to help you understand your protection status:

1. Open Settings and click "Analytics" in the navigation menu
2. View statistics including:
   - Sites checked
   - Phishing attempts blocked
   - Most common threat types detected
   - Protection activity over time

This information helps you understand how CorgPhish is protecting you.

## Whitelisting Websites

If you know a website is safe and want to prevent CorgPhish from scanning it:

1. While on the trusted website, click the CorgPhish icon
2. Click "Add to Whitelist" in the popup
3. Confirm your choice

Alternatively, in Settings:
1. Go to the "Whitelist" section
2. Enter domains manually (one per line)
3. Click "Save" to update your whitelist

You can remove sites from your whitelist at any time.

## Updating the Extension

CorgPhish updates automatically in most browsers. To check for updates manually:

1. Go to your browser's extension management page
2. Find CorgPhish in the list
3. Click "Update" if available

The extension also automatically updates its threat detection models. You can manually update the models in Settings under "ML Model Updates".

## Troubleshooting

If you encounter issues with CorgPhish:

- **Extension not responding**: Try refreshing the page or restarting your browser
- **High CPU usage**: Temporarily disable Deep Scanning in settings
- **Incorrect site analysis**: Report false positives through the popup menu
- **Extension conflicts**: Check if other security extensions are interfering

For persistent issues, please:
1. Check our [FAQ](./FAQ.md)
2. Create an issue on [GitHub](https://github.com/physcorgi/CorgPhish/issues)

## Privacy Information

CorgPhish respects your privacy:

- No browsing history is stored or transmitted to external servers
- All analysis happens locally on your device
- Only anonymous statistics are collected if you opt in
- No personal information is gathered or shared

You can review our complete [Privacy Policy](../PRIVACY.md) for more information.

---

For additional help, visit our [GitHub repository](https://github.com/physcorgi/CorgPhish) or contact support at support@corgphish.com. 