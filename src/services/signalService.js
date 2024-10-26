// src/services/signalService.js
const { Op } = require('sequelize');
const Signal = require('../models/Signal');
const userService = require('./userService');
const botService = require('./botService');

class SignalService {
    async getSpotSignals(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            const whereClause = {
                type: 'SPOT'
            };

            // Додаємо фільтри
            if (filters.pair) {
                whereClause.pair = { [Op.like]: `%${filters.pair}%` };
            }
            if (filters.status) {
                whereClause.status = filters.status;
            }
            if (filters.dateFrom || filters.dateTo) {
                whereClause.createdAt = {};
                if (filters.dateFrom) {
                    whereClause.createdAt[Op.gte] = new Date(filters.dateFrom);
                }
                if (filters.dateTo) {
                    whereClause.createdAt[Op.lte] = new Date(filters.dateTo);
                }
            }

            const { rows: signals, count: total } = await Signal.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            return { signals, total };
        } catch (error) {
            console.error('Error getting spot signals:', error);
            throw error;
        }
    }

    async getFuturesSignals(page = 1, limit = 10, filters = {}) {
        try {
            const offset = (page - 1) * limit;
            const whereClause = {
                type: 'FUTURES'
            };

            // Додаємо фільтри
            if (filters.pair) {
                whereClause.pair = { [Op.like]: `%${filters.pair}%` };
            }
            if (filters.status) {
                whereClause.status = filters.status;
            }
            if (filters.dateFrom || filters.dateTo) {
                whereClause.createdAt = {};
                if (filters.dateFrom) {
                    whereClause.createdAt[Op.gte] = new Date(filters.dateFrom);
                }
                if (filters.dateTo) {
                    whereClause.createdAt[Op.lte] = new Date(filters.dateTo);
                }
            }

            const { rows: signals, count: total } = await Signal.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });

            return { signals, total };
        } catch (error) {
            console.error('Error getting futures signals:', error);
            throw error;
        }
    }

    async getSignalById(id) {
        try {
            const signal = await Signal.findByPk(id);
            if (!signal) {
                throw new Error('Signal not found');
            }
            return signal;
        } catch (error) {
            console.error('Error getting signal by id:', error);
            throw error;
        }
    }

    async createSignal(signalData) {
        try {
            const signal = await Signal.create(signalData);
            console.log('Created new signal:', signal.toJSON());
            return signal;
        } catch (error) {
            console.error('Error creating signal:', error);
            throw error;
        }
    }

    async updateSignal(id, updateData) {
        try {
            const signal = await this.getSignalById(id);
            await signal.update(updateData);
            console.log('Updated signal:', signal.toJSON());
            return signal;
        } catch (error) {
            console.error('Error updating signal:', error);
            throw error;
        }
    }

    async closeSignal(id, closeData) {
        try {
            const signal = await this.getSignalById(id);
            
            if (signal.status !== 'ACTIVE') {
                throw new Error('Can only close active signals');
            }

            await signal.update({
                status: 'CLOSED',
                exitPrice: closeData.exitPrice,
                result: closeData.result,
                closeNote: closeData.note,
                closedAt: new Date()
            });

            console.log('Closed signal:', signal.toJSON());
            return signal;
        } catch (error) {
            console.error('Error closing signal:', error);
            throw error;
        }
    }

    async deleteSignal(id) {
        try {
            const signal = await this.getSignalById(id);
            await signal.destroy();
            console.log('Deleted signal:', id);
        } catch (error) {
            console.error('Error deleting signal:', error);
            throw error;
        }
    }

    async getSignalStats() {
        try {
            const [spotTotal, futuresTotal] = await Promise.all([
                Signal.count({ where: { type: 'SPOT' } }),
                Signal.count({ where: { type: 'FUTURES' } })
            ]);

            const [spotActive, futuresActive] = await Promise.all([
                Signal.count({ where: { type: 'SPOT', status: 'ACTIVE' } }),
                Signal.count({ where: { type: 'FUTURES', status: 'ACTIVE' } })
            ]);

            const successfulSignals = await Signal.findAll({
                where: {
                    status: 'CLOSED',
                    result: { [Op.gt]: 0 }
                }
            });

            const totalClosed = await Signal.count({ where: { status: 'CLOSED' } });
            const successRate = totalClosed > 0 ? (successfulSignals.length / totalClosed) * 100 : 0;

            return {
                spotTotal,
                futuresTotal,
                spotActive,
                futuresActive,
                successRate: successRate.toFixed(2),
                totalSuccessful: successfulSignals.length,
                totalClosed
            };
        } catch (error) {
            console.error('Error getting signal stats:', error);
            throw error;
        }
    }
    async getSignalsStatistics() {
      try {
          // Отримуємо всі закриті сигнали
          const closedSignals = await Signal.findAll({
              where: {
                  status: 'CLOSED',
                  closedAt: {
                      [Op.not]: null
                  }
              },
              order: [['closedAt', 'ASC']]
          });
  
          // Базова статистика
          const stats = {
              spot: {
                  successful: 0,
                  total: 0,
                  totalProfit: 0,
                  maxProfit: 0,
                  maxLoss: 0,
                  duration: []
              },
              futures: {
                  successful: 0,
                  total: 0,
                  totalProfit: 0,
                  maxProfit: 0,
                  maxLoss: 0,
                  duration: []
              },
              total: {
                  successful: 0,
                  total: closedSignals.length,
                  maxProfit: 0,
                  maxLoss: 0,
                  duration: []
              },
              monthly: {
                  labels: [],
                  spotData: [],
                  futuresData: []
              },
              pnlDistribution: {
                  labels: ['-100%+', '-75%', '-50%', '-25%', '0%', '+25%', '+50%', '+75%', '+100%+'],
                  data: new Array(9).fill(0),
                  colors: []
              }
          };
  
          // Групуємо сигнали по місяцях
          const monthlyData = {};
  
          closedSignals.forEach(signal => {
              const type = signal.type.toLowerCase();
              const result = parseFloat(signal.result);
              const duration = Math.floor((new Date(signal.closedAt) - new Date(signal.createdAt)) / (1000 * 60 * 60)); // в годинах
  
              // Оновлюємо статистику по типу
              stats[type].total++;
              if (result > 0) stats[type].successful++;
              stats[type].totalProfit += result;
              stats[type].maxProfit = Math.max(stats[type].maxProfit, result);
              stats[type].maxLoss = Math.min(stats[type].maxLoss, result);
              stats[type].duration.push(duration);
  
              // Оновлюємо загальну статистику
              if (result > 0) stats.total.successful++;
              stats.total.maxProfit = Math.max(stats.total.maxProfit, result);
              stats.total.maxLoss = Math.min(stats.total.maxLoss, result);
              stats.total.duration.push(duration);
  
              // Розподіл PNL
              const pnlIndex = this._getPnlDistributionIndex(result);
              stats.pnlDistribution.data[pnlIndex]++;
  
              // Групуємо по місяцях
              const monthKey = new Date(signal.closedAt).toISOString().slice(0, 7);
              if (!monthlyData[monthKey]) {
                  monthlyData[monthKey] = {
                      spot: { successful: 0, total: 0 },
                      futures: { successful: 0, total: 0 }
                  };
              }
              monthlyData[monthKey][type].total++;
              if (result > 0) monthlyData[monthKey][type].successful++;
          });
  
          // Розраховуємо місячні показники
          Object.entries(monthlyData)
              .sort(([a], [b]) => a.localeCompare(b))
              .forEach(([month, data]) => {
                  stats.monthly.labels.push(month);
                  stats.monthly.spotData.push(
                      data.spot.total ? (data.spot.successful / data.spot.total) * 100 : 0
                  );
                  stats.monthly.futuresData.push(
                      data.futures.total ? (data.futures.successful / data.futures.total) * 100 : 0
                  );
              });
  
          // Розраховуємо середні показники
          for (const type of ['spot', 'futures', 'total']) {
              const typeStats = stats[type];
              typeStats.successRate = ((typeStats.successful / typeStats.total) * 100).toFixed(2);
              typeStats.avgDuration = typeStats.duration.length
                  ? `${Math.round(typeStats.duration.reduce((a, b) => a + b, 0) / typeStats.duration.length)}год`
                  : 'N/A';
          }
  
          // Встановлюємо кольори для розподілу PNL
          stats.pnlDistribution.colors = stats.pnlDistribution.labels.map(label =>
              label.includes('+') ? 'rgba(34, 197, 94, 0.6)' :
              label.includes('-') ? 'rgba(239, 68, 68, 0.6)' : 'rgba(234, 179, 8, 0.6)'
          );
  
          return stats;
      } catch (error) {
          console.error('Error getting signals statistics:', error);
          throw error;
      }
  }
  
  _getPnlDistributionIndex(result) {
      if (result <= -100) return 0;
      if (result <= -75) return 1;
      if (result <= -50) return 2;
      if (result <= -25) return 3;
      if (result <= 0) return 4;
      if (result <= 25) return 5;
      if (result <= 50) return 6;
      if (result <= 75) return 7;
      return 8;
  }

    async notifyUsers(signal) {
        try {
            const users = await userService.getSubscribedUsers();
            const message = this._formatSignalMessage(signal, 'new');
            
            for (const user of users) {
                if (this._canReceiveSignal(user, signal)) {
                    await botService.sendMessage(user.telegramId, message);
                }
            }
        } catch (error) {
            console.error('Error notifying users about new signal:', error);
            throw error;
        }
    }

    async notifyUsersUpdate(signal) {
        try {
            const users = await userService.getSubscribedUsers();
            const message = this._formatSignalMessage(signal, 'update');
            
            for (const user of users) {
                if (this._canReceiveSignal(user, signal)) {
                    await botService.sendMessage(user.telegramId, message);
                }
            }
        } catch (error) {
            console.error('Error notifying users about signal update:', error);
            throw error;
        }
    }

    async notifyUsersClose(signal) {
        try {
            const users = await userService.getSubscribedUsers();
            const message = this._formatSignalMessage(signal, 'close');
            
            for (const user of users) {
                if (this._canReceiveSignal(user, signal)) {
                    await botService.sendMessage(user.telegramId, message);
                }
            }
        } catch (error) {
            console.error('Error notifying users about signal close:', error);
            throw error;
        }
    }

    _formatSignalMessage(signal, type = 'new') {
        let message = '';
        
        switch (type) {
            case 'new':
                message = `🔔 Новий ${signal.type} сигнал\n\n` +
                    `Пара: ${signal.pair}\n` +
                    `Напрямок: ${signal.direction}\n` +
                    `Вхід: ${signal.entryPrice}\n` +
                    `Take Profit: ${signal.takeProfit}\n` +
                    `Stop Loss: ${signal.stopLoss}\n` +
                    `Таймфрейм: ${signal.timeframe}\n` +
                    `Ризик: ${signal.riskLevel}\n\n` +
                    `${signal.description || ''}`;
                break;
                
            case 'update':
                message = `📝 Оновлення ${signal.type} сигналу\n\n` +
                    `Пара: ${signal.pair}\n` +
                    `Нові значення:\n` +
                    `Take Profit: ${signal.takeProfit}\n` +
                    `Stop Loss: ${signal.stopLoss}\n\n` +
                    `${signal.description || ''}`;
                break;
                
            case 'close':
                const result = signal.result > 0 ? `✅ +${signal.result}%` : `❌ ${signal.result}%`;
                message = `🏁 Закриття ${signal.type} сигналу\n\n` +
                    `Пара: ${signal.pair}\n` +
                    `Результат: ${result}\n` +
                    `Ціна виходу: ${signal.exitPrice}\n\n` +
                    `${signal.closeNote || ''}`;
                break;
        }
        
        return message;
    }

    _canReceiveSignal(user, signal) {
        if (!user.isSubscribed) return false;
        
        // Перевірка типу підписки
        if (signal.type === 'FUTURES') {
            return user.subscriptionType === 'FULL';
        }
        
        return user.subscriptionType === 'FULL' || user.subscriptionType === 'VIP';
    }
}

module.exports = new SignalService();