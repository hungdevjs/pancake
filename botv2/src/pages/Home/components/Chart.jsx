import { useEffect, useState, useRef } from 'react';
import { AreaSeries, createChart, ColorType } from 'lightweight-charts';

const backgroundColor = 'black';
const lineColor = '#fcd535';
const textColor = 'white';
const gridColor = '#111';
const areaTopColor = '#fcd535ff';
const areaBottomColor = 'rgba(252, 213, 53, 0.2)';

export const ChartComponent = ({ data, currentPrice }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chart.timeScale().fitContent();

    const newSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    });
    newSeries.setData(data);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      chart.remove();
    };
  }, [
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
  ]);

  return (
    <div>
      <div ref={chartContainerRef} />
      <div>
        <p className="text-white text-center font-bold text-3xl">
          ${currentPrice.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const Chart = () => {
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState('---');

  useEffect(() => {
    setData((prev) => []);
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/bnbusdt@trade`);

    ws.onmessage = (event) => {
      const trade = JSON.parse(event.data);
      const time = Math.floor(trade.T / 1000);
      const price = parseFloat(trade.p);

      setData((prev) => {
        if (prev.at(-1)?.time === time) {
          return [...prev.slice(0, -1), { time, value: price }];
        }
        return [...prev, { time, value: price }];
      });
      setCurrentPrice(price);
    };

    return () => {
      ws.close();
    };
  }, []);

  return <ChartComponent data={data} currentPrice={currentPrice} />;
};

export default Chart;
