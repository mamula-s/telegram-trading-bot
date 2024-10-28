const User = require('../models/User');
const Signal = require('../models/Signal');
const Session = require('../models/Session');
const Activity = require('../models/Activity');
const ApiKey = require('../models/ApiKey');
const ReferralCode = require('../models/ReferralCode');
const subscriptionService = require('./subscriptionService');
const crypto = require('crypto');

class ProfileService {
  async getProfile(userId) {
    try {
      const user = await User.findById(userId)
        .populate('subscription')
        .populate('referralCode')
        .select('-password');

      if (!user) {
        throw new Error('User not found');
      }

      // Отримуємо додаткові дані для профілю
      const [referralStats, activeSignals] = await Promise.all([
        this.getReferralStats(user.referralCode?._id),
        Signal.countDocuments({
          userId,
          status: 'ACTIVE'
        })
      ]);

      return {
        ...user.toJSON(),
        referralStats,
        activeSignals
      };
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  async getProfileStats(userId) {
    try {
      const [
        totalTrades,
        successfulTrades,
        signals,
        totalProfit
      ] = await Promise.all([
        Signal.countDocuments({ userId, status: 'CLOSED' }),
        Signal.countDocuments({ userId, status: 'CLOSED', profit: { $gt: 0 } }),
        Signal.countDocuments({ userId }),
        Signal.aggregate([
          { $match: { userId, status: 'CLOSED' } },
          { $group: { _id: null, totalProfit: { $sum: '$profit' } } }
        ])
      ]);

      const successRate = totalTrades > 0 
        ? (successfulTrades / totalTrades * 100).toFixed(1) 
        : 0;

      return {
        totalTrades,
        successRate,
        totalSignals: signals,
        totalProfit: totalProfit[0]?.totalProfit.toFixed(1) || 0
      };
    } catch (error) {
      console.error('Error getting profile stats:', error);
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const allowedUpdates = [
        'firstName',
        'lastName',
        'language',
        'timezone',
        'notificationSettings'
      ];

      const updates = Object.keys(updateData)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {});

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      );

      return user;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getReferralStats(referralCodeId) {
    try {
      if (!referralCodeId) return null;

      const referrals = await ReferralCode.aggregate([
        { $match: { _id: referralCodeId } },
        {
          $lookup: {
            from: 'users',
            localField: 'referrals',
            foreignField: '_id',
            as: 'referredUsers'
          }
        },
        {
          $project: {
            totalReferrals: { $size: '$referrals' },
            activeReferrals: {
              $size: {
                $filter: {
                  input: '$referredUsers',
                  as: 'user',
                  cond: { $eq: ['$$user.isActive', true] }
                }
              }
            },
            totalEarned: 1,
            pendingRewards: 1
          }
        }
      ]);

      return referrals[0] || null;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  async deleteAccount(userId) {
    try {
      // Спочатку скасовуємо підписку
      await subscriptionService.cancelSubscription(userId);

      // Видаляємо пов'язані дані
      await Promise.all([
        Signal.deleteMany({ userId }),
        ReferralCode.deleteOne({ userId }),
        Session.deleteMany({ userId }),
        Activity.deleteMany({ userId }),
        ApiKey.deleteMany({ userId })
      ]);

      // Видаляємо користувача
      await User.findByIdAndDelete(userId);

      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  async getActiveSessions(userId) {
    try {
      const sessions = await Session.find({ userId, isActive: true })
        .select('deviceInfo lastActivity ipAddress')
        .sort({ lastActivity: -1 });

      return sessions;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }

  async terminateSession(userId, sessionId) {
    try {
      await Session.findOneAndUpdate(
        { _id: sessionId, userId },
        { 
          isActive: false,
          terminatedAt: new Date(),
          terminatedBy: 'user'
        }
      );
      return true;
    } catch (error) {
      console.error('Error terminating session:', error);
      throw error;
    }
  }

  async terminateAllSessions(userId, exceptSessionId) {
    try {
      await Session.updateMany(
        { 
          userId, 
          isActive: true,
          _id: { $ne: exceptSessionId }
        },
        { 
          isActive: false,
          terminatedAt: new Date(),
          terminatedBy: 'user'
        }
      );
      return true;
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      throw error;
    }
  }

  async updateSecuritySettings(userId, settings) {
    try {
      const allowedSettings = [
        'twoFactorEnabled',
        'loginNotifications',
        'tradingConfirmation',
        'withdrawalConfirmation'
      ];

      const updates = Object.keys(settings)
        .filter(key => allowedSettings.includes(key))
        .reduce((obj, key) => {
          obj[`securitySettings.${key}`] = settings[key];
          return obj;
        }, {});

      await User.findByIdAndUpdate(userId, updates);
      return true;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  async getActivityLog(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [activities, total] = await Promise.all([
        Activity.find({ userId })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        Activity.countDocuments({ userId })
      ]);

      return {
        activities,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting activity log:', error);
      throw error;
    }
  }

  async recordActivity(userId, type, details) {
    try {
      await Activity.create({
        userId,
        type,
        details,
        timestamp: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error recording activity:', error);
      // Не пробрасываем ошибку, так как это не критичная операция
      return false;
    }
  }

  async getTradingHistory(userId, filters = {}) {
    try {
      const query = { userId };

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      const trades = await Signal.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50);

      // Розрахунок статистики
      const stats = await Signal.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalTrades: { $sum: 1 },
            profitableTrades: {
              $sum: { $cond: [{ $gt: ['$profit', 0] }, 1, 0] }
            },
            totalProfit: { $sum: '$profit' },
            avgProfit: { $avg: '$profit' }
          }
        }
      ]);

      return {
        trades,
        stats: stats[0] || {
          totalTrades: 0,
          profitableTrades: 0,
          totalProfit: 0,
          avgProfit: 0
        }
      };
    } catch (error) {
      console.error('Error getting trading history:', error);
      throw error;
    }
  }

  async generateApiKey(userId, description, permissions = []) {
    try {
      const apiKey = crypto.randomBytes(32).toString('hex');
      const hashedKey = crypto
        .createHash('sha256')
        .update(apiKey)
        .digest('hex');

      await ApiKey.create({
        userId,
        description,
        key: hashedKey,
        permissions,
        createdAt: new Date()
      });

      await this.recordActivity(userId, 'API_KEY_GENERATED', {
        description,
        permissions
      });

      return apiKey; // Повертаємо оригінальний ключ (показується тільки один раз)
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  async getApiKeys(userId) {
    try {
      const keys = await ApiKey.find({ userId })
        .select('description createdAt lastUsed permissions');
      return keys;
    } catch (error) {
      console.error('Error getting API keys:', error);
      throw error;
    }
  }

  async revokeApiKey(userId, keyId) {
    try {
      const key = await ApiKey.findOneAndDelete({ _id: keyId, userId });
      if (key) {
        await this.recordActivity(userId, 'API_KEY_REVOKED', {
          keyId,
          description: key.description
        });
      }
      return true;
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  }

  async updateNotificationSettings(userId, settings) {
    try {
      const allowedSettings = [
        'emailNotifications',
        'pushNotifications',
        'telegramNotifications',
        'signalAlerts',
        'priceAlerts',
        'newsAlerts',
        'marketingNotifications'
      ];

      const updates = Object.keys(settings)
        .filter(key => allowedSettings.includes(key))
        .reduce((obj, key) => {
          obj[`notificationSettings.${key}`] = settings[key];
          return obj;
        }, {});

      await User.findByIdAndUpdate(userId, updates);
      
      await this.recordActivity(userId, 'NOTIFICATION_SETTINGS_UPDATED', {
        updates
      });

      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  async exportUserData(userId) {
    try {
      const [user, signals, activities] = await Promise.all([
        User.findById(userId).select('-password'),
        Signal.find({ userId }),
        Activity.find({ userId })
      ]);

      const userData = {
        profile: user.toJSON(),
        tradingHistory: signals,
        activityLog: activities,
        exportDate: new Date()
      };

      await this.recordActivity(userId, 'DATA_EXPORTED', {
        timestamp: new Date()
      });

      return userData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
}

module.exports = new ProfileService();