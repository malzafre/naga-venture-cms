// filepath: hooks/features/auth/useAuthQuery.ts
import { Session } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabaseClient';
import { useAuthActions } from '@/stores';

/**
 * Auth Query - TanStack Query for authentication state initialization
 *
 * Handles the initial authentication state check when the app loads.
 * Integrates with auth store for UI state management.
 *
 * Features:
 * - Initial session retrieval from Supabase
 * - Automatic loading state management
 * - Error handling for auth initialization
 * - Integration with auth store
 */

/**
 * Auth Initialization Query
 *
 * Retrieves the current authentication session on app startup.
 * Updates auth store with session data and loading states.
 */
export const useAuthQuery = () => {
  const { setSession, setAuthError, setIsLoadingInitial } = useAuthActions();

  const query = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async (): Promise<Session | null> => {
      console.log('[AuthQuery] Initializing auth state');

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('[AuthQuery] Error getting session:', error);
        throw error;
      }

      console.log('[AuthQuery] Initial session:', !!session);
      return session;
    },
    retry: 1, // Retry once on failure
    staleTime: Infinity, // Session data doesn't go stale
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes (updated from cacheTime)
  });

  // Handle query state changes with useEffect (modern TanStack Query pattern)
  useEffect(() => {
    if (query.isSuccess) {
      console.log('[AuthQuery] Successfully retrieved session');
      setSession(query.data);
    }
  }, [query.isSuccess, query.data, setSession]);

  useEffect(() => {
    if (query.isError) {
      console.error('[AuthQuery] Auth initialization error:', query.error);
      setAuthError(query.error as Error);
    }
  }, [query.isError, query.error, setAuthError]);

  useEffect(() => {
    if (!query.isLoading) {
      console.log('[AuthQuery] Auth initialization completed');
      setIsLoadingInitial(false);
    }
  }, [query.isLoading, setIsLoadingInitial]);

  return query;
};
