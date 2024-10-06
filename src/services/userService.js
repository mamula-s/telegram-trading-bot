const User = require('../models/User');
const { privilegedUserIds, developerId } = require('../config/privileges');

const createUser = async (userData) => {
  try {
    const [user, created] = await User.findOrCreate({
      where: { telegramId: userData.telegramId },
      defaults: userData
    });
    return user;
  } catch (error) {
    console.error('Помилка створення/оновлення користувача:', error);
    throw error;
  }
};


const getUserByTelegramId = async (telegramId) => {
  try {
    return await User.findOne({ where: { telegramId } });
  } catch (error) {
    console.error('Помилка отримання користувача:', error);
    throw error;
  }
};

const updateUser = async (telegramId, updateData) => {
  try {
    return await User.findOneAndUpdate({ telegramId }, updateData, { new: true, runValidators: true });
  } catch (error) {
    console.error('Помилка оновлення користувача:', error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    console.error('Помилка отримання всіх користувачів:', error);
    throw error;
  }
};

const getSubscribedUsers = async (subscriptionType) => {
  try {
    const query = { isSubscribed: true };
    if (subscriptionType) {
      query.subscriptionType = subscriptionType;
    }
    return await User.find(query);
  } catch (error) {
    console.error('Помилка отримання підписаних користувачів:', error);
    throw error;
  }
};

const updateUserSubscription = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  if (!user) return null;

  const isPrivileged = privilegedUserIds.includes(telegramId) || telegramId === developerId;
  
  if (isPrivileged) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    user.isSubscribed = true;
    user.subscriptionType = 'vip'; // припустимо, що 'vip' - це максимальний тип підписки
    user.subscriptionEndDate = oneYearFromNow;
    
    await user.save();
  }

  return user;
};

const checkAndUpdateSubscription = async (user) => {
  if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
    user.isSubscribed = false;
    user.subscriptionType = 'free';
    user.subscriptionEndDate = null;
    await user.save();
  }
  return user;
};

const subscribeUser = async (telegramId, subscriptionType, duration) => {
  try {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error('Користувача не знайдено');

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    user.isSubscribed = true;
    user.subscriptionType = subscriptionType;
    user.subscriptionEndDate = endDate;

    await user.save();
    return user;
  } catch (error) {
    console.error('Помилка оформлення підписки:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByTelegramId,
  updateUser,
  getAllUsers,
  getSubscribedUsers,
  updateUserSubscription,
  checkAndUpdateSubscription,
  subscribeUser
};