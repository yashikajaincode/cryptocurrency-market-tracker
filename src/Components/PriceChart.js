import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { format } from 'date-fns';

const PriceChart = ({ data, timeRange, onTimeRangeChange }) => {
  const [processedData, setProcessedData] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [indicators, setIndicators] = useState({
    volume: true,
    rsi: false,
    macd: false,
    sma: false,
  });

  useEffect(() => {
    if (data) {
      const enrichedData = enrichDataWithIndicators(data);
      setProcessedData(enrichedData);
    }
  }, [data, indicators]);

  const calculateSMA = (data, period) => {
    return data.map((item, index) => {
      if (index < period - 1) return null;
      const sum = data.slice(index - period + 1, index + 1)
        .reduce((acc, curr) => acc + curr.price, 0);
      return sum / period;
    });
  };

  const calculateRSI = (data, period = 14) => {
    const prices = data.map(item => item.price);
    const gains = [];
    const losses = [];

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change >= 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    // Calculate average gains and losses
    const calculateAverage = (arr, period) => {
      const avg = arr.slice(0, period).reduce((a, b) => a + b, 0) / period;
      return arr.slice(period).reduce((result, value, i) => {
        return [...result, (result[i] * (period - 1) + value) / period];
      }, [avg]);
    };

    const avgGains = calculateAverage(gains, period);
    const avgLosses = calculateAverage(losses, period);

    // Calculate RSI
    return avgGains.map((gain, i) => {
      const rs = gain / (avgLosses[i] || 1);
      return 100 - (100 / (1 + rs));
    });
  };

  const calculateMACD = (data) => {
    const prices = data.map(item => item.price);
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12.map((value, i) => value - ema26[i]);
    const signalLine = calculateEMA(macdLine, 9);
    return {
      macdLine,
      signalLine,
      histogram: macdLine.map((value, i) => value - signalLine[i])
    };
  };

  const calculateEMA = (data, period) => {
    const multiplier = 2 / (period + 1);
    let ema = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
    
    return ema;
  };

  const enrichDataWithIndicators = (rawData) => {
    let enriched = [...rawData];

    if (indicators.sma) {
      const sma20 = calculateSMA(rawData, 20);
      enriched = enriched.map((item, index) => ({
        ...item,
        sma20: sma20[index]
      }));
    }

    if (indicators.rsi) {
      const rsiValues = calculateRSI(rawData);
      enriched = enriched.map((item, index) => ({
        ...item,
        rsi: rsiValues[index]
      }));
    }

    if (indicators.macd) {
      const macdData = calculateMACD(rawData);
      enriched = enriched.map((item, index) => ({
        ...item,
        macd: macdData.macdLine[index],
        signal: macdData.signalLine[index],
        histogram: macdData.histogram[index]
      }));
    }

    return enriched;
  };

  const formatXAxis = (timestamp) => {
    const date = new Date(timestamp);
    switch (timeRange) {
      case '1':
        return format(date, 'HH:mm');
      case '7':
        return format(date, 'MMM dd');
      case '30':
      case '90':
        return format(date, 'MMM dd');
      case '365':
        return format(date, 'MMM yyyy');
      default:
        return format(date, 'MMM dd');
    }
  };

  return (
    <div className="bg-white/5 p-6 rounded-xl">
      {/* Chart controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex space-x-2">
          {['line', 'area', 'candlestick'].map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-4 py-2 rounded-lg ${
                chartType === type ? 'bg-blue-500' : 'bg-white/10'
              } text-white`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="bg-white/10 text-white border-none rounded-lg p-2"
        >
          <option value="1">24h</option>
          <option value="7">7d</option>
          <option value="30">30d</option>
          <option value="90">90d</option>
          <option value="365">1y</option>
        </select>
      </div>

      {/* Indicators controls */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(indicators).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setIndicators(prev => ({ ...prev, [key]: !value }))}
            className={`px-4 py-2 rounded-lg ${
              value ? 'bg-blue-500' : 'bg-white/10'
            } text-white`}
          >
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#fff"
              tick={{ fill: '#fff' }}
            />
            <YAxis 
              yAxisId="price"
              stroke="#fff"
              tick={{ fill: '#fff' }}
              domain={['auto', 'auto']}
            />
            {indicators.volume && (
              <YAxis 
                yAxisId="volume"
                orientation="right"
                stroke="#82ca9d"
                tick={{ fill: '#82ca9d' }}
              />
            )}
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value, name) => [
                Number(value).toFixed(2),
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
              labelFormatter={(label) => formatXAxis(label)}
            />
            <Legend />

            {chartType === 'line' && (
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                yAxisId="price"
                dot={false}
              />
            )}

            {chartType === 'area' && (
              <Area 
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                fill="url(#colorPrice)"
                yAxisId="price"
              />
            )}

            {indicators.volume && (
              <Bar 
                dataKey="volume" 
                fill="#82ca9d" 
                yAxisId="volume"
                opacity={0.3}
              />
            )}

            {indicators.sma && (
              <Line 
                type="monotone"
                dataKey="sma20"
                stroke="#f59e0b"
                dot={false}
                yAxisId="price"
              />
            )}

            {indicators.rsi && (
              <Line 
                type="monotone"
                dataKey="rsi"
                stroke="#ec4899"
                dot={false}
                yAxisId="price"
              />
            )}

            {indicators.macd && (
              <>
                <Line 
                  type="monotone"
                  dataKey="macd"
                  stroke="#8b5cf6"
                  dot={false}
                  yAxisId="price"
                />
                <Line 
                  type="monotone"
                  dataKey="signal"
                  stroke="#f43f5e"
                  dot={false}
                  yAxisId="price"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;