import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, PartyPopper, X } from 'lucide-react';

interface AchievementOverlayProps {
    achievement: {
        title: string;
        description: string;
        icon: string;
    } | null;
    onClose: () => void;
}

export const AchievementOverlay: React.FC<AchievementOverlayProps> = ({ achievement, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 500); // Wait for exit animation
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -50 }}
                        className="bg-zinc-900 border border-teal-500/30 rounded-[32px] p-8 shadow-[0_0_50px_rgba(20,184,166,0.3)] max-w-sm w-full pointer-events-auto relative overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent" />

                        <div className="flex flex-col items-center text-center space-y-6">
                            <motion.div
                                initial={{ rotate: -15, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                                className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-teal-500/20"
                            >
                                {achievement.icon}
                            </motion.div>

                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex items-center justify-center space-x-2"
                                >
                                    <Trophy size={16} className="text-teal-400" />
                                    <span className="text-teal-400 font-bold text-xs uppercase tracking-[0.2em]">Achievement Unlocked</span>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-2xl font-black text-white"
                                >
                                    {achievement.title}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="text-zinc-500 text-sm"
                                >
                                    {achievement.description}
                                </motion.p>
                            </div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(onClose, 500);
                                }}
                                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </motion.button>

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 4.5, ease: "linear", delay: 0.5 }}
                                className="absolute bottom-0 left-0 h-1 bg-teal-500/50"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
