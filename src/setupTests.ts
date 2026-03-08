import '@testing-library/jest-dom';
import React from 'react';

// Polyfill for TextEncoder/Decoder
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// Mock LocalStorage
const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key: string) => { delete store[key]; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock crypto.randomUUID
if (!global.crypto) {
    (global as any).crypto = {};
}
if (!global.crypto.randomUUID) {
    (global as any).crypto.randomUUID = () => 'test-uuid-' + Math.random();
}

// Global Mock for lucide-react
jest.mock('lucide-react', () => {
    return new Proxy({}, {
        get: (target, key) => {
            if (key === '__esModule') return true;
            return (props: any) => React.createElement('div', { ...props, 'data-testid': `icon-${String(key)}` });
        }
    });
});

// Global Mock for framer-motion
jest.mock('framer-motion', () => ({
    motion: new Proxy({}, {
        get: (target, key) => {
            return ({ children, ...props }: any) => React.createElement(String(key), props, children);
        }
    }),
    AnimatePresence: ({ children }: any) => children,
}));

// Mock Recharts with default and named exports
const mockRecharts = {
    ResponsiveContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
    PieChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
    Pie: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie' }, children),
    Cell: () => React.createElement('div', { 'data-testid': 'cell' }),
    BarChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
    Bar: () => React.createElement('div', { 'data-testid': 'bar' }),
    XAxis: () => React.createElement('div', { 'data-testid': 'x-axis' }),
    YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
    Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }),
};

// This ensures that import('recharts') works for lazy()
jest.mock('recharts', () => ({
    __esModule: true,
    ...mockRecharts,
}));

// We need to handle the .then(mod => ({ default: mod.PieChart })) pattern
// By making sure the module object itself has the components as properties.
// In Jest, the factory function returns what import() or require() gets.
