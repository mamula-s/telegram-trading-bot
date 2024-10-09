const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Spot Signals List');
});

router.post('/', (req, res) => {
  res.send('Create Spot Signal');
});

module.exports = router;