const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Налаштування бота
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Отримано ваше повідомлення');
});

app.get('/', (req, res) => {
  res.send('Сервер працює');
});

app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});