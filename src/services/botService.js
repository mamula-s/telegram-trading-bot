const TelegramBot = require('node-telegram-bot-api');
const userService = require('./userService');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

const sendSignalToUsers = async (signal) => {
  try {
    const users = await userService.getSubscribedUsers();
    const message = formatSignalMessage(signal);

    for (const user of users) {
      try {
        if (signal.imageUrl) {
          await bot.sendPhoto(user.telegramId, `${process.env.BASE_URL}${signal.imageUrl}`, { 
            caption: message, 
            parse_mode: 'Markdown' 
          });
        } else {
          await bot.sendMessage(user.telegramId, message, { parse_mode: 'Markdown' });
        }
      } catch (error) {
        console.error(`Помилка відправки сигналу користувачу ${user.telegramId}:`, error);
      }
    }
  } catch (error) {
    console.error('Помилка відправки сигналу користувачам:', error);
    throw error;
  }
};

const formatSignalMessage = (signal) => {
  return `
🚨 *Новий ${signal.type === 'futures' ? "ф'ючерсний" : 'спотовий'} сигнал* 🚨

Пара: *${signal.pair}*
Напрямок: *${signal.direction === 'buy' ? 'Купівля' : 'Продаж'}*
Ціна входу: *${signal.entryPrice}*
Тейк-профіт: *${signal.takeProfit}*
Стоп-лосс: *${signal.stopLoss}*

${signal.note ? `Примітка: ${signal.note}\n` : ''}

*Ризик менеджмент:*
Вхід до угоди не повинен бути більше ніж 3-5% від вашого депозиту.

_Ми не несемо відповідальності за ваш депозит. Ви самі ухвалюєте рішення відкрити угоду чи ні. Ми можемо лише показати вам результат торгівлі._

Будьте обережні і торгуйте відповідально!
  `;
};

module.exports = {
  sendSignalToUsers
};