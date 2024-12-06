import React from 'react';
import { Globe, TrendingUp, TrendingDown } from 'lucide-react';

const MarketOverview = () => {
  return (
    <div className="glass-card rounded-2xl mb-8 p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Globe className="mr-2" /> Market Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white/5 rounded-xl p-6 card-hover">
          <h3 className="text-blue-300 mb-2">Global Market Cap</h3>
          <p className="text-3xl font-bold text-white">$2.1T</p>
          <div className="mt-2 text-green-400 text-sm flex items-center">
            <TrendingUp size={16} className="mr-1" /> +2.4%
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-6 card-hover">
          <h3 className="text-blue-300 mb-2">24h Volume</h3>
          <p className="text-3xl font-bold text-white">$84.5B</p>
          <div className="mt-2 text-red-400 text-sm flex items-center">
            <TrendingDown size={16} className="mr-1" /> -1.2%
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-6 card-hover">
          <h3 className="text-blue-300 mb-2">BTC Dominance</h3>
          <p className="text-3xl font-bold text-white">42.3%</p>
          <div className="mt-2 text-green-400 text-sm flex items-center">
            <TrendingUp size={16} className="mr-1" /> +0.8%
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;