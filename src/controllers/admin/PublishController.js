// src/controllers/admin/PublishController.js
const BaseController = require('../BaseController');
const publishService = require('../../services/publishService');

class PublishController extends BaseController {
  // Публікація сигналу
  async publishSignal(req, res) {
    try {
      const { signal, options } = req.body;
      const published = await publishService.publishSignal(signal, options);
      this.sendSuccess(res, published, 'Signal published successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Оновлення статусу сигналу
  async updateSignalStatus(req, res) {
    try {
      const { signalId } = req.params;
      const { status, result } = req.body;
      const updated = await publishService.updateSignalStatus(
        signalId,
        status,
        result
      );
      this.sendSuccess(res, updated, 'Signal status updated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Публікація новин
  async publishNews(req, res) {
    try {
      const { news } = req.body;
      const published = await publishService.publishNews(news);
      this.sendSuccess(res, published, 'News published successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Публікація навчальних матеріалів
  async publishEducationalMaterial(req, res) {
    try {
      const { material } = req.body;
      const published = await publishService.publishEducationalMaterial(material);
      this.sendSuccess(res, published, 'Material published successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

module.exports = new PublishController();