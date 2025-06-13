// filepath: stores/authStore.ts
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { supabase } from '@/lib/supabaseClient';

export interface AuthState {
  // Core authentication state
  session: Session | null;
  user: SupabaseUser | null;
  isLoadingInitial: boolean;
  authError: Error | null;

  // UI state for auth flows
  isSigningIn: boolean;
  isSigningOut: boolean;
}

export interface AuthStore extends AuthState {
  // Core actions
  setSession: (session: Session | null) => void;
  setAuthError: (error: Error | null) => void;
  setIsLoadingInitial: (loading: boolean) => void;

  // Auth flow actions
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  // Internal actions
  _initializeAuth: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  session: null,
  user: null,
  isLoadingInitial: true,
  authError: null,
  isSigningIn: false,
  isSigningOut: false,
};

/**
 * Zustand Auth Store
 *
 * Manages authentication client state following the project's state management guidelines:
 * - Zustand for global client state (auth session, UI state)
 * - TanStack Query for server state (user profile data)
 * - Optimized selective subscriptions to prevent unnecessary re-renders
 *
 * Note: This is an admin-only CMS, so signup functionality is not provided.
 * Admin users must be created directly in the database or through Supabase console.
 */
export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Core state setters
    setSession: (session) => {
      set((state) => ({
        ...state,
        session,
        user: session?.user ?? null,
      }));
    },

    setAuthError: (authError) => {
      set((state) => ({ ...state, authError }));
    },

    setIsLoadingInitial: (isLoadingInitial) => {
      set((state) => ({ ...state, isLoadingInitial }));
    },

    // Authentication actions
    signInWithEmail: async (email: string, password: string) => {
      const { setAuthError } = get();

      set((state) => ({
        ...state,
        isSigningIn: true,
        authError: null,
      }));

      try {
        console.log(`[AuthStore] Attempting to sign in: ${email}`);

        // Pre-emptive sign out to prevent issues
        await supabase.auth.signOut();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('[AuthStore] Sign in error:', error);
          setAuthError(new Error(error.message || 'Sign in failed'));
        } else if (data.session) {
          console.log('[AuthStore] Sign in successful');
          // Session will be updated via auth listener
        }
      } catch (err) {
        console.error('[AuthStore] Sign in exception:', err);
        setAuthError(err instanceof Error ? err : new Error('Sign in failed'));
      } finally {
        set((state) => ({ ...state, isSigningIn: false }));
      }
    },

    signOut: async () => {
      const { setAuthError } = get();

      set((state) => ({
        ...state,
        isSigningOut: true,
        authError: null,
      }));

      try {
        console.log('[AuthStore] Attempting to sign out');

        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('[AuthStore] Sign out error:', error);
          setAuthError(new Error(error.message || 'Sign out failed'));
        } else {
          console.log('[AuthStore] Sign out successful');
          // Session will be cleared via auth listener
        }
      } catch (err) {
        console.error('[AuthStore] Sign out exception:', err);
        setAuthError(err instanceof Error ? err : new Error('Sign out failed'));
      } finally {
        set((state) => ({ ...state, isSigningOut: false }));
      }
    }, // Initialization
    _initializeAuth: async () => {
      // Prevent running initialization more than once
      if (!get().isLoadingInitial) return;

      try {
        console.log('[AuthStore] Initializing auth state');

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthStore] Error getting session:', error);
          get().setAuthError(error);
        } else {
          console.log('[AuthStore] Initial session:', !!session);
          get().setSession(session);
        }
      } catch (err) {
        console.error('[AuthStore] Initialize auth exception:', err);
        get().setAuthError(
          err instanceof Error ? err : new Error('Auth initialization failed')
        );
      } finally {
        get().setIsLoadingInitial(false);
      }
    },
  }))
);

// ####################################################################
// THE NEW SINGLETON LISTENER
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

  // Get the actions directly from the store and update the state
  useAuthStore.getState().setSession(newSession);

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

// Auth actions
export const useAuthActions = () =>
  useAuthStore(
    useShallow((state) => ({
      signInWithEmail: state.signInWithEmail,
      signOut: state.signOut,
      setAuthError: state.setAuthError,
    }))
  );

// Combined loading state for convenience
export const useAuthIsLoading = () =>
  useAuthStore(
    (state) => state.isLoadingInitial || (!!state.user && state.isSigningIn)
  );
