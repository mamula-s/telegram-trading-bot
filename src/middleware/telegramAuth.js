const crypto = require('crypto');

const validateWebAppData = (req, res, next) => {
  try {
    const initData = req.headers['x-telegram-init-data'];
    
    // В режимі розробки пропускаємо валідацію
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 'test_user' };
      return next();
    }

    if (!initData) {
      return res.status(401).json({ error: 'No init data provided' });
    }

    const parsedData = new URLSearchParams(initData);
    const hash = parsedData.get('hash');
    parsedData.delete('hash');

    const dataCheckString = Array.from(parsedData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secret = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secret)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Invalid hash' });
    }

    req.user = JSON.parse(parsedData.get('user'));
    next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { validateWebAppData };