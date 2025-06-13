// filepath: stores/navigationStore.ts
import React from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/types/supabase';

export interface NavigationStore {
  // State
  isLoading: boolean;
  filteredNavigation: NavigationItem[];

  // Actions
  setLoading: (loading: boolean) => void;
  setFilteredNavigation: (navigation: NavigationItem[]) => void;

  // Utils
  findActiveSection: (
    items: NavigationItem[],
    path: string
  ) => { section: string; subsection?: string };
}

/**
 * Navigation Store - Global state management for navigation data
 *
 * Manages navigation-specific state that doesn't belong in the sidebar store.
 * This includes filtered navigation items and utility functions.
 *
 * Features:
 * - Navigation item filtering by user role
 * - Active section detection utilities
 * - Loading state management
 * - Type-safe navigation utilities
 */
export const useNavigationStore = create<NavigationStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isLoading: true,
    filteredNavigation: [],

    // Actions
    setLoading: (loading: boolean) => {
      if (__DEV__) {
        console.log('[NavigationStore] Setting loading:', loading);
      }
      set({ isLoading: loading });
    },

    setFilteredNavigation: (navigation: NavigationItem[]) => {
      if (__DEV__) {
        console.log(
          '[NavigationStore] Setting filtered navigation:',
          navigation.length,
          'items'
        );
      }
      set({ filteredNavigation: navigation });
    },

    // Utils
    findActiveSection: (
      items: NavigationItem[],
      path: string
    ): { section: string; subsection?: string } => {
      for (const item of items) {
        if (item.path === path) {
          return { section: item.id };
        }

        if (item.subsections) {
          const found = get().findActiveSection(item.subsections, path);
          if (found.section) {
            return { section: item.id, subsection: found.section };
          }
        }
      }
      return { section: '' };
    },
  }))
);

/**
 * Selector hooks for optimized component subscriptions
 */

// Get loading state
export const useNavigationLoading = () =>
  useNavigationStore((state) => state.isLoading);

// Get filtered navigation
export const useFilteredNavigation = () =>
  useNavigationStore((state) => state.filteredNavigation);

// Get navigation actions (stable reference)
export const useNavigationActions = () =>
  useNavigationStore((state) => ({
    setLoading: state.setLoading,
    setFilteredNavigation: state.setFilteredNavigation,
    findActiveSection: state.findActiveSection,
  }));

// Utility hook for filtering navigation by user role
export const useNavigationFilter = (
  allNavigation: NavigationItem[],
  userRole: UserRole | undefined
) => {
  const actions = useNavigationActions();

  // Filter navigation items based on user role
  const filterByPermissions = React.useCallback(
    (items: NavigationItem[]): NavigationItem[] => {
      if (!userRole) return [];

      return items
        .filter((item) => item.permissions.includes(userRole))
        .map((item) => ({
          ...item,
          subsections: item.subsections
            ? filterByPermissions(item.subsections)
            : undefined,
        }))
        .filter((item) => !item.subsections || item.subsections.length > 0);
    },
    [userRole]
  );

  // Apply filtering and update store
  React.useEffect(() => {
    const filtered = filterByPermissions(allNavigation);
    actions.setFilteredNavigation(filtered);
    actions.setLoading(false);
  }, [allNavigation, userRole, actions, filterByPermissions]);

  return useFilteredNavigation();
};
