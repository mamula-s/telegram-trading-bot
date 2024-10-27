// src/admin/routes/dashboard.js
const express = require('express');
const router = express.Router();
const userService = require('../../services/userService');
const signalService = require('../../services/signalService');
const subscriptionService = require('../../services/subscriptionService');

router.get('/', async (req, res) => {
    try {
        res.render('dashboard', { 
            title: 'Dashboard',
            layout: 'layout'
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/api/dashboard-data', async (req, res) => {
    try {
        const [
            totalUsers,
            activeSubscriptions,
            totalSignals,
            monthlyRevenue,
            recentActivity
        ] = await Promise.all([
            userService.getTotalUsers(),
            subscriptionService.getActiveSubscriptionsCount(),
            signalService.getTotalSignalsCount(),
            subscriptionService.getMonthlyRevenue(),
            userService.getRecentActivity(10)
        ]);

        res.json({
            totalUsers,
            activeSubscriptions,
            totalSignals,
            monthlyRevenue,
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;