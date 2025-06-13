// filepath: stores/themeStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'default' | 'blue' | 'green' | 'purple';

export interface ThemeState {
  // Theme settings
  mode: ThemeMode;
  colorScheme: ColorScheme;

  // UI preferences
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Layout preferences
  sidebarWidth: number;
  compactMode: boolean;

  // System preferences
  systemTheme: 'light' | 'dark';
}

export interface ThemeStore extends ThemeState {
  // Theme actions
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;

  // UI preference actions
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;

  // Layout actions
  setSidebarWidth: (width: number) => void;
  setCompactMode: (enabled: boolean) => void;

  // System actions
  setSystemTheme: (theme: 'light' | 'dark') => void;

  // Computed getters
  getCurrentTheme: () => 'light' | 'dark';

  // Persistence
  _loadPersistedPreferences: () => Promise<void>;
  _persistPreferences: () => Promise<void>;
}

// Initial state following design system constants
const initialState: ThemeState = {
  mode: 'system',
  colorScheme: 'default',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  sidebarWidth: 280,
  compactMode: false,
  systemTheme: 'light',
};

/**
 * Theme Store - Global state management for UI theme and preferences
 *
 * Manages theme mode, color schemes, accessibility preferences, and layout settings.
 * Implements persistent storage for user preferences across app sessions.
 *
 * Features:
 * - System theme detection and auto-switching
 * - Accessibility preferences (reduced motion, high contrast, font size)
 * - Layout customization (sidebar width, compact mode)
 * - Persistent user preferences
 * - Type-safe theme management
 */
export const useThemeStore = create<ThemeStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Theme actions
    setMode: (mode) => {
      const currentMode = get().mode;
      if (currentMode === mode) return; // Bailout condition

      set((state) => ({
        ...state,
        mode,
      }));
      get()._persistPreferences();
    },

    setColorScheme: (scheme) => {
      const currentScheme = get().colorScheme;
      if (currentScheme === scheme) return; // Bailout condition

      set((state) => ({
        ...state,
        colorScheme: scheme,
      }));
      get()._persistPreferences();
    },

    // UI preference actions
    setReducedMotion: (enabled) => {
      const current = get().reducedMotion;
      if (current === enabled) return; // Bailout condition

      set((state) => ({
        ...state,
        reducedMotion: enabled,
      }));
      get()._persistPreferences();
    },

    setHighContrast: (enabled) => {
      const current = get().highContrast;
      if (current === enabled) return; // Bailout condition

      set((state) => ({
        ...state,
        highContrast: enabled,
      }));
      get()._persistPreferences();
    },

    setFontSize: (size) => {
      const current = get().fontSize;
      if (current === size) return; // Bailout condition

      set((state) => ({
        ...state,
        fontSize: size,
      }));
      get()._persistPreferences();
    },

    // Layout actions
    setSidebarWidth: (width) => {
      // Constrain sidebar width to reasonable bounds
      const constrainedWidth = Math.max(240, Math.min(400, width));

      set((state) => ({
        ...state,
        sidebarWidth: constrainedWidth,
      }));
      get()._persistPreferences();
    },

    setCompactMode: (enabled) => {
      set((state) => ({
        ...state,
        compactMode: enabled,
      }));
      get()._persistPreferences();
    },

    // System actions
    setSystemTheme: (theme) => {
      set((state) => ({
        ...state,
        systemTheme: theme,
      }));
    },

    // Computed getters
    getCurrentTheme: () => {
      const { mode, systemTheme } = get();

      if (mode === 'system') {
        return systemTheme;
      }

      return mode;
    },

    // Persistence methods
    _loadPersistedPreferences: async () => {
      try {
        const AsyncStorage = await import(
          '@react-native-async-storage/async-storage'
        );
        const key = '@TourismCMS:ThemePreferences';
        const stored = await AsyncStorage.default.getItem(key);

        if (stored !== null) {
          const parsed = JSON.parse(stored);

          // Validate and apply persisted preferences
          set((state) => ({
            ...state,
            mode: parsed.mode || state.mode,
            colorScheme: parsed.colorScheme || state.colorScheme,
            reducedMotion: parsed.reducedMotion ?? state.reducedMotion,
            highContrast: parsed.highContrast ?? state.highContrast,
            fontSize: parsed.fontSize || state.fontSize,
            sidebarWidth:
              typeof parsed.sidebarWidth === 'number'
                ? Math.max(240, Math.min(400, parsed.sidebarWidth))
                : state.sidebarWidth,
            compactMode: parsed.compactMode ?? state.compactMode,
          }));
        }
      } catch (error) {
        console.warn(
          '[ThemeStore] Failed to load persisted preferences:',
          error
        );
      }
    },

    _persistPreferences: async () => {
      try {
        const AsyncStorage = await import(
          '@react-native-async-storage/async-storage'
        );
        const key = '@TourismCMS:ThemePreferences';
        const {
          mode,
          colorScheme,
          reducedMotion,
          highContrast,
          fontSize,
          sidebarWidth,
          compactMode,
        } = get();

        const preferences = {
          mode,
          colorScheme,
          reducedMotion,
          highContrast,
          fontSize,
          sidebarWidth,
          compactMode,
        };

        await AsyncStorage.default.setItem(key, JSON.stringify(preferences));
      } catch (error) {
        console.warn('[ThemeStore] Failed to persist preferences:', error);
      }
    },
  }))
);

/**
 * Selector hooks for optimized component subscriptions
 */

// Get current theme (most commonly used)
export const useCurrentTheme = () =>
  useThemeStore((state) => state.getCurrentTheme());

// Get theme mode and color scheme
export const useThemeSettings = () =>
  useThemeStore(
    useShallow((state) => ({
      mode: state.mode,
      colorScheme: state.colorScheme,
    }))
  );

// Get accessibility preferences
export const useAccessibilityPreferences = () =>
  useThemeStore(
    useShallow((state) => ({
      reducedMotion: state.reducedMotion,
      highContrast: state.highContrast,
      fontSize: state.fontSize,
    }))
  );

// Get layout preferences
export const useLayoutPreferences = () =>
  useThemeStore(
    useShallow((state) => ({
      sidebarWidth: state.sidebarWidth,
      compactMode: state.compactMode,
    }))
  );

// Get theme actions (stable reference)
export const useThemeActions = () =>
  useThemeStore(
    useShallow((state) => ({
      setMode: state.setMode,
      setColorScheme: state.setColorScheme,
      setReducedMotion: state.setReducedMotion,
      setHighContrast: state.setHighContrast,
      setFontSize: state.setFontSize,
      setSidebarWidth: state.setSidebarWidth,
      setCompactMode: state.setCompactMode,
      setSystemTheme: state.setSystemTheme,
    }))
  );
