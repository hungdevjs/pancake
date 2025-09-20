import Redis from 'ioredis';
import Redlock from 'redlock';

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

export const redlock = new Redlock([redis], {
  retryCount: 20,
  retryDelay: 1_000,
  retryJitter: 50,
  automaticExtensionThreshold: 500,
});
