// config/config.js
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.USER, // використовуємо системного користувача
    password: null, // зазвичай для локальної розробки на macOS пароль не потрібен
    database: 'trading_bot_dev',
    logging: false
  },
  test: {
    dialect: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.USER,
    password: null,
    database: 'trading_bot_test',
    logging: false
  },
  production: {
    dialect: 'postgres',
    use_env_variable: 'DATABASE_URL',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};