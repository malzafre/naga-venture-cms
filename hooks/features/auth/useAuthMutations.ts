// filepath: hooks/features/auth/useAuthMutations.ts
import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/lib/supabaseClient';
import { useAuthActions } from '@/stores';

/**
 * Auth Mutations - TanStack Query mutations for authentication business logic
 *
 * Following the "Smart Hook, Dumb Component" pattern:
 * - Business logic handled in TanStack Query mutations
 * - UI state updates managed through Zustand store
 * - Components receive clean, typed interfaces
 *
 * Features:
 * - Type-safe authentication operations
 * - Automatic loading state management
 * - Error handling with user-friendly messages
 * - Integration with auth store for UI feedback
 */

interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign In Mutation
 *
 * Handles email/password authentication with automatic UI state management.
 * Updates auth store loading states and error handling.
 */
export const useSignInMutation = () => {
  const { setAuthError, setIsSigningIn } = useAuthActions();

  return useMutation({
    mutationFn: async ({ email, password }: SignInCredentials) => {
      console.log(`[AuthMutations] Attempting to sign in: ${email}`);

      // Pre-emptive sign out to prevent auth state issues
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AuthMutations] Sign in error:', error);
        throw new Error(error.message || 'Sign in failed');
      }

      if (!data.session) {
        throw new Error('No session returned after sign in');
      }

      console.log('[AuthMutations] Sign in successful');
      return data;
    },
    onMutate: () => {
      console.log('[AuthMutations] Starting sign in process');
      setIsSigningIn(true);
      setAuthError(null);
    },
    onError: (error: Error) => {
      console.error('[AuthMutations] Sign in mutation error:', error);
      setAuthError(error);
    },
    onSettled: () => {
      console.log('[AuthMutations] Sign in process completed');
      setIsSigningIn(false);
    },
    retry: false, // Don't retry auth failures automatically
  });
};

/**
 * Sign Out Mutation
 *
 * Handles user sign out with automatic UI state management.
 * Clears auth store state and handles error scenarios.
 */
export const useSignOutMutation = () => {
  const { setAuthError, setIsSigningOut } = useAuthActions();

  return useMutation({
    mutationFn: async () => {
      console.log('[AuthMutations] Attempting to sign out');

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[AuthMutations] Sign out error:', error);
        throw new Error(error.message || 'Sign out failed');
      }

      console.log('[AuthMutations] Sign out successful');
      return true;
    },
    onMutate: () => {
      console.log('[AuthMutations] Starting sign out process');
      setIsSigningOut(true);
      setAuthError(null);
    },
    onError: (error: Error) => {
      console.error('[AuthMutations] Sign out mutation error:', error);
      setAuthError(error);
    },
    onSettled: () => {
      console.log('[AuthMutations] Sign out process completed');
      setIsSigningOut(false);
    },
    retry: false, // Don't retry sign out failures automatically
  });
};
