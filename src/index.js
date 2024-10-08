const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
const { CronJob } = require('cron');
require('dotenv').config();

const { sequelize, connectDB } = require('./database/sequelize');
const subscriptions = require('./config/subscriptions');
const adminRoutes = require('./routes/adminRoutes');
const userService = require('./services/userService');
const signalService = require('./services/signalService');
const botService = require('./services/botService');
const subscriptionService = require('./services/subscriptionService');

const bot = new TelegramBot(process.env.BOT_TOKEN);
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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

// Маршрути
app.get('/webapp', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'webapp.html'));
});

app.get('/api/portfolio', async (req, res) => {
  // TODO: Реалізувати отримання даних портфоліо
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

// Обробка команд бота
bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    console.log(`Отримано команду /start від користувача ${msg.from.id}`);
    
    const user = await userService.createUser({
      telegramId: msg.from.id.toString(),
      username: msg.from.username,
      firstName: msg.from.first_name,
      lastName: msg.from.last_name,
    });
    console.log(`Створено або оновлено користувача:`, user);

    const updatedUser = await userService.updateUserSubscription(user.telegramId);
    console.log(`Оновлено підписку користувача:`, updatedUser);

    let welcomeMessage = `Вітаємо, ${updatedUser.firstName}!`;
    if (updatedUser.isSubscribed && updatedUser.subscriptionType === 'vip') {
      welcomeMessage += ' У вас активована VIP підписка.';
    } else {
      welcomeMessage += ' Використовуйте /subscribe для оформлення підписки.';
    }

    bot.sendMessage(chatId, welcomeMessage);
  } catch (error) {
    console.error('Помилка обробки команди /start:', error);
    bot.sendMessage(chatId, 'Виникла помилка при обробці команди. Спробуйте ще раз пізніше.');
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Доступні команди:\n/start - Почати\n/help - Допомога\n/subscribe - Оформити підписку\n/status - Перевірити статус підписки\n/signals - Отримати сигнали\n/portfolio - Переглянути портфоліо\n/settings - Налаштування\n/webapp - Відкрити веб-додаток');
});

bot.onText(/\/subscribe/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const keyboard = {
      inline_keyboard: Object.values(subscriptions).map(sub => (
        [{ text: `${sub.name} - $${sub.price}`, callback_data: `subscribe_${sub.id}` }]
      ))
    };
    await bot.sendMessage(chatId, 'Виберіть тип підписки:', { reply_markup: JSON.stringify(keyboard) });
  } catch (error) {
    console.error('Помилка при обробці команди /subscribe:', error);
  }
});

bot.onText(/\/status/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const user = await userService.getUserByTelegramId(msg.from.id.toString());

    if (user && user.isSubscribed) {
      const endDate = new Date(user.subscriptionEndDate).toLocaleDateString();
      bot.sendMessage(chatId, `Ваша ${user.subscriptionType.toUpperCase()} підписка активна до ${endDate}.`);
    } else {
      bot.sendMessage(chatId, 'У вас немає активної підписки. Використовуйте /subscribe для оформлення.');
    }
  } catch (error) {
    console.error('Помилка обробки команди /status:', error);
  }
});

bot.onText(/\/checkstatus/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const user = await userService.getUserByTelegramId(msg.from.id.toString());
    
    if (user && user.isSubscribed) {
      const subscriptionEnd = new Date(user.subscriptionEndDate).toLocaleDateString();
      bot.sendMessage(chatId, `Ваша ${user.subscriptionType.toUpperCase()} підписка активна до ${subscriptionEnd}.`);
    } else {
      bot.sendMessage(chatId, 'У вас немає активної підписки.');
    }
  } catch (error) {
    console.error('Помилка перевірки статусу:', error);
    bot.sendMessage(chatId, 'Виникла помилка при перевірці статусу підписки.');
  }
});

bot.onText(/\/signals/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const user = await userService.getUserByTelegramId(msg.from.id.toString());
    
    if (user && user.isSubscribed) {
      const signals = await signalService.getRecentSignals(user.subscriptionType);
      let message = 'Останні сигнали:\n\n';
      signals.forEach(signal => {
        message += `${signal.type.toUpperCase()} | ${signal.pair} | ${signal.direction}\n`;
        message += `Вхід: ${signal.entryPrice} | TP: ${signal.takeProfit} | SL: ${signal.stopLoss}\n\n`;
      });
      bot.sendMessage(chatId, message);
    } else {
      bot.sendMessage(chatId, 'Для отримання сигналів потрібна активна підписка. Використовуйте /subscribe для оформлення.');
    }
  } catch (error) {
    console.error('Помилка обробки команди /signals:', error);
  }
});

bot.onText(/\/portfolio/, async (msg) => {
  const chatId = msg.chat.id;
  // TODO: Реалізувати логіку управління портфелем
  bot.sendMessage(chatId, 'Функція управління портфелем знаходиться в розробці.');
});

bot.onText(/\/settings/, async (msg) => {
  const chatId = msg.chat.id;
  // TODO: Реалізувати логіку налаштувань користувача
  bot.sendMessage(chatId, 'Налаштування користувача:\n1. Частота сигналів: Всі\n2. Сповіщення: Увімкнено');
});

bot.onText(/\/webapp/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Натисніть кнопку нижче, щоб відкрити Web App:', {
    reply_markup: {
      keyboard: [[{ text: 'Відкрити Trading Dashboard', web_app: { url: `${process.env.BASE_URL}/webapp` } }]],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});

bot.onText(/\/mystatus/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const user = await userService.getUserByTelegramId(msg.from.id.toString());

    if (user) {
      const activeSubscriptions = await userService.getActiveSubscriptions(user.telegramId);
      if (activeSubscriptions.length > 0) {
        const subscriptionList = activeSubscriptions.map(sub => subscriptions[sub].name).join(', ');
        const endDate = new Date(user.subscriptionEndDate).toLocaleDateString();
        bot.sendMessage(chatId, `Ваші активні підписки: ${subscriptionList}\nДата закінчення: ${endDate}`);
      } else {
        bot.sendMessage(chatId, 'У вас немає активних підписок. Використовуйте /subscribe для оформлення підписки.');
      }
    } else {
      bot.sendMessage(chatId, 'Користувача не знайдено. Використовуйте /start для реєстрації.');
    }
  } catch (error) {
    console.error('Помилка обробки команди /mystatus:', error);
  }
});

bot.onText(/\/checksignal/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const hasAccess = await userService.checkAccess(chatId.toString(), 'FUTURES_SIGNALS');
    if (hasAccess) {
      bot.sendMessage(chatId, "У вас є доступ до ф'ючерсних сигналів.");
    } else {
      bot.sendMessage(chatId, "У вас немає доступу до ф'ючерсних сигналів. Оформіть відповідну підписку.");
    }
  } catch (error) {
    console.error('Помилка обробки команди /checksignal:', error);
  }
});

bot.on('callback_query', async (callbackQuery) => {
  try {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;

    if (action.startsWith('subscribe_')) {
      const subscriptionId = action.split('_')[1];
      const user = await userService.addSubscription(chatId.toString(), subscriptionId);
      const subscription = subscriptions[subscriptionId];
      
      if (user.subscriptionType === 'vip' && user.subscriptionEndDate > new Date()) {
        bot.answerCallbackQuery(callbackQuery.id, { text: 'У вас вже є активна VIP підписка!' });
        bot.sendMessage(chatId, `Ви вже маєте активну VIP підписку до ${user.subscriptionEndDate.toLocaleDateString()}`);
      } else {
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Підписку успішно оформлено!' });
        bot.sendMessage(chatId, `Ви успішно підписалися на "${subscription.name}" на ${subscription.duration} днів`);
      }
    }
  } catch (error) {
    console.error('Помилка обробки callback query:', error);
    bot.answerCallbackQuery(callbackQuery.id, { text: 'Помилка при оформленні підписки.' });
  }
});

// Обробка помилок бота
bot.on('polling_error', (error) => {
  console.error('Помилка поллінгу бота:', error);
});

bot.on('webhook_error', (error) => {
  console.error('Помилка вебхука бота:', error);
});

// Адмін-панель роути
app.use('/admin', adminRoutes);

// Маршрут для перевірки стану сервера
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Щось пішло не так!');
});

// Функція для відправки сигналу всім підписаним користувачам
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

app.post('/api/settings', async (req, res) => {
  const { frequency, notificationsEnabled } = req.body;
  const userId = req.headers['x-telegram-user-id'];

  try {
    // TODO: Зберегти налаштування в базі даних
    // await userService.updateSettings(userId, { frequency, notificationsEnabled });
    res.json({ success: true, message: 'Налаштування збережено' });
  } catch (error) {
    console.error('Помилка збереження налаштувань:', error);
    res.status(500).json({ success: false, message: 'Помилка збереження налаштувань' });
  }
});

// Підключення до бази даних і запуск сервера
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

// Обробка SIGTERM для graceful shutdown
process.on('SIGTERM', async () => {
  console.log("SIGTERM отримано. Закриваємо сервер та з'єднання з базою даних.");
  await sequelize.close();
  process.exit(0);
});

module.exports = { app, bot, broadcastSignal };