import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

const categories = [
  { name: 'Food', emoji: '🍔', color: '#06b6d4' },
  { name: 'Transport', emoji: '🚗', color: '#a855f7' },
  { name: 'Shopping', emoji: '🛍️', color: '#ec4899' },
  { name: 'Bills', emoji: '💡', color: '#f97316' },
  { name: 'Entertainment', emoji: '🎬', color: '#10b981' },
  { name: 'Health', emoji: '⚕️', color: '#ef4444' },
  { name: 'Other', emoji: '📦', color: '#6366f1' },
];

export function AddExpense() {
  const { addTransaction } = useFinance();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    addTransaction({
      amount: parseFloat(amount),
      category,
      description,
      date,
      type: 'expense',
    });

    toast.success('Expense added successfully!');
    
    // Reset form
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    
    // Navigate back to dashboard after a short delay
    setTimeout(() => navigate('/'), 500);
  };

  return (
    <div className="min-h-screen bg-black pb-24 px-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Add Expense</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800"
          >
            <label className="text-zinc-400 text-sm mb-2 block">Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-cyan-400">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent text-4xl font-bold text-white outline-none placeholder:text-zinc-700"
                autoFocus
              />
            </div>
          </motion.div>

          {/* Category Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="text-zinc-400 text-sm mb-3 block">Category</label>
            <div className="grid grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`relative aspect-square rounded-2xl border-2 transition-all ${
                    category === cat.name
                      ? 'border-white bg-zinc-800'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                  style={{
                    boxShadow: category === cat.name ? `0 0 20px ${cat.color}40` : 'none',
                  }}
                >
                  {category === cat.name && (
                    <div
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-2xl mb-1">{cat.emoji}</span>
                    <span className="text-xs text-zinc-400">{cat.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
          >
            <label className="text-zinc-400 text-sm mb-2 block">Description (Optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you buy?"
              className="w-full bg-transparent text-white outline-none placeholder:text-zinc-700"
            />
          </motion.div>

          {/* Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
          >
            <label className="text-zinc-400 text-sm mb-2 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-white outline-none"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            type="submit"
            disabled={!amount || !category}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-cyan-500/50"
          >
            Add Expense
          </motion.button>
        </form>
      </div>
    </div>
  );
}
