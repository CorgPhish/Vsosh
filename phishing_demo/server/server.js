const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the demo_sites directory
app.use('/demo_sites', express.static(path.join(__dirname, '../demo_sites')));

// Serve extension files
app.use('/extension', express.static(path.join(__dirname, '../demo_sites/extension')));

// Import phishing detector module
const phishingDetector = require('./phishing_detector/model');

// API endpoint for phishing detection
app.post('/api/detect-phishing', (req, res) => {
    try {
        const { url, content } = req.body;
        
        if (!url && !content) {
            return res.status(400).json({ 
                error: 'Missing required parameters: url or content' 
            });
        }
        
        // Perform phishing detection
        const result = phishingDetector.detectPhishing(url, content);
        
        return res.json({
            result: result,
            score: result.score,
            isPhishing: result.isPhishing,
            confidence: result.confidence,
            details: result.details
        });
    } catch (error) {
        console.error('Error in phishing detection:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
});

// Home page - Demo site directory
app.get('/', (req, res) => {
    const demoSitesPath = path.join(__dirname, '../demo_sites');
    const sites = [];
    
    // Read directories in demo_sites
    fs.readdirSync(demoSitesPath).forEach(site => {
        const sitePath = path.join(demoSitesPath, site);
        if (fs.statSync(sitePath).isDirectory() && site !== 'extension') {
            // Check if index.html exists in the directory
            const hasIndex = fs.existsSync(path.join(sitePath, 'index.html'));
            sites.push({
                name: site,
                path: `/demo_sites/${site}/index.html`,
                status: hasIndex ? 'ready' : 'in development'
            });
        }
    });
    
    // Generate HTML for the homepage
    const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CorgPhish Демонстрационные Сайты</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
            }
            h1 {
                color: #2c3e50;
                border-bottom: 2px solid #eee;
                padding-bottom: 10px;
            }
            .phishing-warning {
                background-color: #f8d7da;
                color: #721c24;
                padding: 10px 15px;
                margin: 20px 0;
                border-radius: 4px;
                border-left: 4px solid #f5c6cb;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                margin-bottom: 10px;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            li a {
                color: #007bff;
                text-decoration: none;
                font-weight: bold;
            }
            li a:hover {
                text-decoration: underline;
            }
            .status {
                font-size: 0.8em;
                padding: 3px 8px;
                border-radius: 10px;
            }
            .ready {
                background-color: #d4edda;
                color: #155724;
            }
            .in-development {
                background-color: #fff3cd;
                color: #856404;
            }
            .description {
                margin-bottom: 30px;
            }
            .extension-info {
                background-color: #e7f5ff;
                border-left: 4px solid #007bff;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
            }
            .extension-instructions {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                margin-top: 20px;
            }
            .instruction-step {
                margin-bottom: 10px;
                padding-left: 20px;
                position: relative;
            }
            .instruction-step:before {
                content: "•";
                position: absolute;
                left: 0;
                color: #007bff;
            }
        </style>
    </head>
    <body>
        <h1>CorgPhish Демонстрационные Сайты</h1>
        
        <div class="phishing-warning">
            <strong>Внимание:</strong> Следующие ссылки ведут на симулированные фишинговые сайты, созданные исключительно в образовательных и тестовых целях. 
            Эти сайты предназначены для демонстрации того, как CorgPhish обнаруживает различные типы фишинговых попыток.
        </div>
        
        <div class="extension-info">
            <strong>Расширение CorgPhish:</strong> Этот демо-сервер интегрирован с браузерным расширением CorgPhish.
            <div class="extension-instructions">
                <p><strong>Чтобы использовать расширение с этими демо-сайтами:</strong></p>
                <div class="instruction-step">Убедитесь, что расширение CorgPhish установлено в вашем браузере</div>
                <div class="instruction-step">Если оно не установлено, вы можете получить доступ к нему по адресу <a href="/extension/index.html">/extension</a></div>
                <div class="instruction-step">Расширение должно автоматически обнаруживать фишинговые попытки на демо-сайтах</div>
            </div>
        </div>
        
        <div class="description">
            <p>Эти демо-сайты демонстрируют различные типы фишинговых атак, которые CorgPhish предназначен обнаруживать. 
            Каждый сайт был создан для имитации распространенных фишинговых сценариев, оставаясь при этом полностью безопасным для тестирования.</p>
            <p>Выберите сайт ниже для изучения:</p>
        </div>
        
        <ul>
            ${sites.map(site => `
                <li>
                    <span>${site.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    ${site.status === 'ready' 
                        ? `<a href="${site.path}">Посетить демо-сайт</a>` 
                        : `<span class="status in-development">В разработке</span>`
                    }
                </li>
            `).join('')}
        </ul>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Доступ к демо-сайтам: http://localhost:${PORT}/demo_sites/`);
    console.log(`Доступ к расширению: http://localhost:${PORT}/extension/`);
}); 