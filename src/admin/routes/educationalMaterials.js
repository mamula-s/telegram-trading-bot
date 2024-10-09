const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Educational Materials List');
});

router.get('/:id', (req, res) => {
  res.send(`Educational Material Details for ID: ${req.params.id}`);
});

router.post('/', (req, res) => {
  res.send('Create Educational Material');
});

module.exports = router;