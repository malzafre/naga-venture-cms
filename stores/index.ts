// filepath: stores/index.ts
/**
 * Zustand Stores - Centralized State Management
 *
 * Feature-based store organization following the "Smart Hook, Dumb Component" pattern.
 * Each store manages a specific domain of application state with type-safe actions and selectors.
 * * Architecture:
 * - Sidebar Store: Navigation state and user-specific persistence
 * - Business Filter Store: Business listing filters with debounced search
 * - Theme Store: UI preferences and accessibility settings
 * - Navigation Store: Navigation filtering and utility functions
 *
 * Best Practices:
 * - Use selector hooks for optimized subscriptions
 * - Leverage subscribeWithSelector for fine-grained updates
 * - Implement persistence where appropriate
 * - Follow immutable update patterns
 */

// Store exports
export {
  useActiveSection,
  useExpandedSections,
  useSidebarActions,
  useSidebarState,
  useSidebarStore,
  type SidebarStore,
} from './sidebarStore';

export {
  useBusinessFilterActions,
  useBusinessFilters,
  useBusinessFilterState,
  useBusinessFilterStore,
  useBusinessFilterUI,
  useBusinessSearch,
  type BusinessFilterState,
  type BusinessFilterStore,
} from './businessFilterStore';

export {
  useAccessibilityPreferences,
  useCurrentTheme,
  useLayoutPreferences,
  useThemeActions,
  useThemeSettings,
  useThemeStore,
  type ColorScheme,
  type ThemeMode,
  type ThemeState,
  type ThemeStore,
} from './themeStore';

export {
  useFilteredNavigation,
  useNavigationActions,
  useNavigationFilter,
  useNavigationLoading,
  useNavigationStore,
  type NavigationStore,
} from './navigationStore';

/**
 * Store initialization utilities
 */

/**
 * Initialize all stores with persisted data
 * Call this once during app startup after authentication is established
 */
export const initializeStores = async (userId?: string | null) => {
  try {
    // Dynamic imports to avoid circular dependencies
    const { useSidebarStore } = await import('./sidebarStore');
    const { useThemeStore } = await import('./themeStore');

    // Initialize sidebar store with user-specific data
    await useSidebarStore.getState()._loadPersistedState(userId);

    // Initialize theme store
    await useThemeStore.getState()._loadPersistedPreferences();

    // eslint-disable-next-line no-console
    console.log('[Stores] Successfully initialized all stores');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Stores] Failed to initialize stores:', error);
  }
};

/**
 * Clean up store subscriptions and timers
 * Call this during app shutdown or user logout
 */
export const cleanupStores = async () => {
  try {
    // Dynamic imports to avoid circular dependencies
    const { useBusinessFilterStore } = await import('./businessFilterStore');

    // Clear any pending debounce timers in business filter store
    useBusinessFilterStore.getState()._clearDebounceTimer();

    // eslint-disable-next-line no-console
    console.log('[Stores] Successfully cleaned up stores');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Stores] Failed to cleanup stores:', error);
  }
};

/**
 * Reset all user-specific store data
 * Call this during user logout to clear personalized state
 */
export const resetUserStores = async () => {
  try {
    // Dynamic imports to avoid circular dependencies
    const { useSidebarStore } = await import('./sidebarStore');
    const { useBusinessFilterStore } = await import('./businessFilterStore');
    const { useNavigationStore } = await import('./navigationStore');

    // Reset sidebar state
    useSidebarStore.setState({
      expandedSections: [],
      activeSection: '',
      userRole: undefined,
    });

    // Reset business filters
    useBusinessFilterStore.getState().resetFilters();

    // Reset navigation state
    useNavigationStore.getState().setFilteredNavigation([]);
    useNavigationStore.getState().setLoading(true);

    // eslint-disable-next-line no-console
    console.log('[Stores] Successfully reset user-specific stores');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Stores] Failed to reset user stores:', error);
  }
};
