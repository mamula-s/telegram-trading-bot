const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboard');
const usersRoutes = require('./users');
const futuresSignalsRoutes = require('./futuresSignals');
const spotSignalsRoutes = require('./spotSignals');
const educationalMaterialsRoutes = require('./educationalMaterials');
const reviewsRoutes = require('./reviews');
const referralSystemRoutes = require('./referralSystem');

router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/futures-signals', futuresSignalsRoutes);
router.use('/spot-signals', spotSignalsRoutes);
router.use('/educational-materials', educationalMaterialsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/referral-system', referralSystemRoutes);

module.exports = router;