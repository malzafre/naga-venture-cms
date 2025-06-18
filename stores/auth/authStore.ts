// filepath: stores/auth/authStore.ts
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { supabase } from '@/lib/supabaseClient';

export interface AuthState {
  // Core authentication state (managed by Supabase listener)
  session: Session | null;
  user: SupabaseUser | null;

  // UI state for loading feedback
  isLoadingInitial: boolean;
  isSigningIn: boolean;
  isSigningOut: boolean;

  // UI state for error display
  authError: Error | null;
}

export interface AuthStore extends AuthState {
  // Simple UI state setters (no business logic)
  setSession: (session: Session | null) => void;
  setIsLoadingInitial: (loading: boolean) => void;
  setIsSigningIn: (loading: boolean) => void;
  setIsSigningOut: (loading: boolean) => void;
  setAuthError: (error: Error | null) => void;
}

// Initial state
const initialState: AuthState = {
  session: null,
  user: null,
  isLoadingInitial: true,
  isSigningIn: false,
  isSigningOut: false,
  authError: null,
};

/**
 * Zustand Auth Store - UI State Management Only
 *
 * Refactored to follow "Smart Hook, Dumb Component" pattern:
 * - NO business logic (moved to TanStack Query mutations)
 * - Only UI state management (loading states, error display)
 * - Session state managed by Supabase auth listener
 * - Clean separation of concerns
 *
 * Business Logic Now In:
 * - useSignInMutation() - handles sign in logic
 * - useSignOutMutation() - handles sign out logic
 * - useAuthQuery() - handles initial auth state
 */
export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // Simple UI state setters (no async operations)
    setSession: (session) => {
      set((state) => ({
        ...state,
        session,
        user: session?.user ?? null,
      }));
    },

    setIsLoadingInitial: (isLoadingInitial) => {
      set((state) => ({ ...state, isLoadingInitial }));
    },

    setIsSigningIn: (isSigningIn) => {
      set((state) => ({ ...state, isSigningIn }));
    },

    setIsSigningOut: (isSigningOut) => {
      set((state) => ({ ...state, isSigningOut }));
    },

    setAuthError: (authError) => {
      set((state) => ({ ...state, authError }));
    },
  }))
);

// ####################################################################
// SUPABASE AUTH LISTENER - Handles session changes automatically
// This code runs ONCE when the app loads and exists outside of React.
// ####################################################################

console.log('[AuthStore] Setting up global Supabase auth listener...');

supabase.auth.onAuthStateChange((event, newSession) => {
  // Skip events that don't signify a real auth change
  if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
    return;
  }

  console.log(
    `[AuthStore] Auth event: ${event}, User: ${newSession?.user?.id || 'none'}`
  );

  // Update session in store
  useAuthStore.getState().setSession(newSession);

  // Clear error on successful sign out
  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().setAuthError(null);
  }
});

/**
 * Optimized selector hooks for better performance
 */

// Core auth state
export const useAuthSession = () =>
  useAuthStore(
    useShallow((state) => ({
      session: state.session,
      user: state.user,
    }))
  );

// Loading states
export const useAuthLoading = () =>
  useAuthStore(
    useShallow((state) => ({
      isLoadingInitial: state.isLoadingInitial,
      isSigningIn: state.isSigningIn,
      isSigningOut: state.isSigningOut,
    }))
  );

// Error state
export const useAuthError = () => useAuthStore((state) => state.authError);

// Auth actions (UI state setters only)
export const useAuthActions = () =>
  useAuthStore(
    useShallow((state) => ({
      setSession: state.setSession,
      setIsLoadingInitial: state.setIsLoadingInitial,
      setIsSigningIn: state.setIsSigningIn,
      setIsSigningOut: state.setIsSigningOut,
      setAuthError: state.setAuthError,
    }))
  );

// Combined loading state for convenience
export const useAuthIsLoading = () =>
  useAuthStore(
    (state) => state.isLoadingInitial || state.isSigningIn || state.isSigningOut
  );
