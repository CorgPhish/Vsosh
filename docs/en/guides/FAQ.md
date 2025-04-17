# Frequently Asked Questions (FAQ)

This document answers common questions about the CorgPhish browser extension. If you don't find the answer you're looking for, please contact us at support@corgphish.com or create an issue on our [GitHub repository](https://github.com/physcorgi/CorgPhish/issues).

## Table of Contents

- [General Questions](#general-questions)
- [Installation](#installation)
- [Features and Usage](#features-and-usage)
- [Alerts and Security](#alerts-and-security)
- [Settings and Customization](#settings-and-customization)
- [Privacy and Data](#privacy-and-data)
- [Troubleshooting](#troubleshooting)
- [Technical Questions](#technical-questions)

## General Questions

### What is CorgPhish?

CorgPhish is an intelligent browser extension that protects you from phishing attacks using advanced machine learning algorithms. It analyzes websites in real-time to detect and alert you to potential phishing attempts, helping you stay safe online.

### How does CorgPhish work?

CorgPhish uses a multi-factor analysis approach to detect phishing:
1. It examines the URL structure and domain information
2. It analyzes page content, forms, and scripts
3. It identifies suspicious elements like hidden fields and obfuscated code
4. It checks for impersonation attempts of legitimate websites
All this happens locally on your device, ensuring privacy and quick response times.

### Is CorgPhish free to use?

Yes, CorgPhish is completely free. The project is open-source and maintained by a community of security professionals and volunteers.

### Which browsers are supported?

CorgPhish supports:
- Google Chrome (version 80 and later)
- Mozilla Firefox (version 78 and later)
- Microsoft Edge (version 80 and later)
- Opera (version 67 and later)

## Installation

### How do I install CorgPhish?

Please see our [Installation Guide](./INSTALLATION.md) for detailed instructions for each supported browser.

### Why does CorgPhish need so many permissions?

CorgPhish requests access to:
- **Web page content**: To analyze pages for phishing indicators
- **Browser tabs**: To show alerts and provide protection in real-time
- **Storage**: To save your settings and whitelist
- **Notifications**: To alert you about detected threats

These permissions are necessary for the extension to function effectively. CorgPhish does not collect or transmit your browsing data.

### Can I install CorgPhish in incognito/private browsing mode?

Yes. After installation, you'll need to:
1. Go to your browser's extension management page
2. Find CorgPhish and click "Details"
3. Enable "Allow in incognito" or equivalent option

## Features and Usage

### What's the difference between Standard and Enhanced protection?

- **Standard Protection**: Provides basic phishing detection with minimal performance impact
- **Enhanced Protection**: Enables more thorough scanning, including Deep Scanning features, for maximum security but may slightly affect performance on some websites

### What is Deep Scanning?

Deep Scanning is a feature that performs a more comprehensive analysis of web pages:
- Examines hidden elements that might contain malicious content
- Analyzes script behavior for suspicious patterns
- Checks for obfuscated code that might hide malicious intent
- Monitors redirect chains that could lead to phishing sites
- Inspects iframes and cross-domain references

### Does CorgPhish slow down my browsing?

CorgPhish is designed to have minimal impact on browsing speed. In standard mode, the performance impact is negligible. Deep Scanning may cause slight delays on complex pages, but most users won't notice a difference.

### Can I use CorgPhish alongside other security extensions?

Yes, CorgPhish is compatible with most security extensions. However, running multiple security tools may occasionally cause conflicts or performance issues. If you experience problems, try temporarily disabling other security extensions to identify the source.

## Alerts and Security

### What do the different alert colors mean?

- **Green**: The site appears safe
- **Yellow/Orange**: Some suspicious elements detected, proceed with caution
- **Red**: High probability of phishing, avoid entering information

### What should I do if I get a phishing alert?

If you receive a red (high-risk) alert:
1. Do not enter any personal information on the site
2. Leave the page immediately
3. If you believe it's a legitimate site incorrectly flagged, you can report it as a false positive

### How accurate is CorgPhish?

Based on our testing, CorgPhish has:
- 96.8% overall accuracy
- 95.2% precision (low false positive rate)
- 94.5% recall (low false negative rate)
- 0.949 F1 score

These metrics are continuously improving as our machine learning models are updated.

### What if CorgPhish misses a phishing site?

If you encounter a phishing site that CorgPhish didn't detect:
1. Click the CorgPhish icon
2. Select "Report Missed Phishing"
3. Complete the form with details about the site

Your report helps improve our detection capabilities for everyone.

## Settings and Customization

### How do I add a site to the whitelist?

To add a site to your whitelist:
1. While on the website, click the CorgPhish icon
2. Select "Add to Whitelist"
3. Confirm your choice

Alternatively, in Settings > Whitelist, you can manually add domains (one per line).

### How do I set up Google Safe Browsing integration?

1. Obtain an API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. In CorgPhish Settings, go to the "Google Safe Browsing" section
3. Enter your API key
4. Click "Verify & Save"

### Can I disable notifications?

Yes, in Settings > Notification Settings, you can:
- Disable browser notifications completely
- Choose to receive notifications only for high-risk threats
- Adjust the display duration of in-page warnings

### How often does CorgPhish update its detection models?

By default, CorgPhish checks for model updates weekly. You can manually update or change the frequency in Settings > ML Model Updates.

## Privacy and Data

### Does CorgPhish collect my browsing data?

No. All website analysis happens locally on your device. CorgPhish does not store or transmit your browsing history or the content of pages you visit.

### What information does CorgPhish collect?

If you opt in to anonymous statistics (disabled by default), CorgPhish may collect:
- Anonymized counts of phishing sites detected
- Types of phishing techniques identified
- Performance metrics of the extension

No personally identifiable information or browsing history is ever collected.

### Where is my whitelist stored?

Your whitelist and settings are stored locally in your browser's extension storage. They are not uploaded to any server unless you explicitly use a sync feature provided by your browser.

## Troubleshooting

### CorgPhish isn't detecting a known phishing site

This could happen for several reasons:
- The site is using new techniques not yet in our detection models
- The page hasn't fully loaded before analysis
- Your extension might need updating

Try enabling Deep Scanning and refreshing the page. If it still isn't detected, please report it to help improve our models.

### CorgPhish is causing high CPU usage

If you notice performance issues:
1. Disable Deep Scanning when not needed
2. Check if you have multiple security extensions running
3. Update to the latest version
4. If problems persist, please report the issue with details about when it occurs

### My settings aren't saving

This could be due to:
- Browser storage restrictions
- Conflicts with other extensions
- Browser sync issues

Try refreshing the settings page, restarting your browser, or temporarily disabling other extensions.

## Technical Questions

### How does the machine learning model work?

CorgPhish uses a combination of feature extraction and classification:
1. We extract hundreds of features from websites, including URL patterns, HTML structure, form elements, and scripts
2. These features are processed by a trained neural network that classifies the site as safe, suspicious, or dangerous
3. The model is trained on a dataset of known legitimate and phishing websites
4. Regular updates improve detection accuracy and adapt to new phishing techniques

### Can I contribute to CorgPhish?

Absolutely! CorgPhish is open-source and we welcome contributions. Visit our [GitHub repository](https://github.com/physcorgi/CorgPhish) and check out the CONTRIBUTING.md file for guidelines.

### Is there an API for CorgPhish?

We don't currently offer a public API for external applications. If you're interested in integrating with CorgPhish, please contact us to discuss potential collaboration.

### How is CorgPhish different from other anti-phishing tools?

CorgPhish distinguishes itself through:
- Advanced machine learning models trained specifically for phishing detection
- Multi-factor analysis that examines numerous aspects of a website
- Deep Scanning capabilities that detect sophisticated phishing techniques
- Entirely local analysis for better privacy and performance
- Regular model updates to adapt to evolving threats
- Open-source development allowing for community contributions and auditing

---

If you have additional questions not covered here, please reach out to support@corgphish.com or visit our [community forum](https://github.com/physcorgi/CorgPhish/discussions). 