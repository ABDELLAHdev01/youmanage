import { useState, useEffect, useRef } from 'react';
import LZString from 'lz-string';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return initialValue;

            // Try decompressing first (UTF16 is safer for localStorage)
            const decompressed = LZString.decompressFromUTF16(item);

            // If decompression fails or returns null, try parsing raw item (for migration from old data)
            const dataToParse = decompressed !== null ? decompressed : item;
            return JSON.parse(dataToParse);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return initialValue;
        }
    });

    // Refs for debouncing logic
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Return a wrapped version of useState's setter function
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
        } catch (error) {
            console.error('Error setting value in state:', error);
        }
    };

    // Synchronize with localStorage using a 200ms debounce
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout for debounced write
        timeoutRef.current = setTimeout(() => {
            try {
                const stringified = JSON.stringify(storedValue);
                const compressed = LZString.compressToUTF16(stringified);
                window.localStorage.setItem(key, compressed);
            } catch (error) {
                console.error('Error writing to localStorage:', error);
            }
        }, 200);

        // Cleanup on unmount or dependency change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [key, storedValue]);

    return [storedValue, setValue] as const;
}
