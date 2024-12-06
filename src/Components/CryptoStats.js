import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const CryptoStats = ({ coinData }) => {
  const renderPriceChangeIndicator = (change) => {
    const isPositive = change > 0;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp size={20} className="mr-2" /> : <TrendingDown size={20} className="mr-2" />}
        <span className="text-2xl font-bold">{change.toFixed(2)}%</span>
      </div>
    );
  };
  

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
        <div className="flex items-center text-blue-300 mb-2">
          <DollarSign size={20} className="mr-2" />
          <span>Price (USD)</span>
        </div>
        <div className="text-2xl font-bold text-white">
          ${coinData.market_data.current_price.usd.toLocaleString()}
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
        <div className="flex items-center text-blue-300 mb-2">
          <Activity size={20} className="mr-2" />
          <span>24h Change</span>
        </div>
        {renderPriceChangeIndicator(coinData.market_data.price_change_percentage_24h)}
      </div>
    </div>
  );
};

export default CryptoStats;