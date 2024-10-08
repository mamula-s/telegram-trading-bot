const User = require('../models/User');
const { privilegedUserIds, developerId } = require('../config/privileges');
const subscriptions = require('../config/subscriptions');

const createUser = async (userData) => {
  try {
    const [user, created] = await User.findOrCreate({
      where: { telegramId: userData.telegramId },
      defaults: userData
    });
    console.log(`Користувач ${created ? 'створений' : 'оновлений'}:`, user.toJSON());
    return user;
  } catch (error) {
    console.error('Помилка створення/оновлення користувача:', error);
    throw error;
  }
};

const getUserByTelegramId = async (telegramId) => {
  try {
    const user = await User.findOne({ where: { telegramId } });
    console.log(`Отримано користувача:`, user ? user.toJSON() : null);
    return user;
  } catch (error) {
    console.error('Помилка отримання користувача:', error);
    throw error;
  }
};

const updateUser = async (telegramId, updateData) => {
  try {
    const [updatedRowsCount, updatedUsers] = await User.update(updateData, {
      where: { telegramId },
      returning: true,
    });
    if (updatedRowsCount === 0) {
      console.log(`Користувача з ID ${telegramId} не знайдено для оновлення`);
      return null;
    }
    console.log(`Оновлено користувача:`, updatedUsers[0].toJSON());
    return updatedUsers[0];
  } catch (error) {
    console.error('Помилка оновлення користувача:', error);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.findAll();
    console.log(`Отримано всіх користувачів. Кількість:`, users.length);
    return users;
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
    const users = await User.findAll({ where: query });
    console.log(`Отримано підписаних користувачів. Кількість:`, users.length);
    return users;
  } catch (error) {
    console.error('Помилка отримання підписаних користувачів:', error);
    throw error;
  }
};

const updateUserSubscription = async (telegramId) => {
  console.log(`Оновлення підписки для користувача ${telegramId}`);
  console.log(`Привілейовані ID:`, privilegedUserIds);
  console.log(`ID розробника:`, developerId);

  const user = await User.findOne({ where: { telegramId } });
  if (!user) {
    console.log(`Користувача з ID ${telegramId} не знайдено`);
    return null;
  }

  const isPrivileged = privilegedUserIds.includes(telegramId) || telegramId === developerId;
  console.log(`Користувач ${telegramId} є привілейованим: ${isPrivileged}`);
  
  if (isPrivileged) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    await user.update({
      isSubscribed: true,
      subscriptionType: 'vip',
      subscriptionEndDate: oneYearFromNow
    });
    console.log(`Оновлено підписку для користувача ${telegramId} до VIP`);
  } else {
    console.log(`Користувач ${telegramId} не є привілейованим, підписку не оновлено`);
  }

  return user;
};

const checkAndUpdateSubscription = async (user) => {
  if (user.subscriptionEndDate && user.subscriptionEndDate < new Date()) {
    console.log(`Підписка користувача ${user.telegramId} закінчилась`);
    await user.update({
      isSubscribed: false,
      subscriptionType: 'free',
      subscriptionEndDate: null
    });
    console.log(`Скинуто підписку для користувача ${user.telegramId}`);
  }
  return user;
};

const subscribeUser = async (telegramId, subscriptionType, duration) => {
  try {
    const user = await User.findOne({ where: { telegramId } });
    if (!user) throw new Error('Користувача не знайдено');

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    await user.update({
      isSubscribed: true,
      subscriptionType: subscriptionType,
      subscriptionEndDate: endDate
    });

    console.log(`Оформлено підписку ${subscriptionType} для користувача ${telegramId}`);
    return user;
  } catch (error) {
    console.error('Помилка оформлення підписки:', error);
    throw error;
  }
};

const addSubscription = async (telegramId, subscriptionId) => {
  const user = await User.findOne({ where: { telegramId } });
  if (!user) throw new Error('Користувача не знайдено');

  const subscription = subscriptions[subscriptionId];
  if (!subscription) throw new Error('Невірний тип підписки');

  const userSubscriptions = user.subscriptions || [];
  if (!userSubscriptions.includes(subscriptionId)) {
    userSubscriptions.push(subscriptionId);
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + subscription.duration);

  await user.update({
    subscriptions: userSubscriptions,
    isSubscribed: true,
    subscriptionType: subscriptionId,
    subscriptionEndDate: endDate
  });

  console.log(`Додано підписку ${subscriptionId} для користувача ${telegramId}`);
  return user;
};

const removeSubscription = async (telegramId, subscriptionId) => {
  const user = await User.findOne({ where: { telegramId } });
  if (!user) throw new Error('Користувача не знайдено');

  const userSubscriptions = user.subscriptions.filter(sub => sub !== subscriptionId);

  await user.update({
    subscriptions: userSubscriptions,
    isSubscribed: userSubscriptions.length > 0,
    subscriptionType: userSubscriptions.length > 0 ? user.subscriptionType : 'free',
    subscriptionEndDate: userSubscriptions.length > 0 ? user.subscriptionEndDate : null
  });

  console.log(`Видалено підписку ${subscriptionId} для користувача ${telegramId}`);
  return user;
};

const getActiveSubscriptions = async (telegramId) => {
  const user = await User.findOne({ where: { telegramId } });
  if (!user) throw new Error('Користувача не знайдено');

  if (new Date() > user.subscriptionEndDate) {
    await user.update({
      isSubscribed: false,
      subscriptionType: 'free',
      subscriptions: [],
      subscriptionEndDate: null
    });
    console.log(`Скинуто всі підписки для користувача ${telegramId} через закінчення терміну`);
    return [];
  }

  console.log(`Активні підписки користувача ${telegramId}:`, user.subscriptions);
  return user.subscriptions;
};

const checkAccess = async (telegramId, requiredSubscription) => {
  const activeSubscriptions = await getActiveSubscriptions(telegramId);
  const hasAccess = activeSubscriptions.includes(requiredSubscription) || activeSubscriptions.includes('FULL');
  console.log(`Перевірка доступу для користувача ${telegramId} до ${requiredSubscription}: ${hasAccess}`);
  return hasAccess;
};

module.exports = {
  createUser,
  getUserByTelegramId,
  updateUser,
  getAllUsers,
  getSubscribedUsers,
  updateUserSubscription,
  checkAndUpdateSubscription,
  subscribeUser,
  addSubscription,
  removeSubscription,
  getActiveSubscriptions,
  checkAccess
};