const fs = require('fs');
const path = require('path');

// Ensure directories exist
const dirs = [
  'src/public',
  'src/admin/views'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create webapp.html
const webappHtml = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#ffffff">
    <meta name="color-scheme" content="light dark">
    <title>Trading Bot</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link href="/styles.css" rel="stylesheet">
    <base href="/webapp/" />
</head>
<body class="bg-gray-50">
    <div id="root"></div>
    <script>
        window.addEventListener('load', () => {
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
            }
        });
    </script>
    <script src="/webapp.bundle.js"></script>
</body>
</html>`;

// Create error.ejs
const errorEjs = `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error <%= error.status %></title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #f7f7f7;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .error-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
        }
        .error-code {
            font-size: 4rem;
            font-weight: bold;
            color: #e53e3e;
            margin: 0;
            line-height: 1;
        }
        .error-message {
            color: #4a5568;
            margin: 1rem 0;
        }
        .back-link {
            display: inline-block;
            background: #3182ce;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            text-decoration: none;
            margin-top: 1rem;
        }
        .back-link:hover {
            background: #2c5282;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1 class="error-code"><%= error.status %></h1>
        <p class="error-message"><%= message %></p>
        <a href="/admin" class="back-link">Повернутися на головну</a>
    </div>
</body>
</html>`;

// Write files
try {
  fs.writeFileSync(path.join(__dirname, '../src/public/webapp.html'), webappHtml);
  console.log('Created webapp.html');
  
  fs.writeFileSync(path.join(__dirname, '../src/admin/views/error.ejs'), errorEjs);
  console.log('Created error.ejs');
} catch (err) {
  console.error('Error writing files:', err);
  process.exit(1);
}

console.log('Build preparation completed successfully');