import { Contract } from '@ethersproject/contracts';

import { staticProvider } from './provider.config.js';
import PancakePredictionABI from '../assets/PancakePrediction.abi.json' with { type: 'json' };
import environments from '../utils/environments.js';

const {
  PANCAKE_BNB_PREDICTION_CONTRACT_ADDRESS,
  PANCAKE_BTC_PREDICTION_CONTRACT_ADDRESS,
  PANCAKE_ETH_PREDICTION_CONTRACT_ADDRESS,
} = environments;

const contractBNB = new Contract(
  PANCAKE_BNB_PREDICTION_CONTRACT_ADDRESS,
  PancakePredictionABI.abi,
  staticProvider
);

const contractBTC = new Contract(
  PANCAKE_BTC_PREDICTION_CONTRACT_ADDRESS,
  PancakePredictionABI.abi,
  staticProvider
);

const contractETH = new Contract(
  PANCAKE_ETH_PREDICTION_CONTRACT_ADDRESS,
  PancakePredictionABI.abi,
  staticProvider
);

export const contracts = {
  bnb: contractBNB,
  btc: contractBTC,
  eth: contractETH
}
