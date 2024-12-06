import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import CoinCard from './CoinCard';
import PriceChart from './PriceChart';
import NewsSection from './NewsSection';
import CryptoStats from './CryptoStats';
import LoadingSpinner from './LoadingSpinner';
import WebSocketService from './WebSocketService';

const cache = {
  data: new Map(),
  timestamp: new Map(),
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutes in milliseconds

  set(key, data) {
    this.data.set(key, data);
    this.timestamp.set(key, Date.now());
  },

  get(key) {
    const timestamp = this.timestamp.get(key);
    if (!timestamp) return null;
    
    if (Date.now() - timestamp > this.CACHE_DURATION) {
      this.data.delete(key);
      this.timestamp.delete(key);
      return null;
    }
    
    return this.data.get(key);
  },

  clear() {
    this.data.clear();
    this.timestamp.clear();
  }
};

const CryptoDashboard = () => {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [coinData, setCoinData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');
  const [livePrice, setLivePrice] = useState(null);

  const retryFetch = async (url, options, maxRetries = 3) => {
    let lastError = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        lastError = new Error(`HTTP error! status: ${response.status}`);
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw lastError;
  };

  const fetchCoinData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `${selectedCoin}-${timeRange}`;
      const cachedData = cache.get(cacheKey);
      
      if (cachedData) {
        setCoinData(cachedData.coinData);
        setChartData(processChartData(cachedData.historyData));
        setLoading(false);
        return;
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1500));

      const API_PATH = '/api/v3';
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      // Implement request queue
      const fetchWithRetry = async (url, options) => {
        for (let i = 0; i < 3; i++) {
          try {
            const response = await fetch(url, options);
            if (response.status === 429) {
              const retryAfter = response.headers.get('Retry-After') || 60;
              await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
              continue;
            }
            return response;
          } catch (error) {
            if (i === 2) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      };

      const [coinResponse, historyResponse] = await Promise.all([
        fetchWithRetry(
          `${API_PATH}/coins/${selectedCoin}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
          { method: 'GET', headers, credentials: 'omit' }
        ),
        fetchWithRetry(
          `${API_PATH}/coins/${selectedCoin}/market_chart?vs_currency=usd&days=${timeRange}&interval=${timeRange === '1' ? 'hourly' : 'daily'}`,
          { method: 'GET', headers, credentials: 'omit' }
        )
      ]);

      if (!coinResponse.ok || !historyResponse.ok) {
        throw new Error(`Failed to fetch data: ${coinResponse.status} ${historyResponse.status}`);
      }

      const [coinResult, historyResult] = await Promise.all([
        coinResponse.json(),
        historyResponse.json()
      ]);

      // Cache the results
      cache.set(cacheKey, {
        coinData: coinResult,
        historyData: historyResult
      });

      setCoinData(coinResult);
      setChartData(processChartData(historyResult));

      // Initialize WebSocket connection with the new coin
      WebSocketService.connect([selectedCoin]);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'An unexpected error occurred');
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        setError('Network error: Please check your internet connection');
      }
    } finally {
      setLoading(false);
    }
  };

  const memoizedFetchCoinData = useCallback(fetchCoinData, [selectedCoin, timeRange]);

  useEffect(() => {
    memoizedFetchCoinData();

    const symbol = selectedCoin.toUpperCase();
    WebSocketService.subscribe(symbol, handlePriceUpdate);

    return () => {
      WebSocketService.unsubscribe(symbol, handlePriceUpdate);
    };
  }, [selectedCoin, timeRange, memoizedFetchCoinData]);

  const handlePriceUpdate = (data) => {
    setLivePrice(data.price);
    setChartData(prevData => {
      if (!prevData.length) return prevData;
      const lastPoint = { ...prevData[prevData.length - 1], price: data.price };
      return [...prevData.slice(0, -1), lastPoint];
    });
  };

  const processChartData = (data) => {
    return data.prices.map(([timestamp, price], index) => ({
      timestamp,
      date: new Date(timestamp).toLocaleDateString(),
      price,
      volume: data.total_volumes[index][1],
      marketCap: data.market_caps[index][1],
    }));
  };

  const handleCoinSelect = (coinId) => {
    setSelectedCoin(coinId);
    setLivePrice(null);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={fetchCoinData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center mx-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <SearchBar onCoinSelect={handleCoinSelect} />

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {coinData && (
            <div className="space-y-6">
              <CryptoStats 
                coinData={coinData} 
                livePrice={livePrice}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <CoinCard 
                    coinData={coinData}
                    livePrice={livePrice}
                  />

                  <PriceChart 
                    data={chartData}
                    timeRange={timeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                    livePrice={livePrice}
                  />
                </div>

                <div className="lg:col-span-4">
                  <NewsSection 
                    coinId={selectedCoin}
                    coinName={coinData.name}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CryptoDashboard;