import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Dashboard } from '../pages/Dashboard';
import { useFinance } from '../context/FinanceContext';

// Mock useFinance
jest.mock('../context/FinanceContext', () => ({
    useFinance: jest.fn()
}));

// Mock Recharts specifically for this test to bypass lazy issues
jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
    Cell: () => <div data-testid="cell" />,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    Tooltip: () => <div data-testid="tooltip" />,
    __esModule: true
}));

describe('Dashboard Component', () => {
    const mockState = {
        income: [{ id: '1', amount: 5000, type: 'Salary', description: 'Monthly', date: new Date().toISOString() }],
        expenses: [{ id: '2', amount: 100, category: 'Food', description: 'Pizza', date: new Date().toISOString() }],
        debts: [],
        savingsGoals: [{ id: '3', name: 'Emergency', saved_amount: 1000, target_amount: 5000 }],
        recurringExpenses: [],
        categories: [
            { id: '1', name: 'Food', color: '#f87171' },
            { id: '2', name: 'Transport', color: '#60a5fa' },
            { id: '3', name: 'Bills', color: '#fbbf24' },
            { id: '4', name: 'Lifestyle', color: '#34d399' },
            { id: '5', name: 'Other', color: '#a78bfa' }
        ],
        gamification: {
            current_streak: 5,
            longest_streak: 10,
            achievements: []
        },
        settings: {
            monthly_budget_per_category: { Food: 500, Transport: 200, Bills: 800, Lifestyle: 300, Other: 200 },
            daily_budget_mode: 'recommended',
            custom_daily_budget: 0,
            has_completed_onboarding: true
        }
    };

    beforeEach(() => {
        (useFinance as jest.Mock).mockReturnValue({
            ...mockState,
            addExpense: jest.fn(),
            deleteExpense: jest.fn(),
        });
    });

    test('renders main summary correctly', async () => {
        render(
            <MemoryRouter>
                <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                </Suspense>
            </MemoryRouter>
        );
        // "Money left today" is the correct header in the Hero Card
        expect(await screen.findByText(/Money left today/i)).toBeInTheDocument();
        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    });

    test('renders at least some category information', async () => {
        render(
            <MemoryRouter>
                <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                </Suspense>
            </MemoryRouter>
        );
        // Find by category name
        expect(await screen.findByText(/Transport/i)).toBeInTheDocument();
    });
});
