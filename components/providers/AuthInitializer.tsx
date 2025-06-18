// filepath: components/providers/AuthInitializer.tsx
import React from 'react';

import { useAuthQuery } from '@/hooks/features/auth';

/**
 * AuthInitializer Component
 *
 * Initializes authentication state when the app starts using TanStack Query.
 * The Supabase auth listener is set up globally in authStore.ts.
 *
 * Refactored to follow "Smart Hook, Dumb Component" pattern:
 * - Uses useAuthQuery for initial auth state
 * - No direct store access
 * - Clean component interface
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  // Initialize auth state using TanStack Query
  useAuthQuery();

  return <>{children}</>;
}

/**
 * Alternative: Auth Hook for App-level Initialization
 *
 * If you prefer a hook-based approach instead of a component wrapper.
 * Now uses TanStack Query for auth initialization.
 */
export function useAuthInitialization() {
  // Initialize auth state using TanStack Query
  useAuthQuery();
}
