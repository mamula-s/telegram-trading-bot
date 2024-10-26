// src/admin/routes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

// Роути автентифікації (доступні без авторизації)
router.use('/', authRoutes);

// Захищені роути (потребують авторизації)
router.use(authMiddleware);

// Підключаємо інші роути з перевіркою ролей
router.use('/dashboard', require('./routes/dashboard'));
router.use('/users', checkRole('admin', 'super_admin'), require('./routes/users'));
router.use('/spot-signals', checkRole('admin', 'super_admin'), require('./routes/spotSignals'));
router.use('/futures-signals', checkRole('admin', 'super_admin'), require('./routes/futuresSignals'));
router.use('/educational-materials', checkRole('admin', 'moderator'), require('./routes/educationalMaterials'));
router.use('/referral-system', checkRole('admin', 'super_admin'), require('./routes/referralSystem'));
router.use('/reviews', checkRole('admin', 'moderator'), require('./routes/reviews'));

module.exports = router;