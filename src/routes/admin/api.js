const express = require('express');
const router = express.Router();
const { adminAuth, checkRole } = require('../../middleware/adminAuth');
const UserController = require('../../controllers/admin/UserController');
const SignalController = require('../../controllers/admin/SignalController');
const SubscriptionController = require('../../controllers/admin/SubscriptionController');


// Middleware для всіх адмін API роутів
router.use(adminAuth);

// Users routes
router.get('/users', UserController.getUsers.bind(UserController));
router.get('/users/:id', UserController.getUser.bind(UserController));
router.put('/users/:id', checkRole('admin', 'super_admin'), UserController.updateUser.bind(UserController));
router.post('/users/:id/block', checkRole('admin', 'super_admin'), UserController.toggleBlockUser.bind(UserController));
router.get('/users/stats', UserController.getUserStats.bind(UserController));

// Signals routes
router.get('/signals', SignalController.getSignals.bind(SignalController));
router.post('/signals', checkRole('admin', 'super_admin'), SignalController.createSignal.bind(SignalController));
router.put('/signals/:id', checkRole('admin', 'super_admin'), SignalController.updateSignal.bind(SignalController));
router.post('/signals/:id/close', checkRole('admin', 'super_admin'), SignalController.closeSignal.bind(SignalController));
router.get('/signals/stats', SignalController.getSignalStats.bind(SignalController));

// Subscriptions routes
router.get('/subscriptions', SubscriptionController.getSubscriptions.bind(SubscriptionController));
router.put('/subscriptions/:id', checkRole('admin', 'super_admin'), SubscriptionController.updateSubscription.bind(SubscriptionController));
router.get('/subscriptions/stats', SubscriptionController.getSubscriptionStats.bind(SubscriptionController));

module.exports = router;