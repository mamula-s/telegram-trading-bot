// src/services/botService.js
const TelegramBot = require('node-telegram-bot-api');
const userService = require('./userService');
const { formatMessage } = require('../utils/messageFormatter');

class BotService {
  constructor() {
    this.bot = new TelegramBot(process.env.BOT_TOKEN);
  }

  // Відправка масових сповіщень
  async broadcastMessage(message, options = {}) {
    const {
      userFilter = {},
      parseMode = 'HTML',
      silent = false
    } = options;

    try {
      // Отримуємо список користувачів за фільтром
      const users = await userService.getFilteredUsers(userFilter);
      const results = {
        total: users.length,
        success: 0,
        failed: 0,
        errors: []
      };

      for (const user of users) {
        try {
          await this.bot.sendMessage(user.telegramId, message, {
            parse_mode: parseMode,
            disable_notification: silent
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            userId: user.telegramId,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Broadcast error:', error);
      throw error;
    }
  }

  // Відправка сигналу
  async broadcastSignal(signal, options = {}) {
    const {
      subscriptionType = 'all',
      notifyAll = false
    } = options;

    try {
      const users = await userService.getSubscribedUsers(subscriptionType);
      const message = formatMessage('signal', signal);

      const results = await this.broadcastMessage(message, {
        userFilter: {
          isSubscribed: true,
          subscriptionType: notifyAll ? undefined : subscriptionType
        },
        parseMode: 'HTML'
      });

      return results;
    } catch (error) {
      console.error('Signal broadcast error:', error);
      throw error;
    }
  }

  // Відправка новин
  async broadcastNews(news) {
    try {
      const message = formatMessage('news', news);
      return await this.broadcastMessage(message, {
        parseMode: 'HTML',
        silent: true
      });
    } catch (error) {
      console.error('News broadcast error:', error);
      throw error;
    }
  }

  // Блокування користувача
  async blockUser(userId, reason) {
    try {
      await this.bot.sendMessage(userId, 
        `⚠️ Ваш акаунт було заблоковано.\nПричина: ${reason}\n\nЗв'яжіться з адміністратором для розблокування.`
      );
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  // Розблокування користувача
  async unblockUser(userId) {
    try {
      await this.bot.sendMessage(userId,
        '✅ Ваш акаунт було розблоковано. Ви знову можете користуватися ботом.'
      );
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  // Отримання інформації про чат/користувача
  async getChatInfo(chatId) {
    try {
      return await this.bot.getChat(chatId);
    } catch (error) {
      console.error('Error getting chat info:', error);
      throw error;
    }
  }

  // Відправка технічних сповіщень адміністраторам
  async notifyAdmins(message, type = 'info') {
    try {
      const adminIds = process.env.ADMIN_IDS.split(',');
      const icon = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '🚨',
        success: '✅'
      }[type] || 'ℹ️';

      for (const adminId of adminIds) {
        await this.bot.sendMessage(adminId, `${icon} ${message}`);
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  }
}

module.exports = new BotService();