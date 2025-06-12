// filepath: stores/sidebarStore.ts
import { SidebarState } from '@/types/navigation';
import { UserRole } from '@/types/supabase';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface SidebarStore extends SidebarState {
  // Actions
  setActiveSection: (section: string) => void;
  toggleSection: (sectionId: string) => void;
  setExpandedSections: (sections: string[]) => void;
  autoExpandSection: (sectionId: string) => void;
  setUserRole: (role: UserRole | undefined) => void;

  // Utils
  isSectionExpanded: (sectionId: string) => boolean;
  isSectionActive: (sectionId: string) => boolean;

  // Internal methods for persistence
  _loadPersistedState: (userId: string | null | undefined) => Promise<void>;
  _persistState: (userId: string | null | undefined) => Promise<void>;
}

// Initial state
const initialState: SidebarState = {
  expandedSections: [],
  activeSection: '',
  userRole: undefined,
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

        return {
          ...state,
          expandedSections: newExpandedSections,
        };
      });
    },

    setExpandedSections: (sections: string[]) => {
      set((state) => ({
        ...state,
        expandedSections: [...sections],
      }));
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

    // Utils
    isSectionExpanded: (sectionId: string) => {
      return get().expandedSections.includes(sectionId);
    },

    isSectionActive: (sectionId: string) => {
      return get().activeSection === sectionId;
    },

    // Internal persistence methods
    _loadPersistedState: async (userId: string | null | undefined) => {
      try {
        const AsyncStorage = await import(
          '@react-native-async-storage/async-storage'
        );
        const key = `@TourismCMS:ExpandedSections:${userId || 'guest'}`;
        const stored = await AsyncStorage.default.getItem(key);

        if (stored !== null) {
          const parsed = JSON.parse(stored);
          set((state) => ({
            ...state,
            expandedSections: Array.isArray(parsed) ? parsed : [],
          }));
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
        const key = `@TourismCMS:ExpandedSections:${userId || 'guest'}`;
        const { expandedSections } = get();
        await AsyncStorage.default.setItem(
          key,
          JSON.stringify(expandedSections)
        );
      } catch (error) {
        console.warn('[SidebarStore] Failed to persist state:', error);
      }
    },
  }))
);

/**
 * Selector hooks for optimized component subscriptions
 */

// Get only expanded sections (most commonly used)
export const useExpandedSections = () =>
  useSidebarStore((state) => state.expandedSections);

// Get only active section
export const useActiveSection = () =>
  useSidebarStore((state) => state.activeSection);

// Get sidebar actions (stable reference)
export const useSidebarActions = () =>
  useSidebarStore((state) => ({
    setActiveSection: state.setActiveSection,
    toggleSection: state.toggleSection,
    setExpandedSections: state.setExpandedSections,
    autoExpandSection: state.autoExpandSection,
    setUserRole: state.setUserRole,
    isSectionExpanded: state.isSectionExpanded,
    isSectionActive: state.isSectionActive,
  }));

// Get complete sidebar state (use sparingly)
export const useSidebarState = () =>
  useSidebarStore((state) => ({
    expandedSections: state.expandedSections,
    activeSection: state.activeSection,
    userRole: state.userRole,
  }));
