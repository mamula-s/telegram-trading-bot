const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('dashboard', { title: 'Admin Dashboard' });
});

module.exports = router;