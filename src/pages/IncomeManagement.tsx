import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useForm } from 'react-hook-form';
import { Plus, Wallet, Calendar, FileText, Trash2, ArrowUpCircle, Repeat } from 'lucide-react';
import { Income, IncomeType } from '../types/finance';

interface IncomeFormData {
    amount: number;
    description: string;
    date: string;
    type: IncomeType;
    is_recurring: boolean;
}

export const IncomeManagement: React.FC = () => {
    const { income, addIncome, deleteIncome } = useFinance();
    const { register, handleSubmit, reset, watch, setValue } = useForm<IncomeFormData>({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            type: 'Extra',
            is_recurring: false
        }
    });

    const incomeType = watch('type');

    const onSubmit = (data: IncomeFormData) => {
        addIncome({
            ...data,
            amount: Number(data.amount),
            date: new Date(data.date).toISOString(),
        });
        reset({
            amount: undefined,
            description: '',
            date: new Date().toISOString().split('T')[0],
            type: 'Extra',
            is_recurring: false
        });
    };

    const salaryTemplate = income.find(i => i.is_recurring && i.type === 'Salary');

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
            <header className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <ArrowUpCircle className="text-teal-400" size={24} />
                    <h1 className="text-2xl font-bold text-white">Income</h1>
                </div>
            </header>

            {/* Monthly Salary Card */}
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-lg shadow-black/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-teal-500/10 p-2 rounded-xl">
                            <Repeat className="text-teal-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-white font-bold">Monthly Salary</h2>
                            <p className="text-zinc-500 text-xs">Automatically adds at start of month</p>
                        </div>
                    </div>
                </div>

                {salaryTemplate ? (
                    <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                        <div>
                            <span className="text-white font-bold text-lg">${salaryTemplate.amount.toLocaleString()}</span>
                            <p className="text-zinc-500 text-xs">{salaryTemplate.description || 'Main Salary'}</p>
                        </div>
                        <button
                            onClick={() => deleteIncome(salaryTemplate.id)}
                            className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => {
                            setValue('type', 'Salary');
                            setValue('is_recurring', true);
                            setValue('description', 'Monthly Salary');
                        }}
                        className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 hover:border-teal-500/50 hover:text-teal-400 transition-all text-sm font-medium"
                    >
                        + Set Monthly Salary
                    </button>
                )}
            </div>

            {/* Add Income Form */}
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-lg shadow-black/5">
                <h2 className="text-white font-bold mb-4 flex items-center space-x-2">
                    <Plus size={18} className="text-teal-400" />
                    <span>{incomeType === 'Salary' ? 'Set Salary' : 'Add Extra Income'}</span>
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <button
                            type="button"
                            onClick={() => {
                                setValue('type', 'Extra');
                                setValue('is_recurring', false);
                            }}
                            className={`p-3 rounded-xl text-xs font-bold transition-all border ${incomeType === 'Extra'
                                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                                }`}
                        >
                            Extra Income
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setValue('type', 'Salary');
                                setValue('is_recurring', true);
                            }}
                            className={`p-3 rounded-xl text-xs font-bold transition-all border ${incomeType === 'Salary'
                                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                                    : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                                }`}
                        >
                            Monthly Salary
                        </button>
                    </div>

                    <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            {...register('amount', { required: true, min: 0.01 })}
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            className="w-full bg-zinc-950 text-white rounded-2xl py-4 pl-12 pr-4 outline-none border border-zinc-800 focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                        />
                    </div>

                    <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            {...register('description')}
                            placeholder="Description (Optional)"
                            className="w-full bg-zinc-950 text-white rounded-2xl py-4 pl-12 pr-4 outline-none border border-zinc-800 focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                    </div>

                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            {...register('date', { required: true })}
                            type="date"
                            className="w-full bg-zinc-950 text-white rounded-2xl py-4 pl-12 pr-4 outline-none border border-zinc-800 focus:ring-2 focus:ring-teal-500 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/20"
                    >
                        {incomeType === 'Salary' ? 'Save Salary Settings' : 'Add Income'}
                    </button>
                </form>
            </div>

            {/* Income History */}
            <div className="space-y-3">
                <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest px-2">Recent Records</h2>
                <div className="space-y-2">
                    {income
                        .filter(i => !i.is_recurring) // Only show records, not templates
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 10)
                        .map((item) => (
                            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between group">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-xl ${item.type === 'Salary' ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        <ArrowUpCircle size={18} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{item.description || item.type}</p>
                                        <p className="text-zinc-500 text-[10px]">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-teal-400 font-bold text-sm">+${item.amount.toLocaleString()}</span>
                                    <button
                                        onClick={() => deleteIncome(item.id)}
                                        className="p-1 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};
