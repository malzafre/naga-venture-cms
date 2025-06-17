import { useCallback, useEffect, useState } from 'react';

/**
 * useDebounce - Custom Hook
 *
 * Debounces a value to avoid excessive API calls during rapid user input.
 * Follows React best practices for performance optimization.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useDebouncedCallback - Custom Hook
 *
 * Creates a debounced version of a callback function.
 * Useful for search handlers and form submissions.
 */
export const useDebouncedCallback = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(...args);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
};
