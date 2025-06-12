// filepath: hooks/useNavigationManagement.ts
import { tourismAdminNavigation } from '@/constants/NavigationConfig';
import { useNavigationActions, useNavigationFilter } from '@/stores';
import { UserRole } from '@/types/supabase';
import { usePathname } from 'expo-router';
import { useMemo } from 'react';

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
      '[useNavigationManagement] isSectionExpanded should use useSidebarNavigation hook'
    );
    return false;
  };

  // Check if section is active - delegated to sidebar store
  const isSectionActive = (sectionId: string) => {
    // This should be handled by the sidebar store
    console.warn(
      '[useNavigationManagement] isSectionActive should use useSidebarNavigation hook'
    );
    return false;
  };

  // Navigation management functions - delegated to sidebar store
  const toggleExpand = (sectionId: string) => {
    console.warn(
      '[useNavigationManagement] toggleExpand should use useSidebarNavigation hook'
    );
  };

  const expandSection = (sectionId: string) => {
    console.warn(
      '[useNavigationManagement] expandSection should use useSidebarNavigation hook'
    );
  };

  const collapseSection = (sectionId: string) => {
    console.warn(
      '[useNavigationManagement] collapseSection should use useSidebarNavigation hook'
    );
  };

  const collapseAll = () => {
    console.warn(
      '[useNavigationManagement] collapseAll should use useSidebarNavigation hook'
    );
  };

  return {
    // State
    filteredNavigation,
    isLoading: false, // Navigation store manages this

    // Actions - deprecated, use useSidebarNavigation instead
    toggleExpand,
    expandSection,
    collapseSection,
    collapseAll,

    // Getters - deprecated, use useSidebarNavigation instead
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
