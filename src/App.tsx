import React from 'react';
import { Routes, Route } from 'react-router';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { AddExpense } from './pages/AddExpense';
import { History } from './pages/History';
import { DebtTracker } from './pages/DebtTracker';
import { SavingsTracker } from './pages/SavingsTracker';
import { IncomeManagement } from './pages/IncomeManagement';
import { RecurringExpenses } from './pages/RecurringExpenses';
import { Settings } from './pages/Settings';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Onboarding } from './components/Onboarding';
import { PinLock } from './components/PinLock';

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings } = useFinance();
    const [isAuthenticated, setIsAuthenticated] = React.useState(!settings.security_pin);

    if (!settings.has_completed_onboarding) {
        return <Onboarding onComplete={() => { }} />;
    }

    if (settings.security_pin && !isAuthenticated) {
        return <PinLock savedPin={settings.security_pin} onSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30 flex justify-center">
            <div className="w-full max-w-md relative h-screen bg-zinc-950 overflow-hidden shadow-2xl shadow-black">
                <main className="h-full overflow-y-auto overflow-x-hidden pt-safe pb-24 scrollbar-hide">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
};

export const AppContent: React.FC = () => {
    return (
        <PrivateLayout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add" element={<AddExpense />} />
                <Route path="/history" element={<History />} />
                <Route path="/debts" element={<DebtTracker />} />
                <Route path="/savings" element={<SavingsTracker />} />
                <Route path="/income" element={<IncomeManagement />} />
                <Route path="/recurring" element={<RecurringExpenses />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </PrivateLayout>
    );
};

export const App: React.FC = () => {
    return (
        <FinanceProvider>
            <AppContent />
        </FinanceProvider>
    );
};

export default App;
