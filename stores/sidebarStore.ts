// filepath: stores/sidebarStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { SidebarState } from '@/types/navigation';
import { UserRole } from '@/types/supabase';

export interface SidebarStore extends SidebarState {
  currentUserId: string | null | undefined; // Added
  // Actions
  setActiveSection: (section: string) => void;
  toggleSection: (sectionId: string) => void;
  setExpandedSections: (sections: string[]) => void;
  autoExpandSection: (sectionId: string) => void;
  setUserRole: (role: UserRole | undefined) => void;
  setCurrentUserId: (userId: string | null | undefined) => void; // Added

  // Utils
  isSectionExpanded: (sectionId: string) => boolean;
  isSectionActive: (sectionId: string) => boolean;

  // Internal methods for persistence
  _loadPersistedState: (userId: string | null | undefined) => Promise<void>;
  _persistState: (userId: string | null | undefined) => Promise<void>;
}

// Initial state
const initialState: SidebarState & {
  currentUserId: string | null | undefined;
} = {
  // Modified to include currentUserId and corrected type
  expandedSections: [],
  activeSection: '',
  userRole: undefined,
  currentUserId: undefined, // Added
};

/**
 * Sidebar Store - Global state management for sidebar navigation
 *
 * Manages sidebar expand/collapse state, active sections, and user role-based navigation.
 * Implements user-specific persistence for expanded sections.
 *
 * Features:
 * - User-specific state persistence
 * - Auto-expansion for active routes
 * - Immutable state updates
 * - Type-safe actions and selectors
 */
export const useSidebarStore = create<SidebarStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Actions
    setActiveSection: (section: string) => {
      const current = get().activeSection;
      if (current === section) return; // Bailout condition

      set((state) => ({
        ...state,
        activeSection: section,
      }));
    },
    toggleSection: (sectionId: string) => {
      set((state) => {
        const isExpanded = state.expandedSections.includes(sectionId);
        const newExpandedSections = isExpanded
          ? state.expandedSections.filter((id) => id !== sectionId)
          : [...state.expandedSections, sectionId];

        console.log(
          `[SidebarStore] Toggle section: ${sectionId}, was ${isExpanded ? 'expanded' : 'collapsed'}, now ${!isExpanded ? 'expanded' : 'collapsed'}`
        );
        console.log(
          '[SidebarStore] New expanded sections:',
          newExpandedSections
        );

        return {
          ...state,
          expandedSections: newExpandedSections,
        };
      });
      get()._persistState(get().currentUserId); // Added: Persist after state update
    },

    setExpandedSections: (sections: string[]) => {
      set((state) => ({
        ...state,
        expandedSections: [...sections],
      }));
      get()._persistState(get().currentUserId); // Added: Persist after state update
    },

    autoExpandSection: (sectionId: string) => {
      set((state) => {
        if (state.expandedSections.includes(sectionId)) {
          return state; // No change needed
        }

        return {
          ...state,
          expandedSections: [...state.expandedSections, sectionId],
        };
      });
    },

    setUserRole: (role: UserRole | undefined) => {
      set((state) => ({
        ...state,
        userRole: role,
      }));
    },

    setCurrentUserId: (userId: string | null | undefined) => {
      set({ currentUserId: userId });
      if (userId) {
        // User logged in
        console.log(
          `[SidebarStore] setCurrentUserId: User logged in - ${userId}. Loading persisted state.`
        );
        get()._loadPersistedState(userId);
      } else {
        // User logged out or no user
        console.log(
          '[SidebarStore] setCurrentUserId: User logged out or no user. Resetting store.'
        );
        set({
          expandedSections: initialState.expandedSections,
          activeSection: initialState.activeSection,
          userRole: initialState.userRole, // Reset userRole as well
        });
        // Optionally, persist this reset state for an 'anonymous' key or clear it.
        // For now, resetting in-memory is the primary goal. The next anonymous load
        // will find nothing if the specific anonymous key isn't explicitly cleared or set to [].
      }
    },

    // Utils
    isSectionExpanded: (sectionId: string) => {
      return get().expandedSections.includes(sectionId);
    },

    isSectionActive: (sectionId: string) => {
      return get().activeSection === sectionId;
    }, // Internal persistence methods - FIXED
    _loadPersistedState: async (userId: string | null | undefined) => {
      try {
        const AsyncStorage = await import(
          '@react-native-async-storage/async-storage'
        );
        const key = `@TourismCMS:ExpandedSections:${userId || 'anonymous'}`;
        const stored = await AsyncStorage.default.getItem(key);

        console.log(
          `[SidebarStore] Loading state for user: ${userId || 'anonymous'}, stored:`,
          stored
        );

        if (stored !== null) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            set((state) => ({
              ...state,
              expandedSections: parsed,
            }));
            console.log(
              `[SidebarStore] Loaded ${parsed.length} expanded sections:`,
              parsed
            );
          }
        } else {
          // FIX: Reset to empty if no stored state
          set((state) => ({
            ...state,
            expandedSections: [],
          }));
          console.log('[SidebarStore] No stored state found, reset to empty');
        }
      } catch (error) {
        console.warn('[SidebarStore] Failed to load persisted state:', error);
      }
    },

    _persistState: async (userId: string | null | undefined) => {
      try {
        const AsyncStorage = await import(
          '@react-native-async-storage/async-storage'
        );
        const key = `@TourismCMS:ExpandedSections:${userId || 'anonymous'}`;
        const { expandedSections } = get();

        await AsyncStorage.default.setItem(
          key,
          JSON.stringify(expandedSections)
        );

        console.log(
          `[SidebarStore] Persisted state for user: ${userId || 'anonymous'}, sections:`,
          expandedSections
        );
      } catch (error) {
        console.warn('[SidebarStore] Failed to persist state:', error);
      }
    },
  }))
);

/**
 * ✅ MODERNIZED SELECTOR HOOKS - Prevent infinite loops with stable references and useShallow
 */

// Get only expanded sections (most commonly used)
export const useExpandedSections = () =>
  useSidebarStore((state) => state.expandedSections);

// Get only active section
export const useActiveSection = () =>
  useSidebarStore((state) => state.activeSection);

// Get user role only
export const useSidebarUserRole = () =>
  useSidebarStore((state) => state.userRole);

// Get complete sidebar state (use sparingly) - Updated with useShallow
export const useSidebarState = () =>
  useSidebarStore(
    useShallow((state) => ({
      expandedSections: state.expandedSections,
      activeSection: state.activeSection,
      userRole: state.userRole,
    }))
  );

// Get navigation state for menu components
export const useSidebarNavigation = () =>
  useSidebarStore(
    useShallow((state) => ({
      expandedSections: state.expandedSections,
      activeSection: state.activeSection,
      isSectionExpanded: state.isSectionExpanded,
      isSectionActive: state.isSectionActive,
    }))
  );

// Get all sidebar actions (stable reference) - MODERNIZED with useShallow
export const useSidebarActions = () =>
  useSidebarStore(
    useShallow((state) => ({
      setActiveSection: state.setActiveSection,
      toggleSection: state.toggleSection,
      setExpandedSections: state.setExpandedSections,
      autoExpandSection: state.autoExpandSection,
      setUserRole: state.setUserRole,
      setCurrentUserId: state.setCurrentUserId,
    }))
  );
