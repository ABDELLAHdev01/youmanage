import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Onboarding } from '../components/Onboarding';
import { FinanceProvider } from '../context/FinanceContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FinanceProvider>
        <MemoryRouter>
            {children}
        </MemoryRouter>
    </FinanceProvider>
);

describe('Onboarding Flow', () => {
    test('completes full onboarding multi-step process', async () => {
        render(<Onboarding onComplete={() => { }} />, { wrapper });

        // Step 1: Welcome
        expect(screen.getByText(/Welcome to YouManage/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Continue/i));

        // Step 2: PIN Setup
        expect(screen.getByText(/Secure Your Data/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Skip Security/i));

        // Step 3: Income
        expect(screen.getByText(/Set Your Income/i)).toBeInTheDocument();
        const salaryInput = screen.getByPlaceholderText('0');
        fireEvent.change(salaryInput, { target: { value: '5000' } });
        fireEvent.click(screen.getAllByText(/Continue/i)[0]);

        // Step 4: Budgets
        expect(screen.getByText(/Essential Budgets/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Continue/i));

        // Step 5: Emergency Fund
        expect(screen.getByText(/Emergency Fund/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Continue/i));

        // Step 6: Daily Budget
        expect(screen.getByText(/Daily Budget/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Continue/i));

        // Step 7: Review & Start
        expect(screen.getByText(/Review & Start/i)).toBeInTheDocument();
        // The final button is "Start Journey"
        fireEvent.click(screen.getByText(/Start Journey/i));
    });
});
