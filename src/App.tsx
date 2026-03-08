import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import { BottomNav } from './components/BottomNav';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Onboarding } from './components/Onboarding';
import { PinLock } from './components/PinLock';

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const AddExpense = lazy(() => import('./pages/AddExpense').then(module => ({ default: module.AddExpense })));
const History = lazy(() => import('./pages/History').then(module => ({ default: module.History })));
const DebtTracker = lazy(() => import('./pages/DebtTracker').then(module => ({ default: module.DebtTracker })));
const SavingsTracker = lazy(() => import('./pages/SavingsTracker').then(module => ({ default: module.SavingsTracker })));
const IncomeManagement = lazy(() => import('./pages/IncomeManagement').then(module => ({ default: module.IncomeManagement })));
const RecurringExpenses = lazy(() => import('./pages/RecurringExpenses').then(module => ({ default: module.RecurringExpenses })));
const CategoryManagement = lazy(() => import('./pages/CategoryManagement').then(module => ({ default: module.CategoryManagement })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));

const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-xs font-medium animate-pulse">Loading experience...</p>
    </div>
);

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
                    <Suspense fallback={<LoadingFallback />}>
                        {children}
                    </Suspense>
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
                <Route path="/categories" element={<CategoryManagement />} />
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
