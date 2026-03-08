import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Trash2, ArrowLeft, Palette, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router';

export const CategoryManagement: React.FC = () => {
    const { categories, addCategory, deleteCategory, updateCategory, expenses } = useFinance();
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#2dd4bf');

    const handleAdd = () => {
        if (!newName.trim()) return;
        addCategory({ name: newName.trim(), color: newColor });
        setNewName('');
        setIsAdding(false);
    };

    const isCategoryInUse = (name: string) => {
        return expenses.some(e => e.category === name);
    };

    const handleDelete = (id: string, name: string) => {
        if (isCategoryInUse(name)) {
            alert("This category is currently in use by some expenses and cannot be deleted.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            deleteCategory(id);
        }
    };

    return (
        <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24">
            <header className="flex items-center space-x-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Categories</h1>
                    <p className="text-xs text-zinc-500">Manage your expense types</p>
                </div>
            </header>

            <button
                onClick={() => setIsAdding(!isAdding)}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-center space-x-2 text-zinc-400 hover:text-white hover:border-teal-500/50 transition-all group"
            >
                <Plus size={20} className="group-hover:text-teal-400 transition-colors" />
                <span className="font-bold">Add Custom Category</span>
            </button>

            {isAdding && (
                <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Category Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. Health, Education"
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Color Theme</label>
                            <div className="flex items-center space-x-4 bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                                <input
                                    type="color"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                />
                                <span className="text-zinc-400 font-mono text-sm uppercase">{newColor}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-3 pt-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-3 rounded-xl active:scale-95 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            className="flex-1 bg-teal-500 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-teal-500/10 active:scale-95 transition-all text-sm"
                        >
                            Create Category
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                                style={{ backgroundColor: cat.color }}
                            >
                                <LayoutGrid size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{cat.name}</h3>
                                {isCategoryInUse(cat.name) && (
                                    <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-tighter">In Use</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className={`p-2 transition-colors ${isCategoryInUse(cat.name) ? 'text-zinc-800' : 'text-zinc-700 hover:text-red-400'}`}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex items-start space-x-3">
                <Palette className="text-amber-500 shrink-0" size={18} />
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                    Tip: You can use these categories when adding expenses, setting monthly budgets, or scheduling recurring bills. Each category also gets a unique color in your dashboard.
                </p>
            </div>
        </div>
    );
};
