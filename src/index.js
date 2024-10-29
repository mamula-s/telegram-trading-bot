const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { CronJob } = require('cron');
const cors = require('cors');
require('dotenv').config();

const { sequelize, connectDB } = require('./database/sequelize');
const subscriptions = require('./config/subscriptions');
const userService = require('./services/userService');
const signalService = require('./services/signalService');
const botService = require('./services/botService');
const subscriptionService = require('./services/subscriptionService');
const expressLayouts = require('express-ejs-layouts');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./admin/routes');

const bot = new TelegramBot(process.env.BOT_TOKEN);
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Налаштування шаблонізатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'admin/views'));
app.use(expressLayouts);
app.set('layout', 'layout');  // використовуємо layout.ejs як базовий шаблон
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

// API та адмін маршрути
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Основні маршрути
app.get('/', (req, res) => {
  res.send('Welcome to the Telegram Trading Bot');
});

// Cron job для перевірки підписок
const checkSubscriptionsCron = new CronJob('0 12 * * *', () => {
  subscriptionService.checkExpiringSubscriptions(bot);
});
checkSubscriptionsCron.start();

// Функція для встановлення webhook з повторними спробами
const setWebhookWithRetry = async (retryCount = 0) => {
  try {
    await bot.setWebHook(`${process.env.BASE_URL}/webhook/${process.env.BOT_TOKEN}`);
    console.log('Webhook встановлено успішно');
  } catch (error) {
    console.error('Помилка встановлення webhook:', error);
    if (retryCount < 5) {
      console.log(`Повторна спроба через 5 секунд... (спроба ${retryCount + 1})`);
      setTimeout(() => setWebhookWithRetry(retryCount + 1), 5000);
    }
  }
};

// WebApp маршрути
app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'webapp.html'));
});

app.get('/webapp*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'webapp.html'));
});

// API маршрути
app.get('/api/portfolio', async (req, res) => {
  res.json([
    { asset: 'BTC', amount: 0.5, value: 15000 },
    { asset: 'ETH', amount: 5, value: 10000 },
    { asset: 'USDT', amount: 5000, value: 5000 }
  ]);
});

app.get('/api/signals', async (req, res) => {
  try {
    const signals = await signalService.getRecentSignals('vip', 5);
    res.json(signals);
  } catch (error) {
    console.error('Помилка отримання сигналів:', error);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

// Webhook маршрути
app.post(`/webhook/${process.env.BOT_TOKEN}`, (req, res) => {
  console.log('Отримано webhook від Telegram');
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get('/webhook-info', async (req, res) => {
  try {
    const webhookInfo = await bot.getWebHookInfo();
    res.json(webhookInfo);
  } catch (error) {
    console.error('Помилка отримання інформації про webhook:', error);
    res.status(500).json({ error: 'Не вдалося отримати інформацію про webhook' });
  }
});

// API для користувацьких даних
app.get('/api/user-data', (req, res) => {
    const initData = req.headers['x-telegram-init-data'];
    // TODO: Додати валідацію даних від Telegram
    
    res.json({
        success: true,
        user: {
            name: 'Serhii Mamula 🚀',
            balance: 10000,
            profitToday: 5.2,
            totalProfit: 15.7,
            subscription: 'FULL'
        }
    });
});

// API для налаштувань
app.post('/api/settings', async (req, res) => {
  const { frequency, notificationsEnabled } = req.body;
  const userId = req.headers['x-telegram-user-id'];

  try {
    res.json({ success: true, message: 'Налаштування збережено' });
  } catch (error) {
    console.error('Помилка збереження налаштувань:', error);
    res.status(500).json({ success: false, message: 'Помилка збереження налаштувань' });
  }
});

// Маршрут для перевірки стану сервера
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Команди бота
require('./bot/commands')(bot, userService, signalService, subscriptions);

// Обробка помилок
app.use((req, res, next) => {
  res.status(404).send("Sorry, that route doesn't exist.");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Щось пішло не так!');
});

// Broadcast функція
const broadcastSignal = async (signal) => {
  try {
    const users = await userService.getSubscribedUsers();
    for (const user of users) {
      await botService.sendSignalToUser(bot, user.telegramId, signal);
    }
  } catch (error) {
    console.error('Помилка при розсилці сигналу:', error);
  }
};

// Запуск сервера
connectDB().then(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('База даних синхронізована');
    
    app.listen(port, () => {
      console.log(`Сервер запущено на порту ${port}`);
      setWebhookWithRetry();
    });
  } catch (error) {
    console.error('Помилка синхронізації бази даних:', error);
    process.exit(1);
  }
}).catch(error => {
  console.error('Не вдалося підключитися до бази даних:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log("SIGTERM отримано. Закриваємо сервер та з'єднання з базою даних.");
  await sequelize.close();
  process.exit(0);
});

module.exports = { app, bot, broadcastSignal };