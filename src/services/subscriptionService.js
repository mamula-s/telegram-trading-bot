const User = require('../models/User');
const bot = require('../bot'); 
const checkExpiringSubscriptions = async () => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const users = await User.findAll({
    where: {
      subscriptionEndDate: {
        [Op.lt]: threeDaysFromNow,
        [Op.gt]: new Date()
      }
    }
  });

  for (const user of users) {
    const daysLeft = Math.ceil((user.subscriptionEndDate - new Date()) / (1000 * 60 * 60 * 24));
    bot.sendMessage(user.telegramId, `Ваша підписка закінчується через ${daysLeft} днів. Не забудьте продовжити її!`);
  }
};

module.exports = {
  checkExpiringSubscriptions
};