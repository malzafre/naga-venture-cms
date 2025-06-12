// filepath: constants/CacheConstants.ts

/**
 * Enhanced Cache Constants - Phase 3 Optimization
 *
 * Advanced cache configuration for TanStack Query with optimized patterns.
 * Provides granular cache control, smart invalidation strategies, and performance presets.
 *
 * Features:
 * - Domain-specific cache configurations
 * - Stale-while-revalidate patterns
 * - Optimistic update settings
 * - Background refetching strategies
 * - Memory management presets
 */

export const CACHE_CONSTANTS = {
  // Query Key Prefixes (aligned with enhanced queryKeys)
  QUERY_KEYS: {
    BUSINESSES: 'businesses',
    USERS: 'users',
    CATEGORIES: 'categories',
    TOURIST_SPOTS: 'tourist-spots',
    EVENTS: 'events',
    BOOKINGS: 'bookings',
    REVIEWS: 'reviews',
    PROMOTIONS: 'promotions',
    ANALYTICS: 'analytics',
    SYSTEM: 'system',

    // Legacy support
    SHOPS: 'shops',
    SPECIAL_OFFERS: 'specialOffers',
    AUTH: 'auth',
  },

  // Stale Times - How long data is considered fresh (Phase 3 Enhanced)
  STALE_TIME: {
    // Real-time data (frequently changing)
    IMMEDIATE: 0,
    VERY_SHORT: 10 * 1000, // 10 seconds
    SHORT: 30 * 1000, // 30 seconds

    // Semi-static data (moderate change frequency)
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 15 * 60 * 1000, // 15 minutes
    VERY_LONG: 30 * 60 * 1000, // 30 minutes

    // Static data (rarely changes)
    EXTENDED: 60 * 60 * 1000, // 1 hour
    PERSISTENT: 4 * 60 * 60 * 1000, // 4 hours
    ETERNAL: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Garbage Collection Times - How long unused data stays in cache
  GC_TIME: {
    TRANSIENT: 1 * 60 * 1000, // 1 minute
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 10 * 60 * 1000, // 10 minutes
    LONG: 30 * 60 * 1000, // 30 minutes
    EXTENDED: 60 * 60 * 1000, // 1 hour
    PERSISTENT: 4 * 60 * 60 * 1000, // 4 hours
    PERMANENT: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Refetch Intervals for Background Updates
  REFETCH_INTERVAL: {
    DISABLED: false,
    REAL_TIME: 5 * 1000, // 5 seconds
    FREQUENT: 30 * 1000, // 30 seconds
    MODERATE: 2 * 60 * 1000, // 2 minutes
    OCCASIONAL: 5 * 60 * 1000, // 5 minutes
    RARE: 15 * 60 * 1000, // 15 minutes
    HOURLY: 60 * 60 * 1000, // 1 hour
  },

  // Retry Configuration
  RETRY: {
    NONE: 0,
    MINIMAL: 1,
    STANDARD: 2,
    AGGRESSIVE: 3,
    PERSISTENT: 5,
  },

  // Domain-Specific Cache Presets (Phase 3 Innovation)
  PRESETS: {
    // Static Reference Data (categories, system config)
    STATIC_DATA: {
      staleTime: 60 * 60 * 1000, // 1 hour
      gcTime: 4 * 60 * 60 * 1000, // 4 hours
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
    },

    // Dynamic Business Data (business listings, user profiles)
    DYNAMIC_DATA: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: false,
    },

    // Real-Time Data (live notifications, active bookings)
    REAL_TIME_DATA: {
      staleTime: 0, // Always stale
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 30 * 1000, // 30 seconds
    },

    // User-Specific Data (preferences, personal settings)
    USER_DATA: {
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 60 * 60 * 1000, // 1 hour
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
    },

    // Analytics Data (statistics, reports)
    ANALYTICS_DATA: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },

    // Heavy Data (large lists, detailed reports)
    HEAVY_DATA: {
      staleTime: 30 * 60 * 1000, // 30 minutes
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },

    // System Data (health checks, configuration)
    SYSTEM_DATA: {
      staleTime: 2 * 60 * 60 * 1000, // 2 hours
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
    },

    // Search Results (temporary, user-driven)
    SEARCH_DATA: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },

  // Optimistic Update Configuration
  OPTIMISTIC: {
    // Enable optimistic updates for these operations
    ENABLED_OPERATIONS: [
      'create_business',
      'update_business',
      'create_review',
      'update_user_profile',
      'toggle_business_status',
    ],

    // Rollback timeout for failed optimistic updates
    ROLLBACK_TIMEOUT: 5000, // 5 seconds

    // Maximum number of optimistic updates to queue
    MAX_QUEUE_SIZE: 10,
  },

  // Background Sync Configuration
  BACKGROUND_SYNC: {
    // Enable background refetching for critical data
    CRITICAL_QUERIES: [
      'businesses.pending',
      'bookings.active',
      'reviews.pending',
      'system.notifications',
    ],

    // Sync intervals for different priority levels
    PRIORITY_INTERVALS: {
      HIGH: 30 * 1000, // 30 seconds
      MEDIUM: 2 * 60 * 1000, // 2 minutes
      LOW: 10 * 60 * 1000, // 10 minutes
    },
  },

  // Cache Size Management
  CACHE_MANAGEMENT: {
    // Maximum cache size (approximate)
    MAX_CACHE_SIZE_MB: 50,

    // Cleanup thresholds
    CLEANUP_THRESHOLD: 0.8, // Start cleanup at 80% capacity
    TARGET_CLEANUP: 0.6, // Clean down to 60% capacity

    // Priority for cache eviction (lower = higher priority to keep)
    EVICTION_PRIORITY: {
      SYSTEM_DATA: 1,
      USER_DATA: 2,
      STATIC_DATA: 3,
      DYNAMIC_DATA: 4,
      ANALYTICS_DATA: 5,
      SEARCH_DATA: 6,
      REAL_TIME_DATA: 7, // Highest priority for eviction
    },
  },

  // Network-Aware Configuration
  NETWORK_AWARE: {
    // Adjust behavior based on connection quality
    SLOW_CONNECTION: {
      staleTimeMultiplier: 2, // Double stale times
      retryDelay: 2000, // Longer retry delays
      refetchInterval: false, // Disable background refetch
    },

    OFFLINE_MODE: {
      staleTimeMultiplier: 10, // Much longer stale times
      retry: 0, // No retries when offline
      refetchInterval: false,
    },
  },
} as const;

// Cache Configuration Helpers
export const getCacheConfig = (
  preset: keyof typeof CACHE_CONSTANTS.PRESETS
) => {
  return CACHE_CONSTANTS.PRESETS[preset];
};

// Domain-specific cache configurations
export const DOMAIN_CACHE_CONFIG = {
  businesses: getCacheConfig('DYNAMIC_DATA'),
  users: getCacheConfig('USER_DATA'),
  categories: getCacheConfig('STATIC_DATA'),
  touristSpots: getCacheConfig('DYNAMIC_DATA'),
  events: getCacheConfig('DYNAMIC_DATA'),
  bookings: getCacheConfig('REAL_TIME_DATA'),
  reviews: getCacheConfig('DYNAMIC_DATA'),
  promotions: getCacheConfig('DYNAMIC_DATA'),
  analytics: getCacheConfig('ANALYTICS_DATA'),
  system: getCacheConfig('SYSTEM_DATA'),
  search: getCacheConfig('SEARCH_DATA'),
} as const;

// Utility functions for cache management
export const cacheUtils = {
  // Get appropriate cache config based on data type
  getConfigForDataType: (dataType: keyof typeof DOMAIN_CACHE_CONFIG) => {
    return DOMAIN_CACHE_CONFIG[dataType];
  },

  // Create optimistic update configuration
  createOptimisticConfig: (operation: string) => ({
    enabled: CACHE_CONSTANTS.OPTIMISTIC.ENABLED_OPERATIONS.includes(operation),
    rollbackTimeout: CACHE_CONSTANTS.OPTIMISTIC.ROLLBACK_TIMEOUT,
  }),

  // Calculate stale time based on network conditions
  getNetworkAwareStaleTime: (
    baseStaleTime: number,
    connectionQuality: 'fast' | 'slow' | 'offline'
  ) => {
    switch (connectionQuality) {
      case 'slow':
        return (
          baseStaleTime *
          CACHE_CONSTANTS.NETWORK_AWARE.SLOW_CONNECTION.staleTimeMultiplier
        );
      case 'offline':
        return (
          baseStaleTime *
          CACHE_CONSTANTS.NETWORK_AWARE.OFFLINE_MODE.staleTimeMultiplier
        );
      default:
        return baseStaleTime;
    }
  },

  // Get retry configuration based on operation importance
  getRetryConfig: (importance: 'critical' | 'normal' | 'low') => {
    switch (importance) {
      case 'critical':
        return CACHE_CONSTANTS.RETRY.PERSISTENT;
      case 'normal':
        return CACHE_CONSTANTS.RETRY.STANDARD;
      case 'low':
        return CACHE_CONSTANTS.RETRY.MINIMAL;
    }
  },
} as const;

export type CacheConstants = typeof CACHE_CONSTANTS;
export type CachePreset = keyof typeof CACHE_CONSTANTS.PRESETS;
export type DomainCacheConfig = typeof DOMAIN_CACHE_CONFIG;
