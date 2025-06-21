import { usePathname } from 'expo-router';
import React from 'react';

import { tourismAdminNavigation } from '@/config/NavigationConfig';
import { useAuth } from '@/hooks/features/auth/useAuth';
import { NavigationService } from '@/services/NavigationService';
import { useSidebarActions, useSidebarStore } from '@/stores';
import { UserRole } from '@/types/supabase';
import {
  filterNavigationByRole,
  findActiveSection,
} from '@/utils/navigationUtils';

/**
 * Smart Hook: useSidebarLogic
 *
 * Following the "Smart Hook, Dumb Component" pattern from coding guidelines.
 * Contains ALL business logic for the sidebar component.
 *
 * Features:
 * - Role-based navigation filtering using pure utility functions
 * - Navigation state management via Zustand
 * - Route-based active section detection using pure utility functions
 * - Centralized navigation handling via NavigationService
 * - User session management
 */
export function useSidebarLogic(userRole?: UserRole) {
  const { signOut, user, userProfile } = useAuth();
  const pathname = usePathname();

  // Get state from Zustand store with optimized selectors
  const expandedSections = useSidebarStore((state) => state.expandedSections);
  const activeSection = useSidebarStore((state) => state.activeSection);

  // Get stable actions from Zustand
  const actions = useSidebarActions();

  // Filter navigation items based on user role using the pure utility function
  const filteredNavigation = React.useMemo(
    () => filterNavigationByRole(tourismAdminNavigation, userRole),
    [userRole]
  );

  // Create stable state object
  const sidebarState = React.useMemo(
    () => ({
      expandedSections,
      activeSection,
      userRole,
    }),
    [expandedSections, activeSection, userRole]
  );

  // Auto-expand and set active section based on current route
  React.useEffect(() => {
    const active = findActiveSection(filteredNavigation, pathname);
    if (active.section) {
      actions.setActiveSection(active.subsection || active.section);
      if (!actions.isSectionExpanded(active.section)) {
        actions.autoExpandSection(active.section);
      }
    }
  }, [pathname, filteredNavigation, actions]);

  // Track user ID in the sidebar store
  React.useEffect(() => {
    if (user?.id) {
      // This properly links the current user ID to the sidebar store
      useSidebarStore.getState().setCurrentUserId(user.id);
    }
  }, [user?.id]);

  // Update user role in store
  React.useEffect(() => {
    actions.setUserRole(userRole);
  }, [userRole, actions]);

  // Navigation handlers
  const handleNavigate = React.useCallback(
    (path: string, onNavigate?: (path: string) => void) => {
      if (onNavigate) {
        onNavigate(path);
      } else {
        // Use centralized NavigationService following guidelines
        NavigationService.navigate(path);
      }
    },
    []
  );

  // Stable toggle function using Zustand actions
  const handleToggleExpand = React.useCallback(
    (sectionId: string) => {
      actions.toggleSection(sectionId);
    },
    [actions]
  );

  // Handle sign out
  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
      // Use NavigationService method instead of magic strings
      NavigationService.toLogin();
    } catch (error) {
      if (__DEV__) {
        console.error('Sign out error:', error);
      }
    }
  }, [signOut]);

  return {
    // State
    sidebarState,
    filteredNavigation,
    user,
    userProfile,
    userRole,

    // Actions
    handleNavigate,
    handleToggleExpand,
    handleSignOut,

    // Utils
    actions,
  };
}
