// src/admin/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Створюємо окремі обмежувачі для різних ендпоінтів
const rateLimiters = {
  // Для API endpoints
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 100, // Ліміт запитів
    message: { error: 'Too many API requests' },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Для аутентифікації
  auth: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 година
    max: 5, // 5 спроб
    message: { error: 'Too many login attempts' },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Для відновлення паролю
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 година
    max: 3, // 3 спроби
    message: { error: 'Too many password reset attempts' },
    standardHeaders: true,
    legacyHeaders: false
  }),

  // Для WebSocket з'єднань
  websocket: rateLimit({
    windowMs: 60 * 1000, // 1 хвилина
    max: 60, // 60 з'єднань
    message: { error: 'Too many WebSocket connections' },
    standardHeaders: true,
    legacyHeaders: false
  })
};

// Додаткова функція для створення кастомного лімітера
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
};

module.exports = {
  rateLimiters,
  createRateLimiter
};