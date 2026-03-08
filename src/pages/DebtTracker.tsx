import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useForm } from 'react-hook-form';
import { ShieldAlert, Plus, User, DollarSign, Wallet, CheckCircle2 } from 'lucide-react';

interface DebtFormData {
    person_name: string;
    total_amount: number;
    description: string;
}

export const DebtTracker: React.FC = () => {
    const { debts, addDebt, updateDebtPayment, markDebtSettled } = useFinance();
    const [isAdding, setIsAdding] = useState(false);

    const { register, handleSubmit, reset } = useForm<DebtFormData>();

    const onSubmit = (data: DebtFormData) => {
        addDebt({
            person_name: data.person_name,
            total_amount: Number(data.total_amount),
            paid_amount: 0,
            remaining_amount: Number(data.total_amount),
            description: data.description,
            due_date: new Date().toISOString()
        });
        reset();
        setIsAdding(false);
    };

    const handleQuickPay = (id: string) => {
        const amount = prompt('Enter payment amount:');
        if (amount && !isNaN(Number(amount))) {
            updateDebtPayment(id, Number(amount));
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Debt Tracker</h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`p-2 rounded-full transition-all ${isAdding ? 'bg-zinc-800 text-white rotate-45' : 'bg-teal-500 text-zinc-950'}`}
                >
                    <Plus size={20} />
                </button>
            </header>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 animate-in slide-in-from-top-4 duration-300">
                    <h2 className="text-white font-bold text-lg mb-2">New Debt</h2>
                    <div className="space-y-3">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                {...register('person_name', { required: true })}
                                placeholder="Who do you owe?"
                                className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="number"
                                {...register('total_amount', { required: true, min: 1 })}
                                placeholder="Total Amount"
                                className="w-full bg-zinc-950 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <input
                            {...register('description')}
                            placeholder="Reason (Optional)"
                            className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-teal-500 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/10">
                        Create Debt record
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {debts.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                            <ShieldAlert size={32} />
                        </div>
                        <p className="text-zinc-500 font-medium">All clear! No debts found.</p>
                    </div>
                ) : (
                    debts.map((debt) => {
                        const progress = (debt.paid_amount / debt.total_amount) * 100;
                        const isSettled = debt.remaining_amount <= 0;

                        return (
                            <div key={debt.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 space-y-4 group transition-all hover:border-zinc-700">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-3 rounded-2xl ${isSettled ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'}`}>
                                            <Wallet size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{debt.person_name}</h3>
                                            <p className="text-xs text-zinc-500">{debt.description || 'No description'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-black">${debt.remaining_amount.toFixed(0)}</p>
                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Remaining</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                                        <span className="text-zinc-500">Paid: ${debt.paid_amount.toFixed(0)}</span>
                                        <span className="text-zinc-500">Total: ${debt.total_amount.toFixed(0)}</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${isSettled ? 'bg-emerald-400' : progress > 80 ? 'bg-amber-400' : 'bg-red-400'
                                                }`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {!isSettled && (
                                    <div className="flex space-x-2 pt-2">
                                        <button
                                            onClick={() => handleQuickPay(debt.id)}
                                            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all"
                                        >
                                            Quick Pay
                                        </button>
                                        <button
                                            onClick={() => markDebtSettled(debt.id)}
                                            className="px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                    </div>
                                )}
                                {isSettled && (
                                    <div className="flex items-center justify-center space-x-2 py-2 text-emerald-400 font-bold text-xs bg-emerald-400/5 rounded-xl">
                                        <CheckCircle2 size={14} />
                                        <span>Fully Settled</span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
