// src/admin/routes/users.js
const express = require('express');
const router = express.Router();
const userService = require('../../services/userService');
const { checkRole } = require('../middleware/auth');

// Отримання списку користувачів
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        
        const { users, total } = await userService.getUsers(page, limit, search);
        const totalPages = Math.ceil(total / limit);

        res.render('users', {
            title: 'Користувачі',
            users,
            currentPage: page,
            totalPages,
            limit,
            search,
            layout: 'layout'
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        req.flash('error', 'Помилка при отриманні списку користувачів');
        res.redirect('/admin/dashboard');
    }
});

// Отримання деталей користувача
router.get('/:id', async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) {
            req.flash('error', 'Користувача не знайдено');
            return res.redirect('/admin/users');
        }
        
        res.render('user-details', {
            title: `Користувач - ${user.username}`,
            user,
            layout: 'layout'
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        req.flash('error', 'Помилка при отриманні даних користувача');
        res.redirect('/admin/users');
    }
});

// Оновлення статусу підписки
router.post('/:id/subscription', checkRole('super_admin'), async (req, res) => {
    try {
        const { subscriptionType, months } = req.body;
        await userService.updateUserSubscription(req.params.id, subscriptionType, months);
        
        req.flash('success', 'Підписку користувача оновлено');
        res.redirect(`/admin/users/${req.params.id}`);
    } catch (error) {
        console.error('Error updating user subscription:', error);
        req.flash('error', 'Помилка при оновленні підписки');
        res.redirect(`/admin/users/${req.params.id}`);
    }
});

// Блокування/розблокування користувача
router.post('/:id/toggle-block', checkRole('super_admin'), async (req, res) => {
    try {
        const { blocked } = req.body;
        await userService.toggleUserBlock(req.params.id, blocked);
        
        req.flash('success', `Користувача ${blocked ? 'заблоковано' : 'розблоковано'}`);
        res.redirect(`/admin/users/${req.params.id}`);
    } catch (error) {
        console.error('Error toggling user block:', error);
        req.flash('error', 'Помилка при зміні статусу блокування');
        res.redirect(`/admin/users/${req.params.id}`);
    }
});

module.exports = router;