const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Успішне підключення до MongoDB Atlas');
  } catch (error) {
    console.error('Помилка підключення до MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;