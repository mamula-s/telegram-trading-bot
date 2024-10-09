const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Futures Signals List');
});

router.post('/', (req, res) => {
  res.send('Create Futures Signal');
});

module.exports = router;