import { useState, useEffect, useRef } from 'react';

import { getPositions, getBNBPriceInUSD } from './services/api';
import environments from './utils/environments';

const { MASTER_WALLET_ADDRESS } = environments;

const INTERVAL_WINDOW = 5_000;

const App = () => {
  const [positions, setPositions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [BNBPrice, setBNBPrice] = useState(0);

  const interval = useRef();
  const removeInterval = () => {
    if (interval.current) {
      clearInterval(interval.current);
    }
  };

  const get = async () => {
    try {
      const res = await getPositions();
      const {
        positions: newPositions,
        balance: newBalance,
        netProfit: newNetProfit,
      } = res.data;
      setPositions(newPositions);
      setBalance(newBalance);
      setNetProfit(newNetProfit);
    } catch (err) {
      console.error(err);
    }
  };

  const getBNBPrice = async () => {
    try {
      const price = await getBNBPriceInUSD();
      setBNBPrice(price);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getBNBPrice();
    removeInterval();

    interval.current = setInterval(get, INTERVAL_WINDOW);

    return () => removeInterval();
  }, []);

  return (
    <div className="bg-black">
      <div className="h-dvh max-w-[1280px] mx-auto p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-lg font-medium">PANCAKE BOT</p>
            <p
              className={`text-sm ${
                netProfit > 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              Net profit: {Math.round(netProfit * 1_000_000) / 1_000_000} BNB
            </p>
          </div>
          <div className="bg-white/7 p-2 rounded-lg">
            <p className="text-white font-light">
              {MASTER_WALLET_ADDRESS.slice(0, 6)}...
              {MASTER_WALLET_ADDRESS.slice(-6)}
            </p>
            <p className="text-gray-600 text-sm text-right font-light">
              {Math.round(balance * 1_000_000) / 1_000_000} BNB ~ $
              {Math.round(BNBPrice * balance * 1_000) / 1_000}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-12 px-2 py-1">
          <div className="col-span-2">
            <p className="text-white font-medium">Epoch</p>
          </div>
          <div className="col-span-2 text-right">
            <p className="text-white font-medium">Bet</p>
          </div>
          <div className="col-span-2 text-right">
            <p className="text-white font-medium">Result</p>
          </div>
          <div className="col-span-3 text-right">
            <p className="text-white font-medium">Outcome</p>
          </div>
          <div className="col-span-3 text-right">
            <p className="text-white font-medium">Status</p>
          </div>
        </div>
        <div className="flex-1 flex flex-col border border-gray-800 rounded-lg overflow-auto">
          {positions.map((position, index) => (
            <div
              key={position.epoch}
              className={`${
                index ? 'border-t border-gray-800' : ''
              } grid grid-cols-12 px-2 py-1`}
            >
              <div className="col-span-2">
                <p className="text-white">#{position.epoch}</p>
              </div>
              <div className="col-span-2 text-right">
                <p
                  className={
                    position.position === 'bull'
                      ? 'text-green-500 text-sm'
                      : 'text-red-500 text-sm'
                  }
                >
                  {position.position}
                </p>
              </div>
              <div className="col-span-2 text-right">
                <p
                  className={
                    position.result === 'win'
                      ? 'text-green-500 text-sm'
                      : position.result === 'lose'
                      ? 'text-red-500 text-sm'
                      : 'text-orange-400 text-sm'
                  }
                >
                  {position.result}
                </p>
              </div>
              <div className="col-span-3 text-right">
                <p
                  className={
                    position.outcome > 0
                      ? 'text-green-500 text-sm'
                      : 'text-red-500 text-sm'
                  }
                >
                  {position.outcome > 0 ? '+' : ''}
                  {Math.round(position.outcome * 1_000_000) / 1_000_000}
                </p>
              </div>
              <div className="col-span-3 text-right">
                <p
                  className={
                    position.result === 'pending'
                      ? 'text-yellow-500 text-sm'
                      : position.result === 'lose'
                      ? 'text-red-500 text-sm'
                      : 'text-green-500 text-sm'
                  }
                >
                  {['lose', 'pending'].includes(position.result)
                    ? '---'
                    : position.claimed
                    ? 'claimed'
                    : 'pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
