const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Успішне підключення до бази даних MongoDB Atlas');
  } catch (error) {
    console.error('Помилка підключення до бази даних:', error);
    process.exit(1);
  }
};

module.exports = connectDB;