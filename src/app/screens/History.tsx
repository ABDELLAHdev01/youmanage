import { useFinance } from '../context/FinanceContext';
import { motion } from 'motion/react';
import { Calendar, Filter, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  Food: '#06b6d4',
  Transport: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#f97316',
  Entertainment: '#10b981',
  Health: '#ef4444',
  Other: '#6366f1',
};

const categoryEmojis: Record<string, string> = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '💡',
  Entertainment: '🎬',
  Health: '⚕️',
  Other: '📦',
  Income: '💰',
};

export function History() {
  const { transactions } = useFinance();
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' ? true : t.type === filter
  );

  // Group by date
  const groupedByDate = filteredTransactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>);

  const dates = Object.keys(groupedByDate).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  return (
    <div className="min-h-screen bg-black pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <p className="text-zinc-400">View all your transactions</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-900/50 to-green-950/50 rounded-2xl p-4 border border-green-800/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs">Income</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalIncome.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-pink-900/50 to-pink-950/50 rounded-2xl p-4 border border-pink-800/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-pink-400" />
              <span className="text-pink-400 text-xs">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filter === 'all'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filter === 'expense'
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
              filter === 'income'
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            Income
          </button>
        </motion.div>

        {/* Transactions List */}
        <div className="space-y-6">
          {dates.map((date, dateIndex) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + dateIndex * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-400">{formatDate(date)}</h3>
              </div>
              
              <div className="space-y-2">
                {groupedByDate[date].map((transaction, index) => {
                  const color = transaction.type === 'income' 
                    ? '#10b981' 
                    : categoryColors[transaction.category] || '#6366f1';
                  
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + dateIndex * 0.05 + index * 0.02 }}
                      className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-center gap-4"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          backgroundColor: `${color}20`,
                          border: `1px solid ${color}40`,
                        }}
                      >
                        {categoryEmojis[transaction.category] || categoryEmojis.Other}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">
                          {transaction.description || transaction.category}
                        </h4>
                        <p className="text-zinc-500 text-sm">{transaction.category}</p>
                      </div>
                      
                      <div className="text-right">
                        <p
                          className="font-bold text-lg"
                          style={{ color: transaction.type === 'income' ? '#10b981' : color }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {filteredTransactions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center"
            >
              <Filter className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400">No transactions found</p>
              <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
