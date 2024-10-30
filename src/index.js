const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const { CronJob } = require('cron');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Database connections
const { sequelize, connectDB } = require('./database/sequelize');

// Services
const botService = require('./services/botService');
const userService = require('./services/userService');
const signalService = require('./services/signalService');
const subscriptionService = require('./services/subscriptionService');

// Configs and utils
const subscriptions = require('./config/subscriptions');
const { rateLimiters } = require('./admin/middleware/rateLimiter');
const { globalErrorHandler } = require('./middleware/errorHandler');

// Routes
const expressLayouts = require('express-ejs-layouts');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./admin/routes');
const adminApiRoutes = require('./routes/admin/api');
const authMiddleware = require('./middleware/telegramAuth');


// Initialize bot
const bot = new TelegramBot(process.env.BOT_TOKEN);

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdnjs.cloudflare.com",
        "https://telegram.org",
        "https://*.telegram.org"
      ],
      connectSrc: [
        "'self'",
        "wss://*.telegram.org",
        "https://*.telegram.org",
        "https://telegram.org",
        process.env.WS_URL || "'self'",
        "ws://localhost:*",
        "wss://localhost:*"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://telegram.org",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://telegram.org",
        "https://*.telegram.org"
      ],
      frameSrc: [
        "'self'",
        "https://telegram.org"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// Basic middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.WEBAPP_URL, process.env.ADMIN_URL]
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data']
}));

// API routes
app.use('/api', authMiddleware);

// Content Type Middleware
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.css')) {
    res.type('text/css');
  }
  next();
});

// Static files
app.use('/webapp', express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'admin/views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// Rate limiting
app.use('/api', rateLimiters.api);
app.use('/admin/login', rateLimiters.auth);
app.use('/admin/forgot-password', rateLimiters.passwordReset);

// API and admin routes
app.use('/api/admin', adminApiRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// WebApp HTML template
const webAppTemplate = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#ffffff">
    <meta name="color-scheme" content="light dark">
    <title>Trading Bot</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <link href="/webapp/styles.css" rel="stylesheet">
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
    <script src="/webapp/webapp.bundle.js"></script>
</body>
</html>
`;

// Main routes
app.get('/', (req, res) => {
  res.send('Welcome to the Telegram Trading Bot');
});

// WebApp routes
app.get(['/webapp', '/webapp/*'], (req, res) => {
  res.set({
    'Content-Security-Policy': "default-src 'self' https://telegram.org https://*.telegram.org; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://telegram.org https://*.telegram.org; " +
      "style-src 'self' 'unsafe-inline' https://telegram.org https://cdnjs.cloudflare.com; " +
      "img-src 'self' data: blob: https://telegram.org https://*.telegram.org; " +
      "font-src 'self' data: https://cdnjs.cloudflare.com; " +
      "connect-src 'self' wss://*.telegram.org https://*.telegram.org https://telegram.org " + 
      (process.env.WS_URL || "'self'") + " ws://localhost:* wss://localhost:*; " +
      "frame-src 'self' https://telegram.org; " +
      "object-src 'none'; " +
      "media-src 'self'; " +
      "worker-src 'self' blob:; " +
      "child-src 'self' blob:;",
    'Cross-Origin-Embedder-Policy': 'unsafe-none',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });

  const publicPath = path.join(__dirname, 'public', 'webapp.html');

  if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath, (err) => {
      if (err) {
        console.error('Error sending webapp.html:', err);
        res.send(webAppTemplate);
      }
    });
  } else {
    res.send(webAppTemplate);
  }
});

// API routes
app.get('/api/portfolio', async (req, res, next) => {
  try {
    const portfolio = await userService.getUserPortfolio(req.user?.id);
    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

app.get('/api/signals', async (req, res, next) => {
  try {
    const signals = await signalService.getRecentSignals('vip', 5);
    res.json(signals);
  } catch (error) {
    next(error);
  }
});

// Webhook routes
app.post(`/webhook/${process.env.BOT_TOKEN}`, async (req, res) => {
  try {
    console.log('Received webhook from Telegram');
    await bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

app.get('/webhook-info', async (req, res, next) => {
  try {
    const webhookInfo = await bot.getWebHookInfo();
    res.json(webhookInfo);
  } catch (error) {
    next(error);
  }
});

// Load bot commands
require('./bot/commands')(bot, userService, signalService, subscriptions);

// 404 Handler
app.use((req, res) => {
  if (req.path.startsWith('/webapp')) {
    res.send(webAppTemplate);
  } else if (req.path.startsWith('/admin')) {
    res.status(404).render('error', {
      layout: false,
      error: { status: 404 },
      message: 'Сторінку не знайдено'
    });
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
});

// Error handler
app.use(globalErrorHandler);

// Cron jobs
const subscriptionCheckJob = new CronJob('0 12 * * *', () => {
  subscriptionService.checkExpiringSubscriptions(bot);
});
subscriptionCheckJob.start();

// WebSocket setup
const setupWebSocket = require('./webSocket');
const server = require('http').createServer(app);
setupWebSocket(server);

// Initialize server
const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');

    const webhookUrl = `${process.env.BASE_URL}/webhook/${process.env.BOT_TOKEN}`;
    await botService.setWebhook(webhookUrl);
    console.log('Webhook встановлено успішно');
    
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await sequelize.close();
    console.log('Database connection closed');
    
    if (global.wss) {
      global.wss.clients.forEach(client => {
        client.close();
      });
      global.wss.close();
      console.log('WebSocket server closed');
    }
    
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  shutdown();
});

// Start server
startServer();