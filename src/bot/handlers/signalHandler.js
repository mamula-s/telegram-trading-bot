const userService = require('../../services/userService');

const sendFuturesSignal = async (bot, signal) => {
  const users = await userService.getSubscribedUsers('premium');
  
  const message = `
    🚨 Новий ф'ючерсний сигнал 🚨
    Пара: ${signal.pair}
    Напрямок: ${signal.direction}
    Ціна входу: ${signal.entryPrice}
    Стоп-лосс: ${signal.stopLoss}
    Тейк-профіт: ${signal.takeProfit}
  `;

  for (const user of users) {
    try {
      await bot.sendMessage(user.telegramId, message);
    } catch (error) {
      console.error(`Помилка відправки сигналу користувачу ${user.telegramId}:`, error);
    }
  }
};

const sendSpotSignal = async (bot, signal) => {
  const users = await userService.getSubscribedUsers('premium');
  
  const message = `
    📊 Новий спотовий сигнал 📊
    Пара: ${signal.pair}
    Напрямок: ${signal.direction}
    Ціна входу: ${signal.entryPrice}
    Стоп-лосс: ${signal.stopLoss}
    Тейк-профіт: ${signal.takeProfit}
  `;

  for (const user of users) {
    try {
      await bot.sendMessage(user.telegramId, message);
    } catch (error) {
      console.error(`Помилка відправки сигналу користувачу ${user.telegramId}:`, error);
    }
  }
};

module.exports = {
  sendFuturesSignal,
  sendSpotSignal
};