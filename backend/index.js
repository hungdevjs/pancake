import express from 'express';
import cors from 'cors';
import { formatEther } from '@ethersproject/units';

import { redis } from './configs/redis.config.js';
import { staticProvider } from './configs/provider.config.js';
import environments from './utils/environments.js';
import { getCurrentRound as getContractCurrentRound } from './services/round.service.js';

const { PORT, MASTER_WALLET_ADDRESS, START_BALANCE } = environments;

const startBalance = Number(START_BALANCE);

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', async (req, res) => {
  return res.sendStatus(200);
});

app.get('/positions', async (req, res) => {
  try {
    const { type } = req.query;
    const key = type === 'bnb' ? 'pancake' : `pancake_${type}`;
    const data = (await redis.get(key)) || '{}';
    const positions = JSON.parse(data);

    const results = Object.values(positions).sort(
      (position1, position2) => position2.epoch - position1.epoch
    );

    const getCurrentRound = getContractCurrentRound(type);
    const currentRound = await getCurrentRound();

    const rawBalance = await staticProvider.getBalance(MASTER_WALLET_ADDRESS);
    const balance = Number(formatEther(rawBalance));

    const netProfit = balance - startBalance;

    return res
      .status(200)
      .send({ positions: results, balance, netProfit, currentRound });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
});

app.listen(PORT, () => console.log(`app is running on port=${PORT}`));
