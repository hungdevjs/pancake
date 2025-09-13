import dotenv from 'dotenv';

dotenv.config();

const environments = {
  PORT: process.env.PORT,

  ALCHEMY_API_ENDPOINT: process.env.ALCHEMY_API_ENDPOINT,
  NETWORK_ID: process.env.NETWORK_ID,

  MASTER_WALLET_ADDRESS: process.env.MASTER_WALLET_ADDRESS,

  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,

  START_BALANCE: process.env.START_BALANCE,
  PANCAKE_PREDICTION_CONTRACT_ADDRESS:
    process.env.PANCAKE_PREDICTION_CONTRACT_ADDRESS,
};

export default environments;
