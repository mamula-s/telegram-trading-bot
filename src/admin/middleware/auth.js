// src/admin/middleware/auth.js
const adminService = require('../../services/adminService');

const authMiddleware = async (req, res, next) => {
    try {
        // Перевіряємо токен з cookies
        const token = req.cookies.adminToken;
        if (!token) {
            return res.redirect('/admin/login');
        }

        // Перевіряємо валідність токену
        const decoded = await adminService.verifyToken(token);
        if (!decoded) {
            res.clearCookie('adminToken');
            return res.redirect('/admin/login');
        }

        // Додаємо дані адміна до request
        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.clearCookie('adminToken');
        res.redirect('/admin/login');
    }
};

// Middleware для перевірки ролі
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