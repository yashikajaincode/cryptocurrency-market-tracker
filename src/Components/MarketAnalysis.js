import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Globe,
  Activity,
  Users,
  Lock,
  Shuffle
} from 'lucide-react';

const MarketAnalysis = ({ coinData }) => {
  const metrics = [
    {
      title: 'Market Dominance',
      value: `${coinData.market_cap_dominance.toFixed(2)}%`,
      icon: Globe,
      color: 'text-blue-500'
    },
    {
      title: 'Trading Volume',
      value: `$${coinData.total_volume.usd.toLocaleString()}`,
      icon: Activity,
      color: 'text-green-500'
    },
    {
      title: 'Circulating Supply',
      value: `${coinData.circulating_supply.toLocaleString()} ${coinData.symbol.toUpperCase()}`,
      icon: Shuffle,
      color: 'text-purple-500'
    },
    {
      title: 'Total Supply',
      value: coinData.total_supply ? `${coinData.total_supply.toLocaleString()} ${coinData.symbol.toUpperCase()}` : 'Unlimited',
      icon: Lock,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center mb-4">
            <metric.icon className={`${metric.color} mr-3`} size={24} />
            <h3 className="text-lg text-gray-200">{metric.title}</h3>
          </div>
          <p className="text-2xl font-bold text-white">{metric.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default MarketAnalysis;