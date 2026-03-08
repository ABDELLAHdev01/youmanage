import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { ExpenseCategory, Expense, Category } from '../types/finance';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Calendar as CalendarIcon, DollarSign, Tag, AlignLeft, AlertTriangle, AlertCircle } from 'lucide-react';

interface ExpenseFormData {
    name: string;
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
    tags: string;
}

export const AddExpense: React.FC = () => {
    const { addExpense, expenses, settings, categories: contextCategories } = useFinance();
    const navigate = useNavigate();

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ExpenseFormData>({
        defaultValues: {
            category: contextCategories[0]?.name || 'Other',
            date: new Date().toISOString().split('T')[0],
            description: '',
            tags: ''
        }
    });

    const watchedCategory = watch('category');
    const watchedAmount = watch('amount') || 0;

    const categorySpent = expenses
        .filter((e: Expense) => e.category === watchedCategory)
        .reduce((acc: number, curr: Expense) => acc + curr.amount, 0);

    const categoryLimit = settings.monthly_budget_per_category[watchedCategory] || 0;
    const totalAfterPurchase = categorySpent + Number(watchedAmount);
    const progress = (totalAfterPurchase / (categoryLimit || 1)) * 100;
    const isOverBudget = totalAfterPurchase > categoryLimit && categoryLimit > 0;
    const isCloseToBudget = progress >= 80 && !isOverBudget;

    const onSubmit = (data: ExpenseFormData) => {
        addExpense({
            name: data.name,
            amount: Number(data.amount),
            date: new Date(data.date).toISOString(),
            tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
            category: data.category,
            description: data.description
        });
        reset();
        navigate('/');
    };


    return (
        <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-zinc-800 rounded-full text-zinc-400">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-white">Add Expense</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Amount Input */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="text-zinc-500" size={18} />
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            {...register('amount', { required: true, min: 0.01 })}
                            className={`block w-full pl-10 pr-4 py-4 bg-zinc-900 border ${errors.amount ? 'border-red-500' : 'border-zinc-700'} text-white text-xl font-bold rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all`}
                            placeholder="0.00"
                        />
                        {errors.amount && <p className="mt-1 text-xs text-red-500">Valid amount is required</p>}
                    </div>

                    {/* Budget Warning Alert */}
                    {(isOverBudget || isCloseToBudget) && (
                        <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in duration-300 ${isOverBudget ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {isOverBudget ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
                            <div className="flex-1">
                                <p className="text-sm font-bold">{isOverBudget ? 'Budget Exceeded!' : 'Budget Warning'}</p>
                                <p className="text-[11px] opacity-80">
                                    {isOverBudget
                                        ? `Adding this will put you $${(totalAfterPurchase - categoryLimit).toFixed(2)} over your ${watchedCategory} budget.`
                                        : `You've used ${progress.toFixed(0)}% of your ${watchedCategory} budget.`
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {/* Name Input */}
                        <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                {...register('name', { required: true })}
                                placeholder="Expense Name (e.g. Starbucks)"
                                className="w-full bg-zinc-900 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-bold"
                            />
                        </div>
                        {/* Category Select */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Category</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="text-zinc-500" size={18} />
                                </div>
                                <select
                                    {...register('category', { required: true })}
                                    className="block w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none appearance-none transition-all"
                                >
                                    {contextCategories.map((c: Category) => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Date Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CalendarIcon className="text-zinc-500" size={18} />
                                </div>
                                <input
                                    type="date"
                                    {...register('date', { required: true })}
                                    className="block w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Description</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <AlignLeft className="text-zinc-500" size={18} />
                                </div>
                                <input
                                    type="text"
                                    {...register('description')}
                                    className="block w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    placeholder="What was this for?"
                                />
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Tags (Optional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Tag className="text-zinc-500" size={18} />
                                </div>
                                <input
                                    type="text"
                                    {...register('tags')}
                                    className="block w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-700 text-white rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                    placeholder="Work, Fun, Urgent... (comma separated)"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold py-4 rounded-2xl shadow-lg shadow-teal-500/20 transform transition-all active:scale-[0.98] focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                    Add Transaction
                </button>
            </form>
        </div>
    );
};
