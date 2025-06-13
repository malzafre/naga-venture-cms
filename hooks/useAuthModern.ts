// filepath: hooks/useAuth.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/lib/supabaseClient';
import {
  useAuthActions,
  useAuthError,
  useAuthLoading,
  useAuthSession,
  useAuthStore,
} from '@/stores/authStore';
import { Profile as UserProfile, UserRole } from '@/types/supabase';

/**
 * Modern Auth Hook using Zustand + TanStack Query
 *
 * Follows project guidelines:
 * - Zustand for client state (session, auth UI state)
 * - TanStack Query for server state (user profile)
 * - Smart Hook pattern with optimized subscriptions
 */
export function useAuth() {
  const { session, user } = useAuthSession();
  const { isLoadingInitial, isSigningIn, isSigningOut } = useAuthLoading();
  const authError = useAuthError();
  const { signInWithEmail, signOut } = useAuthActions();

  const queryClient = useQueryClient();

  // Initialize auth on first mount
  useEffect(() => {
    const initAuth = async () => {
      await useAuthStore.getState()._initializeAuth();
    };

    const cleanup = useAuthStore.getState()._setupAuthListener();

    initAuth();

    return cleanup;
  }, []);

  // User profile query (server state via TanStack Query)
  const {
    data: userProfile,
    isLoading: isUserProfileLoading,
    error: userProfileError,
  } = useQuery<UserProfile | null, Error>({
    queryKey: ['userProfile', user?.id],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      if (!user?.id) {
        console.log('[useAuth] Skipping profile fetch - no user ID');
        return null;
      }

      console.log(`[useAuth] Fetching profile for user ${user.id}`);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error(`[useAuth] Error fetching profile:`, error);
        throw error;
      }

      console.log(`[useAuth] Profile fetched for user ${user.id}`, data);
      return data;
    },
    enabled: !!user,
    retry: 1,
  });

  // Clean up profile cache on sign out
  useEffect(() => {
    if (!user && session === null) {
      queryClient.removeQueries({
        queryKey: ['userProfile'],
        exact: false,
      });
    }
  }, [user, session, queryClient]);

  // Combined loading state
  const isLoading = isLoadingInitial || (!!user && isUserProfileLoading);

  // Utility methods
  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return !!userProfile && roles.some((r) => userProfile.role === r);
  };

  const isAdmin = (): boolean => {
    return hasAnyRole([
      'tourism_admin',
      'business_listing_manager',
      'tourism_content_manager',
      'business_registration_manager',
    ]);
  };

  // Legacy compatibility methods
  const login = (userData: any) => {
    console.warn(
      "[useAuth] Legacy 'login' method called. Please use 'signInWithEmail'.",
      userData
    );
  };

  const logout = () => {
    console.warn(
      "[useAuth] Legacy 'logout' method called. Please use 'signOut'."
    );
    signOut();
  };

  return {
    // Core auth state
    session,
    user,
    isLoading,
    authError,

    // Auth actions
    signInWithEmail,
    signOut,

    // User profile (server state)
    userProfile: userProfile as UserProfile | null,
    isUserProfileLoading,
    userProfileError: userProfileError as Error | null,

    // UI state
    isSigningIn,
    isSigningOut,

    // Utility methods
    hasRole,
    hasAnyRole,
    isAdmin,

    // Legacy compatibility
    login,
    logout,
  };
}

/**
 * Optimized hooks for specific auth concerns
 */

// Hook for components that only need to know if user is authenticated
export function useIsAuthenticated() {
  const { user } = useAuthSession();
  return !!user;
}

// Hook for components that only need user role checking
export function useUserRole() {
  const { user } = useAuthSession();
  const { data: userProfile } = useQuery<UserProfile | null, Error>({
    queryKey: ['userProfile', user?.id],
    enabled: !!user,
  });

  const hasRole = (role: UserRole): boolean => {
    return userProfile?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return !!userProfile && roles.some((r) => userProfile.role === r);
  };

  const isAdmin = (): boolean => {
    return hasAnyRole([
      'tourism_admin',
      'business_listing_manager',
      'tourism_content_manager',
      'business_registration_manager',
    ]);
  };

  return {
    userProfile,
    hasRole,
    hasAnyRole,
    isAdmin,
  };
}
