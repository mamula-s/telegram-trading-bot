const crypto = require('crypto');

function verifyTelegramWebAppData(initData, botToken) {
  // Parse init data
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  const dataToCheck = [];
  
  urlParams.sort();
  urlParams.forEach((value, key) => {
    if (key !== 'hash') {
      dataToCheck.push(`${key}=${value}`);
    }
  });

  const dataCheckString = dataToCheck.join('\n');
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

const authMiddleware = (req, res, next) => {
  try {
    const initData = req.headers['x-telegram-init-data'];
    
    if (!initData) {
      return res.status(401).json({ 
        error: 'No init data provided',
        code: 'NO_INIT_DATA'
      });
    }

    const isValid = verifyTelegramWebAppData(initData, process.env.BOT_TOKEN);
    
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid init data',
        code: 'INVALID_INIT_DATA'
      });
    }

    // Parse user data
    const urlParams = new URLSearchParams(initData);
    const userDataStr = urlParams.get('user');
    
    if (userDataStr) {
      req.telegramUser = JSON.parse(userDataStr);
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = authMiddleware;