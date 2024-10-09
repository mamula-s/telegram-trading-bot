const express = require('express');
const router = express.Router();

router.get('/referrals', (req, res) => {
  res.send('Referrals List');
});

router.post('/referrals', (req, res) => {
  res.send('Create Referral');
});

router.get('/referrals/:id', (req, res) => {
  res.send(`Referral Details for ID: ${req.params.id}`);
});

module.exports = router;