const express = require('express');
const router = express.Router();

router.get('/count', async (req, res) => {
  try {
    // Заглушка, поки не реалізований сервіс нотифікацій
    res.json({ count: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;