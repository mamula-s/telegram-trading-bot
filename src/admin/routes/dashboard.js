const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Dashboard Home');
});

router.get('/stats', (req, res) => {
  res.send('Dashboard Statistics');
});

module.exports = router;