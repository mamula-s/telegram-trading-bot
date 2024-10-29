// src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
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
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "https:"],
      frameSrc: ["'self'", "https://t.me"],
      upgradeInsecureRequests: null
    }
  }
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

// Static files
app.use(express.static(path.join(__dirname, 'public')));
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

// Main routes
app.get('/', (req, res) => {
  res.send('Welcome to the Telegram Trading Bot');
});

// WebApp routes
app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'webapp.html'));
});

app.get('/webapp/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'webapp.html'));
});

// API routes
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await userService.getUserPortfolio(req.user?.id);
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/signals', async (req, res) => {
  try {
    const signals = await signalService.getRecentSignals('vip', 5);
    res.json(signals);
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ error: 'Internal server error' });
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

app.get('/webhook-info', async (req, res) => {
  try {
    const webhookInfo = await bot.getWebHookInfo();
    res.json(webhookInfo);
  } catch (error) {
    console.error('Error getting webhook info:', error);
    res.status(500).json({ error: 'Failed to get webhook info' });
  }
});

// Load bot commands
require('./bot/commands')(bot, userService, signalService, subscriptions);

// Error handling
app.use((req, res, next) => {
  res.status(404);
  
  if (req.accepts('html')) {
    if (req.path.startsWith('/admin')) {
      res.render('error', {
        layout: false,
        error: { status: 404 },
        message: 'Page not found'
      });
    } else {
      res.sendFile(path.join(__dirname, 'public', 'webapp.html'));
    }
  } else {
    res.json({ error: 'Not found' });
  }
});

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
    // Connect to database
    await connectDB();
    console.log('Database connected successfully');

    // Setup webhook
    const webhookUrl = `${process.env.BASE_URL}/webhook/${process.env.BOT_TOKEN}`;
    await botService.setWebhook(webhookUrl);
    
    // Start server
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
    // Close database connection
    await sequelize.close();
    console.log('Database connection closed');
    
    // Close WebSocket server
    if (global.wss) {
      global.wss.clients.forEach(client => {
        client.close();
      });
      global.wss.close();
      console.log('WebSocket server closed');
    }
    
    // Close HTTP server
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