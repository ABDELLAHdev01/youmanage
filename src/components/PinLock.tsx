import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Fingerprint, Delete } from 'lucide-react';

interface PinLockProps {
    savedPin: string;
    onSuccess: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({ savedPin, onSuccess }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleKeypad = (val: string) => {
        if (pin.length < savedPin.length) {
            const newPin = pin + val;
            setPin(newPin);

            if (newPin.length === savedPin.length) {
                if (newPin === savedPin) {
                    setTimeout(onSuccess, 300);
                } else {
                    setError(true);
                    setTimeout(() => {
                        setPin('');
                        setError(false);
                    }, 600);
                }
            }
        }
    };

    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };

    return (
        <div className="fixed inset-0 z-[110] bg-zinc-950 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-950 to-zinc-900">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-xs flex flex-col items-center"
            >
                <div className={`p-5 rounded-[2rem] mb-8 transition-colors duration-300 ${error ? 'bg-red-500/10 text-red-500' : 'bg-zinc-900 text-teal-400 border border-zinc-800'}`}>
                    {pin.length === savedPin.length && pin === savedPin ? <Unlock size={32} /> : <Lock size={32} />}
                </div>

                <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-zinc-500 text-sm mb-12">Enter your PIN to unlock</p>

                {/* PIN Dots */}
                <div className="flex space-x-4 mb-16">
                    {Array.from({ length: savedPin.length }).map((_, i) => (
                        <motion.div
                            key={i}
                            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${i < pin.length
                                    ? 'bg-teal-400 border-teal-400 scale-110 shadow-[0_0_15px_rgba(45,212,191,0.5)]'
                                    : 'border-zinc-800'
                                }`}
                        />
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            onClick={() => handleKeypad(num.toString())}
                            className="h-16 w-16 rounded-full bg-zinc-900/50 hover:bg-zinc-800 active:scale-90 text-white text-xl font-bold transition-all border border-zinc-800/30 backdrop-blur-sm"
                        >
                            {num}
                        </button>
                    ))}
                    <div className="h-16 w-16"></div>
                    <button
                        onClick={() => handleKeypad('0')}
                        className="h-16 w-16 rounded-full bg-zinc-900/50 hover:bg-zinc-800 active:scale-90 text-white text-xl font-bold transition-all border border-zinc-800/30 backdrop-blur-sm"
                    >
                        0
                    </button>
                    <button
                        onClick={handleDelete}
                        className="h-16 w-16 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                    >
                        <Delete size={24} />
                    </button>
                </div>

                <button className="mt-12 text-zinc-600 hover:text-zinc-400 transition-colors flex items-center space-x-2">
                    <Fingerprint size={18} />
                    <span className="text-xs font-medium uppercase tracking-widest">Use Biometrics</span>
                </button>
            </motion.div>
        </div>
    );
};
