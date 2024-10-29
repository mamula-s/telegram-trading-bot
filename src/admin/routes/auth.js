// src/admin/routes/auth.js
const express = require('express');
const router = express.Router();
const adminService = require('../../services/adminService');
const { rateLimiters } = require('../middleware/rateLimiter');

// Логін сторінка
router.get('/login', (req, res) => {
  res.render('login', {
    layout: false,
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// Процес логіну
router.post('/login', rateLimiters.auth, async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await adminService.validateCredentials(username, password);
    
    if (!admin) {
      return res.redirect('/admin/login?error=' + encodeURIComponent('Невірний логін або пароль'));
    }

    const token = adminService.generateToken(admin);
    
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 години
    });

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.redirect('/admin/login?error=' + encodeURIComponent('Помилка при вході'));
  }
});

// Вихід
router.get('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login?success=' + encodeURIComponent('Ви успішно вийшли'));
});

// Відновлення паролю - сторінка
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', {
    layout: false,
    error: req.query.error || null,
    success: req.query.success || null
  });
});

// Відновлення паролю - процес
router.post('/forgot-password', rateLimiters.passwordReset, async (req, res) => {
  try {
    const { email } = req.body;
    const token = await adminService.generateResetToken(email);

    // Завжди показуємо успішне повідомлення (захист від enumeration)
    res.redirect('/admin/forgot-password?success=' + 
      encodeURIComponent('Якщо email існує, інструкції з відновлення паролю будуть надіслані'));
  } catch (error) {
    console.error('Password reset error:', error);
    res.redirect('/admin/forgot-password?error=' + 
      encodeURIComponent('Помилка при відновленні паролю'));
  }
});

// Зміна паролю
router.get('/reset-password/:token', (req, res) => {
  res.render('reset-password', {
    layout: false,
    token: req.params.token,
    error: req.query.error || null
  });
});

router.post('/reset-password/:token', rateLimiters.passwordReset, async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if (password !== confirmPassword) {
      return res.redirect(`/admin/reset-password/${token}?error=` + 
        encodeURIComponent('Паролі не співпадають'));
    }

    await adminService.resetPassword(token, password);
    res.redirect('/admin/login?success=' + 
      encodeURIComponent('Пароль успішно змінено'));
  } catch (error) {
    console.error('Password reset error:', error);
    res.redirect(`/admin/reset-password/${req.params.token}?error=` + 
      encodeURIComponent('Помилка при зміні паролю'));
  }
});

module.exports = router;