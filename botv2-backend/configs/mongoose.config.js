import mongoose from 'mongoose';

import environments from '../utils/environments.js';

const { MONGO_URI } = environments;

export const connectMongoDB = async () => {
  await mongoose.connect(MONGO_URI, {
    autoCreate: true,
    autoIndex: true,
  });

  const connection = mongoose.connection;

  connection.on('error', (err) => {
    console.error(`[connectMongoDB] error: ${err.message}`);
  });

  connection.on('connecting', () => {
    console.info('[connectMongoDB] connecting');
  });

  connection.on('connected', () => {
    console.info('[connectMongoDB] connected');
  });

  connection.on('disconnected', () => {
    console.info('[connectMongoDB] disconnected');
  });

  connection.on('reconnect', () => {
    console.info('[connectMongoDB] reconnecting');
  });
};
