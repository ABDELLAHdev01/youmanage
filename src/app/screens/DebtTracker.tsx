import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { motion } from 'motion/react';
import { User, DollarSign, TrendingUp } from 'lucide-react';

export function DebtTracker() {
  const { debts, updateDebt } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalDebtAmount = debts.reduce((sum, d) => sum + d.total, 0);
  const totalPaid = debts.reduce((sum, d) => sum + d.paid, 0);
  const totalRemaining = totalDebtAmount - totalPaid;
  const overallProgress = (totalPaid / totalDebtAmount) * 100;

  return (
    <div className="min-h-screen bg-black pb-24 px-4">
      <div className="max-w-md mx-auto pt-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-bold text-white">Debt Tracker</h1>
          <p className="text-zinc-400">Track and manage your debts</p>
        </motion.div>

        {/* Overall Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-orange-900 p-6 shadow-lg shadow-orange-500/20"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-orange-400/10 rounded-full -mr-20 -mt-20" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-orange-200" />
              <span className="text-orange-200 text-sm">Total Debt</span>
            </div>
            <p className="text-4xl font-bold text-white mb-4">${totalDebtAmount.toFixed(2)}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-orange-100">
                <span>Paid</span>
                <span className="font-semibold">${totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-orange-100">
                <span>Remaining</span>
                <span className="font-semibold">${totalRemaining.toFixed(2)}</span>
              </div>
              <div className="relative h-2 bg-orange-950 rounded-full overflow-hidden mt-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="absolute top-0 left-0 h-full bg-orange-300 rounded-full"
                  style={{ boxShadow: '0 0 10px rgba(253, 186, 116, 0.5)' }}
                />
              </div>
              <p className="text-xs text-orange-200 text-right">{overallProgress.toFixed(1)}% paid</p>
            </div>
          </div>
        </motion.div>

        {/* Debts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Active Debts</h2>
          {debts.map((debt, index) => {
            const remaining = debt.total - debt.paid;
            const progress = (debt.paid / debt.total) * 100;
            const isEditing = editingId === debt.id;

            return (
              <motion.div
                key={debt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{debt.person}</h3>
                      <p className="text-zinc-400 text-sm">Total: ${debt.total.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-semibold">${remaining.toFixed(2)}</p>
                    <p className="text-zinc-500 text-xs">remaining</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Paid</span>
                    <span className="text-green-400 font-semibold">${debt.paid.toFixed(2)}</span>
                  </div>
                  
                  <div className="relative h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-zinc-500">{progress.toFixed(1)}% complete</p>
                    <button
                      onClick={() => setEditingId(isEditing ? null : debt.id)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      {isEditing ? 'Cancel' : 'Update Payment'}
                    </button>
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-zinc-800"
                    >
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={debt.paid}
                          placeholder="Amount paid"
                          className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              updateDebt(debt.id, parseFloat(input.value));
                              setEditingId(null);
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            updateDebt(debt.id, parseFloat(input.value));
                            setEditingId(null);
                          }}
                          className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {debts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800 text-center"
          >
            <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">No debts to track</p>
            <p className="text-zinc-600 text-sm mt-1">You're debt-free! 🎉</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
