import Chart from './components/Chart';
import Header from './components/Header';
import CurrentRound from './components/CurrentRound';
import useSmartContract from '../../hooks/useSmartContract';
import Positions from './components/Positions';

const Home = () => {
  const { currentRound, userBalance, userUSDBalance, netProfit, netUSDProfit } =
    useSmartContract();

  return (
    <div className="bg-black h-dvh overflow-auto">
      <div className="max-w-[1280px] mx-auto p-4 flex flex-col gap-4">
        <Header
          userBalance={userBalance}
          userUSDBalance={userUSDBalance}
          netProfit={netProfit}
          netUSDProfit={netUSDProfit}
        />
        {/* <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-6">
            <Chart />
          </div>
          <div className="col-span-12 sm:col-span-6 border border-gray-700 flex flex-col">
            <CurrentRound currentRound={currentRound} />
          </div>
        </div> */}
        <div>
          <Positions />
        </div>
      </div>
    </div>
  );
};

export default Home;
