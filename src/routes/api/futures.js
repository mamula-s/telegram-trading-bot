const express = require('express');
const router = express.Router();

// GET /api/futures/stats
router.get('/stats', (req, res) => {
  res.json({
    totalTrades: 0,
    successRate: 0,
    profitTotal: 0,
    avgProfit: 0
  });
});

// GET /api/futures/signals
router.get('/signals', (req, res) => {
  res.json({
    signals: [],
    performance: []
  });
});

module.exports = router;