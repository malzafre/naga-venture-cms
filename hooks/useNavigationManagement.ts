// filepath: hooks/useNavigationManagement.ts
import { usePathname } from 'expo-router';
import { useMemo } from 'react';

import { tourismAdminNavigation } from '@/constants/NavigationConfig';
import { useNavigationActions, useNavigationFilter } from '@/stores';
import { UserRole } from '@/types/supabase';

/**
 * Smart Hook: useNavigationManagement
 *
 * Comprehensive navigation management hook that replaces NavigationContext.
 * Combines navigation filtering, loading state, and utility functions in a
 * single intelligent hook following the "Smart Hook, Dumb Component" pattern.
 *
 * Features:
 * - Role-based navigation filtering
 * - Active section detection
 * - Navigation state management
 * - Zustand-based state with optimized subscriptions
 *
 * This hook encapsulates all navigation logic while components remain
 * purely presentational.
 */
export function useNavigationManagement(userRole: UserRole | undefined) {
  const pathname = usePathname();
  const actions = useNavigationActions();

  // Get filtered navigation based on user role
  const filteredNavigation = useNavigationFilter(
    tourismAdminNavigation,
    userRole
  );

  // Utility functions
  const findActiveSection = useMemo(() => actions.findActiveSection, [actions]);
  // Check if section is expanded - delegated to sidebar store
  const isSectionExpanded = (sectionId: string) => {
    // This should be handled by the sidebar store
    console.warn(
      '[useNavigationManagement] isSectionExpanded should use useSidebarStore directly'
    );
    return false;
  };

  // Check if section is active - delegated to sidebar store
  const isSectionActive = (sectionId: string) => {
    // This should be handled by the sidebar store
    console.warn(
      '[useNavigationManagement] isSectionActive should use useSidebarStore directly'
    );
    return false;
  };

  // Navigation management functions - delegated to sidebar store
  const toggleExpand = (sectionId: string) => {
    console.warn(
      '[useNavigationManagement] toggleExpand should use useSidebarStore directly'
    );
  };

  const expandSection = (sectionId: string) => {
    console.warn(
      '[useNavigationManagement] expandSection should use useSidebarStore directly'
    );
  };

  const collapseSection = (sectionId: string) => {
    console.warn(
      '[useNavigationManagement] collapseSection should use useSidebarStore directly'
    );
  };

  const collapseAll = () => {
    console.warn(
      '[useNavigationManagement] collapseAll should use useSidebarStore directly'
    );
  };
  return {
    // State
    filteredNavigation,
    isLoading: false, // Navigation store manages this

    // Actions - deprecated, use useSidebarStore/useSidebarActions directly
    toggleExpand,
    expandSection,
    collapseSection,
    collapseAll,

    // Getters - deprecated, use useSidebarStore/useSidebarActions directly
    isSectionExpanded,
    isSectionActive,

    // Utils
    findActiveSection,
  };
}

/**
 * Legacy compatibility hook for components still using NavigationContext
 *
 * @deprecated Use useSidebarNavigation and useNavigationFilter directly
 */
export const useNavigationContext = useNavigationManagement;
