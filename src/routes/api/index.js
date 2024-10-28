const express = require('express');
const router = express.Router();
const signalService = require('../../services/signalService');
const userService = require('../../services/userService');
const telegramService = require('../../services/telegramService');
const { validateWebAppData } = require('../../middleware/telegramAuth');

// Middleware для перевірки Telegram WebApp даних
router.use(validateWebAppData);

// Signals
router.get('/signals/futures', async (req, res) => {
  try {
    const signals = await signalService.getFuturesSignals();
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching futures signals' });
  }
});

router.get('/signals/spot', async (req, res) => {
  try {
    const signals = await signalService.getSpotSignals();
    res.json(signals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching spot signals' });
  }
});

// User Profile
router.get('/profile', async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

router.get('/profile/stats', async (req, res) => {
  try {
    const stats = await userService.getUserStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

// Notifications
router.get('/notifications', async (req, res) => {
  try {
    const notifications = await userService.getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Subscriptions
router.post('/subscribe', async (req, res) => {
  try {
    const result = await userService.createSubscription(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error creating subscription' });
  }
});

// Signal Join
router.post('/signals/:type/:id/join', async (req, res) => {
  try {
    const { type, id } = req.params;
    const result = await signalService.joinSignal(id, type, req.user.id);
    
    // Відправляємо сповіщення через бота
    await telegramService.sendSignalJoinNotification(req.user.id, result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error joining signal' });
  }
});

// Educational Materials
router.get('/education/materials', async (req, res) => {
  try {
    const materials = await userService.getEducationalMaterials(req.user.id);
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching materials' });
  }
});

// Referral System
router.get('/referral/stats', async (req, res) => {
  try {
    const stats = await userService.getReferralStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching referral stats' });
  }
});

router.post('/referral/invite', async (req, res) => {
  try {
    const result = await userService.createReferralInvite(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error creating referral invite' });
  }
});

module.exports = router;