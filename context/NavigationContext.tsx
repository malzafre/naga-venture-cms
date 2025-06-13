// filepath: context/NavigationContext.tsx

/**
 * MIGRATION NOTICE: NavigationContext → Zustand Stores
 *
 * This file has been migrated to use Zustand stores instead of React Context.
 * The NavigationProvider is no longer needed as Zustand provides global state.
 *
 * Migration Steps:
 * 1. Replace useNavigationContext() with useNavigationManagement()
 * 2. Remove <NavigationProvider> wrapper from component tree
 * 3. Import from '@/hooks/useNavigationManagement' instead
 *
 * Example:
 * Before: const { toggleExpand } = useNavigationContext();
 * After:  const { toggleExpand } = useNavigationManagement();
 */

import { useNavigationManagement } from '@/hooks/useNavigationManagement';
import { NavigationItem } from '@/types/navigation';
import { UserRole } from '@/types/supabase';

import React, { ReactNode } from 'react';

// Backward compatibility type - matches the new hook interface
interface NavigationContextType {
  // State
  filteredNavigation: NavigationItem[];
  isLoading: boolean;

  // Actions
  toggleExpand: (sectionId: string) => void;
  expandSection: (sectionId: string) => void;
  collapseSection: (sectionId: string) => void;
  collapseAll: () => void;

  // Getters
  isSectionExpanded: (sectionId: string) => boolean;
  isSectionActive: (sectionId: string) => boolean;

  // Utils
  findActiveSection: (
    items: NavigationItem[],
    path: string
  ) => { section: string; subsection?: string };
}

interface NavigationProviderProps {
  children: ReactNode;
  userRole?: UserRole;
}

/**
 * NavigationProvider - DEPRECATED - Use Zustand stores instead
 *
 * This provider is now a simple passthrough that doesn't provide any context.
 * Components should use the useNavigationManagement hook directly.
 *
 * @deprecated Use useNavigationManagement() hook directly instead
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  userRole: _userRole, // Ignored since Zustand manages this internally
}) => {
  // No context needed - Zustand manages state globally
  return <>{children}</>;
};

/**
 * Hook to access navigation context - DEPRECATED
 *
 * @deprecated Use useNavigationManagement() from '@/hooks/useNavigationManagement' instead
 * @returns Navigation management hooks
 */
export const useNavigationContext = (): NavigationContextType => {
  // Delegate to the Zustand-based hook for backward compatibility
  // Note: userRole is managed internally by the store, so we pass undefined
  return useNavigationManagement(undefined);
};
