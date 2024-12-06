import React, { useState, useEffect } from 'react';
import { Newspaper, Globe, Clock, ExternalLink } from 'lucide-react';
import api from '../Services/api';

const NewsSection = ({ coinId }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [coinId]);
  

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await api.fetchCryptoNews(coinId);
      setNews(data.slice(0, 5)); // Get latest 5 updates
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Newspaper className="mr-2" />
        Latest Updates
      </h2>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          No recent updates available
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              <h3 className="text-white font-medium mb-2">{item.description}</h3>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400">
                  <Globe size={14} className="mr-1" />
                  <span className="mr-3">CoinGecko</span>
                  <Clock size={14} className="mr-1" />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                {item.url && (
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsSection;