// src/admin/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const rateLimiter = (options = {}) => {
    return rateLimit({
        windowMs: options.windowMs || 15 * 60 * 1000, // За замовчуванням 15 хвилин
        max: options.max || 100, // За замовчуванням 100 запитів
        message: {
            error: 'Забагато запитів. Спробуйте пізніше.'
        },
        handler: (req, res) => {
            res.status(429).render('error', {
                layout: false,
                error: 'Забагато запитів. Будь ласка, спробуйте пізніше.'
            });
        }
    });
};

module.exports = { rateLimiter };