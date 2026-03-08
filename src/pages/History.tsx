import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { ShoppingBag, Coffee, Car, Home as HomeIcon, MoreHorizontal, Trash2, Edit2, Calendar, ChevronRight } from 'lucide-react';
import { ExpenseCategory, Expense, Category } from '../types/finance';

const getCategoryData = (categoryName: string, categories: Category[]) => {
    const cat = categories.find((c: Category) => c.name === categoryName);
    return {
        color: cat?.color || '#3f3f46',
        icon: HomeIcon // Default icon for history items
    };
};

type FilterType = 'Day' | 'Week' | 'Month';

export const History: React.FC = () => {
    const { expenses, deleteExpense, categories } = useFinance();
    const [filter, setFilter] = useState<FilterType>('Month');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const filteredExpenses = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return expenses.filter((e: Expense) => {
            const date = new Date(e.date);
            let matchesTime = true;
            if (filter === 'Day') {
                matchesTime = date >= startOfToday;
            } else if (filter === 'Week') {
                const oneWeekAgo = new Date(now);
                oneWeekAgo.setDate(now.getDate() - 7);
                matchesTime = date >= oneWeekAgo;
            } else {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                matchesTime = date >= startOfMonth;
            }

            const matchesSearch = e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (e.tags && e.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));

            const matchesCategory = filterCategory === 'All' || e.category === filterCategory;

            return matchesTime && matchesSearch && matchesCategory;
        }).sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, filter, searchTerm, filterCategory]);

    // Grouping logic
    const groupedExpenses = useMemo(() => {
        const groups: Record<string, { total: number; items: Expense[] }> = {};

        filteredExpenses.forEach((e: Expense) => {
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

            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search name, category, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="space-y-8 pb-24">
                {Object.keys(groupedExpenses).length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                            <Calendar size={32} />
                        </div>
                        <p className="text-zinc-500 font-medium">No results found.</p>
                    </div>
                ) : (
                    Object.entries(groupedExpenses).map(([date, group]) => (
                        <div key={date} className="space-y-3">
                            <div className="flex justify-between items-end px-2">
                                <h2 className="text-xs font-black text-zinc-600 uppercase tracking-widest">{date}</h2>
                                <span className="text-sm font-bold text-zinc-400">Total: ${group.total.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                                {group.items.map((expense: Expense) => {
                                    const { color, icon: Icon } = getCategoryData(expense.category, categories);

                                    return (
                                        <div key={expense.id} className="relative group">
                                            {/* Delete Background */}
                                            <div className="absolute inset-y-0 right-0 w-20 bg-red-500 rounded-2xl flex items-center justify-center text-white">
                                                <Trash2 size={20} />
                                            </div>

                                            <motion.div
                                                drag="x"
                                                dragConstraints={{ left: -80, right: 0 }}
                                                onDragEnd={(event, info) => {
                                                    if (info.offset.x < -60) {
                                                        if (confirm('Delete this expense?')) deleteExpense(expense.id);
                                                    }
                                                }}
                                                className="relative z-10 flex flex-col bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all active:scale-[0.99] space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div
                                                            className="p-3 rounded-2xl text-white shadow-lg"
                                                            style={{ backgroundColor: color }}
                                                        >
                                                            <Icon size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold text-sm tracking-tight">{expense.name || expense.category}</p>
                                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{expense.category}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <p className="text-white font-black text-sm">-${expense.amount.toFixed(2)}</p>
                                                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                                                                {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm('Delete this expense?')) deleteExpense(expense.id);
                                                            }}
                                                            className="p-2 text-zinc-700 hover:text-red-400 transition-colors hidden sm:block"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {expense.tags && expense.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pl-14">
                                                        {expense.tags.map((tag: string) => (
                                                            <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full border border-zinc-700/50">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
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
