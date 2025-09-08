import { Contract } from '@ethersproject/contracts';
import { Wallet } from '@ethersproject/wallet';

import { staticProvider } from './provider.config.js';
import PancakePredictionABI from '../assets/PancakePrediction.abi.json' with { type: 'json' };
import environments from '../utils/environments.js';

const {
  PANCAKE_PREDICTION_CONTRACT_ADDRESS,
  MASTER_WALLET_PRIVATE_KEY,
} = environments;

export const contract = new Contract(
  PANCAKE_PREDICTION_CONTRACT_ADDRESS,
  PancakePredictionABI.abi,
  staticProvider
);

export const wallet = new Wallet(MASTER_WALLET_PRIVATE_KEY, staticProvider);
