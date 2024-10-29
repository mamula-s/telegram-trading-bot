// src/controllers/admin/UserController.js
const BaseController = require('../BaseController');
const userService = require('../../services/userService');

class UserController extends BaseController {
  // Отримання списку користувачів
  async getUsers(req, res) {
    try {
      const { page, limit, offset } = this.getPagination(req);
      const search = req.query.search || '';
      const filter = req.query.filter || 'all';

      const { users, total } = await userService.getUsers({
        page,
        limit,
        offset,
        search,
        filter
      });

      this.sendSuccess(res, {
        users,
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

  // Отримання деталей користувача
  async getUser(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        return this.sendError(res, new Error('User not found'), 404);
      }
      this.sendSuccess(res, user);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Оновлення користувача
  async updateUser(req, res) {
    try {
      const updated = await userService.updateUser(req.params.id, req.body);
      this.sendSuccess(res, updated, 'User updated successfully');
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Блокування/розблокування користувача
  async toggleBlockUser(req, res) {
    try {
      const { blocked } = req.body;
      await userService.toggleUserBlock(req.params.id, blocked);
      this.sendSuccess(res, null, `User ${blocked ? 'blocked' : 'unblocked'} successfully`);
    } catch (error) {
      this.sendError(res, error);
    }
  }

  // Статистика користувачів
  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStats();
      this.sendSuccess(res, stats);
    } catch (error) {
      this.sendError(res, error);
    }
  }
}

module.exports = new UserController();