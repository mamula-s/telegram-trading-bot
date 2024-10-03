const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Успішне підключення до бази даних');
  } catch (error) {
    console.error('Помилка підключення до бази даних:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;