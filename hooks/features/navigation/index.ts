// filepath: hooks/features/navigation/index.ts
/**
 * Navigation Hooks - Centralized exports for navigation logic
 *
 * Following the "Smart Hook, Dumb Component" pattern:
 * - Business logic in custom hooks with React patterns
 * - Pure utilities in utils/navigationUtils.ts
 * - UI state managed through Zustand store
 */

export { useNavigationFilter } from './useNavigationFilter';

// Re-export navigation store selectors for convenience
export {
  useFilteredNavigation,
  useNavigationActions,
  useNavigationLoading,
  useNavigationState,
} from '@/stores';

// Re-export navigation utilities for convenience
export {
  filterNavigationByRole,
  findActiveSection,
} from '@/utils/navigationUtils';
