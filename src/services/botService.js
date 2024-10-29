// src/services/botService.js
const TelegramBot = require('node-telegram-bot-api');
const { formatSignalMessage, formatNewsMessage } = require('../utils/messageFormatter');
const userService = require('./userService');

class BotService {
  constructor() {
    this.bot = new TelegramBot(process.env.BOT_TOKEN);
    this.retryDelay = 1000; // Start with 1 second
    this.maxRetryDelay = 30000; // Maximum 30 seconds
  }

  async setWebhook(url, retryCount = 0) {
    try {
      await this.bot.setWebHook(url);
      console.log('Webhook встановлено успішно');
      this.retryDelay = 1000; // Reset delay on success
    } catch (error) {
      if (error.response?.body?.error_code === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '1');
        const delay = retryAfter * 1000;
        
        console.log(`Rate limit hit. Waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.setWebhook(url, retryCount);
      }

      console.error('Помилка встановлення webhook:', error);
      
      if (retryCount < 5) {
        const delay = Math.min(this.retryDelay * Math.pow(2, retryCount), this.maxRetryDelay);
        console.log(`Повторна спроба через ${delay/1000} секунд... (спроба ${retryCount + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.setWebhook(url, retryCount + 1);
      }
    }
  }

  async broadcastMessage(message, options = {}) {
    const {
      userFilter = {},
      parseMode = 'HTML',
      silent = false
    } = options;

    try {
      const users = await userService.getFilteredUsers(userFilter);
      const results = {
        total: users.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // Розбиваємо користувачів на групи по 30 для уникнення rate limit
      const chunks = this.chunkArray(users, 30);
      
      for (const chunk of chunks) {
        await Promise.all(chunk.map(async (user) => {
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
        }));

        // Чекаємо 1 секунду між групами
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return results;
    } catch (error) {
      console.error('Broadcast error:', error);
      throw error;
    }
  }

  async broadcastSignal(signal, options = {}) {
    try {
      const message = formatSignalMessage(signal, 'new');
      const users = await userService.getSubscribedUsers(options.subscriptionType || 'all');
      
      return await this.broadcastMessage(message, {
        userFilter: { telegramId: users.map(u => u.telegramId) },
        parseMode: 'HTML'
      });
    } catch (error) {
      console.error('Signal broadcast error:', error);
      throw error;
    }
  }

  async sendSignalUpdate(signal, userId) {
    try {
      const message = formatSignalMessage(signal, 'update');
      await this.bot.sendMessage(userId, message, {
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error(`Error sending signal update to user ${userId}:`, error);
      throw error;
    }
  }

  async sendSignalClose(signal, userId) {
    try {
      const message = formatSignalMessage(signal, 'close');
      await this.bot.sendMessage(userId, message, {
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error(`Error sending signal close to user ${userId}:`, error);
      throw error;
    }
  }

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

  // Utility methods
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Error handling methods
  handleTelegramError(error, userId) {
    if (error.code === 403) {
      // User blocked the bot
      return userService.updateUser(userId, { isBlocked: true });
    }
    throw error;
  }
}

module.exports = new BotService();