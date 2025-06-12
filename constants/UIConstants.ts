// filepath: constants/UIConstants.ts

/**
 * UI Constants
 * Centralized UI-related constants for consistent design and behavior
 * Following coding guidelines to eliminate magic strings and numbers
 */

export const UI_CONSTANTS = {
  // Animation Durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
    VERY_SLOW: 500,
    SIDEBAR_TOGGLE: 300,
    MODAL_TRANSITION: 200,
    FADE_IN: 300,
    SLIDE_IN: 250,
  },

  // Component Sizes
  SIZES: {
    BUTTON_HEIGHT: {
      SMALL: 32,
      MEDIUM: 40,
      LARGE: 48,
    },
    INPUT_HEIGHT: {
      SMALL: 36,
      MEDIUM: 44,
      LARGE: 52,
    },
    SIDEBAR_WIDTH: {
      COLLAPSED: 60,
      EXPANDED: 280,
    },
    HEADER_HEIGHT: 64,
    FOOTER_HEIGHT: 48,
    CARD_BORDER_RADIUS: 8,
    BUTTON_BORDER_RADIUS: 6,
    INPUT_BORDER_RADIUS: 4,
  },

  // Spacing (following 8px grid system)
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
    XXXL: 64,
  },

  // Z-Index Layers
  Z_INDEX: {
    BACKGROUND: -1,
    NORMAL: 0,
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080,
    LOADING_OVERLAY: 1090,
  },

  // Breakpoints for responsive design
  BREAKPOINTS: {
    MOBILE: 320,
    TABLET: 768,
    DESKTOP: 1024,
    LARGE_DESKTOP: 1440,
  },

  // Form Validation
  VALIDATION: {
    DEBOUNCE_DELAY: 300,
    ERROR_DISPLAY_DURATION: 5000,
    SUCCESS_MESSAGE_DURATION: 3000,
  },

  // Loading States
  LOADING: {
    SKELETON_ANIMATION_DURATION: 1500,
    MINIMUM_LOADING_TIME: 500,
    TIMEOUT_DURATION: 30000,
  },

  // Image Handling
  IMAGE: {
    PLACEHOLDER_BLUR_RADIUS: 10,
    LAZY_LOAD_THRESHOLD: 100,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },

  // List/Table Configuration
  LIST: {
    ESTIMATED_ITEM_SIZE: 80,
    OVERSCAN_COUNT: 5,
    INITIAL_NUM_TO_RENDER: 10,
    MAX_TO_RENDER_PER_BATCH: 10,
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  } as const,

  // Modal Sizes
  MODAL_SIZES: {
    SMALL: { width: 400, height: 300 },
    MEDIUM: { width: 600, height: 400 },
    LARGE: { width: 800, height: 600 },
    EXTRA_LARGE: { width: 1000, height: 700 },
  },
} as const;

export type UIConstants = typeof UI_CONSTANTS;
