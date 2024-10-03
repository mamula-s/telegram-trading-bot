const User = require('../models/User');

const generateReferralCode = (userId) => {
  return `REF${userId}${Math.random().toString(36).substring(7)}`;
};

const createReferralLink = async (userId) => {
  const user = await User.findById(userId);
  if (!user.referralCode) {
    user.referralCode = generateReferralCode(userId);
    await user.save();
  }
  return `https://t.me/YourBotUsername?start=${user.referralCode}`;
};

const processReferral = async (referralCode, newUserId) => {
  const referrer = await User.findOne({ referralCode });
  if (referrer) {
    // Надання знижки реферера
    await User.findByIdAndUpdate(referrer._id, { $inc: { discount: 20 } });
    
    // Позначення нового користувача як запрошеного
    await User.findByIdAndUpdate(newUserId, { referredBy: referrer._id });
    
    return true;
  }
  return false;
};

module.exports = {
  createReferralLink,
  processReferral
};