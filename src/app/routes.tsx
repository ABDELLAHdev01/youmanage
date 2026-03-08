import { createBrowserRouter, Outlet } from 'react-router';
import { Dashboard } from './screens/Dashboard';
import { AddExpense } from './screens/AddExpense';
import { History } from './screens/History';
import { DebtTracker } from './screens/DebtTracker';
import { Settings } from './screens/Settings';
import { NotFound } from './screens/NotFound';
import { BottomNav } from './components/BottomNav';

function Layout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'add',
        element: <AddExpense />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'debt',
        element: <DebtTracker />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);