import React, { useMemo, Suspense, lazy } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ExpenseCategory, Income, Expense, Debt, SavingsGoal, Category, RecurringExpense } from '../types/finance';
import { TrendingUp, Wallet, Zap, ShieldAlert, Settings as SettingsIcon, ArrowUpCircle, PiggyBank, AlertTriangle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';

// Lazy load Recharts for bundle optimization
const ResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
const PieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
const Pie = lazy(() => import('recharts').then(mod => ({ default: mod.Pie })));
const Cell = lazy(() => import('recharts').then(mod => ({ default: mod.Cell })));

const ChartPlaceholder = () => (
    <div className="w-full h-full flex items-center justify-center bg-zinc-950/20 rounded-full animate-pulse">
        <div className="w-12 h-12 border-2 border-zinc-800 border-t-zinc-700 rounded-full animate-spin"></div>
    </div>
);

export const Dashboard: React.FC = () => {
    const {
        income,
        expenses,
        debts,
        savingsGoals,
        settings,
        recurringExpenses,
        categories: contextCategories,
        gamification
    } = useFinance();

    // Memoize all heavy financial calculations
    const stats = useMemo(() => {
        const totalIncome = (income || []).reduce((acc: number, curr: Income) => acc + curr.amount, 0);
        const totalExpenses = (expenses || []).reduce((acc: number, curr: Expense) => acc + curr.amount, 0);
        const totalDebt = (debts || []).reduce((acc: number, curr: Debt) => acc + curr.remaining_amount, 0);
        const totalSavings = (savingsGoals || []).reduce((acc: number, curr: SavingsGoal) => acc + curr.saved_amount, 0);
        const totalPlanned = savingsGoals.reduce((acc: number, curr: SavingsGoal) => acc + (curr.target_amount - curr.saved_amount), 0);

        const totalBudget = Object.values(settings.monthly_budget_per_category).reduce((acc: number, curr: number) => acc + curr, 0);
        const budgetRemaining = totalBudget - totalExpenses;

        return { totalIncome, totalExpenses, totalDebt, totalSavings, totalBudget, budgetRemaining, totalPlanned };
    }, [income, expenses, debts, savingsGoals, settings]);

    // Daily Allowance & Today's Spending logic
    const dailyStats = useMemo(() => {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysLeft = daysInMonth - today.getDate() + 1;

        const totalPlanned = Object.values(settings?.monthly_budget_per_category || {}).reduce((acc: number, curr: number) => acc + curr, 0);
        const totalRecurring = (recurringExpenses || []).reduce((acc: number, curr: RecurringExpense) => acc + curr.amount, 0);
        const recommendedAllowance = Math.max(0, (stats.totalIncome - totalPlanned - totalRecurring) / daysLeft);

        const dailyAllowance = settings?.daily_budget_mode === 'custom'
            ? (settings.custom_daily_budget || 0)
            : recommendedAllowance;

        // Spent Today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const spentToday = expenses
            .filter((e: Expense) => new Date(e.date).toDateString() === today.toDateString())
            .reduce((acc: number, curr: Expense) => acc + curr.amount, 0);

        const isOverspentToday = spentToday > dailyAllowance && dailyAllowance > 0;
        const moneyLeftToday = Math.max(0, dailyAllowance - spentToday);

        return { dailyAllowance, spentToday, isOverspentToday, moneyLeftToday, daysLeft };
    }, [settings, recurringExpenses, stats.totalIncome, expenses]);

    // Chart and Category data
    const categoryData = useMemo(() => {
        const categoryExpenses = expenses.reduce((acc: Record<string, number>, curr: Expense) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

        const chartData = contextCategories.map((cat: Category) => ({
            name: cat.name,
            value: categoryExpenses[cat.name] || 0,
            color: cat.color
        })).filter((d: { value: number }) => d.value > 0);

        return { categoryExpenses, chartData, categories: contextCategories };
    }, [expenses, contextCategories]);

    const hasExpenses = categoryData.chartData.length > 0;
    const placeholderData = [{ name: 'Empty', value: 1, color: '#3f3f46' }];

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-700">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-zinc-500 text-xs">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2 items-center space-x-2 shadow-lg shadow-black/20">
                        <span className="text-orange-500 text-lg">🔥</span>
                        <div className="flex flex-col -space-y-1">
                            <span className="text-white font-black text-sm">{gamification.current_streak}</span>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Streak</span>
                        </div>
                    </div>
                    <Link to="/settings" className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-all shadow-lg shadow-black/20 active:scale-95">
                        <SettingsIcon size={20} />
                    </Link>
                </div>
            </header>

            {/* Money Left Today - HERO CARD */}
            <div className={`relative overflow-hidden p-6 rounded-3xl shadow-xl transition-all duration-500 ${dailyStats.isOverspentToday
                ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'
                : dailyStats.moneyLeftToday < (dailyStats.dailyAllowance * 0.2)
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
                    : 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-500/20'
                }`}>
                <div className="relative z-10">
                    <p className="text-white/80 text-sm font-medium mb-1">
                        {dailyStats.isOverspentToday ? 'Limit Exceeded' : 'Money left today'}
                    </p>
                    <h2 className="text-4xl font-black text-white">
                        {dailyStats.isOverspentToday ? `-$${(dailyStats.spentToday - dailyStats.dailyAllowance).toFixed(2)}` : `$${dailyStats.moneyLeftToday.toFixed(2)}`}
                    </h2>
                    <div className="mt-4 flex items-center justify-between text-white/70 text-xs">
                        <div className="flex items-center space-x-2">
                            < Zap size={14} />
                            <span>Daily limit: ${dailyStats.dailyAllowance.toFixed(2)}</span>
                        </div>
                        <span className="font-bold bg-white/20 px-2 py-1 rounded-lg">
                            {((dailyStats.spentToday / (dailyStats.dailyAllowance || 1)) * 100).toFixed(0)}% used
                        </span>
                    </div>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Overspent Today Warning */}
            {dailyStats.isOverspentToday && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-3xl flex items-center space-x-4 animate-in slide-in-from-left duration-500">
                    <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-500/20">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h3 className="text-red-400 font-bold">Overspent Today!</h3>
                        <p className="text-red-400/70 text-xs">You've exceeded your daily limit by ${(dailyStats.spentToday - dailyStats.dailyAllowance).toFixed(2)}</p>
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
                    <p className="text-xl font-bold text-white">${stats.totalIncome.toLocaleString()}</p>
                </Link>
                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="text-teal-400" size={16} />
                        <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Budget Left</span>
                    </div>
                    <p className="text-xl font-bold text-white">${stats.budgetRemaining.toLocaleString()}</p>
                </div>
                <div className="col-span-2 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-red-400/10 p-2 rounded-xl text-red-400">
                            <ShieldAlert size={20} />
                        </div>
                        <div>
                            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Total Debt</span>
                            <p className="text-xl font-bold text-white">${stats.totalDebt.toFixed(0)}</p>
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
                            <p className="text-xl font-bold text-white">${stats.totalSavings.toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spending Chart */}
            <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 relative">
                <h3 className="text-white font-bold mb-4">Monthly Spending</h3>
                <div className="h-48 w-full">
                    <Suspense fallback={<ChartPlaceholder />}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={hasExpenses ? categoryData.chartData : placeholderData}
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(hasExpenses ? categoryData.chartData : placeholderData).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </Suspense>
                    {!hasExpenses && (
                        <div className="absolute inset-x-0 bottom-1/2 translate-y-1/2 text-center">
                            <p className="text-zinc-600 text-xs">No expenses</p>
                        </div>
                    )}
                </div>

                {/* Chart Legend */}
                {hasExpenses && (
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {categoryData.chartData.map((item) => (
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
                <div className="space-y-6">
                    {categoryData.categories.map((cat) => {
                        const spent = categoryData.categoryExpenses[cat.name] || 0;
                        const limit = settings.monthly_budget_per_category[cat.name] || 0;
                        const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;

                        return (
                            <div key={cat.id} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white font-bold text-sm">{cat.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                            ${spent.toFixed(0)} of ${limit.toFixed(0)}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${percentage >= 100 ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-400'
                                        }`}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-800/50">
                                    <div
                                        className="h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: cat.color
                                        }}
                                    />
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
