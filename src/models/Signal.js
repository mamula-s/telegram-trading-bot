const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['futures', 'spot'],
    required: true
  },
  pair: {
    type: String,
    required: true
  },
  direction: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  entryPrice: {
    type: Number,
    required: true
  },
  takeProfit: {
    type: Number,
    required: true
  },
  stopLoss: {
    type: Number,
    required: true
  },
  note: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: false
  },
  published: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Signal', signalSchema);