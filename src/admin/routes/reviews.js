const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Reviews List');
});

router.post('/', (req, res) => {
  res.send('Create Review');
});

router.get('/:id', (req, res) => {
  res.send(`Review Details for ID: ${req.params.id}`);
});

module.exports = router;