// src/routes/admin/bot.js
const express = require('express');
const router = express.Router();
const BotController = require('../../controllers/admin/BotController');
const { adminAuth, checkRole } = require('../../middlewares/adminAuth');

router.use(adminAuth);

// Broadcast routes
router.post('/broadcast/message', 
  checkRole('admin', 'super_admin'), 
  BotController.broadcastMessage.bind(BotController)
);

router.post('/broadcast/signal', 
  checkRole('admin', 'super_admin'), 
  BotController.broadcastSignal.bind(BotController)
);

// User management routes
router.post('/users/:id/block',
  checkRole('admin', 'super_admin'),
  BotController.blockUser.bind(BotController)
);

router.post('/users/:id/unblock',
  checkRole('admin', 'super_admin'),
  BotController.unblockUser.bind(BotController)
);

// Stats route
router.get('/stats',
  BotController.getBotStats.bind(BotController)
);

module.exports = router;