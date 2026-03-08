import React from 'react';
import { NavLink } from 'react-router';
import { Home, PlusCircle, Clock, CreditCard, ArrowUpCircle, PiggyBank } from 'lucide-react';

export const BottomNav: React.FC = () => {
    const navItems = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'History', icon: Clock, path: '/history' },
        { name: 'Add', icon: PlusCircle, path: '/add' },
        { name: 'Income', icon: ArrowUpCircle, path: '/income' },
        { name: 'Savings', icon: PiggyBank, path: '/savings' },
        { name: 'Debts', icon: CreditCard, path: '/debts' },
    ];

    return (
        <nav className="absolute bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 pb-safe z-50">
            <div className="flex justify-between items-center h-16 px-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center flex-1 h-full min-w-0 space-y-1 transition-colors ${isActive ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
                                }`
                            }
                        >
                            <Icon size={20} className="sm:size-6" />
                            <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center px-1">
                                {item.name}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};
