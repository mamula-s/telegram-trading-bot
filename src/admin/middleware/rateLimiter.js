// src/admin/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // За замовчуванням 15 хвилин
    max = 100, // За замовчуванням 100 запитів
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    headers = true,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    statusCode,
    headers,
    skipSuccessfulRequests,
    skipFailedRequests,
    // Функція для генерації ключа ліміту
    keyGenerator: (req) => {
      // Використовуємо IP + user agent для кращої ідентифікації
      return `${req.ip}-${req.headers['user-agent']}`;
    },
    // Обробник для різних типів відповідей
    handler: (req, res) => {
      if (req.accepts('html')) {
        // Для HTML запитів
        res.status(statusCode).render('error', {
          layout: false,
          error: message,
          retry: Math.ceil(windowMs / 1000 / 60) // у хвилинах
        });
      } else {
        // Для API запитів
        res.status(statusCode).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
    },
    // Обробник для пропуску перевірки
    skip: (req) => {
      // Пропускаємо перевірку для певних IP адрес
      const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST 
        ? process.env.RATE_LIMIT_WHITELIST.split(',') 
        : [];
      
      return whitelistedIPs.includes(req.ip);
    },
    // Store для зберігання лічильників
    store: process.env.REDIS_URL ? new RedisStore({
      // Конфігурація Redis для розподіленого зберігання
      redisURL: process.env.REDIS_URL,
      prefix: 'rl:',
      // Автоматичне очищення застарілих записів
      expiry: Math.ceil(windowMs / 1000)
    }) : undefined
  });
};

// Створюємо готові конфігурації для різних сценаріїв
const rateLimiters = {
  // Для API endpoints
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many API requests'
  }),

  // Для аутентифікації
  auth: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 година
    max: 5, // 5 спроб
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true // Успішні спроби не враховуються
  }),

  // Для відновлення паролю
  passwordReset: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 година
    max: 3, // 3 спроби
    message: 'Too many password reset attempts'
  }),

  // Для WebSocket з'єднань
  websocket: createRateLimiter({
    windowMs: 60 * 1000, // 1 хвилина
    max: 60, // 60 з'єднань
    message: 'Too many WebSocket connections'
  })
};

module.exports = {
  createRateLimiter,
  rateLimiters
};