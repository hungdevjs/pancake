import express from 'express';
import cors from 'cors';

import { redis } from './configs/redis.config.js';
import environments from './utils/environments.js';

const { PORT } = environments;

const app = express();

app.use(cors());

app.get('/', async (req, res) => {
  return res.sendStatus(200);
});

app.get('/positions', async (req, res) => {
  try {
    const data = await redis.get('pancake');
    const positions = JSON.parse(data);

    const results = Object.values(positions).sort(
      (position1, position2) => position2.epoch - position1.epoch
    );

    return res.status(200).send(results);
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
});

app.listen(PORT, () => console.log(`app is running on port=${PORT}`));
