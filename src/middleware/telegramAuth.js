// src/middleware/telegramAuth.js
const crypto = require('crypto');
const { AppError } = require('./errorHandler');

class TelegramAuthMiddleware {
  constructor() {
    this.botToken = process.env.BOT_TOKEN;
    if (!this.botToken) {
      throw new Error('BOT_TOKEN is required');
    }
  }

  /**
   * Validates Telegram WebApp init data
   */
  validateWebAppData = (req, res, next) => {
    try {
      // Skip validation in development if enabled
      if (process.env.NODE_ENV === 'development' && process.env.SKIP_TELEGRAM_AUTH) {
        req.user = { id: 'test_user' };
        return next();
      }

      const initData = req.headers['x-telegram-init-data'];
      
      if (!initData) {
        throw new AppError('No init data provided', 401);
      }

      // Parse and validate data
      const { hash, ...data } = this.parseInitData(initData);
      
      if (!hash) {
        throw new AppError('No hash provided', 401);
      }

      // Check if data is expired
      const authDate = parseInt(data.auth_date);
      if (this.isInitDataExpired(authDate)) {
        throw new AppError('Init data is expired', 401);
      }

      // Validate hash
      if (!this.validateHash(hash, data)) {
        throw new AppError('Invalid hash', 401);
      }

      // Parse user data
      try {
        req.user = this.parseUserData(data);
      } catch (error) {
        throw new AppError('Invalid user data', 401);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Parse init data from query string format
   */
  private parseInitData(initData) {
    const params = new URLSearchParams(initData);
    const data = {};
    
    for (const [key, value] of params) {
      if (key === 'hash') {
        data.hash = value;
      } else {
        try {
          // Try to parse JSON values
          data[key] = JSON.parse(value);
        } catch {
          // If not JSON, use raw value
          data[key] = value;
        }
      }
    }

    return data;
  }

  /**
   * Check if init data is not older than 24 hours
   */
  private isInitDataExpired(authDate) {
    const now = Math.floor(Date.now() / 1000);
    return (now - authDate) > 86400; // 24 hours
  }

  /**
   * Validate data hash using bot token
   */
  private validateHash(hash, data) {
    // Sort keys and create data check string
    const checkString = Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Generate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(this.botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    return calculatedHash === hash;
  }

  /**
   * Parse and validate user data
   */
  private parseUserData(data) {
    if (!data.user) {
      throw new Error('No user data provided');
    }

    const user = typeof data.user === 'string' 
      ? JSON.parse(data.user) 
      : data.user;

    if (!user.id) {
      throw new Error('Invalid user data: no id');
    }

    return {
      id: user.id.toString(),
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium
    };
  }
}

module.exports = new TelegramAuthMiddleware();