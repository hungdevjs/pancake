import { useEffect } from 'react';

const BNBChart = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        width: '100%',
        height: 300,
        symbol: 'BINANCE:BNBUSDT',
        interval: '5',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '3',
        locale: 'en',
        container_id: 'tradingview_bnb',
      });
    };
    document.body.appendChild(script);
  }, []);

  return <div id="tradingview_bnb" />;
};

export default BNBChart;
