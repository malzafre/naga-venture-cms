// filepath: constants/ApiConstants.ts

/**
 * API Constants
 * Centralized configuration for all API-related constants
 * Following coding guidelines to eliminate magic strings and numbers
 */

export const API_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 5,
  },
  CACHE_TIMES: {
    // Business-related cache times (in milliseconds)
    BUSINESSES: 5 * 60 * 1000, // 5 minutes
    BUSINESS_DETAIL: 10 * 60 * 1000, // 10 minutes

    // Category cache times
    CATEGORIES: 30 * 60 * 1000, // 30 minutes
    MAIN_CATEGORIES: 60 * 60 * 1000, // 1 hour

    // User and auth cache times
    USER_PROFILE: 15 * 60 * 1000, // 15 minutes
    STAFF_PERMISSIONS: 20 * 60 * 1000, // 20 minutes

    // Analytics cache times
    ANALYTICS_DATA: 2 * 60 * 1000, // 2 minutes
    DASHBOARD_STATS: 1 * 60 * 1000, // 1 minute

    // Long-term cache for static data
    AMENITIES: 24 * 60 * 60 * 1000, // 24 hours
    SYSTEM_CONFIG: 12 * 60 * 60 * 1000, // 12 hours
  },
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    EXPONENTIAL_BACKOFF: true,
  },
  TIMEOUTS: {
    DEFAULT_TIMEOUT: 10000, // 10 seconds
    UPLOAD_TIMEOUT: 30000, // 30 seconds
    LONG_RUNNING_TIMEOUT: 60000, // 1 minute
  },
  LIMITS: {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_IMAGES_PER_BUSINESS: 10,
    MAX_DESCRIPTION_LENGTH: 1000,
    MIN_DESCRIPTION_LENGTH: 200,
    MAX_BUSINESS_NAME_LENGTH: 100,
    MIN_BUSINESS_NAME_LENGTH: 3,
  },
} as const;

export type ApiConstants = typeof API_CONSTANTS;
