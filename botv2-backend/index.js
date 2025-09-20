import express from 'express';
import cors from 'cors';

import json from './middlewares/json.middleware.js';
import router from './routes/index.js';
import { connectMongoDB } from './configs/mongoose.config.js';
import environments from './utils/environments.js';

const { PORT } = environments;

const main = async () => {
  await connectMongoDB();

  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(json);

  app.use(cors());

  app.use(express.json());

  app.get('/', async (req, res) => {
    return res.sendStatus(200);
  });

  app.use('/api', router);

  app.listen(PORT, () => console.log(`app is running on port=${PORT}`));
};

main();
