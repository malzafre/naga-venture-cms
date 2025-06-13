import { usePathname } from 'expo-router';
import React from 'react';

import { tourismAdminNavigation } from '@/constants/NavigationConfig';
import { NavigationService } from '@/constants/NavigationService';
import { useAuth } from '@/context/AuthContext';
import { useSidebarActions, useSidebarStore } from '@/stores';
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/types/supabase';

/**
 * Smart Hook: useSidebarLogic
 *
 * Following the "Smart Hook, Dumb Component" pattern from coding guidelines.
 * Contains ALL business logic for the sidebar component.
 *
 * Features:
 * - Role-based navigation filtering
 * - Navigation state management
 * - Route-based active section detection
 * - Centralized navigation handling
 * - User session management
 */
export function useSidebarLogic(userRole?: UserRole) {
  const { signOut, user, userProfile } = useAuth();
  const pathname = usePathname();

  // Get state from Zustand store with optimized selectors
  const expandedSections = useSidebarStore((state) => state.expandedSections);
  const activeSection = useSidebarStore((state) => state.activeSection);

  // Get stable actions
  const actions = useSidebarActions();

  // Filter navigation items based on user role
  const filteredNavigation = React.useMemo(() => {
    if (!userRole) return [];

    const filterByPermissions = (items: NavigationItem[]): NavigationItem[] => {
      return items
        .filter((item) => item.permissions.includes(userRole))
        .map((item) => ({
          ...item,
          subsections: item.subsections
            ? filterByPermissions(item.subsections)
            : undefined,
        }))
        .filter((item) => !item.subsections || item.subsections.length > 0);
    };

    return filterByPermissions(tourismAdminNavigation);
  }, [userRole]);

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
    const findActiveSection = (
      items: NavigationItem[],
      path: string
    ): string => {
      for (const item of items) {
        if (item.path === path) {
          actions.setActiveSection(item.id);
          if (!actions.isSectionExpanded(item.id)) {
            actions.autoExpandSection(item.id);
          }
          return item.id;
        }
        if (item.subsections) {
          const found = findActiveSection(item.subsections, path);
          if (found) {
            actions.setActiveSection(found);
            if (!actions.isSectionExpanded(item.id)) {
              actions.autoExpandSection(item.id);
            }
            return found;
          }
        }
      }
      return '';
    };

    findActiveSection(filteredNavigation, pathname);
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
