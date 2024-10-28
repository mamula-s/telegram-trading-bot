const TelegramBot = require('node-telegram-bot-api');
const userService = require('./userService');

class TelegramService {
  constructor() {
    this.bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });
  }

  async sendNotification(userId, message, extra = {}) {
    try {
      const user = await userService.getUserById(userId);
      if (!user?.telegramId) return;

      await this.bot.sendMessage(user.telegramId, message, {
        parse_mode: 'HTML',
        ...extra
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async sendSignalJoinNotification(userId, signal) {
    const message = `
🎯 <b>Ви приєдналися до сигналу</b>

Пара: ${signal.pair}
Тип: ${signal.type}
Напрямок: ${signal.direction}
Ціна входу: $${signal.entryPrice}

⚠️ Не забудьте встановити стоп-лос на рівні $${signal.stopLoss}
🎯 Тейк-профіт: $${signal.takeProfit}
    `;

    await this.sendNotification(userId, message);
  }

  async sendSignalUpdateNotification(userId, signal) {
    const message = `
📊 <b>Оновлення по сигналу</b>

Пара: ${signal.pair}
Поточна ціна: $${signal.currentPrice}
Прибуток: ${signal.profit > 0 ? '+' : ''}${signal.profit}%

${signal.status === 'CLOSED' ? '✅ Сигнал закрито' : '⚠️ Сигнал оновлено'}
    `;

    await this.sendNotification(userId, message);
  }

  async sendSubscriptionNotification(userId, subscription) {
    const message = `
💎 <b>Підписку активовано</b>

План: ${subscription.plan}
Термін дії: до ${new Date(subscription.endDate).toLocaleDateString()}

Дякуємо за довіру! Тепер вам доступні всі функції обраного плану.
    `;

    await this.sendNotification(userId, message);
  }

  async sendReferralRewardNotification(userId, reward) {
    const message = `
🎁 <b>Реферальна винагорода</b>

Ви отримали ${reward.amount}$ за запрошеного користувача!
Загальний заробіток: ${reward.totalEarned}$

Запрошуйте друзів та заробляйте більше!
    `;

    await this.sendNotification(userId, message);
  }
}

module.exports = new TelegramService();