const express = require('express');
const router = express.Router();
const signalService = require('../services/signalService');
const { checkRole } = require('../middleware/auth');

// Спільні статистичні дані
router.get('/api/signals/stats', async (req, res) => {
  try {
    const stats = await signalService.getSignalsStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

// Ф'ючерсні сигнали
router.get('/api/futures/stats', async (req, res) => {
  try {
    const stats = await signalService.getFuturesStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching futures stats' });
  }
});

router.get('/api/futures/signals', async (req, res) => {
  try {
    const { signals, performance } = await signalService.getFuturesSignals(req.query);
    res.json({ signals, performance });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching futures signals' });
  }
});

// Спот сигнали
router.get('/api/spot/stats', async (req, res) => {
  try {
    const stats = await signalService.getSpotStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching spot stats' });
  }
});

router.get('/api/spot/signals', async (req, res) => {
  try {
    const { signals, performance } = await signalService.getSpotSignals(req.query);
    res.json({ signals, performance });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching spot signals' });
  }
});

router.get('/api/spot/holdings', async (req, res) => {
  try {
    const holdings = await signalService.getUserHoldings(req.user.id);
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching holdings' });
  }
});

// Приєднання до сигналів
router.post('/api/futures/signals/:id/join', async (req, res) => {
  try {
    await signalService.joinFuturesSignal(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error joining futures signal' });
  }
});

router.post('/api/spot/signals/:id/join', async (req, res) => {
  try {
    await signalService.joinSpotSignal(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error joining spot signal' });
  }
});

// Скасування сигналу
router.delete('/api/signals/:id/cancel', checkRole('admin'), async (req, res) => {
  try {
    await signalService.cancelSignal(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error cancelling signal' });
  }
});

module.exports = router;