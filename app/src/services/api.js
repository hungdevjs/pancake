import axios from 'axios';

import environments from '../utils/environments';

const { BACKEND_URL } = environments;

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    const message = (err.response && err.response.data) || err.message;
    throw new Error(message);
  }
);

export default api;

export const getPositions = (type) =>
  api.get('/positions', { params: { type } });

export const getBNBPriceInUSD = async () => {
  try {
    const res = await axios.get(
      'https://api.coinbase.com/v2/exchange-rates?currency=BNB'
    );
    return res.data.data.rates.USD;
  } catch (err) {
    console.error(err);
    return 1;
  }
};
