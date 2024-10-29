// src/controllers/admin/BotController.js
const BaseController = require('../BaseController');
const botService = require('../../services/botService');

class BotController extends BaseController {
  // Відправка масового повідомлення
  async broadcastMessage(req, res) {
    try {
      const { message, options } = req.body;
      const results = await botService.broadcastMessage(message, options);
      this.sendSuccess(res, results, 'Message broadcasted successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Відправка сигналу
  async broadcastSignal(req, res) {
    try {
      const { signal, options } = req.body;
      const results = await botService.broadcastSignal(signal, options);
      this.sendSuccess(res, results, 'Signal broadcasted successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Блокування користувача
  async blockUser(req, res) {
    try {
      const { userId, reason } = req.body;
      await botService.blockUser(userId, reason);
      this.sendSuccess(res, null, 'User blocked successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Розблокування користувача
  async unblockUser(req, res) {
    try {
      const { userId } = req.body;
      await botService.unblockUser(userId);
      this.sendSuccess(res, null, 'User unblocked successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Отримання статистики бота
  async getBotStats(req, res) {
    try {
      const stats = {
        totalUsers: await userService.getTotalUsers(),
        activeToday: await userService.getActiveUsersCount(1),
        activeWeek: await userService.getActiveUsersCount(7),
        activeMonth: await userService.getActiveUsersCount(30),
        blockedUsers: await userService.getBlockedUsersCount(),
        // Додаткова статистика...
      };
      this.sendSuccess(res, stats);
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

module.exports = new BotController();