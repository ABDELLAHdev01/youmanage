import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Settings as SettingsIcon, Download, Upload, Moon, DollarSign, CheckCircle2, AlertCircle, Zap, Shield, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { ExpenseCategory } from '../types/finance';

export const Settings: React.FC = () => {
    const { settings, updateSettings, importState, income, expenses } = useFinance();
    const [budgets, setBudgets] = useState(settings.monthly_budget_per_category);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleBudgetChange = (category: ExpenseCategory, value: string) => {
        const newBudgets = { ...budgets, [category]: parseFloat(value) || 0 };
        setBudgets(newBudgets);
        updateSettings({ ...settings, monthly_budget_per_category: newBudgets });
    };

    const handleSalaryChange = (field: 'recurring_salary_amount' | 'recurring_salary_day', value: string) => {
        const numValue = parseFloat(value) || 0;
        updateSettings({ ...settings, [field]: numValue });
    };

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleExport = () => {
        try {
            const data = window.localStorage.getItem('finance_data');
            if (!data) return;

            const timestamp = new Date().toISOString().split('T')[0];
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `finance_backup_${timestamp}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showFeedback('success', 'Backup exported successfully!');
        } catch (err) {
            showFeedback('error', 'Failed to export backup.');
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = event.target?.result as string;
                const data = JSON.parse(json);

                // Simple validation
                if (!data.income || !data.expenses || !data.settings) {
                    throw new Error('Invalid backup format');
                }

                const mode = window.confirm('Do you want to MERGE this with your current data? (Cancel to REPLACE ENTIRELY)')
                    ? 'merge' : 'replace';

                const success = importState(data, mode);
                if (success) {
                    showFeedback('success', `Data ${mode === 'merge' ? 'merged' : 'replaced'} successfully!`);
                    // If replace, local storage state updates might need a reload or careful state management
                    if (mode === 'replace') {
                        setTimeout(() => window.location.reload(), 1000);
                    }
                } else {
                    showFeedback('error', 'Failed to import data.');
                }
            } catch (err) {
                showFeedback('error', 'Invalid or corrupted JSON file.');
            }
        };
        reader.readAsText(file);
        // Reset input
        e.target.value = '';
    };

    const categories: ExpenseCategory[] = ['Food', 'Transport', 'Bills', 'Lifestyle', 'Other'];

    // Calculate Recommended Daily Budget
    const totalIncome = (income || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalPlanned = Object.values(settings.monthly_budget_per_category).reduce((acc, curr) => acc + curr, 0);
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate() + 1;
    const recommendedDaily = Math.max(0, (totalIncome - totalPlanned) / daysLeft);

    const handleDailyBudgetModeChange = (mode: 'recommended' | 'custom') => {
        updateSettings({ ...settings, daily_budget_mode: mode });
    };

    const handleCustomDailyBudgetChange = (value: string) => {
        updateSettings({ ...settings, custom_daily_budget: parseFloat(value) || 0 });
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
            <header className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <SettingsIcon className="text-white" size={24} />
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                </div>
            </header>

            {feedback && (
                <div className={`p-4 rounded-2xl flex items-center space-x-3 animate-in slide-in-from-top-4 duration-300 ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{feedback.message}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex justify-between items-center shadow-lg shadow-black/5">
                    <div className="flex items-center space-x-3">
                        <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                            <Moon size={20} />
                        </div>
                        <span className="text-white font-medium">Dark Mode Enabled</span>
                    </div>
                    <div
                        onClick={() => updateSettings({ ...settings, dark_mode_enabled: !settings.dark_mode_enabled })}
                        className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${settings.dark_mode_enabled ? 'bg-teal-500 justify-end' : 'bg-zinc-800 justify-start'}`}
                    >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                </div>

                {/* Financial Sections */}
                <div className="bg-zinc-900 p-2 rounded-3xl border border-zinc-800 overflow-hidden shadow-lg shadow-black/5">
                    <Link to="/income" className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50">
                        <div className="flex items-center space-x-3">
                            <div className="bg-teal-500/10 p-2 rounded-xl text-teal-400">
                                <DollarSign size={20} />
                            </div>
                            <span className="text-white font-medium">Income & Salary</span>
                        </div>
                        <ChevronRight size={18} className="text-zinc-600" />
                    </Link>
                    <Link to="/recurring" className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
                                <CreditCard size={20} />
                            </div>
                            <span className="text-white font-medium">Monthly Bills</span>
                        </div>
                        <ChevronRight size={18} className="text-zinc-600" />
                    </Link>
                </div>

                {/* Security Section */}
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4 shadow-lg shadow-black/5">
                    <div className="flex items-center space-x-3">
                        <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                            <Shield size={20} className="text-rose-400" />
                        </div>
                        <h2 className="text-white font-bold">Security</h2>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white text-sm font-medium">App PIN Lock</p>
                            <p className="text-[10px] text-zinc-500">{settings.security_pin ? 'PIN is active and protecting your data' : 'Add a PIN to secure your app locally'}</p>
                        </div>
                        <button
                            onClick={() => {
                                if (settings.security_pin) {
                                    if (window.confirm('Disable PIN security?')) {
                                        updateSettings({ ...settings, security_pin: undefined });
                                    }
                                } else {
                                    const newPin = window.prompt('Enter new 4-6 digit PIN:');
                                    if (newPin && newPin.length >= 4) {
                                        updateSettings({ ...settings, security_pin: newPin });
                                    }
                                }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${settings.security_pin ? 'bg-zinc-800 text-rose-400' : 'bg-teal-500 text-zinc-950'}`}
                        >
                            {settings.security_pin ? 'Disable' : 'Set PIN'}
                        </button>
                    </div>
                </div>

                {/* Daily Budget Settings */}
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-5 shadow-lg shadow-black/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                                <Zap size={20} className="text-amber-400" />
                            </div>
                            <h2 className="text-white font-bold">Daily Budget</h2>
                        </div>
                        <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                            <button
                                onClick={() => handleDailyBudgetModeChange('recommended')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.daily_budget_mode === 'recommended' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                            >
                                Recommended
                            </button>
                            <button
                                onClick={() => handleDailyBudgetModeChange('custom')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.daily_budget_mode === 'custom' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}
                            >
                                Custom
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {settings.daily_budget_mode === 'recommended' ? (
                            <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 border-dashed">
                                <p className="text-zinc-500 text-xs mb-1 uppercase tracking-wider font-bold">System Recommendation</p>
                                <p className="text-2xl font-black text-white">${recommendedDaily.toFixed(2)}<span className="text-zinc-700 text-sm font-normal ml-2">/ day</span></p>
                                <p className="text-[10px] text-zinc-600 mt-2 leading-relaxed">Calculated based on your total income minus planned category budgets, distributed over the remaining {daysLeft} days of the month.</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm font-medium">Custom Daily Limit</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">$</span>
                                    <input
                                        type="number"
                                        value={settings.custom_daily_budget || ''}
                                        placeholder="0.00"
                                        onChange={(e) => handleCustomDailyBudgetChange(e.target.value)}
                                        className="w-32 bg-zinc-950 text-white rounded-xl pl-6 pr-3 py-2 text-right outline-none border border-zinc-800 focus:ring-2 focus:ring-amber-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        )}
                        {settings.daily_budget_mode === 'custom' && (
                            <p className="text-[10px] text-zinc-500">
                                Recommended: <span className="font-bold text-zinc-400">${recommendedDaily.toFixed(2)}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Recurring Salary Settings */}
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-5 shadow-lg shadow-black/5">
                    <div className="flex items-center space-x-3">
                        <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                            <DollarSign size={20} className="text-teal-400" />
                        </div>
                        <h2 className="text-white font-bold">Recurring Salary</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-zinc-500 text-sm font-medium">Monthly Amount</span>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">$</span>
                                <input
                                    type="number"
                                    value={settings.recurring_salary_amount || ''}
                                    placeholder="0.00"
                                    onChange={(e) => handleSalaryChange('recurring_salary_amount', e.target.value)}
                                    className="w-32 bg-zinc-950 text-white rounded-xl pl-6 pr-3 py-2 text-right outline-none border border-zinc-800 focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500 text-sm font-medium">Day of Month</span>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                value={settings.recurring_salary_day || ''}
                                placeholder="1"
                                onChange={(e) => handleSalaryChange('recurring_salary_day', e.target.value)}
                                className="w-20 bg-zinc-950 text-white rounded-xl px-3 py-2 text-center outline-none border border-zinc-800 focus:ring-2 focus:ring-teal-500 transition-all font-bold"
                            />
                        </div>
                        <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800/50">
                            <div>
                                <p className="text-white text-xs font-bold uppercase tracking-tight">Automate Record</p>
                                <p className="text-[9px] text-zinc-500">Auto-add income every month</p>
                            </div>
                            <div
                                onClick={() => updateSettings({ ...settings, recurring_salary_enabled: !settings.recurring_salary_enabled })}
                                className={`w-10 h-5 rounded-full flex items-center p-1 cursor-pointer transition-colors ${settings.recurring_salary_enabled ? 'bg-teal-500' : 'bg-zinc-800'}`}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${settings.recurring_salary_enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-600 italic">App will auto-add this amount as income on the selected day each month if enabled.</p>
                    </div>
                </div>

                {/* Budget Editor */}
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-5 shadow-lg shadow-black/5">
                    <div className="flex items-center space-x-3">
                        <div className="bg-zinc-800 p-2 rounded-xl text-zinc-400">
                            <DollarSign size={20} />
                        </div>
                        <h2 className="text-white font-bold">Monthly Budgets</h2>
                    </div>
                    <div className="space-y-4">
                        {categories.map((cat) => (
                            <div key={cat} className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm font-medium">{cat}</span>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">$</span>
                                    <input
                                        type="number"
                                        value={budgets[cat]}
                                        onChange={(e) => handleBudgetChange(cat, e.target.value)}
                                        className="w-28 bg-zinc-950 text-white rounded-xl pl-6 pr-3 py-2 text-right outline-none border border-zinc-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-5 shadow-lg shadow-black/5">
                    <h2 className="text-white font-bold">Data Management</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={handleExport}
                            className="w-full flex items-center justify-center space-x-3 bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-2xl transition-all font-bold border border-zinc-700/50"
                        >
                            <Download size={20} className="text-teal-400" />
                            <span>Export Backup</span>
                        </button>
                        <label className="w-full flex items-center justify-center space-x-3 bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-2xl transition-all font-bold border border-zinc-700/50 cursor-pointer">
                            <Upload size={20} className="text-amber-400" />
                            <span>Import Backup</span>
                            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                        </label>
                    </div>
                    <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">
                        Local Storage • Offline Only
                    </p>
                </div>
            </div>
        </div>
    );
};
