import { useNavigate } from 'react-router-dom';

import useUserStore from '../../../stores/user.store';

const Header = ({ userBalance, userUSDBalance, netProfit, netUSDProfit }) => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const { trackingAddress } = user.addressConfig || {
    trackingAddress: null,
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <p className="text-white text-lg font-medium">PANCAKE BOT</p>
        <p className={netProfit > 0 ? 'text-green-500' : 'text-red-500'}>
          Net profit: {netProfit.toFixed(6)}BNB ~ ${netUSDProfit.toFixed(3)}
        </p>
      </div>
      <p
        className="text-yellow-500 text-sm underline cursor-pointer"
        onClick={() => navigate('/configs')}
      >
        Change configs
      </p>
      {trackingAddress && (
        <div className="bg-white/7 p-2 rounded-lg">
          <p className="text-white font-light">
            {trackingAddress.slice(0, 6)}...
            {trackingAddress.slice(-6)}
          </p>
          <p className="text-gray-600 text-sm text-right font-light">
            {Math.round(userBalance * 1_000_000) / 1_000_000} BNB ~ $
            {Math.round(userUSDBalance * 1_000) / 1_000}
          </p>
        </div>
      )}
    </div>
  );
};

export default Header;
