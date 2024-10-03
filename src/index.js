const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const connectDB = require('./database/connection');
const { commands, handleCallbackQuery } = require('./bot/commands');
const signalHandler = require('./bot/handlers/signalHandler');
const materialHandler = require('./bot/handlers/materialHandler');
const userService = require('./services/userService');
const paymentService = require('./services/paymentService');

const app = express();
const port = process.env.PORT || 3000;

// Підключення до бази даних
connectDB().then(() => {
  // Налаштування бота
  const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

  // Обробка команд
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      let user = await userService.getUserByTelegramId(msg.from.id.toString());
      if (!user) {
        user = await userService.createUser({
          telegramId: msg.from.id.toString(),
          username: msg.from.username,
          firstName: msg.from.first_name,
          lastName: msg.from.last_name,
        });
      }
      
      if (msg.text && msg.text.startsWith('/')) {
        const command = msg.text.split(' ')[0];
        if (commands[command]) {
          await commands[command](bot, msg, user);
        } else {
          await bot.sendMessage(chatId, 'Невідома команда. Використовуйте /help для списку команд.');
        }
      }
    } catch (error) {
      console.error('Помилка обробки повідомлення:', error);
      await bot.sendMessage(chatId, 'Виникла помилка при обробці вашого запиту. Спробуйте пізніше.');
    }
  });

  // Обробка callback-запитів
  bot.on('callback_query', async (callbackQuery) => {
    await handleCallbackQuery(bot, callbackQuery);
  });

  // Обробка успішних платежів
  bot.on('successful_payment', async (msg) => {
    await paymentService.handleSuccessfulPayment(msg);
    await bot.sendMessage(msg.chat.id, 'Дякуємо за оплату! Ваша підписка активована.');
  });

  // ... інші налаштування сервера ...

  app.listen(port, () => {
    console.log(`Сервер запущено на порту ${port}`);
  });
}).catch(error => {
  console.error('Неможливо підключитися до бази даних:', error);
  process.exit(1);
});