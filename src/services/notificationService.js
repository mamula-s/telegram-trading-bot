const Notification = require('../models/Notification');
const User = require('../models/User');
const bot = require('../bot');

class NotificationService {
  async getNotifications(userId, type = 'all') {
    try {
      let query = { userId };
      
      switch (type) {
        case 'unread':
          query.isRead = false;
          break;
        case 'signals':
          query.type = 'signal';
          break;
        case 'news':
          query.type = 'news';
          break;
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);
        
      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  async createNotification(data) {
    try {
      const notification = await Notification.create(data);
      
      // Відправляємо сповіщення в Telegram, якщо користувач онлайн
      const user = await User.findById(data.userId);
      if (user?.isOnline) {
        await this.sendTelegramNotification(user.telegramId, notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async clearAllNotifications(userId) {
    try {
      await Notification.deleteMany({ userId });
      return true;
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }

  async sendTelegramNotification(telegramId, notification) {
    try {
      const message = this.formatTelegramMessage(notification);
      await bot.sendMessage(telegramId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  formatTelegramMessage(notification) {
    const icons = {
      signal: '📊',
      message: '💬',
      promo: '🎁',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️'
    };

    return `
${icons[notification.type] || 'ℹ️'} <b>${notification.title}</b>

${notification.message}

<i>${new Date(notification.createdAt).toLocaleString()}</i>
    `.trim();
  }

  async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({ userId, isRead: false });
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

module.exports = new NotificationService();