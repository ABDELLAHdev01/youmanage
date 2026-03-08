import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ShoppingBag, Coffee, Car, Home as HomeIcon, MoreHorizontal, Trash2, Edit2, Calendar, ChevronRight } from 'lucide-react';
import { ExpenseCategory, Expense } from '../types/finance';

const categoryIcons: Record<ExpenseCategory, React.ElementType> = {
    Food: Coffee,
    Lifestyle: ShoppingBag,
    Transport: Car,
    Bills: HomeIcon,
    Other: MoreHorizontal,
};

const categoryColors: Record<ExpenseCategory, string> = {
    Food: 'text-orange-400 bg-orange-400/10',
    Lifestyle: 'text-purple-400 bg-purple-400/10',
    Transport: 'text-blue-400 bg-blue-400/10',
    Bills: 'text-red-400 bg-red-400/10',
    Other: 'text-zinc-400 bg-zinc-400/10',
};

type FilterType = 'Day' | 'Week' | 'Month';

export const History: React.FC = () => {
    const { expenses, deleteExpense } = useFinance();
    const [filter, setFilter] = useState<FilterType>('Month');

    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return expenses.filter(e => {
            const date = new Date(e.date);
            if (filter === 'Day') {
                return date >= startOfToday;
            }
            if (filter === 'Week') {
                const oneWeekAgo = new Date(now);
                oneWeekAgo.setDate(now.getDate() - 7);
                return date >= oneWeekAgo;
            }
            // Month
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return date >= startOfMonth;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, filter]);

    // Grouping logic
    const groupedExpenses = useMemo(() => {
        const groups: Record<string, { total: number; items: Expense[] }> = {};

        filteredExpenses.forEach(e => {
            const dateStr = new Date(e.date).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groups[dateStr]) {
                groups[dateStr] = { total: 0, items: [] };
            }
            groups[dateStr].items.push(e);
            groups[dateStr].total += e.amount;
        });

        return groups;
    }, [filteredExpenses]);

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">History</h1>
                <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    {(['Day', 'Week', 'Month'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-teal-500 text-zinc-950' : 'text-zinc-500'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-8 pb-24">
                {Object.keys(groupedExpenses).length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                            <Calendar size={32} />
                        </div>
                        <p className="text-zinc-500 font-medium">No expenses for this {filter.toLowerCase()}.</p>
                    </div>
                ) : (
                    Object.entries(groupedExpenses).map(([date, group]) => (
                        <div key={date} className="space-y-3">
                            <div className="flex justify-between items-end px-2">
                                <h2 className="text-xs font-black text-zinc-600 uppercase tracking-widest">{date}</h2>
                                <span className="text-sm font-bold text-zinc-400">Total: ${group.total.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                                {group.items.map((expense) => {
                                    const Icon = categoryIcons[expense.category] || MoreHorizontal;
                                    const colorClass = categoryColors[expense.category] || categoryColors.Other;

                                    return (
                                        <div
                                            key={expense.id}
                                            className="group flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all active:scale-[0.99]"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`p-3 rounded-2xl ${colorClass} transition-transform group-hover:scale-110`}>
                                                    <Icon size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{expense.category}</p>
                                                    {expense.description && (
                                                        <p className="text-xs text-zinc-500 truncate max-w-[120px]">{expense.description}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="text-white font-black">-${expense.amount.toFixed(2)}</p>
                                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                                                        {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this expense?')) deleteExpense(expense.id);
                                                    }}
                                                    className="p-2 text-zinc-700 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
