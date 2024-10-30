const express = require('express');
const router = express.Router();
const referralService = require('../../services/referralService');

router.get('/data', async (req, res) => {
  try {
    const data = await referralService.getUserReferralData(req.telegramUser.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;