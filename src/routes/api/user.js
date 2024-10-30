const express = require('express');
const router = express.Router();
const userService = require('../../services/userService');

router.get('/profile', async (req, res) => {
  try {
    const user = await userService.getUserByTelegramId(req.telegramUser.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;