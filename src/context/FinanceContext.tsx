import React, { createContext, useContext, ReactNode } from 'react';
import { FinanceState, Income, Expense, Debt, SavingsGoal, Settings, ExpenseCategory, RecurringExpense, Category } from '../types/finance';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { checkBudgetThresholds, requestNotificationPermission } from '../utils/notifications';
import { AchievementOverlay } from '../components/AchievementOverlay';
import { Achievement } from '../types/finance';

const defaultCategories: Category[] = [
    { id: '1', name: 'Food', color: '#2dd4bf' },
    { id: '2', name: 'Transport', color: '#818cf8' },
    { id: '3', name: 'Bills', color: '#f87171' },
    { id: '4', name: 'Lifestyle', color: '#fbbf24' },
    { id: '5', name: 'Other', color: '#a78bfa' },
];

const defaultSettings: Settings = {
    monthly_budget_per_category: {
        Food: 500,
        Transport: 200,
        Bills: 1000,
        Lifestyle: 300,
        Other: 200,
    },
    dark_mode_enabled: true,
    recurring_salary_amount: 0,
    recurring_salary_day: 1,
    recurring_salary_enabled: false,
    daily_budget_mode: 'recommended',
    custom_daily_budget: 0,
    notifications_enabled: true,
    has_completed_onboarding: false,
};

const defaultState: FinanceState = {
    income: [],
    expenses: [],
    debts: [],
    savingsGoals: [],
    recurringExpenses: [],
    categories: defaultCategories,
    settings: defaultSettings,
    gamification: {
        current_streak: 0,
        longest_streak: 0,
        total_savings_milestones_reached: 0,
        achievements: [
            { id: 'first_expense', title: 'First Step', description: 'Log your first expense', icon: '🎯' },
            { id: 'budget_master', title: 'Budget Master', description: 'Stay under budget for 7 days', icon: '👑' },
            { id: 'super_saver', title: 'Super Saver', description: 'Reach your first savings goal', icon: '💰' }
        ]
    }
};

interface FinanceContextType extends FinanceState {
    addIncome: (income: Omit<Income, 'id'>) => void;
    updateIncome: (income: Income) => void;
    deleteIncome: (id: string) => void;
    addExpense: (expense: Omit<Expense, 'id'>) => void;
    updateExpense: (expense: Expense) => void;
    deleteExpense: (id: string) => void;
    updateDebt: (debt: Debt) => void;
    updateDebtPayment: (debtId: string, amountPaid: number) => void;
    markDebtSettled: (debtId: string) => void;
    addDebt: (debt: Omit<Debt, 'id'>) => void;
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
    updateSavingsGoal: (goalId: string, amountAdded: number) => void;
    markSavingsGoalCompleted: (goalId: string) => void;
    deleteSavingsGoal: (goalId: string) => void;
    addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
    deleteRecurringExpense: (id: string) => void;
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
    toggleNotifications: (enabled: boolean) => Promise<boolean>;
    unlockAchievement: (id: string) => void;
    importState: (data: any, mode: 'merge' | 'replace') => boolean;
    updateSettings: (settings: Settings) => void;
    completeOnboarding: (data: {
        salaryAmount: number;
        salaryDay: number;
        extraIncomes: { amount: number; description: string }[];
        budgets: Record<ExpenseCategory, number>;
        emergencyFundTarget: number;
        emergencyFundMonthly: number;
        salaryEnabled: boolean;
        initialBalance?: number | null;
        pin?: string;
    }) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [rawFinanceData, setFinanceData] = useLocalStorage<any>('finance_data', defaultState);

    // Initial migration and safety checks
    const financeData: FinanceState = React.useMemo(() => {
        const data = { ...defaultState, ...rawFinanceData };

        // Ensure arrays exist
        data.income = data.income || [];
        data.expenses = data.expenses || [];
        data.debts = data.debts || [];
        data.savingsGoals = data.savingsGoals || [];
        data.recurringExpenses = data.recurringExpenses || [];
        data.categories = data.categories || defaultCategories;
        data.gamification = data.gamification || defaultState.gamification;

        // Migrate old 'savings' object to 'savingsGoals' array if it exists and array is empty
        if (rawFinanceData?.savings && data.savingsGoals.length === 0) {
            data.savingsGoals = [{
                id: rawFinanceData.savings.id || crypto.randomUUID(),
                name: 'Emergency Fund',
                saved_amount: rawFinanceData.savings.amount_saved || 0,
                target_amount: rawFinanceData.savings.goal_amount || 0,
                is_completed: (rawFinanceData.savings.amount_saved || 0) >= (rawFinanceData.savings.goal_amount || 0)
            }];
            // Note: We don't delete rawFinanceData.savings here to avoid triggering state updates during render
            // It will naturally be replaced on the next setFinanceData call
        }

        return data;
    }, [rawFinanceData]);

    // Check for recurring incomes (Salary) based on settings
    React.useEffect(() => {
        const salaryAmount = financeData.settings.recurring_salary_amount || 0;
        const salaryDay = financeData.settings.recurring_salary_day || 1;
        const salaryEnabled = financeData.settings.recurring_salary_enabled || false;

        if (salaryAmount <= 0 || !salaryEnabled) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        // Only process if today is on or after the salary day
        if (currentDay < salaryDay) return;

        // Check if salary for this month already exists
        const alreadyExists = financeData.income.some(i => {
            const iDate = new Date(i.date);
            return i.type === 'Salary' &&
                iDate.getMonth() === currentMonth &&
                iDate.getFullYear() === currentYear &&
                !i.is_recurring; // Match against generated records, not templates
        });

        if (!alreadyExists) {
            const newIncome: Income = {
                id: crypto.randomUUID(),
                type: 'Salary',
                amount: salaryAmount,
                description: 'Monthly Salary (Auto)',
                date: new Date(currentYear, currentMonth, salaryDay).toISOString(),
                is_recurring: false
            };

            setFinanceData((prev: FinanceState) => ({
                ...prev,
                income: [...prev.income, newIncome]
            }));
        }
    }, [financeData.income, financeData.settings, setFinanceData]);

    // Check for recurring expenses (Bills)
    React.useEffect(() => {
        if (financeData.recurringExpenses.length === 0) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        const newGeneratedExpenses: Expense[] = [];

        financeData.recurringExpenses.forEach(re => {
            if (currentDay < re.day_of_month) return;

            // Check if this recurring expense was already added this month
            const alreadyExists = financeData.expenses.some(e => {
                const eDate = new Date(e.date);
                return e.description?.includes(re.name) &&
                    e.description?.includes('(Auto)') &&
                    eDate.getMonth() === currentMonth &&
                    eDate.getFullYear() === currentYear;
            });

            if (!alreadyExists) {
                newGeneratedExpenses.push({
                    id: crypto.randomUUID(),
                    name: re.name,
                    category: re.category,
                    amount: re.amount,
                    description: `${re.name} (Auto)`,
                    date: new Date(currentYear, currentMonth, re.day_of_month).toISOString(),
                    tags: re.tags || []
                });
            }
        });

        if (newGeneratedExpenses.length > 0) {
            setFinanceData((prev: FinanceState) => ({
                ...prev,
                expenses: [...(prev.expenses || []), ...newGeneratedExpenses]
            }));
        }
    }, [financeData.recurringExpenses, financeData.expenses, setFinanceData]);

    // Ensure LocalStorage stays in sync with expected structure (Persistence Migration)
    React.useEffect(() => {
        const needsSync = !rawFinanceData?.income ||
            !rawFinanceData?.expenses ||
            !rawFinanceData?.debts ||
            !rawFinanceData?.savingsGoals ||
            !rawFinanceData?.recurringExpenses ||
            !rawFinanceData?.categories ||
            !rawFinanceData?.settings;

        if (needsSync) {
            setFinanceData(financeData);
        }
    }, [rawFinanceData, financeData, setFinanceData]);

    const addIncome = (newIncome: Omit<Income, 'id'>) => {
        const income: Income = { ...newIncome, id: crypto.randomUUID() };
        setFinanceData((prev: FinanceState) => ({ ...prev, income: [...(prev.income || []), income] }));
    };

    const updateIncome = (updatedIncome: Income) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            income: (prev.income || []).map(i => i.id === updatedIncome.id ? updatedIncome : i)
        }));
    };

    const deleteIncome = (id: string) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            income: (prev.income || []).filter(i => i.id !== id)
        }));
    };

    const addExpense = (newExpense: Omit<Expense, 'id'>) => {
        const expense: Expense = { ...newExpense, id: crypto.randomUUID() };

        // Notifications Logic
        if (financeData.settings.notifications_enabled) {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            // Calculate previous spent for this category this month
            const categorySpentBefore = (financeData.expenses || [])
                .filter(e => {
                    const d = new Date(e.date);
                    return e.category === expense.category &&
                        d.getMonth() === currentMonth &&
                        d.getFullYear() === currentYear;
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            const limit = financeData.settings.monthly_budget_per_category[expense.category] || 0;

            checkBudgetThresholds(
                expense.category,
                categorySpentBefore,
                expense.amount,
                limit
            );
        }

        // Achievement: First Expense
        if (financeData.expenses.length === 0) {
            unlockAchievement('first_expense');
        }

        setFinanceData((prev: FinanceState) => {
            const today = new Date().toISOString().split('T')[0];
            const lastDate = prev.gamification?.last_logged_date;
            let newStreak = prev.gamification?.current_streak || 0;

            if (lastDate) {
                const last = new Date(lastDate);
                const d = new Date();
                const diffTime = Math.abs(d.getTime() - last.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    newStreak += 1;
                } else if (diffDays > 1) {
                    newStreak = 1;
                }
            } else {
                newStreak = 1;
            }

            const longest = Math.max(newStreak, prev.gamification?.longest_streak || 0);

            return {
                ...prev,
                expenses: [expense, ...(prev.expenses || [])],
                gamification: {
                    ...prev.gamification,
                    current_streak: newStreak,
                    longest_streak: longest,
                    last_logged_date: today
                }
            };
        });
    };

    const updateExpense = (updatedExpense: Expense) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            expenses: (prev.expenses || []).map(e => e.id === updatedExpense.id ? updatedExpense : e)
        }));
    };

    const deleteExpense = (id: string) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            expenses: (prev.expenses || []).filter(e => e.id !== id)
        }));
    };

    const updateDebt = (updatedDebt: Debt) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            debts: (prev.debts || []).map(d => d.id === updatedDebt.id ? updatedDebt : d)
        }));
    };

    const updateDebtPayment = (debtId: string, amountPaid: number) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            debts: (prev.debts || []).map(d => {
                if (d.id === debtId) {
                    const newPaid = Math.min(d.total_amount, d.paid_amount + amountPaid);
                    return { ...d, paid_amount: newPaid, remaining_amount: d.total_amount - newPaid };
                }
                return d;
            })
        }));
    };

    const markDebtSettled = (debtId: string) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            debts: (prev.debts || []).map(d => d.id === debtId ? { ...d, paid_amount: d.total_amount, remaining_amount: 0 } : d)
        }));
    };

    const addDebt = (newDebt: Omit<Debt, 'id'>) => {
        const debt: Debt = { ...newDebt, id: crypto.randomUUID() };
        setFinanceData((prev: FinanceState) => ({ ...prev, debts: [...(prev.debts || []), debt] }));
    };

    const addSavingsGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
        const goal: SavingsGoal = { ...newGoal, id: crypto.randomUUID() };
        setFinanceData((prev: FinanceState) => ({ ...prev, savingsGoals: [...(prev.savingsGoals || []), goal] }));
    };

    const updateSavingsGoal = (goalId: string, amountAdded: number) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            savingsGoals: (prev.savingsGoals || []).map(g => {
                if (g.id === goalId) {
                    const newSaved = g.saved_amount + amountAdded;
                    return { ...g, saved_amount: newSaved, is_completed: newSaved >= g.target_amount };
                }
                return g;
            })
        }));
    };

    const markSavingsGoalCompleted = (goalId: string) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            savingsGoals: (prev.savingsGoals || []).map(g => g.id === goalId ? { ...g, is_completed: true, saved_amount: g.target_amount } : g)
        }));
        unlockAchievement('super_saver');
    };

    const deleteSavingsGoal = (goalId: string) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            savingsGoals: (prev.savingsGoals || []).filter(g => g.id !== goalId)
        }));
    };

    const addRecurringExpense = (newExpense: Omit<RecurringExpense, 'id'>) => {
        const expense: RecurringExpense = { ...newExpense, id: crypto.randomUUID() };
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            recurringExpenses: [...(prev.recurringExpenses || []), expense]
        }));
    };

    const deleteRecurringExpense = (id: string) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            recurringExpenses: (prev.recurringExpenses || []).filter(re => re.id !== id)
        }));
    };

    const addCategory = (newCat: Omit<Category, 'id'>) => {
        const category: Category = { ...newCat, id: crypto.randomUUID() };
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            categories: [...(prev.categories || []), category]
        }));
    };

    const updateCategory = (updatedCat: Category) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            categories: (prev.categories || []).map(c => c.id === updatedCat.id ? updatedCat : c)
        }));
    };

    const deleteCategory = (id: string) => {
        setFinanceData((prev: FinanceState) => ({
            ...prev,
            categories: (prev.categories || []).filter(c => c.id !== id)
        }));
    };

    const [activeAchievement, setActiveAchievement] = React.useState<Achievement | null>(null);

    const unlockAchievement = (id: string) => {
        setFinanceData((prev: FinanceState) => {
            const achievement = prev.gamification.achievements.find(a => a.id === id);
            if (achievement && !achievement.unlocked_at) {
                const updatedAchievements = prev.gamification.achievements.map(a =>
                    a.id === id ? { ...a, unlocked_at: new Date().toISOString() } : a
                );

                // Trigger overlay
                setActiveAchievement(achievement);

                return {
                    ...prev,
                    gamification: {
                        ...prev.gamification,
                        achievements: updatedAchievements
                    }
                };
            }
            return prev;
        });
    };

    const toggleNotifications = async (enabled: boolean) => {
        if (enabled) {
            const granted = await requestNotificationPermission();
            if (!granted) return false;
        }

        setFinanceData((prev: FinanceState) => ({
            ...prev,
            settings: { ...prev.settings, notifications_enabled: enabled }
        }));
        return true;
    };

    const updateSettings = (settings: Settings) => {
        setFinanceData((prev: FinanceState) => ({ ...prev, settings }));
    };

    const completeOnboarding = (data: {
        salaryAmount: number;
        salaryDay: number;
        extraIncomes: { amount: number; description: string }[];
        budgets: Record<ExpenseCategory, number>;
        emergencyFundTarget: number;
        emergencyFundMonthly: number;
        salaryEnabled: boolean;
        initialBalance?: number | null;
        pin?: string;
    }) => {
        setFinanceData((prev: FinanceState) => {
            const newState = { ...prev };

            newState.settings = {
                ...prev.settings,
                monthly_budget_per_category: data.budgets,
                recurring_salary_amount: data.salaryAmount,
                recurring_salary_day: data.salaryDay,
                recurring_salary_enabled: data.salaryEnabled,
                has_completed_onboarding: true,
                security_pin: data.pin,
            };

            const initialIncomeRecords: Income[] = [];

            // 1. Initial Monthly Salary
            const initialIncomeAmount = data.initialBalance !== undefined && data.initialBalance !== null
                ? data.initialBalance
                : data.salaryAmount;

            if (initialIncomeAmount > 0) {
                initialIncomeRecords.push({
                    id: crypto.randomUUID(),
                    type: 'Salary',
                    amount: initialIncomeAmount,
                    description: data.initialBalance !== undefined && data.initialBalance !== null ? 'Initial Balance' : 'First Salary',
                    date: new Date().toISOString()
                });
            }

            // 2. Extra Incomes
            data.extraIncomes.forEach(extra => {
                if (extra.amount > 0) {
                    initialIncomeRecords.push({
                        id: crypto.randomUUID(),
                        type: 'Extra',
                        amount: extra.amount,
                        description: extra.description || 'Other Income',
                        date: new Date().toISOString()
                    });
                }
            });

            newState.income = [...(prev.income || []), ...initialIncomeRecords];

            // 3. Emergency Fund Goal
            if (data.emergencyFundTarget > 0) {
                const goal: SavingsGoal = {
                    id: crypto.randomUUID(),
                    name: 'Emergency Fund',
                    target_amount: data.emergencyFundTarget,
                    saved_amount: 0,
                    is_completed: false,
                    description: 'Initial fund created during onboarding'
                };
                newState.savingsGoals = [...(prev.savingsGoals || []), goal];

                // 4. Monthly Contribution (as Recurring Expense)
                if (data.emergencyFundMonthly > 0) {
                    const contribution: RecurringExpense = {
                        id: crypto.randomUUID(),
                        name: 'Savings: Emergency Fund',
                        amount: data.emergencyFundMonthly,
                        category: 'Other',
                        day_of_month: data.salaryDay,
                        description: 'Monthly contribution to emergency fund'
                    };
                    newState.recurringExpenses = [...(prev.recurringExpenses || []), contribution];
                }
            }

            return newState;
        });
    };

    const importState = (data: any, mode: 'merge' | 'replace'): boolean => {
        try {
            // Basic validation
            if (!data || typeof data !== 'object') return false;

            if (mode === 'replace') {
                setFinanceData(data);
                return true;
            }

            // Merge logic
            setFinanceData((prev: FinanceState) => {
                const merged: FinanceState = { ...prev };

                // Helper to merge arrays and avoid ID collisions
                const mergeArray = (prevArr: any[], importArr: any[]) => {
                    if (!importArr || !Array.isArray(importArr)) return prevArr;
                    const result = [...prevArr];
                    importArr.forEach(item => {
                        // If ID exists in current state, generate a new one for the import
                        const newItem = { ...item };
                        if (result.some(existing => existing.id === newItem.id)) {
                            newItem.id = crypto.randomUUID();
                        }
                        result.push(newItem);
                    });
                    return result;
                };

                merged.income = mergeArray(prev.income, data.income);
                merged.expenses = mergeArray(prev.expenses, data.expenses);
                merged.debts = mergeArray(prev.debts, data.debts);
                merged.savingsGoals = mergeArray(prev.savingsGoals, data.savingsGoals);

                // Settings - keep current or overwrite? Let's take imported if provided
                if (data.settings) {
                    merged.settings = { ...prev.settings, ...data.settings };
                }

                return merged;
            });
            return true;
        } catch (err) {
            console.error('Import failed:', err);
            return false;
        }
    };

    return (
        <FinanceContext.Provider
            value={{
                ...financeData,
                addIncome,
                updateIncome,
                deleteIncome,
                addExpense,
                updateExpense,
                deleteExpense,
                updateDebt,
                updateDebtPayment,
                markDebtSettled,
                addDebt,
                addSavingsGoal,
                updateSavingsGoal,
                markSavingsGoalCompleted,
                deleteSavingsGoal,
                addRecurringExpense,
                deleteRecurringExpense,
                addCategory,
                updateCategory,
                deleteCategory,
                toggleNotifications,
                unlockAchievement,
                importState,
                updateSettings,
                completeOnboarding,
            }}
        >
            {children}
            <AchievementOverlay
                achievement={activeAchievement}
                onClose={() => setActiveAchievement(null)}
            />
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }
    return context;
};
