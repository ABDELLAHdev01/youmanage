import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface Debt {
  id: string;
  person: string;
  total: number;
  paid: number;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  color: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  debts: Debt[];
  budgets: Budget[];
  monthlyIncome: number;
  savingsGoal: number;
  currentSavings: number;
  darkMode: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateDebt: (id: string, paid: number) => void;
  setBudgetLimit: (category: string, limit: number) => void;
  setMonthlyIncome: (amount: number) => void;
  toggleDarkMode: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const categories = [
  { name: 'Food', color: '#06b6d4' }, // cyan
  { name: 'Transport', color: '#a855f7' }, // purple
  { name: 'Shopping', color: '#ec4899' }, // pink
  { name: 'Bills', color: '#f97316' }, // orange
  { name: 'Entertainment', color: '#10b981' }, // green
  { name: 'Health', color: '#ef4444' }, // red
  { name: 'Other', color: '#6366f1' }, // indigo
];

const initialTransactions: Transaction[] = [
  { id: '1', amount: 45.50, category: 'Food', description: 'Grocery shopping', date: '2026-03-08', type: 'expense' },
  { id: '2', amount: 15.00, category: 'Transport', description: 'Uber ride', date: '2026-03-08', type: 'expense' },
  { id: '3', amount: 120.00, category: 'Shopping', description: 'New shoes', date: '2026-03-07', type: 'expense' },
  { id: '4', amount: 8.50, category: 'Food', description: 'Coffee', date: '2026-03-07', type: 'expense' },
  { id: '5', amount: 200.00, category: 'Bills', description: 'Electricity bill', date: '2026-03-06', type: 'expense' },
  { id: '6', amount: 50.00, category: 'Entertainment', description: 'Concert tickets', date: '2026-03-06', type: 'expense' },
  { id: '7', amount: 3500.00, category: 'Income', description: 'Monthly salary', date: '2026-03-01', type: 'income' },
];

const initialDebts: Debt[] = [
  { id: '1', person: 'Sarah Johnson', total: 500, paid: 300 },
  { id: '2', person: 'Mike Chen', total: 250, paid: 100 },
  { id: '3', person: 'Emma Davis', total: 1000, paid: 750 },
];

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [monthlyIncome, setMonthlyIncomeState] = useState(3500);
  const [savingsGoal] = useState(5000);
  const [currentSavings] = useState(2350);
  const [darkMode, setDarkMode] = useState(true);

  // Calculate budgets based on transactions
  const budgets: Budget[] = categories.map(cat => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      category: cat.name,
      limit: 500, // Default limit
      spent,
      color: cat.color,
    };
  });

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateDebt = (id: string, paid: number) => {
    setDebts(prev =>
      prev.map(debt => (debt.id === id ? { ...debt, paid } : debt))
    );
  };

  const setBudgetLimit = (category: string, limit: number) => {
    // In a real app, this would update a budgets state
    console.log(`Setting budget for ${category} to ${limit}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        debts,
        budgets,
        monthlyIncome,
        savingsGoal,
        currentSavings,
        darkMode,
        addTransaction,
        updateDebt,
        setBudgetLimit,
        setMonthlyIncome: setMonthlyIncomeState,
        toggleDarkMode,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
}
