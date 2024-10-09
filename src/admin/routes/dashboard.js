const express = require('express');
const router = express.Router();
const userService = require('../../services/userService');
const signalService = require('../../services/signalService');

router.get('/', async (req, res) => {
    try {
        const subscribersCount = await userService.getSubscribersCount();
        const futuresSignalsCount = await signalService.getFuturesSignalsCount();
        const spotSignalsCount = await signalService.getSpotSignalsCount();
        const profitability = await signalService.getProfitability();

        res.render('dashboard', {
            title: 'Дашборд',
            subscribersCount,
            futuresSignalsCount,
            spotSignalsCount,
            profitability
        });
    } catch (error) {
        console.error('Помилка завантаження дашборду:', error);
        res.status(500).send('Помилка сервера');
    }
});

module.exports = router;