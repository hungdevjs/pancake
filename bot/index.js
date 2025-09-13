import { parseEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

import { wallet, contract } from './configs/asset.config.js';
import { getRound } from './services/round.service.js';
import { redis } from './configs/redis.config.js';
import environments from './utils/environments.js';
import { staticProvider } from './configs/provider.config.js';

const {
  PANCAKE_PREDICTION_TREASURY_FEE,
  PANCAKE_PREDICTION_BET_AMOUNT,
  MIN_GAS,

  FULFILL_PHASE_END_TIME_IN_SECOND,
  CLAIM_PHASE_END_TIME_IN_SECOND,
  ANALYZE_PHASE_START_TIME_FROM_SECOND,

  MIN_ROI,
  NUMBER_OF_ROUNDS_TO_CLAIM,
} = environments;

const minGas = parseEther(MIN_GAS);
const fulfillPhaseEndTimeInSecond = Number(FULFILL_PHASE_END_TIME_IN_SECOND);
const claimPhaseEndTimeInSecond = Number(CLAIM_PHASE_END_TIME_IN_SECOND);
const analyzePhaseStartTimeFromSecond = Number(
  ANALYZE_PHASE_START_TIME_FROM_SECOND
);
const minROI = Number(MIN_ROI);
const numberOfRoundsToClaim = Number(NUMBER_OF_ROUNDS_TO_CLAIM);
const defaultBetAmount = Number(PANCAKE_PREDICTION_BET_AMOUNT);
const treasuryFee = Number(PANCAKE_PREDICTION_TREASURY_FEE);
const payoutRatio = 1 - treasuryFee;

const locked = {};
const fulfilling = {};
const claiming = {};
const analyzing = {};

const getPositions = async () => {
  const data = (await redis.get('pancake')) || '{}';

  return JSON.parse(data);
};

const setPositions = async (data) => {
  await redis.set('pancake', JSON.stringify(data));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getGasFeeData = async (multiplier = 1) => {
  const feeData = await staticProvider.getFeeData();

  const { gasPrice } = feeData;

  const scale = BigNumber.from(10000);
  const mul = BigNumber.from(Math.round(multiplier * scale.toNumber()));

  const gas = gasPrice.mul(mul).div(scale);

  return gas;
};

const bet = async (epoch, fn, betAmount) => {
  const gasPrice = await getGasFeeData(3);
  const tx = await contract
    .connect(wallet)
    [fn](epoch, { value: parseEther(`${betAmount}`), gasPrice });

  await tx.wait();
};

const getLockPrice = async (positions, epoch) => {
  console.log(`[getLockPrice] epoch=${epoch}`);

  const { lockPrice } = await getRound(epoch);

  if (lockPrice > 0) {
    positions[epoch].lockPrice = lockPrice;
    await setPositions(positions);
  }
};

const fulfillRound = async (positions, epoch) => {
  console.log(`[fulfillRound] epoch=${epoch}`);

  const position = positions[epoch];

  const {
    isClosed,
    oracleCalled,
    lockPrice,
    closePrice,
    bullPayoutRatio,
    bearPayoutRatio,
  } = await getRound(epoch);

  if (!isClosed || !oracleCalled) return;

  const result =
    lockPrice < closePrice ? 'bull' : lockPrice > closePrice ? 'bear' : null;
  const hasWon = result === position.position;

  let payoutAmount = 0;
  if (hasWon) {
    if (position.position === 'bull') {
      payoutAmount = bullPayoutRatio * position.amount * payoutRatio;
    } else if (position.position === 'bear') {
      payoutAmount = bearPayoutRatio * position.amount * payoutRatio;
    }
  }

  positions[epoch].lockPrice = lockPrice;
  positions[epoch].closePrice = closePrice;
  positions[epoch].result = hasWon ? 'win' : 'lose';
  if (hasWon) {
    positions[epoch].outcome += payoutAmount;
  }

  await setPositions(positions);
};

const claimWinRounds = async (positions) => {
  const winRounds = Object.values(positions).filter(
    (position) => position.result === 'win' && position.claimed === false
  );

  if (winRounds.length >= numberOfRoundsToClaim) {
    const epochs = winRounds.map((round) => round.epoch);

    const gasPrice = await getGasFeeData(1.1);

    const tx = await contract.connect(wallet).claim(epochs, { gasPrice });
    await tx.wait();

    winRounds.map((round) => {
      positions[round.epoch].claimed = true;
    }, {});
  }

  await setPositions(positions);
};

const tick = async () => {
  try {
    const positions = await getPositions();

    const epoch = await contract.currentEpoch();
    const currentEpoch = Number(epoch.toString());

    const {
      isLocked,
      totalAmount,
      bullAmount,
      bearAmount,
      bullPayoutRatio,
      bearPayoutRatio,
      openTimeLeftInSeconds,
    } = await getRound(currentEpoch);

    if (isLocked) {
      if (!locked[currentEpoch.toString()]) {
        console.log(`epoch=${currentEpoch} locked | waiting for new round...`);
        locked[currentEpoch.toString()] = true;
      }

      return;
    }

    if (openTimeLeftInSeconds > fulfillPhaseEndTimeInSecond) {
      if (!fulfilling[currentEpoch.toString()]) {
        console.log(
          `[${currentEpoch}] | fulfill phase | fulfilling last round...`
        );
        fulfilling[currentEpoch.toString()] = true;
      }

      if (
        positions[(currentEpoch - 1).toString()] &&
        !positions[(currentEpoch - 1).toString()].lockPrice
      ) {
        await getLockPrice(positions, currentEpoch - 1);
      }

      if (
        positions[(currentEpoch - 2).toString()] &&
        positions[(currentEpoch - 2).toString()].result === 'pending'
      ) {
        await fulfillRound(positions, currentEpoch - 2);
      }
    } else if (openTimeLeftInSeconds > claimPhaseEndTimeInSecond) {
      if (!claiming[currentEpoch.toString()]) {
        console.log(
          `[${currentEpoch}] | claim phase | claiming last won round...`
        );

        claiming[currentEpoch.toString()] = true;
      }

      await claimWinRounds(positions);
    } else if (
      openTimeLeftInSeconds > 0 &&
      openTimeLeftInSeconds <= analyzePhaseStartTimeFromSecond
    ) {
      if (!analyzing[currentEpoch.toString()]) {
        console.log(`epoch=${currentEpoch} | analyze phase | analyzing...`);
        analyzing[currentEpoch.toString()] = true;
      }

      const hasNotBetYet = !positions[currentEpoch.toString()];

      const betAmount = defaultBetAmount;

      const bullPayoutRatio =
        (totalAmount + betAmount) / (bullAmount + betAmount);
      const bearPayoutRatio =
        (totalAmount + betAmount) / (bearAmount + betAmount);
      const roiAccepted = Math.max(bullPayoutRatio, bearPayoutRatio) >= minROI;

      const willBet = hasNotBetYet && roiAccepted;
      if (willBet) {
        console.log(
          `[${currentEpoch}] | analyze phase | chance detected | ROI=${Math.max(
            bullPayoutRatio,
            bearPayoutRatio
          )}`
        );

        const betPosition = bullPayoutRatio > bearPayoutRatio ? 'bull' : 'bear';

        const fn = betPosition === 'bull' ? 'betBull' : 'betBear';

        await bet(currentEpoch, fn, betAmount);

        positions[currentEpoch.toString()] = {
          epoch: currentEpoch,
          position: betPosition,
          amount: betAmount,
          result: 'pending',
          outcome: -betAmount,
          claimed: false,
        };

        await setPositions(positions);
      }
    }

    // console.clear();
    console.log(
      `[${currentEpoch}] | ${openTimeLeftInSeconds}s | total=${totalAmount.toFixed(
        4
      )} | bull=${bullAmount.toFixed(4)} | bear=${bearAmount.toFixed(
        4
      )} | bullRate=${bullPayoutRatio.toFixed(
        4
      )} | bearRate=${bearPayoutRatio.toFixed(4)}`
    );
  } catch (err) {
    console.error(err.message);
  }
};

const main = async () => {
  await delay(2_000);
  while (true) {
    await tick();
    await delay(250);
  }
};

main();
