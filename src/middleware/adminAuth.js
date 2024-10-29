// src/middlewares/adminAuth.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    // Перевіряємо токен з cookies
    const token = req.cookies.adminToken;
    
    if (!token) {
      return res.status(401).redirect('/admin/login');
    }

    // Верифікуємо токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Знаходимо адміна
    const admin = await Admin.findByPk(decoded.id);
    
    if (!admin) {
      throw new Error('Admin not found');
    }

    // Додаємо адміна до request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.clearCookie('adminToken');
    res.status(401).redirect('/admin/login');
  }
};

// Middleware для перевірки ролей
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({
        error: 'Доступ заборонено'
      });
    }
    next();
  };
};

module.exports = { adminAuth, checkRole };