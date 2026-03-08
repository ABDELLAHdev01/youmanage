import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FinanceProvider, useFinance } from '../context/FinanceContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FinanceProvider>{children}</FinanceProvider>
);

describe('Management Features', () => {
    beforeEach(() => {
        window.localStorage.clear();
        jest.useFakeTimers();
    });

    test('Debt Management: adding, paying, and settling', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });

        act(() => {
            result.current.addDebt({
                person_name: 'John',
                total_amount: 10000,
                paid_amount: 0,
                remaining_amount: 10000,
                description: 'Car Loan',
                due_date: ''
            });
        });

        const id = result.current.debts[0].id;
        expect(result.current.debts[0].total_amount).toBe(10000);

        // Record a payment
        act(() => {
            result.current.updateDebtPayment(id, 2000);
        });
        expect(result.current.debts[0].paid_amount).toBe(2000);

        // Mark as settled
        act(() => {
            result.current.markDebtSettled(id);
        });
        expect(result.current.debts[0].remaining_amount).toBe(0);
    });

    test('Savings Management: adding and editing goals', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });

        act(() => {
            result.current.addSavingsGoal({
                name: 'New PC',
                target_amount: 2000,
                saved_amount: 0,
                is_completed: false
            });
        });

        const id = result.current.savingsGoals[0].id;
        expect(result.current.savingsGoals).toHaveLength(1);

        // Deposit money
        act(() => {
            result.current.updateSavingsGoal(id, 500);
        });
        expect(result.current.savingsGoals[0].saved_amount).toBe(500);
    });

    test('JSON Import/Export: schema validation and merging', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });

        const mockBackup = {
            income: [{ id: 'old-1', amount: 100, type: 'Extra', date: new Date().toISOString() }],
            expenses: [],
            debts: [],
            savingsGoals: [],
            recurringExpenses: [],
            settings: { has_completed_onboarding: true }
        };

        // Test Replace Mode
        act(() => {
            result.current.importState(mockBackup, 'replace');
        });
        expect(result.current.income).toHaveLength(1);
        expect(result.current.income[0].id).toBe('old-1');

        // Test Merge Mode
        const mergeData = { ...mockBackup, income: [{ id: 'new-1', amount: 50, type: 'Extra', date: new Date().toISOString() }] };
        act(() => {
            result.current.importState(mergeData, 'merge');
        });
        expect(result.current.income).toHaveLength(2);
    });

    test('Recurring Expenses: manual management', () => {
        const { result } = renderHook(() => useFinance(), { wrapper });

        act(() => {
            result.current.addRecurringExpense({
                name: 'Netflix',
                amount: 15,
                category: 'Lifestyle',
                day_of_month: 1,
                description: 'Streaming'
            });
        });

        expect(result.current.recurringExpenses).toHaveLength(1);
        expect(result.current.recurringExpenses[0].name).toBe('Netflix');
    });
});
