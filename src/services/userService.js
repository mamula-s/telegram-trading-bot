// src/services/userService.js
const { Op } = require('sequelize');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const { privilegedUserIds, developerId } = require('../config/privileges');
const subscriptions = require('../config/subscriptions');

class UserService {
    // Існуючі методи
    async createUser(userData) {
        try {
            const [user, created] = await User.findOrCreate({
                where: { telegramId: userData.telegramId },
                defaults: userData
            });
            console.log(`Користувач ${created ? 'створений' : 'оновлений'}:`, user.toJSON());
            return user;
        } catch (error) {
            console.error('Помилка створення/оновлення користувача:', error);
            throw error;
        }
    }

    async getUserByTelegramId(telegramId) {
        try {
            const user = await User.findOne({ where: { telegramId } });
            console.log(`Отримано користувача:`, user ? user.toJSON() : null);
            return user;
        } catch (error) {
            console.error('Помилка отримання користувача:', error);
            throw error;
        }
    }

    async updateUser(telegramId, updateData) {
        try {
            const [updatedRowsCount, updatedUsers] = await User.update(updateData, {
                where: { telegramId },
                returning: true,
            });
            if (updatedRowsCount === 0) {
                console.log(`Користувача з ID ${telegramId} не знайдено для оновлення`);
                return null;
            }
            console.log(`Оновлено користувача:`, updatedUsers[0].toJSON());
            return updatedUsers[0];
        } catch (error) {
            console.error('Помилка оновлення користувача:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const users = await User.findAll();
            console.log(`Отримано всіх користувачів. Кількість:`, users.length);
            return users;
        } catch (error) {
            console.error('Помилка отримання всіх користувачів:', error);
            throw error;
        }
    }

    // Нові методи для адмін-панелі
    async getUsers(page = 1, limit = 10, search = '') {
        try {
            const offset = (page - 1) * limit;
            let whereClause = {};

            if (search) {
                whereClause = {
                    [Op.or]: [
                        { username: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } },
                        { telegramId: { [Op.like]: `%${search}%` } }
                    ]
                };
            }

            const { rows: users, count: total } = await User.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                include: ['subscription']
            });

            return { users, total };
        } catch (error) {
            console.error('Помилка отримання користувачів:', error);
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const user = await User.findByPk(id, {
                include: [
                    'subscription',
                    {
                        model: UserActivity,
                        as: 'activities',
                        limit: 10,
                        order: [['createdAt', 'DESC']]
                    }
                ]
            });

            if (!user) {
                throw new Error('Користувача не знайдено');
            }

            return user;
        } catch (error) {
            console.error('Помилка отримання користувача за ID:', error);
            throw error;
        }
    }

    async getSubscribedUsers(subscriptionType) {
        try {
            const query = { isSubscribed: true };
            if (subscriptionType) {
                query.subscriptionType = subscriptionType;
            }
            const users = await User.findAll({ where: query });
            console.log(`Отримано підписаних користувачів. Кількість:`, users.length);
            return users;
        } catch (error) {
            console.error('Помилка отримання підписаних користувачів:', error);
            throw error;
        }
    }

    async updateUserSubscription(telegramId, subscriptionType = null, months = null) {
        console.log(`Оновлення підписки для користувача ${telegramId}`);
        try {
            const user = await User.findOne({ where: { telegramId } });
            if (!user) {
                console.log(`Користувача з ID ${telegramId} не знайдено`);
                return null;
            }

            const isPrivileged = privilegedUserIds.includes(telegramId) || telegramId === developerId;
            console.log(`Користувач ${telegramId} є привілейованим: ${isPrivileged}`);

            if (isPrivileged) {
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

                await user.update({
                    isSubscribed: true,
                    subscriptionType: 'FULL',
                    subscriptionEndDate: oneYearFromNow
                });
                console.log(`Оновлено підписку для користувача ${telegramId} до FULL`);
            } else if (subscriptionType && months) {
                const endDate = new Date();
                endDate.setMonth(endDate.getMonth() + parseInt(months));

                await user.update({
                    isSubscribed: true,
                    subscriptionType,
                    subscriptionEndDate: endDate
                });

                await this.createUserActivity(user.id, 'SUBSCRIPTION_UPDATE',
                    `Оновлено підписку на ${subscriptionType} на ${months} місяців`);
            }

            const updatedUser = await User.findOne({ where: { telegramId } });
            console.log('Оновлений користувач:', updatedUser.toJSON());
            return updatedUser;
        } catch (error) {
            console.error('Помилка оновлення підписки:', error);
            throw error;
        }
    }

    async toggleUserBlock(userId, blocked) {
        try {
            const user = await this.getUserById(userId);
            await user.update({ isBlocked: blocked });

            await this.createUserActivity(userId, 'ACCESS_TOGGLE',
                blocked ? 'Користувача заблоковано' : 'Користувача розблоковано');

            return user;
        } catch (error) {
            console.error('Помилка зміни статусу блокування:', error);
            throw error;
        }
    }

    async checkAndUpdateSubscription(user) {
        try {
            if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
                console.log(`Підписка користувача ${user.telegramId} закінчилась`);
                await user.update({
                    isSubscribed: false,
                    subscriptionType: 'free',
                    subscriptionEndDate: null
                });
                console.log(`Скинуто підписку для користувача ${user.telegramId}`);
            }
            return user;
        } catch (error) {
            console.error('Помилка перевірки підписки:', error);
            throw error;
        }
    }

    async checkAccess(telegramId, requiredSubscription) {
        try {
            const activeSubscriptions = await this.getActiveSubscriptions(telegramId);
            const hasAccess = activeSubscriptions.includes(requiredSubscription) || activeSubscriptions.includes('FULL');
            console.log(`Перевірка доступу для користувача ${telegramId} до ${requiredSubscription}: ${hasAccess}`);
            return hasAccess;
        } catch (error) {
            console.error('Помилка перевірки доступу:', error);
            throw error;
        }
    }

    async createUserActivity(userId, action, details) {
        try {
            return await UserActivity.create({
                userId,
                action,
                details
            });
        } catch (error) {
            console.error('Помилка створення активності користувача:', error);
            throw error;
        }
    }

    async getTotalUsers() {
        try {
            return await User.count();
        } catch (error) {
            console.error('Помилка отримання загальної кількості користувачів:', error);
            throw error;
        }
    }

    async getActiveUsers() {
        try {
            return await User.count({
                where: {
                    isBlocked: false,
                    isSubscribed: true
                }
            });
        } catch (error) {
            console.error('Помилка отримання кількості активних користувачів:', error);
            throw error;
        }
    }
}

module.exports = new UserService();