// src/admin/middleware/auth.js
const adminService = require('../../services/adminService');

const authMiddleware = async (req, res, next) => {
  try {
    // Перевіряємо токен з cookies
    const token = req.cookies.adminToken;
    
    if (!token) {
      return res.redirect('/admin/login');
    }

    try {
      // Верифікуємо токен та отримуємо адміна
      const admin = await adminService.verifyToken(token);
      
      // Додаємо адміна до request
      req.admin = admin;
      
      // Зберігаємо базову інформацію для шаблонів
      res.locals.admin = {
        username: admin.username,
        role: admin.role
      };

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.clearCookie('adminToken');
      return res.redirect('/admin/login');
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
  }
};

// Middleware для перевірки ролей
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).render('error', {
        message: 'Доступ заборонено',
        layout: 'layout'
      });
    }
    next();
  };
};

module.exports = { authMiddleware, checkRole };