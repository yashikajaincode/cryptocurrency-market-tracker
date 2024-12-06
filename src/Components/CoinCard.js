import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CoinCard = ({ coinData }) => {
  const priceChange = coinData.market_data.price_change_percentage_24h;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <img
          src={coinData.image.small}
          alt={coinData.name}
          className="w-8 h-8 mr-3"
        />
        <div>
          <h2 className="text-xl font-bold text-white">{coinData.name}</h2>
          <span className="text-gray-400">{coinData.symbol.toUpperCase()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-gray-400 text-sm mb-1">Price</div>
          <div className="text-white text-lg font-bold">
            ${coinData.market_data.current_price.usd.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-1">24h Change</div>
          <div className={`text-lg font-bold flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
            {Math.abs(priceChange).toFixed(2)}%
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-1">Market Cap</div>
          <div className="text-white text-lg font-bold">
            ${coinData.market_data.market_cap.usd.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-1">24h Volume</div>
          <div className="text-white text-lg font-bold">
            ${coinData.market_data.total_volume.usd.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinCard;