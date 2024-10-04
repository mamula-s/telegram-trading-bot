const express = require('express');
const path = require('path');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const connectDB = require('./database/connection');
const adminRoutes = require('./routes/adminRoutes');
const userService = require('./services/userService');
const signalService = require('./services/signalService');
const botService = require('./services/botService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Маршрут для Web App
app.get('/webapp', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'webapp.html'));
});

// API маршрути для Web App
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

// Налаштування бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обробка команд бота
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await userService.createUser({
    telegramId: msg.from.id.toString(),
    username: msg.from.username,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name,
  });

  let welcomeMessage = `Вітаємо, ${user.firstName}!`;
  
  if (user.isSubscribed && user.subscriptionType === 'vip') {
    welcomeMessage += ' У вас активована VIP підписка.';
  } else {
    welcomeMessage += ' Використовуйте /subscribe для оформлення підписки.';
  }

  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Доступні команди:\n/start - Почати\n/help - Допомога\n/subscribe - Оформити підписку\n/status - Перевірити статус підписки');
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await userService.getUserByTelegramId(msg.from.id.toString());
  
  if (user && user.isSubscribed) {
    bot.sendMessage(chatId, 'У вас вже є активна підписка. Використовуйте /status для перевірки деталей.');
  } else {
    // Тут можна додати логіку для вибору типу підписки та оплати
    bot.sendMessage(chatId, 'Для оформлення підписки, будь ласка, зверніться до адміністратора.');
  }
});

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await userService.getUserByTelegramId(msg.from.id.toString());

  if (user && user.isSubscribed) {
    const endDate = new Date(user.subscriptionEndDate);
    const formattedDate = endDate.toLocaleDateString();
    bot.sendMessage(chatId, `Ваша ${user.subscriptionType.toUpperCase()} підписка активна до ${formattedDate}.`);
  } else {
    bot.sendMessage(chatId, 'У вас немає активної підписки. Використовуйте /subscribe для оформлення.');
  }
});

bot.onText(/\/signals/, async (msg) => {
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
    bot.sendMessage(chatId, 'Відкрити Web App', {
        reply_markup: {
            inline_keyboard: [[
                { text: 'Відкрити Web App', web_app: { url: `${process.env.BASE_URL}/webapp` } }
            ]]
        }
    });
});

// Адмін-панель роути
app.use('/admin', adminRoutes);

// Обробка помилок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Щось пішло не так!');
});

// Підключення до бази даних і запуск сервера
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Сервер запущено на порту ${port}`);
  });
}).catch(error => {
  console.error('Неможливо підключитися до бази даних:', error);
  process.exit(1);
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

// Експорт функції broadcastSignal для використання в інших частинах додатку
module.exports = {
  broadcastSignal
};