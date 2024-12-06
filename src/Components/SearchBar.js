import React, { useState, useEffect } from 'react';

const SearchBar = ({ onCoinSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/search?query=' + searchTerm
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        setSuggestions(data.coins.slice(0, 5)); // Limit to top 5 results
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelect = (coin) => {
    setSearchTerm(coin.name);
    setSuggestions([]);
    onCoinSelect(coin.id);
  };

  return (
    <div className="relative mb-6">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a cryptocurrency..."
        className="w-full p-4 bg-white/5 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {loading && (
        <div className="absolute right-4 top-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-gray-800 rounded-xl shadow-lg">
          {suggestions.map((coin) => (
            <div
              key={coin.id}
              onClick={() => handleSelect(coin)}
              className="flex items-center p-4 hover:bg-gray-700 cursor-pointer transition-colors rounded-lg"
            >
              <img
                src={coin.thumb}
                alt={coin.name}
                className="w-6 h-6 mr-3"
              />
              <div>
                <div className="text-white">{coin.name}</div>
                <div className="text-gray-400 text-sm">{coin.symbol.toUpperCase()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;