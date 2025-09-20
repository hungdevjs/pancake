import { isAddress } from '@ethersproject/address';

import privy from '../configs/privy.config.js';
import User from '../models/user.model.js';
import { acquireLock, set, get } from './redis.service.js';
import { sendMessage as sendTelegramMessage } from '../configs/telegram.config.js';
import Position from '../models/position.model.js';

export const getMe = async (userId) => {
  const lock = await acquireLock(`getMe-${userId}`);
  try {
    const user = await User.findOne({ privyId: userId }).lean();
    if (user) return user;

    const userData = await privy.getUserById(userId);
    if (!userData) throw new Error('Bad credential');

    const userInfo = {
      privyId: userId,
      email: userData.google.email,
    };

    if (!userData.wallet) {
      const wallet = await privy.walletApi.createWallet({
        chainType: 'ethereum',
        owner: { userId },
      });
      userInfo.address = wallet.address.toLowerCase();
    } else {
      userInfo.address = userData.wallet.address?.toLowerCase();
    }

    await User.create(userInfo);

    return userInfo;
  } catch (err) {
    throw err;
  } finally {
    lock.release();
  }
};

export const updateConfigs = async (
  userId,
  { addressConfig, telegramConfig, betConfig }
) => {
  const lock = await acquireLock(`updateConfigs-${userId}`);
  try {
    const { trackingAddress, startBalance } = addressConfig;

    if (!isAddress(trackingAddress))
      throw new Error('Invalid tracking address');

    if (isNaN(startBalance)) throw new Error('Invalid start balance');

    const { token, chatId } = telegramConfig;
    const {
      fulfillPhaseEndTime,
      claimPhaseEndTime,
      analyzePhaseStartTime,
      minROI,
      numberOfRoundsToClaim,
      betAmount,
      gasMultiplier,
      strategy,
    } = betConfig;

    if (
      isNaN(fulfillPhaseEndTime) ||
      isNaN(claimPhaseEndTime) ||
      isNaN(analyzePhaseStartTime) ||
      isNaN(minROI) ||
      isNaN(numberOfRoundsToClaim) ||
      isNaN(betAmount) ||
      isNaN(gasMultiplier)
    )
      throw new Error('Invalid bet config');

    await User.findOneAndUpdate(
      { privyId: userId },
      {
        addressConfig: {
          trackingAddress: trackingAddress.toLowerCase(),
          startBalance,
        },
        telegramConfig: { token, chatId },
        betConfig: {
          fulfillPhaseEndTime,
          claimPhaseEndTime,
          analyzePhaseStartTime,
          minROI,
          numberOfRoundsToClaim,
          betAmount,
          gasMultiplier,
          strategy,
        },
        onboarded: true,
      }
    );

    await Promise.all([
      set(`telegram-config:${userId}`, JSON.stringify(token, chatId)),
      set(`address:${userId}`, trackingAddress.toLowerCase()),
    ]);
  } catch (err) {
    throw err;
  } finally {
    lock.release();
  }
};

export const sendMessage = async (userId, { text }) => {
  const data = await get(`telegram-config:${userId}`);
  if (!data) throw new Error('Telegram config not found');

  const telegramConfig = JSON.parse(data);
  const { token, chatId } = telegramConfig;
  if (!token || !chatId) throw new Error('Invalid telegram config');

  await sendTelegramMessage({ token, chatId, text });
};

export const getPositions = async (userId, { page, limit, status }) => {
  const address = await get(`address:${userId}`);

  const filter = { address };
  if (status) {
    filter.status = status;
  }

  const total = await Position.find(filter).countDocuments();

  const skip = page * limit;
  const items = await Position.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return { items, total };
};

export const upsertPositions = async (userId, data) => {
  await Position.updateMany(
    { userId, epoch: data.epoch },
    { $set: data, $setOnInsert: { userId, epoch: data.epoch } },
    { upsert: true }
  );
};

export const updateStatus = async (userId, { status }) => {
  await User.updateOne({ privyId: userId }, { status });
};
