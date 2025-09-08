import Redis from 'ioredis';

import environments from '../utils/environments.js';

const { REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD } = environments;

export const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

redis.on('ready', () => {
  console.log('[redis] ready');
});

redis.on('error', (err) => {
  console.error('[redis] error', err);
});
