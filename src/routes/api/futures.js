const express = require('express');
const router = express.Router();
const signalService = require('../../services/signalService');

router.get('/signals', async (req, res) => {
  try {
    const signals = await signalService.getRecentSignals('futures');
    res.json({ signals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await signalService.getFuturesStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;