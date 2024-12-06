const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Fetch basic coin information
export const fetchCoinInfo = async (coinId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch coin info');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching coin info:', error);
    throw error;
  }
};

// Fetch detailed price and OHLC data
export const fetchDetailedCoinData = async (coinId, days) => {
  try {
    const interval = getTimeInterval(days);
    const [priceResponse, ohlcResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`),
      fetch(`${API_BASE_URL}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`)
    ]);

    if (!priceResponse.ok || !ohlcResponse.ok) {
      throw new Error('Failed to fetch detailed coin data');
    }

    const priceData = await priceResponse.json();
    const ohlcData = await ohlcResponse.json();

    return processChartData(priceData, ohlcData);
  } catch (error) {
    console.error('Error fetching detailed coin data:', error);
    throw error;
  }
};

// Fetch trending coins
export const fetchTrendingCoins = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/search/trending`);
    if (!response.ok) {
      throw new Error('Failed to fetch trending coins');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    throw error;
  }
};

// Fetch global market data
export const fetchGlobalMarketData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/global`);
    if (!response.ok) {
      throw new Error('Failed to fetch global market data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching global market data:', error);
    throw error;
  }
};

// Fetch crypto news (using CoinGecko status updates as an alternative to news)
export const fetchCryptoNews = async (coinId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/${coinId}/status_updates`);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    const data = await response.json();
    return data.status_updates || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Search coins
export const searchCoins = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${query}`);
    if (!response.ok) {
      throw new Error('Failed to search coins');
    }
    return response.json();
  } catch (error) {
    console.error('Error searching coins:', error);
    throw error;
  }
};

// Fetch multiple coins market data
export const fetchMultipleCoinsData = async (coinIds) => {
  try {
    const idsString = coinIds.join(',');
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${idsString}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch multiple coins data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching multiple coins data:', error);
    throw error;
  }
};

// Helper function to determine time interval based on days
const getTimeInterval = (days) => {
  switch (days) {
    case '1':
      return 'minute';
    case '7':
      return 'hourly';
    default:
      return 'daily';
  }
};

// Process chart data
const processChartData = (priceData, ohlcData) => {
  try {
    return priceData.prices.map(([timestamp, price], index) => {
      const volume = priceData.total_volumes[index]?.[1] || 0;
      const ohlc = ohlcData.find(([time]) => time === timestamp);

      return {
        timestamp,
        price,
        volume,
        open: ohlc?.[1] || price,
        high: ohlc?.[2] || price,
        low: ohlc?.[3] || price,
        close: ohlc?.[4] || price,
        date: new Date(timestamp).toLocaleDateString(),
        time: new Date(timestamp).toLocaleTimeString(),
        marketCap: priceData.market_caps[index]?.[1] || 0,
      };
    });
  } catch (error) {
    console.error('Error processing chart data:', error);
    throw error;
  }
};

// Format large numbers
export const formatNumber = (number) => {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(2) + 'B';
  }
  if (number >= 1e6) {
    return (number / 1e6).toFixed(2) + 'M';
  }
  if (number >= 1e3) {
    return (number / 1e3).toFixed(2) + 'K';
  }
  return number.toFixed(2);
};

// Calculate percentage change
export const calculatePercentageChange = (oldValue, newValue) => {
  return ((newValue - oldValue) / oldValue) * 100;
};

export default {
  fetchCoinInfo,
  fetchDetailedCoinData,
  fetchTrendingCoins,
  fetchGlobalMarketData,
  fetchCryptoNews,
  searchCoins,
  fetchMultipleCoinsData,
  formatNumber,
  calculatePercentageChange
};