// src/controllers/adminAuthController.js
const adminService = require('../services/adminService');
const emailService = require('../services/emailService');

class AdminAuthController {
  // Сторінка логіну
  async loginPage(req, res) {
    res.render('admin/login', {
      layout: false,
      error: req.flash('error')
    });
  }

  // Процес логіну
  async login(req, res) {
    try {
      const { username, password } = req.body;

      const admin = await adminService.validateCredentials(username, password);
      
      if (!admin) {
        req.flash('error', 'Невірний логін або пароль');
        return res.redirect('/admin/login');
      }

      const token = adminService.generateToken(admin);

      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 години
      });

      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error', 'Помилка при вході');
      res.redirect('/admin/login');
    }
  }

  // Вихід
  async logout(req, res) {
    res.clearCookie('adminToken');
    res.redirect('/admin/login');
  }

  // Сторінка відновлення паролю
  async forgotPasswordPage(req, res) {
    res.render('admin/forgot-password', {
      layout: false,
      error: req.flash('error'),
      success: req.flash('success')
    });
  }

  // Процес відновлення паролю
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const resetToken = await adminService.generateResetToken(email);

      if (resetToken) {
        await emailService.sendPasswordResetEmail(email, resetToken);
      }

      // Завжди показуємо успішне повідомлення (захист від enumeration)
      req.flash('success', 'Якщо вказаний email існує, на нього буде надіслано інструкції');
      res.redirect('/admin/forgot-password');
    } catch (error) {
      console.error('Password reset error:', error);
      req.flash('error', 'Помилка при обробці запиту');
      res.redirect('/admin/forgot-password');
    }
  }
}

module.exports = new AdminAuthController();