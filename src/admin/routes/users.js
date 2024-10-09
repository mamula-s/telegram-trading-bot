const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Users List');
});

router.get('/:id', (req, res) => {
  res.send(`User Details for ID: ${req.params.id}`);
});

router.post('/', (req, res) => {
  res.send('Create User');
});

module.exports = router;