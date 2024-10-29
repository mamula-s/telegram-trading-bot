// src/routes/adminAuth.js
const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { rateLimiter } = require('../middlewares/rateLimiter');

// Логін
router.get('/login', adminAuthController.loginPage);
router.post('/login', rateLimiter(), adminAuthController.login);

// Вихід
router.get('/logout', adminAuthController.logout);

// Відновлення паролю
router.get('/forgot-password', adminAuthController.forgotPasswordPage);
router.post('/forgot-password', rateLimiter(), adminAuthController.forgotPassword);

module.exports = router;