import moment from 'moment';

import usePosition from '../../../hooks/usePosition';
import { IconArrowLeft, IconArrowRight } from '../../../components/Icons';

const Positions = () => {
  const { items, total, page, limit, setPage } = usePosition();

  const canBack = page > 0;
  const back = () => canBack && setPage(page - 1);
  const canNext = (page + 1) * limit < total;
  const next = () => canNext && setPage(page + 1);

  return (
    <div className="w-full">
      <div className="min-w-[1200px] grid grid-cols-12 px-2 py-1">
        <div className="col-span-1">
          <p className="text-white font-medium">Epoch</p>
        </div>
        <div className="col-span-2 text-right">
          <p className="text-white font-medium">Time</p>
        </div>
        <div className="col-span-1 text-right">
          <p className="text-white font-medium">Lock Price</p>
        </div>
        <div className="col-span-1 text-right">
          <p className="text-white font-medium">Bet</p>
        </div>
        <div className="col-span-1 text-right">
          <p className="text-white font-medium">EV return</p>
        </div>
        <div className="col-span-1  text-right">
          <p className="text-white font-medium">Close Price</p>
        </div>
        <div className="col-span-1 text-right">
          <p className="text-white font-medium">Result</p>
        </div>
        <div className="col-span-2 text-right">
          <p className="text-white font-medium">Outcome</p>
        </div>
        <div className="col-span-2 text-right">
          <p className="text-white font-medium">Status</p>
        </div>
      </div>
      <div className="h-[400px] min-w-[1200px] flex flex-col border border-gray-800 overflow-auto">
        {items.map((position, index) => (
          <div
            key={position.epoch}
            className={`${
              index ? 'border-t border-gray-800' : ''
            } grid grid-cols-12 px-2 py-1`}
          >
            <div className="col-span-1">
              <p className="text-white">#{position.epoch}</p>
            </div>
            <div className="col-span-2 text-right">
              <p className="text-white">
                {moment(new Date(position.createdAt)).format(
                  'DD/MM/YYYY HH:mm:ss'
                )}
              </p>
            </div>
            <div className="col-span-1 text-right">
              <p className="text-white text-sm">
                {position.lockPrice
                  ? Math.round(position.lockPrice * 10_000) / 10_000
                  : '---'}
              </p>
            </div>
            <div className="col-span-1 text-right">
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
            <div className="col-span-1 text-right">
              <p
                className={
                  position.position === 'bull'
                    ? 'text-green-500 text-sm'
                    : 'text-red-500 text-sm'
                }
              >
                {position.expectReturnRatio
                  ? Math.round(position.expectedPayoutRatio * 10_000) / 10_000
                  : '---'}
                x
              </p>
            </div>
            <div className="col-span-1 text-right">
              <p
                className={`${
                  position.closePrice > position.lockPrice
                    ? 'text-green-500'
                    : position.closePrice < position.lockPrice
                    ? 'text-red-500'
                    : 'text-white'
                } text-sm`}
              >
                {position.closePrice
                  ? Math.round(position.closePrice * 10_000) / 10_000
                  : '---'}
              </p>
            </div>
            <div className="col-span-1 text-right">
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
                  position.status === 'processing'
                    ? 'text-yellow-500 text-sm'
                    : position.status === 'lost'
                    ? 'text-red-500 text-sm'
                    : 'text-green-500 text-sm'
                }
              >
                {position.status}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 flex justify-end items-center gap-4">
        <button
          className={`transition duration-200 active:scale-95 ${
            !canBack ? 'opacity-50' : 'cursor-pointer'
          }`}
        >
          <IconArrowLeft className="w-7 aspect-square" />
        </button>
        <p className="text-white text-xl font-bold">{page + 1}</p>
        <button
          className={`transition duration-200 active:scale-95 ${
            !canNext ? 'opacity-50' : 'cursor-pointer'
          }`}
        >
          <IconArrowRight className="w-7 aspect-square" />
        </button>
      </div>
    </div>
  );
};

export default Positions;
