// filepath: stores/index.ts
/**
 * Zustand Stores - Centralized State Management
 *
 * Domain-organized store architecture following the "Smart Hook, Dumb Component" pattern.
 * Each store manages a specific domain of application state with type-safe actions and selectors.
 *
 * Architecture:
 * - auth/: Authentication session state (UI state only, business logic in TanStack Query)
 * - ui/: User interface state management
 *   - sidebarStore: Navigation UI state and user-specific persistence
 *   - themeStore: UI preferences and accessibility settings
 *   - businessFilterStore: Business listing filters with debounced search
 * - navigation/: Navigation state management (pure state only, logic in hooks)
 *
 * Best Practices:
 * - Use selector hooks for optimized subscriptions
 * - Leverage subscribeWithSelector for fine-grained updates
 * - Implement persistence where appropriate
 * - Follow immutable update patterns
 * - Separate business logic from UI state management
 */

// Store exports
export {
  useAuthActions,
  useAuthError,
  useAuthIsLoading,
  useAuthLoading,
  useAuthSession,
  useAuthStore,
  type AuthState,
  type AuthStore,
} from './auth/authStore';

export {
  useActiveSection,
  useExpandedSections,
  useSidebarActions,
  useSidebarStore,
  type SidebarStore,
} from './ui/sidebarStore';

export {
  useBusinessFilterActions,
  useBusinessFilterState,
  useBusinessFilterStore,
  useBusinessFilterUI,
  useBusinessFilters,
  useBusinessSearch,
  type BusinessFilterState,
  type BusinessFilterStore,
} from './ui/businessFilterStore';

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
} from './ui/themeStore';

export {
  useFilteredNavigation,
  useNavigationActions,
  useNavigationLoading,
  useNavigationState,
  useNavigationStore,
  type NavigationState,
  type NavigationStore,
} from './navigation/navigationStore';

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
    const { useSidebarStore } = await import('./ui/sidebarStore');
    const { useThemeStore } = await import('./ui/themeStore');

    // Initialize sidebar store with user-specific data
    await useSidebarStore.getState()._loadPersistedState(userId);

    // Initialize theme store
    await useThemeStore.getState()._loadPersistedPreferences();

    console.log('[Stores] Successfully initialized all stores');
  } catch (error) {
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
    const { useBusinessFilterStore } = await import('./ui/businessFilterStore');

    // Clear any pending debounce timers in business filter store
    useBusinessFilterStore.getState()._clearDebounceTimer();

    console.log('[Stores] Successfully cleaned up stores');
  } catch (error) {
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
    const { useSidebarStore } = await import('./ui/sidebarStore');
    const { useBusinessFilterStore } = await import('./ui/businessFilterStore');
    const { useNavigationStore } = await import('./navigation/navigationStore');

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

    console.log('[Stores] Successfully reset user-specific stores');
  } catch (error) {
    console.error('[Stores] Failed to reset user stores:', error);
  }
};
