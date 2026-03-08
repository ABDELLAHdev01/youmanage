import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, Target, CreditCard } from 'lucide-react';

export function Dashboard() {
  const { transactions, budgets, monthlyIncome, savingsGoal, currentSavings, debts } = useFinance();

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const moneyLeft = monthlyIncome - totalExpenses;
  const totalDebt = debts.reduce((sum, d) => d.total - d.paid + sum, 0);
  const savingsProgress = (currentSavings / savingsGoal) * 100;

  // Get top spending categories
  const topCategories = [...budgets]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 4)
    .filter(b => b.spent > 0);

  const pieData = topCategories.map(b => ({
    name: b.category,
    value: b.spent,
    color: b.color,
  }));

  const daysInMonth = 30;
  const dayOfMonth = 8;
  const dailyBudget = moneyLeft / (daysInMonth - dayOfMonth);

  return (
    <div className="min-h-screen bg-black pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400">March 8, 2026</p>
        </motion.div>

        {/* Main Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 to-cyan-900 p-6 shadow-lg shadow-cyan-500/20"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/10 rounded-full -mr-20 -mt-20" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-cyan-200" />
              <span className="text-cyan-200 text-sm">Monthly Income</span>
            </div>
            <p className="text-4xl font-bold text-white mb-4">${monthlyIncome.toFixed(2)}</p>
            <div className="flex items-center justify-between text-cyan-100">
              <span>Money Left</span>
              <span className="text-xl font-semibold">${moneyLeft.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-pink-400" />
              <span className="text-zinc-400 text-xs">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-zinc-400 text-xs">Daily Budget</span>
            </div>
            <p className="text-2xl font-bold text-white">${dailyBudget.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Spending by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
        >
          <h2 className="text-xl font-bold text-white mb-4">Spending Overview</h2>
          
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 space-y-2">
                {topCategories.map(category => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-zinc-300">{category.category}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      ${category.spent.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-4">No expenses yet</p>
          )}
        </motion.div>

        {/* Budget Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
        >
          <h2 className="text-xl font-bold text-white mb-4">Category Budgets</h2>
          <div className="space-y-4">
            {budgets.slice(0, 5).map(budget => {
              const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
              return (
                <div key={budget.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-300">{budget.category}</span>
                    <span className="text-sm text-zinc-400">
                      ${budget.spent.toFixed(0)} / ${budget.limit}
                    </span>
                  </div>
                  <div className="relative h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className="absolute top-0 left-0 h-full rounded-full"
                      style={{
                        backgroundColor: budget.color,
                        boxShadow: `0 0 10px ${budget.color}40`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Savings & Debt */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-900/50 to-green-950/50 rounded-2xl p-4 border border-green-800/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs">Savings Goal</span>
            </div>
            <p className="text-xl font-bold text-white mb-2">
              ${currentSavings} / ${savingsGoal}
            </p>
            <div className="relative h-2 bg-green-950 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${savingsProgress}%` }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="absolute top-0 left-0 h-full bg-green-400 rounded-full"
                style={{ boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }}
              />
            </div>
            <p className="text-xs text-green-400 mt-1">{savingsProgress.toFixed(0)}% Complete</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-orange-900/50 to-orange-950/50 rounded-2xl p-4 border border-orange-800/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-xs">Total Debt</span>
            </div>
            <p className="text-xl font-bold text-white mb-2">${totalDebt.toFixed(2)}</p>
            <p className="text-xs text-orange-400">{debts.length} active debts</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}