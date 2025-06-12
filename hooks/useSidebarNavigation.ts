// filepath: hooks/useSidebarNavigation.ts
import { useAuth } from '@/context/AuthContext';
import { useSidebarActions, useSidebarStore } from '@/stores';
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/types/supabase';
import { useCallback, useEffect } from 'react';

/**
 * Smart Hook: useSidebarNavigation
 *
 * Intelligent wrapper around sidebar store that handles:
 * - User-specific persistence
 * - Active section detection from pathname
 * - Auto-expansion for active routes
 * - Navigation item filtering by user role
 *
 * Follows the "Smart Hook, Dumb Component" pattern by encapsulating
 * all sidebar logic while components remain purely presentational.
 */
export function useSidebarNavigation(
  userRole: UserRole | undefined,
  pathname: string,
  filteredNavigation: NavigationItem[]
) {
  const { user } = useAuth();
  const sidebarState = useSidebarStore();
  const actions = useSidebarActions();

  // Load user-specific persisted state when user changes
  useEffect(() => {
    sidebarState._loadPersistedState(user?.id);
  }, [user?.id, sidebarState]);

  // Update user role when it changes
  useEffect(() => {
    actions.setUserRole(userRole);
  }, [userRole, actions]);

  // Persist state changes to storage
  useEffect(() => {
    const unsubscribe = useSidebarStore.subscribe(
      (state) => state.expandedSections,
      (expandedSections) => {
        // Debounce persistence to avoid excessive storage writes
        const timeoutId = setTimeout(() => {
          sidebarState._persistState(user?.id);
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    );

    return unsubscribe;
  }, [user?.id, sidebarState]);

  // Find active section based on current path
  const findActiveSection = useCallback(
    (
      items: NavigationItem[],
      path: string
    ): { section: string; subsection?: string } => {
      for (const item of items) {
        if (item.path === path) {
          return { section: item.id };
        }

        if (item.subsections) {
          const found = findActiveSection(item.subsections, path);
          if (found.section) {
            return { section: item.id, subsection: found.section };
          }
        }
      }
      return { section: '' };
    },
    []
  );

  // Update active section based on current route
  useEffect(() => {
    const { section, subsection } = findActiveSection(
      filteredNavigation,
      pathname
    );
    const activeSection = subsection || section;

    actions.setActiveSection(activeSection);

    // Auto-expand section containing active route
    if (section && !actions.isSectionExpanded(section)) {
      actions.autoExpandSection(section);
    }
  }, [pathname, filteredNavigation, findActiveSection, actions]);

  // Enhanced toggle expand with persistence
  const handleToggleExpand = useCallback(
    (sectionId: string) => {
      actions.toggleSection(sectionId);
      // Persistence is handled by the subscription above
    },
    [actions]
  );

  // Utility functions
  const isSectionExpanded = useCallback(
    (sectionId: string) => actions.isSectionExpanded(sectionId),
    [actions]
  );

  const isSectionActive = useCallback(
    (sectionId: string) => actions.isSectionActive(sectionId),
    [actions]
  );

  // Return only what components need
  return {
    // State
    sidebarState: {
      expandedSections: sidebarState.expandedSections,
      activeSection: sidebarState.activeSection,
      userRole: sidebarState.userRole,
    },

    // Actions
    handleToggleExpand,

    // Utils (for backward compatibility)
    isSectionExpanded,
    isSectionActive,
    findActiveSection,
  };
}
