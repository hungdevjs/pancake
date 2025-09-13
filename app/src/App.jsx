import { useState, useEffect, useRef } from 'react';

import BNBChart from '../components/BNBChart';
import { getPositions, getBNBPriceInUSD } from './services/api';
import environments from './utils/environments';

const { MASTER_WALLET_ADDRESS } = environments;

const INTERVAL_WINDOW = 2_000;

const App = () => {
  const [positions, setPositions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [BNBPrice, setBNBPrice] = useState(0);
  const [currentRound, setCurrentRound] = useState(null);
  const [timeLeft, setTimeLeft] = useState('---');

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
        currentRound: newCurrentRound,
      } = res.data;
      setPositions(newPositions);
      setBalance(newBalance);
      setNetProfit(newNetProfit);
      setCurrentRound(newCurrentRound);
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
    get();
    removeInterval();

    interval.current = setInterval(get, INTERVAL_WINDOW);

    return () => removeInterval();
  }, []);

  const countdownInterval = useRef();
  const removeCountdownInterval = () => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }
  };

  const countdown = () => {
    if (!currentRound) return;

    const { lockTime } = currentRound;
    const now = Date.now();
    const diff = lockTime - now;
    if (diff <= 0) {
      setTimeLeft('0');
      return;
    }

    setTimeLeft(Math.round(diff / 1_000));
  };
  useEffect(() => {
    removeCountdownInterval();
    if (currentRound) {
      countdownInterval.current = setInterval(countdown, 1_000);
    }
  }, [currentRound?.epoch]);

  return (
    <div className="bg-black">
      <div className="max-w-[1280px] mx-auto p-4 flex flex-col gap-2">
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
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-6">
            <BNBChart />
          </div>
          {currentRound && (
            <div className="col-span-12 sm:col-span-6 border border-gray-700 flex flex-col">
              <div className="border-b border-gray-700 p-2">
                <p className="text-white text-lg font-medium">
                  #{currentRound.epoch}
                </p>
              </div>
              <div className="flex-1 p-2 flex items-center justify-center">
                <p className="text-white text-[100px] font-bold">{timeLeft}</p>
              </div>
              <div className="border-t border-gray-700 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/bull.png" alt="bull" className="block w-7" />
                  <div>
                    <p className="text-green-500 text-xs">
                      {currentRound.bullAmount.toFixed(5)} BNB
                    </p>
                    <p className="text-green-500 text-xs">
                      {currentRound.bullPayoutRatio.toFixed(3)}x
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-red-500 text-xs">
                      {currentRound.bearAmount.toFixed(5)} BNB
                    </p>
                    <p className="text-red-500 text-xs text-right">
                      {currentRound.bearPayoutRatio.toFixed(3)}x
                    </p>
                  </div>
                  <img src="/bear.png" alt="bear" className="block w-7" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="w-full overflow-auto">
          <div className="min-w-[960px] grid grid-cols-12 px-2 py-1">
            <div className="col-span-1 overflow-auto">
              <p className="text-white font-medium">Epoch</p>
            </div>
            <div className="col-span-2 overflow-auto text-right">
              <p className="text-white font-medium">Lock Price</p>
            </div>
            <div className="col-span-1 text-right">
              <p className="text-white font-medium">Bet</p>
            </div>
            <div className="col-span-2 overflow-auto text-right">
              <p className="text-white font-medium">Close Price</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-white font-medium">Result</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-white font-medium">Outcome</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-white font-medium">Status</p>
            </div>
          </div>
          <div className="h-[400px] min-w-[960px]  flex flex-col border border-gray-800 rounded-lg overflow-auto">
            {positions.map((position, index) => (
              <div
                key={position.epoch}
                className={`${
                  index ? 'border-t border-gray-800' : ''
                } grid grid-cols-12 px-2 py-1`}
              >
                <div className="col-span-1 overflow-auto">
                  <p className="text-white">#{position.epoch}</p>
                </div>
                <div className="col-span-2 overflow-auto text-right">
                  <p className="text-white text-sm">
                    {position.lockPrice?.toFixed(5) || '---'}
                  </p>
                </div>
                <div className="col-span-1 overflow-auto text-right">
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
                <div className="col-span-2 overflow-auto text-right">
                  <p className="text-white text-sm">
                    {position.closePrice?.toFixed(5) || '---'}
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
                <div className="col-span-2 text-right">
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
                <div className="col-span-2 text-right">
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
    </div>
  );
};

export default App;
