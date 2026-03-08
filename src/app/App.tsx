import { RouterProvider } from 'react-router';
import { router } from './routes';
import { FinanceProvider } from './context/FinanceContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <FinanceProvider>
      <Toaster position="top-center" theme="dark" />
      <RouterProvider router={router} />
    </FinanceProvider>
  );
}
