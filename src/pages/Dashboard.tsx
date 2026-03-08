import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ExpenseCategory } from '../types/finance';
import { TrendingUp, Wallet, Zap, ShieldAlert, Settings as SettingsIcon, ArrowUpCircle, PiggyBank, AlertTriangle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';

export const Dashboard: React.FC = () => {
    const { income, expenses, settings, savingsGoals, debts, recurringExpenses } = useFinance();

    // Basic calculations
    const totalIncome = (income || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalExpenses = (expenses || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const totalDebt = (debts || []).reduce((acc: number, curr: any) => acc + curr.remaining_amount, 0);
    const totalSavings = (savingsGoals || []).reduce((acc: number, curr: any) => acc + curr.saved_amount, 0);
    const remainingBudget = totalIncome - totalExpenses;

    const totalBudget = Object.values(settings?.monthly_budget_per_category || {}).reduce((acc: number, curr: number) => acc + curr, 0);
    const budgetRemaining = totalBudget - totalExpenses;

    // Money Left Today Logic
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate() + 1;

    // Daily Allowance Logic
    const totalPlanned = Object.values(settings?.monthly_budget_per_category || {}).reduce((acc: number, curr: number) => acc + curr, 0);
    const totalRecurring = (recurringExpenses || []).reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const recommendedAllowance = Math.max(0, (totalIncome - totalPlanned - totalRecurring) / daysLeft);

    const dailyAllowance = settings?.daily_budget_mode === 'custom'
        ? (settings.custom_daily_budget || 0)
        : recommendedAllowance;

    // Spent Today
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const spentToday = expenses
        .filter(e => new Date(e.date) >= startOfToday)
        .reduce((acc, curr) => acc + curr.amount, 0);

    const isOverspentToday = spentToday > dailyAllowance && dailyAllowance > 0;
    const moneyLeftToday = Math.max(0, dailyAllowance - spentToday);

    // Budget remaining per category
    const categoryExpenses = expenses.reduce((acc: Record<string, number>, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const categories: ExpenseCategory[] = ['Food', 'Transport', 'Bills', 'Lifestyle', 'Other'];
    const CHART_COLORS = ['#2dd4bf', '#818cf8', '#f87171', '#fbbf24', '#a78bfa'];

    const chartData = categories.map((cat, index) => ({
        name: cat,
        value: categoryExpenses[cat] || 0,
        color: CHART_COLORS[index]
    })).filter(d => d.value > 0);

    // If no expenses, show empty state for chart
    const hasExpenses = chartData.length > 0;
    const placeholderData = [{ name: 'Empty', value: 1, color: '#3f3f46' }];

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-zinc-500 text-xs">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <Link to="/settings" className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                    <SettingsIcon size={20} />
                </Link>
            </header>

            {/* Money Left Today - HERO CARD */}
            <div className={`relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500 ${isOverspentToday
                ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'
                : moneyLeftToday < (dailyAllowance * 0.2)
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
                    : 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-500/20'
                }`}>
                <div className="relative z-10">
                    <p className="text-white/80 text-sm font-medium mb-1">
                        {isOverspentToday ? 'Limit Exceeded' : 'Money left today'}
                    </p>
                    <h2 className="text-4xl font-black text-white">
                        {isOverspentToday ? `-$${(spentToday - dailyAllowance).toFixed(2)}` : `$${moneyLeftToday.toFixed(2)}`}
                    </h2>
                    <div className="mt-4 flex items-center justify-between text-white/70 text-xs">
                        <div className="flex items-center space-x-2">
                            <Zap size={14} />
                            <span>Daily limit: ${dailyAllowance.toFixed(2)}</span>
                        </div>
                        <span className="font-bold bg-white/20 px-2 py-1 rounded-lg">
                            {((spentToday / (dailyAllowance || 1)) * 100).toFixed(0)}% used
                        </span>
                    </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Overspent Today Warning */}
            {isOverspentToday && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-center space-x-4 animate-in slide-in-from-left duration-500">
                    <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-500/20">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-red-400 font-bold">Overspent Today!</h3>
                        <p className="text-red-400/70 text-xs">You've exceeded your daily limit by ${(spentToday - dailyAllowance).toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Overview Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/income" className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 hover:border-teal-500/30 transition-all">
                    <div className="flex items-center space-x-2 mb-2">
                        <ArrowUpCircle className="text-emerald-400" size={16} />
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Income</span>
                    </div>
                    <p className="text-xl font-bold text-white">${totalIncome.toLocaleString()}</p>
                </Link>
                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="text-teal-400" size={16} />
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Budget Left</span>
                    </div>
                    <p className="text-xl font-bold text-white">${budgetRemaining.toLocaleString()}</p>
                </div>
                <div className="col-span-2 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-400/10 p-2 rounded-xl text-red-400">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Total Debt</span>
                            <p className="text-xl font-bold text-white">${totalDebt.toFixed(0)}</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-2 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-teal-400/10 p-2 rounded-xl text-teal-400">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Total Savings</span>
                            <p className="text-xl font-bold text-white">${totalSavings.toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spending Chart */}
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 relative">
                <h3 className="text-white font-bold mb-4">Monthly Spending</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={hasExpenses ? chartData : placeholderData}
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {(hasExpenses ? chartData : placeholderData).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    {!hasExpenses && (
                        <div className="absolute inset-x-0 bottom-1/2 translate-y-1/2 text-center">
                            <p className="text-zinc-600 text-xs">No expenses</p>
                        </div>
                    )}
                </div>

                {/* Chart Legend */}
                {hasExpenses && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {chartData.map((item) => (
                            <div key={item.name} className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-xs text-zinc-400">{item.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Budgets */}
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-5">
                <h3 className="text-white font-bold">Category Limits</h3>
                <div className="space-y-4">
                    {categories.map((cat) => {
                        const spent = categoryExpenses[cat] || 0;
                        const limit = settings.monthly_budget_per_category[cat] || 0;
                        const progress = Math.min((spent / (limit || 1)) * 100, 100);
                        const isOver = progress >= 100;

                        return (
                            <div key={cat} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-zinc-300 font-medium">{cat}</span>
                                        {progress >= 100 ? (
                                            <AlertCircle size={14} className="text-red-500" />
                                        ) : progress >= 80 ? (
                                            <AlertTriangle size={14} className="text-amber-500" />
                                        ) : null}
                                    </div>
                                    <span className={isOver ? 'text-red-400 font-bold' : progress >= 80 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                                        ${spent.toFixed(0)} / ${limit}
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : progress > 80 ? 'bg-amber-500' : 'bg-teal-500'
                                            }`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pb-24"></div>
        </div>
    );
};
