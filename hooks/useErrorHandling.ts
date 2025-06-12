// filepath: hooks/useErrorHandling.ts
/**
 * Error Handling Hooks - Phase 4 Implementation
 *
 * Custom hooks for standardized error handling patterns across the application.
 * Provides consistent error states, retry logic, and user feedback.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { errorService } from '../services/ErrorService';

export interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string;
  retryCount: number;
  isRetrying: boolean;
}

export interface ErrorHandlingOptions {
  maxRetries?: number;
  retryDelay?: number;
  logErrors?: boolean;
  context?: Record<string, any>;
  onError?: (error: Error, context?: Record<string, any>) => void;
  onRetry?: (retryCount: number) => void;
  onMaxRetriesReached?: (error: Error) => void;
}

/**
 * Hook for managing error states with retry logic
 */
export const useErrorState = (options: ErrorHandlingOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    logErrors = true,
    context = {},
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: '',
    retryCount: 0,
    isRetrying: false,
  });

  const retryTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach(clearTimeout);
    };
  }, []);

  /**
   * Set error state and handle logging
   */
  const setError = useCallback(
    (error: Error | string, additionalContext?: Record<string, any>) => {
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      const fullContext = { ...context, ...additionalContext }; // Log error if enabled
      if (logErrors) {
        errorService.logError(
          errorObj,
          {
            componentStack: '',
          },
          {
            hookName: 'useErrorState',
            ...fullContext,
          }
        );
      }

      // Update error state
      setErrorState((prev) => ({
        ...prev,
        error: errorObj,
        isError: true,
        errorMessage: errorObj.message,
        isRetrying: false,
      }));

      // Call custom error handler
      onError?.(errorObj, fullContext);
    },
    [context, logErrors, onError]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: '',
      retryCount: 0,
      isRetrying: false,
    });
  }, []);

  /**
   * Retry with exponential backoff
   */
  const retry = useCallback(
    (retryFn?: () => Promise<void> | void) => {
      if (errorState.retryCount >= maxRetries) {
        onMaxRetriesReached?.(errorState.error!);
        return Promise.reject(new Error('Maximum retry attempts reached'));
      }

      setErrorState((prev) => ({
        ...prev,
        isRetrying: true,
        retryCount: prev.retryCount + 1,
      }));

      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(2, errorState.retryCount);

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(async () => {
          try {
            if (retryFn) {
              await retryFn();
            }

            setErrorState((prev) => ({
              ...prev,
              error: null,
              isError: false,
              errorMessage: '',
              isRetrying: false,
            }));

            onRetry?.(errorState.retryCount + 1);
            resolve();
          } catch (error) {
            setErrorState((prev) => ({
              ...prev,
              isRetrying: false,
            }));
            reject(error);
          }
        }, delay);

        retryTimeouts.current.push(timeout);
      });
    },
    [
      errorState.retryCount,
      errorState.error,
      maxRetries,
      retryDelay,
      onRetry,
      onMaxRetriesReached,
    ]
  );

  return {
    errorState,
    setError,
    clearError,
    retry,
    canRetry: errorState.retryCount < maxRetries,
  };
};

/**
 * Hook for wrapping async operations with error handling
 */
export const useAsyncErrorHandler = <T = any>(
  options: ErrorHandlingOptions = {}
) => {
  const { setError, clearError, retry, errorState, canRetry } =
    useErrorState(options);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);

  /**
   * Execute async operation with error handling
   */
  const execute = useCallback(
    async (
      asyncFn: () => Promise<T>,
      context?: Record<string, any>
    ): Promise<T | null> => {
      try {
        setIsLoading(true);
        clearError();

        const result = await asyncFn();
        setData(result);
        return result;
      } catch (error) {
        setError(error as Error, context);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [setError, clearError]
  );

  /**
   * Retry the last operation
   */
  const retryOperation = useCallback(
    (asyncFn: () => Promise<T>, context?: Record<string, any>) => {
      return retry(() => execute(asyncFn, context));
    },
    [retry, execute]
  );

  return {
    data,
    isLoading,
    errorState,
    execute,
    retry: retryOperation,
    clearError,
    canRetry,
  };
};

/**
 * Hook for handling form submission errors
 */
export const useFormErrorHandler = (options: ErrorHandlingOptions = {}) => {
  const { setError, clearError, errorState } = useErrorState(options);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Set field-specific error
   */
  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  /**
   * Clear field-specific error
   */
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all field errors
   */
  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  /**
   * Handle form submission with error parsing
   */
  const handleSubmissionError = useCallback(
    (error: Error) => {
      // Try to parse validation errors from API response
      if (error.message.includes('validation')) {
        try {
          const validationData = JSON.parse(error.message);
          if (validationData.fieldErrors) {
            setFieldErrors(validationData.fieldErrors);
            return;
          }
        } catch {
          // Not a validation error, handle as general error
        }
      }

      // Handle as general form error
      setError(error, { formSubmission: true });
    },
    [setError]
  );

  return {
    errorState,
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    handleSubmissionError,
    clearError,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
  };
};

/**
 * Hook for handling network-specific errors
 */
export const useNetworkErrorHandler = (options: ErrorHandlingOptions = {}) => {
  const errorHandler = useErrorState(options);
  const [isOffline, setIsOffline] = useState(false);

  /**
   * Enhanced error handler for network issues
   */
  const handleNetworkError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      // Check if it's a network error
      const isNetworkError =
        error.message.includes('fetch') ||
        error.message.includes('Network') ||
        error.message.includes('offline') ||
        error.name === 'NetworkError';

      if (isNetworkError) {
        setIsOffline(true);
      }

      errorHandler.setError(error, {
        ...context,
        isNetworkError,
        timestamp: new Date().toISOString(),
      });
    },
    [errorHandler]
  );

  /**
   * Clear network error state
   */
  const clearNetworkError = useCallback(() => {
    setIsOffline(false);
    errorHandler.clearError();
  }, [errorHandler]);

  return {
    ...errorHandler,
    isOffline,
    handleNetworkError,
    clearNetworkError,
  };
};

export default useErrorState;
