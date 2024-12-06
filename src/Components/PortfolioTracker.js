import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  PlusCircle, 
  Trash2, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit2
} from 'lucide-react';


const PortfolioTracker = () => {
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('cryptoPortfolio');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    coin: '',
    amount: '',
    price: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addTransaction = () => {
    if (newTransaction.coin && newTransaction.amount && newTransaction.price) {
      setPortfolio([...portfolio, { ...newTransaction, id: Date.now() }]);
      setNewTransaction({ coin: '', amount: '', price: '', date: new Date().toISOString().split('T')[0] });
      setShowAddModal(false);
    }
  };

  const removeTransaction = (id) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };

  const calculateTotalValue = () => {
    return portfolio.reduce((total, item) => {
      return total + (parseFloat(item.amount) * parseFloat(item.price));
    }, 0);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Wallet className="mr-2" />
          Portfolio Tracker
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors"
        >
          <PlusCircle className="mr-2" size={18} />
          Add Transaction
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-gray-400 mb-2">Total Value</h3>
          <p className="text-2xl font-bold text-white">
            ${calculateTotalValue().toLocaleString()}
          </p>
        </div>
        {/* Add more summary cards here */}
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {portfolio.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/5 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold text-white">
                {transaction.coin.toUpperCase()}
              </h3>
              <div className="text-sm text-gray-400">
                Amount: {transaction.amount} • Price: ${transaction.price}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => removeTransaction(transaction.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            {/* Modal content */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTracker;