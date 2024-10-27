// src/bot/commands/types.js

const COMMAND_TYPES = {
    START: '/start',
    HELP: '/help',
    SUBSCRIBE: '/subscribe',
    STATUS: '/status',
    SIGNALS: '/signals',
    PORTFOLIO: '/portfolio',
    SETTINGS: '/settings',
    WEBAPP: '/webapp'
};

const SUBSCRIPTION_ACTIONS = {
    SUBSCRIBE: 'subscribe',
    UNSUBSCRIBE: 'unsubscribe',
    UPGRADE: 'upgrade'
};

const ERROR_MESSAGES = {
    GENERAL_ERROR: 'Виникла помилка при обробці команди. Спробуйте ще раз пізніше.',
    NO_SUBSCRIPTION: 'У вас немає активної підписки. Використовуйте /subscribe для оформлення.',
    SUBSCRIPTION_REQUIRED: 'Для отримання доступу до цієї функції потрібна активна підписка.',
    PAYMENT_REQUIRED: 'Для оформлення підписки необхідна оплата.',
    FEATURE_IN_DEVELOPMENT: 'Ця функція знаходиться в розробці.'
};

module.exports = {
    COMMAND_TYPES,
    SUBSCRIPTION_ACTIONS,
    ERROR_MESSAGES
};