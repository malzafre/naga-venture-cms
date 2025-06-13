// filepath: hooks/useStableBusinessFilter.ts
import { useMemo } from 'react';

import {
  useBusinessFilterActions,
  useBusinessFilters,
  useBusinessSearch,
} from '@/stores';

/**
 * Modern stable business filter hook using Zustand best practices
 *
 * Features:
 * - Uses useShallow for stable references (already implemented in store selectors)
 * - Memoized return value for maximum stability
 * - Focused on commonly used filter state and actions
 * - Optimized for minimal re-renders
 *
 * This hook is designed to replace direct store usage in components
 * where stable references are critical for performance.
 */
export const useStableBusinessFilter = () => {
  const filters = useBusinessFilters(); // Already using useShallow internally
  const search = useBusinessSearch(); // Already using useShallow internally
  const actions = useBusinessFilterActions(); // Already using useShallow internally

  return useMemo(
    () => ({
      // Filter state
      filters,

      // Search state
      searchQuery: search.searchQuery,
      isSearching: search.isSearching,

      // Most commonly used actions
      setSearchQuery: actions.setSearchQuery,
      setFilter: actions.setFilter,
      resetFilters: actions.resetFilters,
      clearSearch: actions.clearSearch,
    }),
    [
      filters,
      search.searchQuery,
      search.isSearching,
      actions.setSearchQuery,
      actions.setFilter,
      actions.resetFilters,
      actions.clearSearch,
    ]
  );
};

/**
 * Lightweight hook for components that only need search functionality
 */
export const useStableBusinessSearch = () => {
  const search = useBusinessSearch();
  const { setSearchQuery, clearSearch } = useBusinessFilterActions();

  return useMemo(
    () => ({
      searchQuery: search.searchQuery,
      isSearching: search.isSearching,
      setSearchQuery,
      clearSearch,
    }),
    [search.searchQuery, search.isSearching, setSearchQuery, clearSearch]
  );
};

/**
 * Hook for components that only need filter state (not search)
 */
export const useStableBusinessFiltersOnly = () => {
  const filters = useBusinessFilters();
  const { setFilter, updateFilters, resetFilters } = useBusinessFilterActions();

  return useMemo(
    () => ({
      filters,
      setFilter,
      updateFilters,
      resetFilters,
    }),
    [filters, setFilter, updateFilters, resetFilters]
  );
};
