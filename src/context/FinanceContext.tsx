import React, { createContext, useContext, ReactNode } from 'react';
import { FinanceState, Income, Expense, Debt, SavingsGoal, Settings, ExpenseCategory, RecurringExpense } from '../types/finance';
import { useLocalStorage } from '../hooks/useLocalStorage';

const defaultSettings: Settings = {
    monthly_budget_per_category: {
        Food: 500,
        Transport: 200,
        Bills: 800,
        Lifestyle: 300,
        Other: 200,
    },
    dark_mode_enabled: true,
    recurring_salary_amount: 0,
    recurring_salary_day: 1,
    recurring_salary_enabled: false,
    daily_budget_mode: 'recommended',
    custom_daily_budget: 0,
    has_completed_onboarding: false,
};

const defaultState: FinanceState = {
    income: [],
    expenses: [],
    debts: [],
    savingsGoals: [],
    recurringExpenses: [],
    settings: defaultSettings,
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

    // Ensure LocalStorage stays in sync with expected structure (Persistence Migration)
    React.useEffect(() => {
        const needsSync = !rawFinanceData?.income ||
            !rawFinanceData?.expenses ||
            !rawFinanceData?.debts ||
            !rawFinanceData?.savingsGoals ||
            !rawFinanceData?.recurringExpenses ||
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
        setFinanceData((prev: FinanceState) => ({ ...prev, expenses: [...(prev.expenses || []), expense] }));
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
                importState,
                updateSettings,
                completeOnboarding,
            }}
        >
            {children}
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
