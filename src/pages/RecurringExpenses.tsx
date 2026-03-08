import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useForm } from 'react-hook-form';
import {
    Calendar,
    Plus,
    Trash2,
    CreditCard,
    DollarSign,
    Bell,
    ShoppingBag,
    Home,
    Zap
} from 'lucide-react';
import { ExpenseCategory, RecurringExpense } from '../types/finance';

interface RecurringExpenseFormData {
    name: string;
    amount: number;
    category: ExpenseCategory;
    day_of_month: number;
}

export const RecurringExpenses: React.FC = () => {
    const { recurringExpenses, addRecurringExpense, deleteRecurringExpense } = useFinance();
    const [isAdding, setIsAdding] = useState(false);
    const { register, handleSubmit, reset } = useForm<RecurringExpenseFormData>();

    const categories: ExpenseCategory[] = ['Food', 'Transport', 'Bills', 'Lifestyle', 'Other'];

    const onSubmit = (data: RecurringExpenseFormData) => {
        addRecurringExpense({
            name: data.name,
            amount: Number(data.amount),
            category: data.category,
            day_of_month: Number(data.day_of_month),
        });
        reset();
        setIsAdding(false);
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'Bills': return <Zap size={18} className="text-amber-400" />;
            case 'Transport': return <Zap size={18} className="text-blue-400" />;
            case 'Food': return <ShoppingBag size={18} className="text-emerald-400" />;
            case 'Lifestyle': return <CreditCard size={18} className="text-rose-400" />;
            default: return <Home size={18} className="text-zinc-400" />;
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Monthly Bills</h1>
                    <p className="text-xs text-zinc-500">Subscriptions & recurring costs</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`p-2 rounded-full transition-all ${isAdding ? 'bg-zinc-800 text-white rotate-45' : 'bg-teal-500 text-zinc-950'}`}
                >
                    <Plus size={20} />
                </button>
            </header>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 animate-in slide-in-from-top-4 duration-300 shadow-xl">
                    <h2 className="text-white font-bold text-lg mb-2">Add Recurring</h2>
                    <div className="space-y-3">
                        <input
                            {...register('name', { required: true })}
                            placeholder="Name (e.g. Netflix)"
                            className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input
                                    type="number"
                                    {...register('amount', { required: true, min: 1 })}
                                    placeholder="Amount"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    {...register('day_of_month', { required: true, min: 1, max: 31 })}
                                    placeholder="Day"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                        </div>
                        <select
                            {...register('category', { required: true })}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none appearance-none"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-teal-500 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/10 active:scale-95 transition-all">
                        Schedule Bill
                    </button>
                </form>
            )}

            <div className="space-y-3">
                {recurringExpenses.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                            <Calendar size={32} />
                        </div>
                        <p className="text-zinc-500 font-medium">No recurring bills added yet.</p>
                    </div>
                ) : (
                    recurringExpenses.map((expense) => (
                        <div key={expense.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                                    {getIcon(expense.category)}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">{expense.name}</h3>
                                    <div className="flex items-center space-x-2 text-[10px] text-zinc-500 mt-0.5">
                                        <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 capitalize">{expense.category}</span>
                                        <span>•</span>
                                        <span>Day {expense.day_of_month}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className="text-white font-bold text-sm">-${expense.amount.toFixed(2)}</span>
                                <button
                                    onClick={() => deleteRecurringExpense(expense.id)}
                                    className="p-2 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {recurringExpenses.length > 0 && (
                <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50 border-dashed">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 italic">Total monthly commitments:</span>
                        <span className="text-white font-black">${recurringExpenses.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};
