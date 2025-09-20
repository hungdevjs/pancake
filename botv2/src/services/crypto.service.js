import axios from 'axios';

export const getCryptoPriceInUSD = (symbol) =>
  axios.get(
    `https://api.coinbase.com/v2/exchange-rates?currency=${symbol.toUpperCase()}`
  );
