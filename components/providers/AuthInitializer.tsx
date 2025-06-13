// filepath: components/providers/AuthInitializer.tsx
import React, { useEffect } from 'react';

import { useAuthStore } from '@/stores/authStore';

/**
 * AuthInitializer Component
 *
 * Initializes the Zustand auth store when the app starts.
 * This replaces the AuthProvider pattern from the old Context-based implementation.
 *
 * Usage: Wrap your app root with this component or include it in your main layout.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth state and set up listener
    const initAuth = async () => {
      await useAuthStore.getState()._initializeAuth();
    };

    const cleanup = useAuthStore.getState()._setupAuthListener();

    initAuth();

    return cleanup;
  }, []);

  return <>{children}</>;
}

/**
 * Alternative: Auth Hook for App-level Initialization
 *
 * If you prefer a hook-based approach instead of a component wrapper:
 */
export function useAuthInitialization() {
  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState()._initializeAuth();
    };

    const cleanup = useAuthStore.getState()._setupAuthListener();

    initAuth();

    return cleanup;
  }, []);
}
