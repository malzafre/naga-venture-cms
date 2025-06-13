// filepath: stores/businessFilterStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { BusinessFilters } from '@/schemas/business/businessSchemas';

export interface BusinessFilterState {
  // Filter values
  filters: BusinessFilters;
  searchQuery: string;
  showFilters: boolean;

  // UI state
  isSearching: boolean;
  searchDebounceTimer: NodeJS.Timeout | null;
}

export interface BusinessFilterStore extends BusinessFilterState {
  // Filter actions
  setFilter: <K extends keyof BusinessFilters>(
    key: K,
    value: BusinessFilters[K]
  ) => void;
  updateFilters: (updates: Partial<BusinessFilters>) => void;
  resetFilters: () => void;

  // Search actions
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // UI actions
  toggleShowFilters: () => void;
  setShowFilters: (show: boolean) => void;

  // Internal methods
  _applyDebouncedSearch: () => void;
  _clearDebounceTimer: () => void;
}

// Initial state
const initialState: BusinessFilterState = {
  filters: {
    page: 1,
    limit: 20,
  },
  searchQuery: '',
  showFilters: false,
  isSearching: false,
  searchDebounceTimer: null,
};

/**
 * Business Filter Store - Global state management for business listing filters
 *
 * Manages all filter state for business listings including search, status filters,
 * business type filters, and pagination. Implements debounced search to optimize
 * API calls and performance.
 *
 * Features:
 * - Debounced search with 500ms delay
 * - Automatic page reset on filter changes
 * - Type-safe filter updates
 * - Optimized re-renders through selective subscriptions
 */
export const useBusinessFilterStore = create<BusinessFilterStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Filter actions
    setFilter: (key, value) => {
      set((state) => {
        // Bail out if value hasn't changed to prevent unnecessary re-renders
        if (state.filters[key] === value) return state;

        return {
          ...state,
          filters: {
            ...state.filters,
            [key]: value,
            page: key !== 'page' ? 1 : state.filters.page, // Reset page unless changing page
          },
        };
      });
    },

    updateFilters: (updates) => {
      set((state) => ({
        ...state,
        filters: {
          ...state.filters,
          ...updates,
          page: updates.page !== undefined ? updates.page : 1, // Reset page unless explicitly set
        },
      }));
    },

    resetFilters: () => {
      // Clear debounce timer
      const { searchDebounceTimer } = get();
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      set((state) => ({
        ...state,
        filters: {
          page: 1,
          limit: 20,
        },
        searchQuery: '',
        showFilters: false,
        isSearching: false,
        searchDebounceTimer: null,
      }));
    },

    // Search actions
    setSearchQuery: (query) => {
      const state = get();

      // Bail out if search query hasn't changed
      if (state.searchQuery === query) return;

      const { searchDebounceTimer } = state;

      // Clear existing timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      // Set new debounce timer
      const newTimer = setTimeout(() => {
        get()._applyDebouncedSearch();
      }, 500);

      // SINGLE set call for all state updates to prevent infinite loops
      set({
        searchQuery: query,
        isSearching: true,
        searchDebounceTimer: newTimer as unknown as NodeJS.Timeout,
      });
    },

    clearSearch: () => {
      const { searchDebounceTimer } = get();

      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      set((state) => ({
        ...state,
        searchQuery: '',
        isSearching: false,
        searchDebounceTimer: null,
        filters: {
          ...state.filters,
          searchQuery: undefined,
          page: 1,
        },
      }));
    },

    // UI actions
    toggleShowFilters: () => {
      set((state) => ({
        ...state,
        showFilters: !state.showFilters,
      }));
    },

    setShowFilters: (show) => {
      set((state) => ({
        ...state,
        showFilters: show,
      }));
    },

    // Internal methods
    _applyDebouncedSearch: () => {
      set((state) => {
        const trimmedQuery = state.searchQuery.trim();

        return {
          ...state,
          filters: {
            ...state.filters,
            searchQuery: trimmedQuery || undefined,
            page: 1, // Reset to first page on search
          },
          isSearching: false,
          searchDebounceTimer: null,
        };
      });
    },

    _clearDebounceTimer: () => {
      const { searchDebounceTimer } = get();
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
        set((state) => ({
          ...state,
          searchDebounceTimer: null,
        }));
      }
    },
  }))
);

/**
 * Selector hooks for optimized component subscriptions using useShallow
 */

// Get active filters (most commonly used for API calls)
export const useBusinessFilters = () =>
  useBusinessFilterStore(useShallow((state) => state.filters));

// Get search state
export const useBusinessSearch = () =>
  useBusinessFilterStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      isSearching: state.isSearching,
    }))
  );

// Get UI state
export const useBusinessFilterUI = () =>
  useBusinessFilterStore(
    useShallow((state) => ({
      showFilters: state.showFilters,
    }))
  );

// Get filter actions (stable reference)
export const useBusinessFilterActions = () =>
  useBusinessFilterStore(
    useShallow((state) => ({
      setFilter: state.setFilter,
      updateFilters: state.updateFilters,
      resetFilters: state.resetFilters,
      setSearchQuery: state.setSearchQuery,
      clearSearch: state.clearSearch,
      toggleShowFilters: state.toggleShowFilters,
      setShowFilters: state.setShowFilters,
    }))
  );

// Get complete filter state (use sparingly)
export const useBusinessFilterState = () =>
  useBusinessFilterStore(
    useShallow((state) => ({
      filters: state.filters,
      searchQuery: state.searchQuery,
      showFilters: state.showFilters,
      isSearching: state.isSearching,
    }))
  );
