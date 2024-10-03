const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: false,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  subscriptionType: {
    type: String,
    enum: ['free', 'premium', 'vip'],
    default: 'free',
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  discount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
});

module.exports = mongoose.model('User', userSchema);