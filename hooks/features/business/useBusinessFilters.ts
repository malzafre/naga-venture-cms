// filepath: hooks/features/business/useBusinessFilters.ts
import { useEffect, useMemo } from 'react';

import {
  useBusinessFilterActions,
  useBusinessFilterStore,
  useBusinessFilterUI,
  useBusinessFilters as useBusinessFiltersFromStore,
  useBusinessSearch,
} from '@/stores';

/**
 * Consolidated Business Filter Hook
 *
 * Combines stable, memoized state with UI management logic. This is the definitive hook
 * for managing business filters, search, and related UI state.
 *
 * Features:
 * - Memoized return value for stable references, preventing unnecessary re-renders.
 * - Provides complete filter, search, and UI state in one place.
 * - Includes lifecycle effect to clean up debounce timers from the store.
 * - Exports specialized hooks for components with minimal state needs.
 */
export function useBusinessFilters() {
  const filters = useBusinessFiltersFromStore();
  const search = useBusinessSearch();
  const ui = useBusinessFilterUI();
  const actions = useBusinessFilterActions();

  // Cleanup debounce timer on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      useBusinessFilterStore.getState()._clearDebounceTimer();
    };
  }, []);

  // Return a stable, memoized object containing all state and actions
  return useMemo(
    () => ({
      // State
      filters,
      searchQuery: search.searchQuery,
      isSearching: search.isSearching,
      showFilters: ui.showFilters,

      // Actions
      ...actions,
    }),
    [filters, search.searchQuery, search.isSearching, ui.showFilters, actions]
  );
}

/**
 * Lightweight hook for components that only need search functionality.
 * Optimized for search input components.
 */
export const useBusinessSearchOnly = () => {
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
 * Hook for components that only need filter state (not search or UI).
 * Optimized for data fetching hooks that depend on filters.
 */
export const useBusinessFiltersOnly = () => {
  const filters = useBusinessFiltersFromStore();
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
