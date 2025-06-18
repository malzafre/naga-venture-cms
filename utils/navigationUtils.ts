// filepath: utils/navigationUtils.ts
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/types/supabase';

/**
 * Navigation Utilities - Pure functions for navigation logic
 *
 * Extracted from navigation store to maintain pure function principles.
 * These utilities can be easily tested and don't depend on store state.
 */

/**
 * Find active section based on current path
 *
 * Recursively searches through navigation items to find the active section
 * and subsection based on the current route path.
 *
 * @param items - Array of navigation items to search
 * @param path - Current route path to match
 * @returns Object containing section and optional subsection IDs
 */
export const findActiveSection = (
  items: NavigationItem[],
  path: string
): { section: string; subsection?: string } => {
  for (const item of items) {
    // Direct path match
    if (item.path === path) {
      return { section: item.id };
    }

    // Search in subsections
    if (item.subsections) {
      const found = findActiveSection(item.subsections, path);
      if (found.section) {
        return { section: item.id, subsection: found.section };
      }
    }
  }

  // No match found
  return { section: '' };
};

/**
 * Filter navigation items based on user permissions
 *
 * Recursively filters navigation items based on user role permissions.
 * Removes items and subsections that the user doesn't have access to.
 *
 * @param items - Array of navigation items to filter
 * @param userRole - User role to check permissions against
 * @returns Filtered array of navigation items
 */
export const filterNavigationByRole = (
  items: NavigationItem[],
  userRole: UserRole | undefined
): NavigationItem[] => {
  if (!userRole) return [];

  return items
    .filter((item) => item.permissions.includes(userRole))
    .map((item) => ({
      ...item,
      subsections: item.subsections
        ? filterNavigationByRole(item.subsections, userRole)
        : undefined,
    }))
    .filter((item) => !item.subsections || item.subsections.length > 0);
};
