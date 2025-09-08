import fs from 'fs';

import { wallet, contract } from './configs/asset.config.js';
import { getRound } from './services/round.service.js';
import environments from './utils/environments.js';

const {
  PANCAKE_PREDICTION_TREASURY_FEE,
  PANCAKE_PREDICTION_BET_AMOUNT,
  MIN_ROI,
} = environments;

const minROI = Number(MIN_ROI);
const defaultBetAmount = Number(PANCAKE_PREDICTION_BET_AMOUNT);
const treasuryFee = Number(PANCAKE_PREDICTION_TREASURY_FEE);
const payoutRatio = 1 - treasuryFee;

const startRound = 400000;
const endRound = 410000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRounds = async () => {
  let epoch = startRound;
  const results = [];
  while (epoch < endRound) {
    console.log(`[getRounds] epoch=${epoch}`);
    const data = await getRound(epoch);
    results.push(data);
    epoch++;
    await delay(600);
  }

  fs.writeFileSync(
    './results_400000_410000.json',
    JSON.stringify(results, null, 2),
    { encoding: 'utf-8' }
  );
};

const INIT_AMOUNT = 10;
const simulator = {
  amount: INIT_AMOUNT,
  round: 0,
  win: 0,
  lose: 0,
};

let maxBalance = 0;
let maxBalanceEpoch = null;
let minBalance = INIT_AMOUNT;
let minBalanceEpoch = null;

let win = 0;
let lose = 0;

let maxWinStreak = 0;
let maxLoseStreak = 0;

const defaultGas = 0.0000099144;

const backTest = () => {
  const data = fs.readFileSync('./results_400000_410000.json', {
    encoding: 'utf-8',
  });
  const rounds = JSON.parse(data);

  const totalRounds = rounds.length;
  for (let i = 0; i < totalRounds; i++) {
    console.log(`back testing round ${i + 1}/${totalRounds}...`);
    const round = rounds[i];
    const { bullPayoutRatio, bearPayoutRatio, closePrice, lockPrice } = round;

    const roiAccepted = Math.max(bullPayoutRatio, bearPayoutRatio) >= minROI;

    const willBet = roiAccepted;
    if (!willBet) continue;

    const betAmount = 3 * defaultBetAmount;
    const betPosition = bullPayoutRatio > bearPayoutRatio ? 'bull' : 'bear';
    const result =
      lockPrice < closePrice ? 'bull' : lockPrice > closePrice ? 'bear' : null;

    simulator.round++;
    simulator.amount -= defaultGas;
    simulator.amount -= betAmount;
    if (betPosition === result) {
      const payoutAmount =
        result === 'bull'
          ? bullPayoutRatio * betAmount * payoutRatio
          : bearPayoutRatio * betAmount * payoutRatio;

      simulator.amount += payoutAmount;
      simulator.amount -= defaultGas;
      simulator.win++;
      win++;
      lose = 0;

      if (win > maxWinStreak) {
        maxWinStreak = win;
      }
    } else {
      simulator.lose++;
      lose++;
      win = 0;
      if (lose > maxLoseStreak) {
        maxLoseStreak = lose;
      }
    }

    if (simulator.amount > maxBalance) {
      maxBalance = simulator.amount;
      maxBalanceEpoch = startRound + i;
    }

    if (simulator.amount < minBalance) {
      minBalance = simulator.amount;
      minBalanceEpoch = startRound + i;
    }
  }

  console.log(
    `[back testing result] round played=${simulator.round}, round won=${
      simulator.win
    }, round lost=${simulator.lose}, net profit=${
      simulator.amount - INIT_AMOUNT
    }, maxBalance=${maxBalance}, minBalance=${minBalance}, maxBalanceEpoch=${maxBalanceEpoch}, minBalanceEpoch=${minBalanceEpoch}, maxWinStreak=${maxWinStreak}, maxLoseStreak=${maxLoseStreak}`
  );
};

const main = async () => {
  // await getRounds();
  backTest();
};

main();
