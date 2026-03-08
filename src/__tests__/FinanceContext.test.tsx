import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FinanceProvider, useFinance } from '../context/FinanceContext';
import LZString from 'lz-string';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FinanceProvider>{children}</FinanceProvider>
);

describe('FinanceContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('initializes with default state', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });
        expect(result.current.income).toEqual([]);
        expect(result.current.expenses).toEqual([]);
        expect(result.current.settings.dark_mode_enabled).toBe(true);
    });

    test('addIncome updates state and persists to LocalStorage (debounced & compressed)', async () => {
        const { result } = renderHook(() => useFinance(), { wrapper });

        act(() => {
            result.current.addIncome({
                type: 'Salary',
                amount: 5000,
                description: 'Test Salary',
                date: new Date().toISOString(),
                is_recurring: false
            });
        });

        expect(result.current.income).toHaveLength(1);
        expect(result.current.income[0].amount).toBe(5000);

        // Test debounced persistence
        expect(window.localStorage.getItem('finance_data')).toBeNull();

        act(() => {
            jest.advanceTimersByTime(250);
        });

        const persisted = window.localStorage.getItem('finance_data');
        expect(persisted).not.toBeNull();

        const decompressed = LZString.decompressFromUTF16(persisted!);
        const parsed = JSON.parse(decompressed!);
        expect(parsed.income[0].amount).toBe(5000);
    });

    test('debounced writes: multiple updates within 200ms only trigger one storage write', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });
        const setItemSpy = jest.spyOn(window.localStorage, 'setItem');

        act(() => {
            result.current.addIncome({ type: 'Salary', amount: 1000, description: '1', date: new Date().toISOString() });
            jest.advanceTimersByTime(100);
            result.current.addIncome({ type: 'Extra', amount: 500, description: '2', date: new Date().toISOString() });
        });

        expect(setItemSpy).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(250);
        });

        expect(setItemSpy).toHaveBeenCalledTimes(1);
        setItemSpy.mockRestore();
    });

    test('deleteExpense updates state correctly', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });

        act(() => {
            result.current.addExpense({
                name: 'Test Expense',
                category: 'Food',
                amount: 50,
                description: 'Yummy food',
                date: new Date().toISOString()
            });
        });

        const expenseId = result.current.expenses[0].id;
        expect(result.current.expenses).toHaveLength(1);

        act(() => {
            result.current.deleteExpense(expenseId);
        });

        expect(result.current.expenses).toHaveLength(0);
    });

    test('salary automation auto-generates income on payday', () => {
        const today = new Date();
        const initialData = {
            settings: {
                recurring_salary_amount: 3000,
                recurring_salary_day: today.getDate(),
                recurring_salary_enabled: true,
                has_completed_onboarding: true
            },
            income: []
        };
        window.localStorage.setItem('finance_data', LZString.compressToUTF16(JSON.stringify(initialData)));

        const { result } = renderHook(() => useFinance(), { wrapper });

        expect(result.current.income).toHaveLength(1);
        expect(result.current.income[0].type).toBe('Salary');
        expect(result.current.income[0].amount).toBe(3000);
    });

    test('completeOnboarding correctly sets up initial state', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });

        act(() => {
            result.current.completeOnboarding({
                salaryAmount: 4000,
                salaryDay: 15,
                extraIncomes: [],
                budgets: { Food: 400, Transport: 100, Bills: 1000, Lifestyle: 200, Other: 100 },
                emergencyFundTarget: 10000,
                emergencyFundMonthly: 500,
                salaryEnabled: true,
                initialBalance: 1000
            });
        });

        expect(result.current.settings.has_completed_onboarding).toBe(true);
        expect(result.current.settings.recurring_salary_amount).toBe(4000);
        expect(result.current.income).toHaveLength(1);
        expect(result.current.income[0].amount).toBe(1000);
    });
});
