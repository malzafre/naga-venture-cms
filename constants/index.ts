// filepath: constants/index.ts

/**
 * Constants Barrel Export
 * Central export point for all constants following coding guidelines
 * This file serves as the single source for importing constants throughout the app
 */

export * from './ApiConstants';
export * from './CacheConstants';
export * from './RouteConstants';
export * from './UIConstants';

// Re-export existing constants for backward compatibility
export * from './Colors';
export * from './NavigationConfig';
export * from './NavigationService';
export * from './useTheme';

// Default exports for common constants
export { API_CONSTANTS } from './ApiConstants';
export { CACHE_CONSTANTS } from './CacheConstants';
export { ROUTE_CONSTANTS } from './RouteConstants';
export { UI_CONSTANTS } from './UIConstants';
