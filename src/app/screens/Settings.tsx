import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'motion/react';
import { Moon, Sun, DollarSign, Target, Wallet, ChevronRight } from 'lucide-react';

export function Settings() {
  const { darkMode, toggleDarkMode, monthlyIncome, setMonthlyIncome, budgets } = useFinance();
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeValue, setIncomeValue] = useState(monthlyIncome.toString());

  const handleSaveIncome = () => {
    setMonthlyIncome(parseFloat(incomeValue));
    setEditingIncome(false);
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
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400">Manage your preferences</p>
        </motion.div>

        {/* Appearance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            Appearance
          </h2>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  darkMode ? 'bg-indigo-600' : 'bg-yellow-600'
                }`}>
                  {darkMode ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Theme</p>
                  <p className="text-zinc-500 text-sm">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
              </div>
              <div className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-cyan-600' : 'bg-zinc-700'
              }`}>
                <motion.div
                  animate={{ x: darkMode ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </div>
            </button>
          </div>
        </motion.div>

        {/* Financial Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            Financial Settings
          </h2>
          
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
            {/* Monthly Income */}
            <div className="p-4">
              <button
                onClick={() => setEditingIncome(!editingIncome)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Monthly Income</p>
                    <p className="text-zinc-500 text-sm">${monthlyIncome.toFixed(2)}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </button>
              
              {editingIncome && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-zinc-800"
                >
                  <div className="flex gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2">
                      <span className="text-zinc-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={incomeValue}
                        onChange={(e) => setIncomeValue(e.target.value)}
                        className="flex-1 bg-transparent text-white outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSaveIncome}
                      className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Savings Goal */}
            <button className="w-full p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Savings Goal</p>
                  <p className="text-zinc-500 text-sm">$5,000.00</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </motion.div>

        {/* Budget Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            Category Budgets
          </h2>
          
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
            {budgets.map((budget, index) => (
              <div key={budget.category} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${budget.color}40` }}
                    >
                      <DollarSign className="w-5 h-5" style={{ color: budget.color }} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{budget.category}</p>
                      <p className="text-zinc-500 text-sm">
                        ${budget.spent.toFixed(0)} / ${budget.limit.toFixed(0)}
                      </p>
                    </div>
                  </div>
                  <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Edit
                  </button>
                </div>
                
                <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                    transition={{ delay: 0.4 + index * 0.05, duration: 0.6 }}
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{
                      backgroundColor: budget.color,
                      boxShadow: `0 0 8px ${budget.color}60`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            About
          </h2>
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-purple-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Finance Tracker</h3>
            <p className="text-zinc-500 text-sm mb-3">Version 1.0.0</p>
            <p className="text-zinc-600 text-xs">
              Track your expenses, manage debts, and achieve your financial goals
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
