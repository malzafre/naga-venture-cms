// filepath: stores/navigation/navigationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { NavigationItem } from '@/types/navigation';

export interface NavigationState {
  // Navigation state
  isLoading: boolean;
  filteredNavigation: NavigationItem[];
}

export interface NavigationStore extends NavigationState {
  // Simple state setters (no business logic)
  setLoading: (loading: boolean) => void;
  setFilteredNavigation: (navigation: NavigationItem[]) => void;
}

// Initial state
const initialState: NavigationState = {
  isLoading: true,
  filteredNavigation: [],
};

/**
 * Navigation Store - Pure state management for navigation data
 *
 * Refactored to follow "Smart Hook, Dumb Component" pattern:
 * - NO React hooks inside store
 * - NO business logic (moved to custom hooks)
 * - Only pure state management
 * - Clean separation of concerns
 *
 * Business Logic Now In:
 * - useNavigationFilter() - filtering logic with React hooks
 * - navigationUtils.ts - pure utility functions
 */
export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,

    // Simple state setters (no async operations or complex logic)
    setLoading: (isLoading: boolean) => {
      if (__DEV__) {
        console.log('[NavigationStore] Setting loading:', isLoading);
      }
      set((state) => ({ ...state, isLoading }));
    },

    setFilteredNavigation: (filteredNavigation: NavigationItem[]) => {
      if (__DEV__) {
        console.log(
          '[NavigationStore] Setting filtered navigation:',
          filteredNavigation.length,
          'items'
        );
      }
      set((state) => ({ ...state, filteredNavigation }));
    },
  }))
);

/**
 * Optimized selector hooks for better performance
 */

// Get loading state
export const useNavigationLoading = () =>
  useNavigationStore((state) => state.isLoading);

// Get filtered navigation
export const useFilteredNavigation = () =>
  useNavigationStore((state) => state.filteredNavigation);

// Get navigation actions (stable reference)
export const useNavigationActions = () =>
  useNavigationStore(
    useShallow((state) => ({
      setLoading: state.setLoading,
      setFilteredNavigation: state.setFilteredNavigation,
    }))
  );

// Get complete navigation state (use sparingly)
export const useNavigationState = () =>
  useNavigationStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      filteredNavigation: state.filteredNavigation,
    }))
  );
