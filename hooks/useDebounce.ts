'use client';

import { useCallback, useRef } from 'react';
/**
 * Creates a debounced function that delays invoking the provided callback until after the specified delay.
 *
 * @param callback - Function to invoke after the debounce delay.
 * @param delay - Delay in milliseconds before invoking `callback`.
 * @returns A zero-argument function which schedules `callback` to run after `delay` ms; calling it again before the delay expires resets the timer and postpones invocation.
 */
export function useDebounce(callback:() => void, delay:number) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback(() => {

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(callback, delay);
    }, [callback, delay]);
}