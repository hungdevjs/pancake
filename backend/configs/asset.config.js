import { Contract } from '@ethersproject/contracts';

import { staticProvider } from './provider.config.js';
import PancakePredictionABI from '../assets/PancakePrediction.abi.json' with { type: 'json' };
import environments from '../utils/environments.js';

const {
  PANCAKE_PREDICTION_CONTRACT_ADDRESS,
} = environments;

export const contract = new Contract(
  PANCAKE_PREDICTION_CONTRACT_ADDRESS,
  PancakePredictionABI.abi,
  staticProvider
);
