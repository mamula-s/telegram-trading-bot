const express = require('express');
const router = express.Router();
const signalService = require('../../services/signalService');

router.get('/signals', async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    const signals = await signalService.getSpotSignals({ status, page, limit });
    res.json({ signals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await signalService.getSpotStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/holdings', async (req, res) => {
  try {
    const holdings = await signalService.getUserHoldings(req.telegramUser.id);
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;