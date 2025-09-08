import { StaticJsonRpcProvider } from '@ethersproject/providers';

import environments from '../utils/environments.js';

const { ALCHEMY_API_ENDPOINT, NETWORK_ID } = environments;

export const staticProvider = new StaticJsonRpcProvider(
  ALCHEMY_API_ENDPOINT,
  Number(NETWORK_ID)
);
