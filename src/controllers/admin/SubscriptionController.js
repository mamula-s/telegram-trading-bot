// src/controllers/admin/SubscriptionController.js
const BaseController = require('../BaseController');
const subscriptionService = require('../../services/subscriptionService');

class SubscriptionController extends BaseController {
  // Отримання всіх підписок
  async getSubscriptions(req, res) {
    try {
      const { page, limit, offset } = this.getPagination(req);
      const { status } = req.query;

      const { subscriptions, total } = await subscriptionService.getSubscriptions({
        page,
        limit,
        offset,
        status
      });

      this.sendSuccess(res, {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Оновлення підписки
  async updateSubscription(req, res) {
    try {
      const updated = await subscriptionService.updateSubscription(
        req.params.id,
        req.body
      );
      this.sendSuccess(res, updated, 'Subscription updated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Статистика підписок
  async getSubscriptionStats(req, res) {
    try {
      const stats = await subscriptionService.getSubscriptionStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

module.exports = new SubscriptionController();