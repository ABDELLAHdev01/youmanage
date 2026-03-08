import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useForm } from 'react-hook-form';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, Target, DollarSign, CheckCircle2, Trash2 } from 'lucide-react';

interface SavingsGoalFormData {
    name: string;
    target_amount: number;
    initial_saved: number;
}

export const SavingsTracker: React.FC = () => {
    const { savingsGoals, addSavingsGoal, updateSavingsGoal, markSavingsGoalCompleted, deleteSavingsGoal } = useFinance();
    const [isAdding, setIsAdding] = useState(false);

    const { register, handleSubmit, reset } = useForm<SavingsGoalFormData>();

    const onSubmit = (data: SavingsGoalFormData) => {
        addSavingsGoal({
            name: data.name,
            target_amount: Number(data.target_amount),
            saved_amount: Number(data.initial_saved || 0),
            is_completed: Number(data.initial_saved || 0) >= Number(data.target_amount)
        });
        reset();
        setIsAdding(false);
    };

    const handleAddMoney = (id: string) => {
        const amount = prompt('Amount to add:');
        if (amount && !isNaN(Number(amount))) {
            updateSavingsGoal(id, Number(amount));
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Savings Goals</h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`p-2 rounded-full transition-all ${isAdding ? 'bg-zinc-800 text-white rotate-45' : 'bg-teal-500 text-zinc-950'}`}
                >
                    <Plus size={20} />
                </button>
            </header>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-white font-bold text-lg mb-2">New Goal</h2>
                    <div className="space-y-3">
                        <div className="relative">
                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                {...register('name', { required: true })}
                                placeholder="Goal Name (e.g. New Car)"
                                className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="number"
                                    {...register('target_amount', { required: true, min: 1 })}
                                    placeholder="Target"
                                    className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                                />
                            </div>
                            <input
                                type="number"
                                {...register('initial_saved')}
                                placeholder="Initial saved"
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-teal-500 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/10">
                        Create Goal
                    </button>
                </form>
            )}

            <div className="grid gap-4">
                {savingsGoals.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                            <TrendingUp size={32} />
                        </div>
                        <p className="text-zinc-500 font-medium">Start saving for your dreams!</p>
                    </div>
                ) : (
                    savingsGoals.map((goal) => {
                        const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                        const isCompleted = goal.is_completed || progress >= 100;

                        const chartData = [
                            { name: 'Saved', value: goal.saved_amount, color: isCompleted ? '#2dd4bf' : '#2dd4bf' },
                            { name: 'Remaining', value: Math.max(0, goal.target_amount - goal.saved_amount), color: '#27272a' }
                        ];

                        return (
                            <div key={goal.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 space-y-4 relative overflow-hidden">
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-16 h-16 relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={chartData}
                                                        innerRadius={22}
                                                        outerRadius={30}
                                                        paddingAngle={2}
                                                        dataKey="value"
                                                        stroke="none"
                                                        startAngle={90}
                                                        endAngle={-270}
                                                    >
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-[10px] font-bold text-white">{progress.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{goal.name}</h3>
                                            <p className="text-xs text-zinc-500">
                                                ${goal.saved_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteSavingsGoal(goal.id)}
                                        className="p-2 text-zinc-700 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex space-x-2 pt-2 relative z-10">
                                    {!isCompleted ? (
                                        <>
                                            <button
                                                onClick={() => handleAddMoney(goal.id)}
                                                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                                            >
                                                Add Money
                                            </button>
                                            <button
                                                onClick={() => markSavingsGoalCompleted(goal.id)}
                                                className="px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                                            >
                                                <CheckCircle2 size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full py-2.5 bg-emerald-400/10 text-emerald-400 text-center font-bold text-xs rounded-xl flex items-center justify-center space-x-2">
                                            <CheckCircle2 size={14} />
                                            <span>Goal Achieved!</span>
                                        </div>
                                    )}
                                </div>
                                {isCompleted && (
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
