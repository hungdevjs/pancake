import { formatEther, parseEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

import { wallet, contracts } from './configs/asset.config.js';
import { getRound as getContractRound } from './services/round.service.js';
import { redis } from './configs/redis.config.js';
import environments from './utils/environments.js';
import { staticProvider } from './configs/provider.config.js';
import { sendNotification as sendContractNotification } from './configs/telegram.config.js';

const {
  PANCAKE_PREDICTION_TREASURY_FEE,
  PANCAKE_PREDICTION_BET_AMOUNT,

  FULFILL_PHASE_END_TIME_IN_SECOND,
  CLAIM_PHASE_END_TIME_IN_SECOND,
  ANALYZE_PHASE_START_TIME_FROM_SECOND,

  MIN_ROI,
  NUMBER_OF_ROUNDS_TO_CLAIM,

  START_BALANCE,
} = environments;

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

const startBalance = Number(START_BALANCE);

const getTick = (type) => {
  const locked = {};
  const fulfilling = {};
  const claiming = {};
  const analyzing = {};

  const contract = contracts[type];
  const getRound = getContractRound(type);
  const sendNotification = sendContractNotification(type);

  const getPositions = async () => {
    const key = type === 'bnb' ? 'pancake' : `pancake_${type}`;
    const data = (await redis.get(key)) || '{}';

    return JSON.parse(data);
  };

  const setPositions = async (data) => {
    const key = type === 'bnb' ? 'pancake' : `pancake_${type}`;
    await redis.set(key, JSON.stringify(data));
  };

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

    const rawBalance = await staticProvider.getBalance(wallet.address);
    const balance = formatEther(rawBalance);
    sendNotification(
      `[#${epoch}] ${fn} ${betAmount} BNB\nbalance: ${balance} BNB`
    );
  };

  const getLockPrice = async (positions, epoch) => {
    console.log(`[${type}] [getLockPrice] epoch=${epoch}`);

    const { lockPrice, bullPayoutRatio, bearPayoutRatio } = await getRound(
      epoch
    );
    const position = positions[epoch];
    const expectedPayoutRatio =
      position.position === 'bull' ? bullPayoutRatio : bearPayoutRatio;

    if (lockPrice > 0) {
      positions[epoch].lockPrice = lockPrice;
      positions[epoch].expectedPayoutRatio = expectedPayoutRatio;
      await setPositions(positions);
    }
  };

  const fulfillRound = async (positions, epoch) => {
    console.log(`[${type}] [fulfillRound] epoch=${epoch}`);

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

    positions[epoch].closePrice = closePrice;
    positions[epoch].result = hasWon ? 'win' : 'lose';
    if (hasWon) {
      positions[epoch].outcome += payoutAmount;
    }

    await setPositions(positions);
    sendNotification(
      `[#${epoch}] ${hasWon ? 'won' : 'lost'}\noutcome ${
        positions[epoch].outcome > 0 ? '+' : ''
      }${positions[epoch].outcome} BNB`
    );
  };

  const claimWinRounds = async (positions) => {
    const winRounds = Object.values(positions).filter(
      (position) => position.result === 'win' && position.claimed === false
    );

    const totalPendingRewards = winRounds.reduce(
      (total, round) => total + round.outcome,
      0
    );

    if (winRounds.length >= numberOfRoundsToClaim) {
      const epochs = winRounds.map((round) => round.epoch);

      const gasPrice = await getGasFeeData(1.1);

      const tx = await contract.connect(wallet).claim(epochs, { gasPrice });
      await tx.wait();

      winRounds.map((round) => {
        positions[round.epoch].claimed = true;
      }, {});

      const rawBalance = await staticProvider.getBalance(wallet.address);
      const balance = formatEther(rawBalance);
      sendNotification(
        `claimed ${totalPendingRewards} BNB\nbalance: ${balance} BNB\nnet profit: ${
          balance - startBalance
        } BNB`
      );
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
          console.log(
            `[${type}] epoch=${currentEpoch} locked | waiting for new round...`
          );
          locked[currentEpoch.toString()] = true;
        }

        return;
      }

      if (openTimeLeftInSeconds > fulfillPhaseEndTimeInSecond) {
        if (!fulfilling[currentEpoch.toString()]) {
          console.log(
            `[${type}] [${currentEpoch}] | fulfill phase | fulfilling last round...`
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
            `[${type}] [${currentEpoch}] | claim phase | claiming last won round...`
          );

          claiming[currentEpoch.toString()] = true;
        }

        await claimWinRounds(positions);
      } else if (
        openTimeLeftInSeconds > 0 &&
        openTimeLeftInSeconds <= analyzePhaseStartTimeFromSecond
      ) {
        if (!analyzing[currentEpoch.toString()]) {
          console.log(
            `[${type}] epoch=${currentEpoch} | analyze phase | analyzing...`
          );
          analyzing[currentEpoch.toString()] = true;
        }

        const hasNotBetYet = !positions[currentEpoch.toString()];

        const betAmount = defaultBetAmount;

        const bullPayoutRatio =
          (totalAmount + betAmount) / (bullAmount + betAmount);
        const bearPayoutRatio =
          (totalAmount + betAmount) / (bearAmount + betAmount);
        const roiAccepted =
          Math.max(bullPayoutRatio, bearPayoutRatio) >= minROI;

        const willBet = hasNotBetYet && roiAccepted;
        if (willBet) {
          console.log(
            `[${type}] [${currentEpoch}] | analyze phase | chance detected | ROI=${Math.max(
              bullPayoutRatio,
              bearPayoutRatio
            )}`
          );

          const betPosition =
            bullPayoutRatio > bearPayoutRatio ? 'bull' : 'bear';

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

      console.log(
        `[${type}] [${currentEpoch}] | ${openTimeLeftInSeconds}s | total=${totalAmount.toFixed(
          4
        )} | bull=${bullAmount.toFixed(4)} | bear=${bearAmount.toFixed(
          4
        )} | bullRate=${bullPayoutRatio.toFixed(
          4
        )} | bearRate=${bearPayoutRatio.toFixed(4)}`
      );
    } catch (err) {
      console.error(`[${type}]`, err.message);
    }
  };

  return tick;
};

export const tickBNB = getTick('bnb');
export const tickBTC = getTick('btc');
export const tickETH = getTick('eth');
