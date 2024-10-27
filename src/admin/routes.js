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
const dashboardRoutes = require('./routes/dashboard');
const usersRoutes = require('./routes/users');
const spotSignalsRoutes = require('./routes/spotSignals');
const futuresSignalsRoutes = require('./routes/futuresSignals');
const educationalMaterialsRoutes = require('./routes/educationalMaterials');
const referralSystemRoutes = require('./routes/referralSystem');
const reviewsRoutes = require('./routes/reviews');

router.use('/dashboard', dashboardRoutes);
router.use('/users', checkRole('admin', 'super_admin'), usersRoutes);
router.use('/spot-signals', checkRole('admin', 'super_admin'), spotSignalsRoutes);
router.use('/futures-signals', checkRole('admin', 'super_admin'), futuresSignalsRoutes);
router.use('/educational-materials', checkRole('admin', 'moderator'), educationalMaterialsRoutes);
router.use('/referral-system', checkRole('admin', 'super_admin'), referralSystemRoutes);
router.use('/reviews', checkRole('admin', 'moderator'), reviewsRoutes);

// Редірект з кореневого маршруту на дашборд
router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});

module.exports = router;