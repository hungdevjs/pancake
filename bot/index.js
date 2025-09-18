import { tickBNB, tickBTC, tickETH } from './tick.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  await delay(2_000);

  while (true) {
    await tickBNB();
    await tickBTC();
    await tickETH();
    await delay(250);
  }
};

main();
