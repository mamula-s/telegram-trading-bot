const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('dashboard', { title: 'Admin Dashboard' });
});

// Додайте інші маршрути адмін-панелі тут, наприклад:
router.get('/users', (req, res) => {
    res.render('users', { title: 'User Management' });
});

router.get('/signals', (req, res) => {
    res.render('signals', { title: 'Signal Management' });
});

module.exports = router;