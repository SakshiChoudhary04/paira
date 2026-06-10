const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['bank', 'cash', 'credit', 'savings', 'investment', 'wallet'],
      default: 'bank',
    },
    balance: {
      type: Number,
      default: 0,
    },
    salary: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: '#1fcf8a',
    },
  },
  { timestamps: true }
);

// Ensure accounts belong to user
accountSchema.index({ user: 1 });

module.exports = mongoose.model('Account', accountSchema);
