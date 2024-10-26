// src/admin/routes/futuresSignals.js
const express = require('express');
const router = express.Router();
const signalService = require('../../services/signalService');
const { checkRole } = require('../middleware/auth');

// Отримання списку futures сигналів
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            pair: req.query.pair,
            status: req.query.status,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        };

        const { signals, total } = await signalService.getFuturesSignals(page, limit, filters);
        const totalPages = Math.ceil(total / limit);

        res.render('futures-signals', {
            title: 'Futures Сигнали',
            signals,
            currentPage: page,
            totalPages,
            limit,
            filters,
            layout: 'layout'
        });
    } catch (error) {
        console.error('Error fetching futures signals:', error);
        req.flash('error', 'Помилка при отриманні списку сигналів');
        res.redirect('/admin/dashboard');
    }
});

// Створення нового futures сигналу
router.post('/', checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const signalData = {
            pair: req.body.pair,
            type: 'FUTURES',
            direction: req.body.direction,
            entryPrice: req.body.entryPrice,
            takeProfit: req.body.takeProfit,
            stopLoss: req.body.stopLoss,
            description: req.body.description,
            leverage: req.body.leverage,
            timeframe: req.body.timeframe,
            riskLevel: req.body.riskLevel,
            status: 'ACTIVE'
        };

        const signal = await signalService.createSignal(signalData);
        if (req.body.sendNotification === 'true') {
            await signalService.notifyUsers(signal);
        }

        req.flash('success', 'Сигнал успішно створено');
        res.redirect('/admin/futures-signals');
    } catch (error) {
        console.error('Error creating futures signal:', error);
        req.flash('error', 'Помилка при створенні сигналу');
        res.redirect('/admin/futures-signals');
    }
});

// Отримання деталей futures сигналу
router.get('/:id', async (req, res) => {
    try {
        const signal = await signalService.getSignalById(req.params.id);
        if (!signal || signal.type !== 'FUTURES') {
            req.flash('error', 'Сигнал не знайдено');
            return res.redirect('/admin/futures-signals');
        }

        res.render('futures-signal-details', {
            title: `Futures Сигнал - ${signal.pair}`,
            signal,
            layout: 'layout'
        });
    } catch (error) {
        console.error('Error fetching futures signal details:', error);
        req.flash('error', 'Помилка при отриманні деталей сигналу');
        res.redirect('/admin/futures-signals');
    }
});

// Оновлення futures сигналу
router.put('/:id', checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const signalData = {
            pair: req.body.pair,
            direction: req.body.direction,
            entryPrice: req.body.entryPrice,
            takeProfit: req.body.takeProfit,
            stopLoss: req.body.stopLoss,
            description: req.body.description,
            leverage: req.body.leverage,
            timeframe: req.body.timeframe,
            riskLevel: req.body.riskLevel,
            status: req.body.status
        };

        const signal = await signalService.updateSignal(req.params.id, signalData);
        
        if (req.body.sendNotification === 'true') {
            await signalService.notifyUsersUpdate(signal);
        }

        res.json({ success: true, message: 'Сигнал успішно оновлено' });
    } catch (error) {
        console.error('Error updating futures signal:', error);
        res.status(500).json({ success: false, message: 'Помилка при оновленні сигналу' });
    }
});

// Закриття futures сигналу
router.post('/:id/close', checkRole('admin', 'super_admin'), async (req, res) => {
    try {
        const { exitPrice, result, note } = req.body;
        const signal = await signalService.closeSignal(req.params.id, {
            exitPrice,
            result,
            note
        });

        if (req.body.sendNotification === 'true') {
            await signalService.notifyUsersClose(signal);
        }

        res.json({ success: true, message: 'Сигнал успішно закрито' });
    } catch (error) {
        console.error('Error closing futures signal:', error);
        res.status(500).json({ success: false, message: 'Помилка при закритті сигналу' });
    }
});

// Видалення futures сигналу
router.delete('/:id', checkRole('super_admin'), async (req, res) => {
    try {
        await signalService.deleteSignal(req.params.id);
        res.json({ success: true, message: 'Сигнал успішно видалено' });
    } catch (error) {
        console.error('Error deleting futures signal:', error);
        res.status(500).json({ success: false, message: 'Помилка при видаленні сигналу' });
    }
});

module.exports = router;