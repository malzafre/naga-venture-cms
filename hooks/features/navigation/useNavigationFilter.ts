// filepath: hooks/features/navigation/useNavigationFilter.ts
import { useCallback, useEffect } from 'react';

import { useFilteredNavigation, useNavigationActions } from '@/stores';
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/types/supabase';
import { filterNavigationByRole } from '@/utils/navigationUtils';

/**
 * Navigation Filter Hook - Business logic for filtering navigation items
 *
 * Extracted from navigation store to follow "Smart Hook, Dumb Component" pattern.
 * Contains all React hooks and filtering logic that was previously in the store.
 *
 * Features:
 * - Role-based navigation filtering
 * - Automatic store updates
 * - Optimized with useCallback to prevent unnecessary re-renders
 * - Clean separation from store state management
 */

/**
 * Filter navigation items by user role and update store
 *
 * @param allNavigation - Complete navigation structure
 * @param userRole - Current user's role for permission filtering
 * @returns Filtered navigation items from store
 */
export const useNavigationFilter = (
  allNavigation: NavigationItem[],
  userRole: UserRole | undefined
) => {
  const { setFilteredNavigation, setLoading } = useNavigationActions();

  // Memoized filtering function to prevent unnecessary re-computations
  const filterByPermissions = useCallback(
    (items: NavigationItem[]): NavigationItem[] => {
      return filterNavigationByRole(items, userRole);
    },
    [userRole]
  );

  // Apply filtering and update store when dependencies change
  useEffect(() => {
    console.log(
      '[useNavigationFilter] Applying navigation filter for role:',
      userRole
    );

    const filtered = filterByPermissions(allNavigation);
    setFilteredNavigation(filtered);
    setLoading(false);

    console.log(
      '[useNavigationFilter] Filtered navigation:',
      filtered.length,
      'items'
    );
  }, [
    allNavigation,
    userRole,
    setFilteredNavigation,
    setLoading,
    filterByPermissions,
  ]);

  // Return filtered navigation from store
  return useFilteredNavigation();
};
