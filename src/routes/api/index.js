const express = require('express');
const router = express.Router();
const telegramAuthMiddleware = require('../../middleware/telegramAuth');

// Підключаємо роути
router.use('/user', require('./user'));
router.use('/futures', require('./futures'));
router.use('/spot', require('./spot'));
router.use('/referral', require('./referral'));
router.use('/notifications', require('./notifications'));

// Додаємо middleware для перевірки авторизації
router.use(telegramAuthMiddleware);

module.exports = router;