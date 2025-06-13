// filepath: hooks/useBusinessFilterManagement.ts
import { useEffect, useMemo } from 'react';

import {
  useBusinessFilterActions,
  useBusinessFilterStore,
  useBusinessFilterUI,
  useBusinessFilters,
  useBusinessSearch,
} from '@/stores';

/**
 * Smart Hook: useBusinessFilterManagement
 *
 * Intelligent wrapper around business filter store that provides:
 * - Debounced search functionality
 * - Filter state management
 * - Cleanup on unmount
 * - Optimized subscriptions
 *
 * Replaces direct useState management in components with centralized
 * Zustand store for better performance and consistency.
 */
export function useBusinessFilterManagement() {
  const filters = useBusinessFilters();
  const search = useBusinessSearch();
  const ui = useBusinessFilterUI();
  const actions = useBusinessFilterActions();

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      useBusinessFilterStore.getState()._clearDebounceTimer();
    };
  }, []);
  // Return organized interface for components - MEMOIZED for stability
  return useMemo(
    () => ({
      // Current filter state (for API calls)
      filters,

      // Search state
      searchQuery: search.searchQuery,
      isSearching: search.isSearching,

      // UI state
      showFilters: ui.showFilters,

      // Filter actions
      setFilter: actions.setFilter,
      updateFilters: actions.updateFilters,
      resetFilters: actions.resetFilters,

      // Search actions
      setSearchQuery: actions.setSearchQuery,
      clearSearch: actions.clearSearch,

      // UI actions
      toggleShowFilters: actions.toggleShowFilters,
      setShowFilters: actions.setShowFilters,
    }),
    [
      filters,
      search.searchQuery,
      search.isSearching,
      ui.showFilters,
      actions.setFilter,
      actions.updateFilters,
      actions.resetFilters,
      actions.setSearchQuery,
      actions.clearSearch,
      actions.toggleShowFilters,
      actions.setShowFilters,
    ]
  );
}

/**
 * Simplified hook for components that only need current filters
 * Optimized for API calls and data fetching
 */
export function useCurrentBusinessFilters() {
  return useBusinessFilters();
}

/**
 * Hook for search-only components
 * Optimized for search input components
 */
export function useBusinessSearchOnly() {
  const search = useBusinessSearch();
  const { setSearchQuery, clearSearch } = useBusinessFilterActions();

  return {
    searchQuery: search.searchQuery,
    isSearching: search.isSearching,
    setSearchQuery,
    clearSearch,
  };
}
