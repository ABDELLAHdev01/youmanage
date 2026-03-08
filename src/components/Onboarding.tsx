import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance } from '../context/FinanceContext';
import { ExpenseCategory } from '../types/finance';
import {
    Shield,
    ChevronRight,
    ChevronLeft,
    TrendingUp,
    Target,
    Zap,
    DollarSign,
    CheckCircle2,
    Lock,
    PieChart as ChartIcon,
    Bell,
    Plus,
    Trash2,
    Info,
    AlertTriangle
} from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { completeOnboarding } = useFinance();
    const [step, setStep] = useState(0);

    // State
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [salary, setSalary] = useState<number>(0);
    const [salaryDay, setSalaryDay] = useState(1);
    const [salaryEnabled, setSalaryEnabled] = useState(true);
    const [extraIncomes, setExtraIncomes] = useState<{ amount: number; description: string }[]>([]);

    const [budgets, setBudgets] = useState<Record<ExpenseCategory, number>>({
        Food: 0,
        Transport: 0,
        Bills: 0,
        Lifestyle: 0,
        Other: 0
    });

    const [emergencyTarget, setEmergencyTarget] = useState(0);
    const [emergencyMonthly, setEmergencyMonthly] = useState(0);
    const [hasEmergencyFund, setHasEmergencyFund] = useState(false);

    const [remainingBalance, setRemainingBalance] = useState<number | null>(null);

    // Helpers
    const totalIncome = useMemo(() => salary + extraIncomes.reduce((acc, curr) => acc + curr.amount, 0), [salary, extraIncomes]);
    const totalBudgets = useMemo(() => Object.values(budgets).reduce((acc, curr) => acc + curr, 0), [budgets]);

    const daysLeftInMonth = useMemo(() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return lastDay - now.getDate() + 1;
    }, []);

    const actualDailyLeft = useMemo(() => {
        const surplus = (remainingBalance ?? totalIncome) - totalBudgets - (hasEmergencyFund ? emergencyMonthly : 0);
        return Math.max(0, surplus / daysLeftInMonth);
    }, [remainingBalance, totalIncome, totalBudgets, hasEmergencyFund, emergencyMonthly, daysLeftInMonth]);

    const nextStep = () => {
        if (step === 2 && salary > 0) {
            setBudgets({
                Food: Math.round(totalIncome * 0.15),
                Transport: Math.round(totalIncome * 0.10),
                Bills: Math.round(totalIncome * 0.20),
                Lifestyle: Math.round(totalIncome * 0.10),
                Other: Math.round(totalIncome * 0.05)
            });
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleFinish = () => {
        completeOnboarding({
            salaryAmount: salary,
            salaryDay: salaryDay,
            salaryEnabled: salaryEnabled,
            extraIncomes: extraIncomes,
            budgets: budgets,
            emergencyFundTarget: emergencyTarget,
            emergencyFundMonthly: emergencyMonthly,
            initialBalance: remainingBalance,
            pin: pin || undefined,
        });
        onComplete();
    };

    const addExtraIncome = () => setExtraIncomes([...extraIncomes, { amount: 0, description: '' }]);
    const removeExtraIncome = (index: number) => setExtraIncomes(extraIncomes.filter((_, i) => i !== index));
    const updateExtraIncome = (index: number, field: 'amount' | 'description', value: any) => {
        const newExtras = [...extraIncomes];
        newExtras[index] = { ...newExtras[index], [field]: value };
        setExtraIncomes(newExtras);
    };

    const steps = [
        {
            title: "Welcome to YouManage",
            description: "Your professional partner for personal finance tracking.",
            icon: <ChartIcon className="text-teal-400" size={48} />,
            content: (
                <div className="grid grid-cols-1 gap-2 text-left w-full max-w-sm mx-auto">
                    {[
                        { icon: <TrendingUp size={16} className="text-emerald-400" />, title: "Dashboard Insights", text: "Real-time overview of your finances." },
                        { icon: <Target size={16} className="text-rose-400" />, title: "Savings & Debts", text: "Track progress towards goals." },
                        { icon: <Zap size={16} className="text-amber-400" />, title: "Daily Guardrails", text: "Safe spending limits." },
                        { icon: <Bell size={16} className="text-indigo-400" />, title: "Smart Alerts", text: "Notifications for bills." }
                    ].map((item, i) => (
                        <div key={i} className="bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/50 flex items-start space-x-3">
                            <div className="mt-1">{item.icon}</div>
                            <div>
                                <h4 className="text-white font-bold text-[10px] uppercase tracking-wider">{item.title}</h4>
                                <p className="text-[9px] text-zinc-500">{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            title: "Secure Your Data",
            description: "Choose a 4-6 digit PIN to protect your information.",
            icon: <Shield className="text-teal-400" size={48} />,
            content: (
                <div className="space-y-3 w-full max-w-xs mx-auto">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="password"
                            maxLength={6}
                            placeholder="Create PIN (4-6 digits)"
                            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-center tracking-widest font-bold text-sm"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="password"
                            maxLength={6}
                            placeholder="Confirm PIN"
                            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-9 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-center tracking-widest font-bold text-sm"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                    {pin && pin.length < 4 && <p className="text-[9px] text-zinc-500 text-center">At least 4 digits required</p>}
                    {pin && confirmPin && pin !== confirmPin && <p className="text-[10px] text-red-400 text-center">PINs do not match</p>}

                    <button
                        onClick={nextStep}
                        className="w-full mt-1 text-zinc-600 text-[9px] font-bold uppercase tracking-[0.2em] hover:text-zinc-400 transition-colors"
                    >
                        Skip Security
                    </button>
                </div>
            )
        },
        {
            title: "Set Your Income",
            description: "Enable automation to auto-add your salary each month.",
            icon: <DollarSign className="text-emerald-400" size={48} />,
            content: (
                <div className="space-y-3 w-full max-w-xs mx-auto text-left">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Salary</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white pl-7 pr-3 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
                                    value={salary || ''}
                                    onChange={(e) => setSalary(Number(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Day</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
                                    value={salaryDay || ''}
                                    onChange={(e) => setSalaryDay(Math.min(31, Math.max(1, Number(e.target.value))))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Automate Monthly?</span>
                        <button
                            onClick={() => setSalaryEnabled(!salaryEnabled)}
                            className={`w-9 h-4.5 rounded-full transition-all relative ${salaryEnabled ? 'bg-teal-500' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all ${salaryEnabled ? 'left-5' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Extra Sources</label>
                            <button onClick={addExtraIncome} className="text-teal-500 hover:text-teal-400">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="space-y-1.5 max-h-[85px] overflow-y-auto pr-1 scrollbar-hide">
                            {extraIncomes.map((extra, i) => (
                                <div key={i} className="flex space-x-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Source"
                                        className="flex-1 bg-zinc-900 border border-zinc-800 text-white px-2 py-1.5 rounded-lg text-[10px] outline-none"
                                        value={extra.description}
                                        onChange={(e) => updateExtraIncome(i, 'description', e.target.value)}
                                    />
                                    <div className="relative w-16">
                                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[8px]">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-4 pr-1 py-1.5 rounded-lg text-[10px] outline-none font-bold"
                                            value={extra.amount || ''}
                                            onChange={(e) => updateExtraIncome(i, 'amount', Number(e.target.value))}
                                        />
                                    </div>
                                    <button onClick={() => removeExtraIncome(i)} className="text-zinc-600 hover:text-rose-500">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Essential Budgets",
            description: "Suggested limits for your lifestyle.",
            icon: <PieChart size={48} className="text-indigo-400" />,
            content: (
                <div className="space-y-1.5 w-full max-w-sm mx-auto text-left">
                    {(Object.keys(budgets) as ExpenseCategory[]).map((cat) => (
                        <div key={cat} className="bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/50 flex items-center space-x-3">
                            <div className="w-14 shrink-0">
                                <span className="text-[10px] font-bold text-white block truncate">{cat}</span>
                                <span className="text-[8px] text-zinc-500">
                                    {Math.round((budgets[cat] / totalIncome) * 100 || 0)}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max={totalIncome * 0.5}
                                step="10"
                                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                value={budgets[cat]}
                                onChange={(e) => setBudgets({ ...budgets, [cat]: Number(e.target.value) })}
                            />
                            <div className="relative w-16 shrink-0">
                                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-zinc-500 text-[8px]">$</span>
                                <input
                                    type="number"
                                    className="w-full bg-zinc-800 border-none text-white pl-4 pr-1 py-1 rounded-lg text-[10px] outline-none font-bold text-right"
                                    value={budgets[cat] || ''}
                                    onChange={(e) => setBudgets({ ...budgets, [cat]: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between items-center px-1 pt-1">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Total Budgeted</span>
                        <span className={`text-[10px] font-black ${totalBudgets > totalIncome ? 'text-rose-500' : 'text-teal-400'}`}>
                            ${totalBudgets.toLocaleString()} / ${totalIncome.toLocaleString()}
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: "Emergency Fund",
            description: "Aim for 3-6 months of essential expenses.",
            icon: <Target className="text-rose-400" size={48} />,
            content: (
                <div className="space-y-4 w-full max-w-xs mx-auto text-left">
                    <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-2xl border border-zinc-800">
                        <div>
                            <h4 className="text-white font-bold text-xs uppercase tracking-tight">Enable Fund?</h4>
                            <p className="text-[9px] text-zinc-500">Monthly auto-savings.</p>
                        </div>
                        <button
                            onClick={() => setHasEmergencyFund(!hasEmergencyFund)}
                            className={`w-10 h-5 rounded-full transition-all relative ${hasEmergencyFund ? 'bg-teal-500' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hasEmergencyFund ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {hasEmergencyFund && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                            >
                                <div className="space-y-1">
                                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Target Goal</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-8 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
                                            value={emergencyTarget || ''}
                                            onChange={(e) => setEmergencyTarget(Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Monthly Plan</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-8 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
                                            value={emergencyMonthly || ''}
                                            onChange={(e) => setEmergencyMonthly(Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )
        },
        {
            title: "Daily Budget",
            description: "Your safe spending limit based on plan.",
            icon: <Zap className="text-amber-400" size={48} />,
            content: (
                <div className="space-y-4 w-full max-w-xs mx-auto">
                    <div className="flex flex-col items-center">
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Recommended Daily</div>
                        <div className="text-4xl font-black text-white tracking-tight">
                            ${Math.round(actualDailyLeft).toLocaleString()}
                        </div>
                    </div>

                    <div className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-800 space-y-2 text-left">
                        <div className="flex justify-between items-center text-[9px]">
                            <span className="text-zinc-500 uppercase tracking-tight">Net Monthly Surplus</span>
                            <span className="text-white font-bold">${(totalIncome - totalBudgets - (hasEmergencyFund ? emergencyMonthly : 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <span className="text-zinc-500 uppercase tracking-tight">Days Left In Month</span>
                            <span className="text-white font-bold">{daysLeftInMonth}</span>
                        </div>
                        <div className="h-px bg-zinc-800 w-full" />
                        <div className="flex justify-between items-center">
                            <span className="text-[9px] text-teal-400 font-black uppercase">Daily Allowance</span>
                            <span className="text-teal-400 font-black text-xs">${Math.round(actualDailyLeft).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block text-left ml-1">Current Balance (Mid-Month)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">$</span>
                            <input
                                type="number"
                                placeholder="Optional"
                                className="w-full bg-zinc-900 border border-zinc-800 text-white pl-8 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm"
                                value={remainingBalance === null ? '' : remainingBalance}
                                onChange={(e) => setRemainingBalance(e.target.value === '' ? null : Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Review & Start",
            description: "Your setup is ready for tracking.",
            icon: <CheckCircle2 className="text-teal-400" size={48} />,
            content: (
                <div className="bg-zinc-900/40 p-4 rounded-3xl border border-zinc-800 space-y-2 text-left w-full max-w-sm">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5 mb-1.5">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Monthly Salary</span>
                        <span className="text-white font-bold text-[11px]">${salary.toLocaleString()} (Day {salaryDay})</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5 mb-1.5">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Automation</span>
                        <span className={`text-[11px] font-bold ${salaryEnabled ? 'text-teal-400' : 'text-zinc-500'}`}>
                            {salaryEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5 mb-1.5">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Planned Budgets</span>
                        <span className="text-white font-bold text-[11px]">${totalBudgets.toLocaleString()}</span>
                    </div>
                    {hasEmergencyFund && (
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-1.5 mb-1.5">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase">Savings Plan</span>
                            <span className="text-white font-bold text-[11px]">${emergencyMonthly.toLocaleString()}/mo</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">Daily Limit</span>
                        <span className="text-teal-400 font-black text-xs">${Math.round(actualDailyLeft).toLocaleString()}</span>
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps[step];
    const isFirstStep = step === 0;
    const isLastStep = step === steps.length - 1;

    const canContinue = () => {
        if (step === 1 && pin) return pin.length >= 4 && pin === confirmPin;
        if (step === 2) return salary > 0;
        return true;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-sm relative z-10 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="w-full flex flex-col items-center"
                    >
                        <div className="mb-2 p-4 bg-zinc-900 rounded-[1.5rem] shadow-2xl border border-zinc-800/50 scale-75 origin-center">
                            {currentStep.icon}
                        </div>
                        <h2 className="text-lg font-black text-white mb-0.5 leading-tight">{currentStep.title}</h2>
                        <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed max-w-[280px]">
                            {currentStep.description}
                        </p>

                        <div className="w-full min-h-[280px] max-h-[360px] flex items-center justify-center overflow-y-auto overflow-x-hidden scrollbar-hide py-1">
                            {currentStep.content}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex space-x-1.5 my-4">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-6 bg-teal-400' : 'w-1.5 bg-zinc-800'}`}
                        />
                    ))}
                </div>

                <div className="w-full flex space-x-3 max-w-xs">
                    {!isFirstStep && (
                        <button
                            onClick={prevStep}
                            className="bg-zinc-900 text-white p-3.5 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all shadow-lg shrink-0"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}

                    <button
                        onClick={isLastStep ? handleFinish : nextStep}
                        disabled={!canContinue()}
                        className={`flex-1 flex items-center justify-center space-x-2 p-3.5 rounded-2xl font-bold transition-all shadow-xl text-sm ${canContinue()
                            ? 'bg-teal-500 text-zinc-950 active:scale-95 shadow-teal-500/20'
                            : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                            }`}
                    >
                        <span>{isLastStep ? 'Start Journey' : 'Continue'}</span>
                        {!isLastStep && <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Internal Pie Chart icon replacement
const PieChart = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);
