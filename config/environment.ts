// filepath: config/environment.ts
/**
 * Environment Variable Configuration & Validation
 *
 * Provides runtime validation of environment variables using Zod schemas.
 * Ensures all required environment variables are present and properly formatted
 * before the application starts.
 */

import { validateEnvironment } from '@/schemas';

// ============================================================================
// ENVIRONMENT VALIDATION & EXPORT
// ============================================================================

/**
 * Validate and export environment variables
 *
 * This will throw an error at app startup if required environment variables
 * are missing or invalid, preventing the app from running with bad config.
 */
export const env = validateEnvironment({
  // Required Supabase Configuration
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

  // Environment Settings
  NODE_ENV: process.env.NODE_ENV,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,

  // Optional API Configuration
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_STORAGE_BUCKET: process.env.EXPO_PUBLIC_STORAGE_BUCKET,

  // Feature Flags
  EXPO_PUBLIC_ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS,
  EXPO_PUBLIC_ENABLE_NOTIFICATIONS:
    process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS,
  EXPO_PUBLIC_ENABLE_DEBUG_MODE: process.env.EXPO_PUBLIC_ENABLE_DEBUG_MODE,
});

// ============================================================================
// ENVIRONMENT UTILITIES
// ============================================================================

/**
 * Check if we're in development mode
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Check if analytics are enabled
 */
export const isAnalyticsEnabled = env.EXPO_PUBLIC_ENABLE_ANALYTICS;

/**
 * Check if notifications are enabled
 */
export const isNotificationsEnabled = env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS;

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = env.EXPO_PUBLIC_ENABLE_DEBUG_MODE;

// ============================================================================
// CONFIGURATION OBJECTS
// ============================================================================

/**
 * Supabase configuration object
 */
export const supabaseConfig = {
  url: env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
} as const;

/**
 * Feature flags configuration
 */
export const features = {
  analytics: isAnalyticsEnabled,
  notifications: isNotificationsEnabled,
  debugMode: isDebugMode,
} as const;

/**
 * API configuration
 */
export const apiConfig = {
  baseUrl: env.EXPO_PUBLIC_API_BASE_URL,
  storageBucket: env.EXPO_PUBLIC_STORAGE_BUCKET,
} as const;

// ============================================================================
// VALIDATION STATUS
// ============================================================================

/**
 * Log environment validation success in development
 */
if (isDevelopment && isDebugMode) {
  console.log(
    '✅ [Environment] All environment variables validated successfully'
  );
  console.log('🔧 [Environment] Current configuration:', {
    nodeEnv: env.NODE_ENV,
    appEnv: env.EXPO_PUBLIC_APP_ENV,
    features,
    hasSupabaseConfig: !!(
      env.EXPO_PUBLIC_SUPABASE_URL && env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    ),
  });
}
