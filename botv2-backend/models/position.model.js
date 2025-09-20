import { Schema, model } from 'mongoose';

const schema = new Schema(
  {
    userId: {
      type: String,
      index: true,
      unique: true,
      required: true,
    },
    epoch: { type: Number, required: true },
    position: { type: String, enum: ['bear', 'bull'], required: true },
    lockPrice: { type: Number, default: null },
    closePrice: { type: Number, default: null },
    expectReturnRatio: { type: Number, default: null },
    result: {
      type: String,
      enum: ['win', 'lose', 'pending'],
      default: 'pending',
    },
    outcome: { type: Number, default: null },
    status: {
      type: String,
      enum: ['processing', 'claimable', 'claimed', 'lost'],
      default: 'processing',
    },
  },
  {
    collection: 'positions',
    timestamps: true,
  }
);

const Position = model('Position', schema);

export default Position;
