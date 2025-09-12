import express from 'express';
import cors from 'cors';
import { formatEther } from '@ethersproject/units';

import { staticProvider } from './configs/provider.config.js';
import environments from './utils/environments.js';

const { PORT, MASTER_WALLET_ADDRESS, START_BALANCE } = environments;

const startBalance = Number(START_BALANCE);

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
  return res.sendStatus(200);
});

app.get('/positions', async (req, res) => {
  try {
    const { redis } = await import('./configs/redis.config.js');
    const data = (await redis.get('pancake')) || '{}';
    const positions = JSON.parse(data);

    const results = Object.values(positions).sort(
      (position1, position2) => position2.epoch - position1.epoch
    );

    const rawBalance = await staticProvider.getBalance(MASTER_WALLET_ADDRESS);
    const balance = Number(formatEther(rawBalance));

    const netProfit = balance - startBalance;

    return res.status(200).send({ positions: results, balance, netProfit });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
});

app.listen(PORT, () => console.log(`app is running on port=${PORT}`));
