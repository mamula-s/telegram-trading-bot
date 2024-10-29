// src/controllers/admin/SignalController.js
const BaseController = require('../BaseController');
const signalService = require('../../services/signalService');

class SignalController extends BaseController {
  // Отримання списку сигналів
  async getSignals(req, res) {
    try {
      const { page, limit, offset } = this.getPagination(req);
      const { type, status, dateRange } = req.query;

      const { signals, total } = await signalService.getSignals({
        page,
        limit,
        offset,
        type,
        status,
        dateRange
      });

      this.sendSuccess(res, {
        signals,
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

  // Створення сигналу
  async createSignal(req, res) {
    try {
      const signal = await signalService.createSignal(req.body);
      this.sendSuccess(res, signal, 'Signal created successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Оновлення сигналу
  async updateSignal(req, res) {
    try {
      const updated = await signalService.updateSignal(req.params.id, req.body);
      this.sendSuccess(res, updated, 'Signal updated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Закриття сигналу
  async closeSignal(req, res) {
    try {
      const closed = await signalService.closeSignal(req.params.id, req.body);
      this.sendSuccess(res, closed, 'Signal closed successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Статистика сигналів
  async getSignalStats(req, res) {
    try {
      const stats = await signalService.getSignalStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

module.exports = new SignalController();