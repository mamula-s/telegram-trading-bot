const User = require('../models/User');

const createUser = async (userData) => {
  try {
    const existingUser = await User.findOne({ telegramId: userData.telegramId });
    if (existingUser) {
      // Якщо користувач вже існує, оновлюємо його дані
      return await User.findOneAndUpdate(
        { telegramId: userData.telegramId },
        userData,
        { new: true, runValidators: true }
      );
    }
    // Якщо користувача не існує, створюємо нового
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    console.error('Помилка створення/оновлення користувача:', error);
    throw error;
  }
};

const getUserByTelegramId = async (telegramId) => {
  try {
    return await User.findOne({ telegramId });
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

module.exports = {
  createUser,
  getUserByTelegramId,
  updateUser,
  getSubscribedUsers,
};