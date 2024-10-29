// src/controllers/BaseController.js
class BaseController {
    sendSuccess(res, data, message = 'Success') {
      res.json({
        success: true,
        message,
        data
      });
    }
  
    sendError(res, error, status = 500) {
      res.status(status).json({
        success: false,
        error: error.message || 'Internal Server Error'
      });
    }
  
    getPagination(req) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
  
      return { page, limit, offset };
    }
  }
  
  module.exports = BaseController;