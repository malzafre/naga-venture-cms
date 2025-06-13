// filepath: components/providers/AuthInitializer.tsx
import React, { useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';

/**
 * AuthInitializer Component
 *
 * Initializes the Zustand auth store when the app starts.
 * The auth listener is now set up globally in authStore.ts to avoid race conditions.
 *
 * Usage: Wrap your app root with this component or include it in your main layout.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth state
    // The auth listener is already running globally
    const initAuth = async () => {
      await useAuthStore.getState()._initializeAuth();
    };

    initAuth();
  }, []);

  return <>{children}</>;
}

/**
 * Alternative: Auth Hook for App-level Initialization
 *
 * If you prefer a hook-based approach instead of a component wrapper.
 * The auth listener is now set up globally in authStore.ts.
 */
export function useAuthInitialization() {
  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState()._initializeAuth();
    };

    initAuth();
  }, []);
}
