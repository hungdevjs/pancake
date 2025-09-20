import { useState, useEffect, useRef } from 'react';
import { IconBear, IconBull } from '../../../components/Icons';

const CurrentRound = ({ currentRound }) => {
  const [timeLeft, setTimeLeft] = useState('---');

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

    return () => removeCountdownInterval();
  }, [currentRound?.epoch]);

  if (!currentRound) return null;

  return (
    <>
      <div className="border-b border-gray-700 p-2">
        <p className="text-white text-lg font-medium">#{currentRound.epoch}</p>
      </div>
      <div className="flex-1 p-2 flex items-center justify-center">
        <p className="text-white text-[100px] font-bold">{timeLeft}</p>
      </div>
      <div className="border-t border-gray-700 p-2 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <IconBull fill="#00c951" className="w-7 aspect-square" />
          <div>
            <p className="text-green-500 text-xs">
              {currentRound.bullAmount.toFixed(5)} BNB
            </p>
            <p className="text-green-500 text-xs">
              {currentRound.bullPayoutRatio.toFixed(3)}x
            </p>
          </div>
        </div>
        <div
          className={`flex-1 h-[10px] ${
            currentRound.totalAmount ? 'bg-red-500' : 'bg-gray-700'
          }`}
        >
          <div
            className={`bg-green-500 transition duration-200 h-full`}
            style={{
              width: `${
                currentRound.totalAmount
                  ? Math.round(
                      (currentRound.bullAmount * 100) / currentRound.totalAmount
                    )
                  : 0
              }%`,
            }}
          />
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
          <IconBear fill="#fb2c36" className="w-7 aspect-square" />
        </div>
      </div>
    </>
  );
};

export default CurrentRound;
