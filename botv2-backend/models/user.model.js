import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    privyId: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    addressConfig: {
      trackingAddress: { type: String, default: null },
      startBalance: { type: Number, default: null },
    },
    telegramConfig: {
      token: { type: String, default: null },
      chatId: { type: String, default: null },
    },
    betConfig: {
      fulfillPhaseEndTime: { type: Number, default: 30 },
      claimPhaseEndTime: { type: Number, default: 10 },
      analyzePhaseStartTime: { type: Number, default: 3 },
      minROI: { type: Number, default: 3 },
      numberOfRoundsToClaim: { type: Number, default: 5 },
      betAmount: { type: Number, default: 0.001 },
      gasMultiplier: { type: Number, default: 3 },
      strategy: {
        type: String,
        enum: ['Mathematics', 'Price action'],
        default: 'Mathematics',
      },
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['on', 'off'],
      default: 'on',
    },
  },
  {
    collection: 'users',
    timestamps: true,
  }
);

const User = model('User', schema);

export default User;
