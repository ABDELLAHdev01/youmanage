import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 mb-8">Page not found</p>
        <button
          onClick={() => navigate('/')}
          className="bg-cyan-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-cyan-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
      </motion.div>
    </div>
  );
}
