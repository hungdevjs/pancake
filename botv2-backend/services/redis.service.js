import { redis, redlock } from '../configs/redis.config.js';

export const get = (key) => redis.get(key);

export const set = (key, value, ttlSeconds = 0) => {
  if (ttlSeconds > 0) {
    return redis.set(key, value, 'EX', ttlSeconds);
  } else {
    return redis.set(key, value);
  }
};

export const del = (key) => redis.del(key);

export const acquireLock = (key, ttl = 100_000) => redlock.acquire([key], ttl);
