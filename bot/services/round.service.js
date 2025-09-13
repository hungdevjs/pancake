import { formatEther } from '@ethersproject/units';

import { contract } from '../configs/asset.config.js';

export const getRound = async (epoch) => {
  const currentRound = await contract.rounds(epoch);

  const {
    lockTimestamp,
    closeTimestamp,
    totalAmount: rawTotalAmount,
    bullAmount: rawBullAmount,
    bearAmount: rawBearAmount,
    oracleCalled,
    lockPrice: rawLockPrice,
    closePrice: rawClosePrice,
  } = currentRound;
  const now = Date.now();

  const isClosed = now >= closeTimestamp.toNumber() * 1_000;
  const isLocked = now >= lockTimestamp.toNumber() * 1_000;

  const lockPrice = Number(rawLockPrice.toString());
  const closePrice = Number(rawClosePrice.toString());

  const totalAmount = Number(formatEther(rawTotalAmount));
  const bullAmount = Number(formatEther(rawBullAmount));
  const bearAmount = Number(formatEther(rawBearAmount));

  const bullPayoutRatio = bullAmount ? totalAmount / bullAmount : 0;
  const bearPayoutRatio = bearAmount ? totalAmount / bearAmount : 0;

  const openTimeLeftInSeconds = Math.floor(
    (lockTimestamp.toNumber() * 1_000 - now) / 1_000
  );

  return {
    isClosed,
    isLocked,
    totalAmount,
    bullAmount,
    bearAmount,
    bullPayoutRatio,
    bearPayoutRatio,
    oracleCalled,
    lockPrice,
    closePrice,
    openTimeLeftInSeconds,
  };
};
