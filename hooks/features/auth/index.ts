// filepath: hooks/features/auth/index.ts
/**
 * Auth Hooks - Centralized exports for authentication logic
 *
 * Following the "Smart Hook, Dumb Component" pattern:
 * - Business logic in TanStack Query mutations and queries
 * - UI state managed through Zustand store
 * - Clean interfaces for components
 */

export { useSignInMutation, useSignOutMutation } from './useAuthMutations';
export { useAuthQuery } from './useAuthQuery';

// Re-export auth store selectors for convenience
export {
  useAuthActions,
  useAuthError,
  useAuthIsLoading,
  useAuthLoading,
  useAuthSession,
} from '@/stores';
