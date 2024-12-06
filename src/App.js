import React from 'react';
import CryptoDashboard from './Components/CryptoDashboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 crypto-bg">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Crypto Market Tracker
        </h1>
        <CryptoDashboard />
      </div>
    </div>
  );
}

export default App;