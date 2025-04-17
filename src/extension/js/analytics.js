// Analytics Dashboard JavaScript

// DOM Elements
const totalSitesElement = document.getElementById('total-sites-checked');
const phishingDetectedElement = document.getElementById('phishing-detected');
const deepScanDetectionsElement = document.getElementById('deep-scan-detections');
const accuracyElement = document.getElementById('detection-accuracy');
const obfuscationMetricElement = document.getElementById('obfuscation-metric');
const hiddenElementsMetricElement = document.getElementById('hidden-elements-metric');
const detectionsListElement = document.getElementById('detections-list');
const domainTableBodyElement = document.getElementById('domain-stats-body');

// Chart contexts
const featureDistributionCtx = document.getElementById('feature-distribution-chart').getContext('2d');
const detectionTrendsCtx = document.getElementById('detection-trends-chart').getContext('2d');

// Analytics data
let analyticsData = {
  totalSitesChecked: 0,
  phishingDetected: 0,
  deepScanDetections: 0,
  detectionAccuracy: 0,
  obfuscationRate: 0,
  hiddenElementsRate: 0,
  recentDetections: [],
  domainStats: [],
  featureDistribution: {},
  detectionTrends: { dates: [], counts: [] }
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  // Load data from local storage or service worker
  loadAnalyticsData();
  
  // Initialize charts
  initCharts();
  
  // Update UI elements
  updateDashboard();
});

// Load analytics data from storage
async function loadAnalyticsData() {
  try {
    // Try to get data from local storage first
    const storedData = localStorage.getItem('corgphish_analytics');
    
    if (storedData) {
      analyticsData = JSON.parse(storedData);
    } else {
      // If no local data, request from service worker
      analyticsData = await requestDataFromServiceWorker();
    }
    
    // If no data yet, use sample data for testing
    if (!analyticsData || Object.keys(analyticsData).length === 0) {
      analyticsData = generateSampleData();
    }
  } catch (error) {
    console.error('Error loading analytics data:', error);
    analyticsData = generateSampleData();
  }
}

// Request data from service worker
async function requestDataFromServiceWorker() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getAnalyticsData' }, (response) => {
      if (response && response.data) {
        resolve(response.data);
      } else {
        resolve({});
      }
    });
  });
}

// Update all UI elements
function updateDashboard() {
  // Update stats cards
  totalSitesElement.textContent = formatNumber(analyticsData.totalSitesChecked);
  phishingDetectedElement.textContent = formatNumber(analyticsData.phishingDetected);
  deepScanDetectionsElement.textContent = formatNumber(analyticsData.deepScanDetections);
  accuracyElement.textContent = formatPercent(analyticsData.detectionAccuracy);
  
  // Update deep scan metrics
  updateDeepScanMetrics();
  
  // Update recent detections list
  updateRecentDetections();
  
  // Update domain stats table
  updateDomainStats();
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format percent with 1 decimal place
function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

// Update deep scan metrics
function updateDeepScanMetrics() {
  // Update obfuscation rate
  obfuscationMetricElement.querySelector('.metric-value').textContent = formatPercent(analyticsData.obfuscationRate);
  obfuscationMetricElement.querySelector('.progress').style.width = `${analyticsData.obfuscationRate * 100}%`;
  
  // Update hidden elements rate
  hiddenElementsMetricElement.querySelector('.metric-value').textContent = formatPercent(analyticsData.hiddenElementsRate);
  hiddenElementsMetricElement.querySelector('.progress').style.width = `${analyticsData.hiddenElementsRate * 100}%`;
}

// Update recent detections list
function updateRecentDetections() {
  // Clear current list
  detectionsListElement.textContent = '';
  
  // Check if we have detections
  if (analyticsData.recentDetections && analyticsData.recentDetections.length > 0) {
    analyticsData.recentDetections.forEach(detection => {
      const detectionItem = document.createElement('div');
      detectionItem.className = 'detection-item';
      
      // Format date
      const date = new Date(detection.timestamp);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      detectionItem.textContent = `
        <div class="domain-info">
          <div class="domain-name">${detection.domain}</div>
          <div class="detection-date">${formattedDate}</div>
        </div>
        <div class="detection-type">${detection.detectionType}</div>
      `;
      
      detectionsListElement.appendChild(detectionItem);
    });
  } else {
    // Show placeholder message
    detectionsListElement.textContent = 'Пока нет данных о обнаружениях';
  }
}

// Update domain stats table
function updateDomainStats() {
  // Clear current table
  domainTableBodyElement.textContent = '';
  
  // Check if we have domain stats
  if (analyticsData.domainStats && analyticsData.domainStats.length > 0) {
    analyticsData.domainStats.forEach(domainStat => {
      const row = document.createElement('tr');
      
      // Determine risk class
      let riskClass = 'low-risk';
      if (domainStat.riskLevel >= 0.7) {
        riskClass = 'high-risk';
      } else if (domainStat.riskLevel >= 0.4) {
        riskClass = 'medium-risk';
      }
      
      row.textContent = `
        <td>${domainStat.domain}</td>
        <td>${domainStat.detectionCount}</td>
        <td><span class="risk-level ${riskClass}">${getRiskLevelText(domainStat.riskLevel)}</span></td>
        <td>${formatDate(domainStat.lastDetected)}</td>
      `;
      
      domainTableBodyElement.appendChild(row);
    });
  } else {
    // Show placeholder row
    const row = document.createElement('tr');
    row.textContent = 'Нет данных о доменах';
    domainTableBodyElement.appendChild(row);
  }
}

// Get risk level text based on value
function getRiskLevelText(riskLevel) {
  if (riskLevel >= 0.7) {
    return 'Высокий';
  } else if (riskLevel >= 0.4) {
    return 'Средний';
  } else {
    return 'Низкий';
  }
}

// Format date
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}

// Initialize charts
function initCharts() {
  // Feature distribution chart
  new Chart(featureDistributionCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(analyticsData.featureDistribution),
      datasets: [{
        data: Object.values(analyticsData.featureDistribution),
        backgroundColor: [
          '#4a6da7',
          '#ff9800',
          '#4caf50',
          '#f44336',
          '#9c27b0',
          '#03a9f4'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 15,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${percentage}%`;
            }
          }
        }
      }
    }
  });
  
  // Detection trends chart
  new Chart(detectionTrendsCtx, {
    type: 'line',
    data: {
      labels: analyticsData.detectionTrends.dates,
      datasets: [{
        label: 'Обнаружено фишинговых сайтов',
        data: analyticsData.detectionTrends.counts,
        fill: true,
        backgroundColor: 'rgba(74, 109, 167, 0.2)',
        borderColor: '#4a6da7',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#4a6da7'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// Generate sample data for testing
function generateSampleData() {
  // Create dates for the past 7 days
  const dates = [];
  const counts = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
    
    // Generate random count between 5 and 25
    counts.push(Math.floor(Math.random() * 20) + 5);
  }
  
  // Generate random phishing detection features
  const featureDistribution = {
    'Suspicious URL': 35,
    'Fake Content': 25,
    'Credential Theft': 20,
    'Hidden Elements': 10,
    'Obfuscated Code': 5,
    'Redirects': 5
  };
  
  // Generate sample domain stats
  const domainStats = [
    {
      domain: 'faceb00k-security.com',
      detectionCount: 15,
      riskLevel: 0.9,
      lastDetected: Date.now() - 86400000 // 1 day ago
    },
    {
      domain: 'secure-paypaI.com',
      detectionCount: 8,
      riskLevel: 0.75,
      lastDetected: Date.now() - 172800000 // 2 days ago
    },
    {
      domain: 'netflix-account-verify.net',
      detectionCount: 6,
      riskLevel: 0.6,
      lastDetected: Date.now() - 259200000 // 3 days ago
    },
    {
      domain: 'googledocs-share.site',
      detectionCount: 4,
      riskLevel: 0.5,
      lastDetected: Date.now() - 345600000 // 4 days ago
    },
    {
      domain: 'mail-service-verify.info',
      detectionCount: 3,
      riskLevel: 0.3,
      lastDetected: Date.now() - 432000000 // 5 days ago
    }
  ];
  
  // Generate sample recent detections
  const recentDetections = [
    {
      domain: 'faceb00k-security.com',
      timestamp: Date.now() - 3600000, // 1 hour ago
      detectionType: 'Подделка URL'
    },
    {
      domain: 'secure-paypaI.com',
      timestamp: Date.now() - 7200000, // 2 hours ago
      detectionType: 'Кража данных'
    },
    {
      domain: 'netflix-account-verify.net',
      timestamp: Date.now() - 10800000, // 3 hours ago
      detectionType: 'Обфускация кода'
    },
    {
      domain: 'googledocs-share.site',
      timestamp: Date.now() - 14400000, // 4 hours ago
      detectionType: 'Скрытые элементы'
    },
    {
      domain: 'mail-service-verify.info',
      timestamp: Date.now() - 18000000, // 5 hours ago
      detectionType: 'Перенаправление'
    }
  ];
  
  return {
    totalSitesChecked: 1582,
    phishingDetected: 73,
    deepScanDetections: 27,
    detectionAccuracy: 0.968,
    obfuscationRate: 0.72,
    hiddenElementsRate: 0.63,
    featureDistribution: featureDistribution,
    detectionTrends: { dates, counts },
    recentDetections: recentDetections,
    domainStats: domainStats
  };
}

// Listen for updates from service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyticsDataUpdated' && message.data) {
    analyticsData = message.data;
    updateDashboard();
    sendResponse({ status: 'updated' });
  }
});

// Export analytics data button
document.getElementById('export-btn')?.addEventListener('click', exportAnalyticsData);

function exportAnalyticsData() {
  const dataStr = JSON.stringify(analyticsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `corgphish_analytics_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

// Update statistics from service worker every minute
setInterval(async () => {
  const newData = await requestDataFromServiceWorker();
  if (newData && Object.keys(newData).length > 0) {
    analyticsData = newData;
    updateDashboard();
  }
}, 60000); 