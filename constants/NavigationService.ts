// filepath: constants/NavigationService.ts
// Enhanced Navigation Service with validation, analytics, and error handling
import { router } from 'expo-router';
import { ROUTE_CONSTANTS } from './RouteConstants';

/**
 * Enhanced Navigation Service
 *
 * Centralized navigation service following production-level coding guidelines:
 * - Route validation and error handling
 * - Navigation history tracking
 * - Analytics integration
 * - Comprehensive logging
 * - Deep linking support
 */

// Navigation Analytics Interface
interface NavigationEvent {
  route: string;
  timestamp: number;
  userId?: string;
  previousRoute?: string;
  metadata?: Record<string, any>;
}

// Navigation History Management
class NavigationHistory {
  private static history: string[] = [];
  private static maxHistorySize = 50;

  static push(route: string) {
    this.history.push(route);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  static getPrevious(): string | undefined {
    return this.history[this.history.length - 2];
  }

  static getHistory(): string[] {
    return [...this.history];
  }

  static clear() {
    this.history = [];
  }
}

// Route Validation
class RouteValidator {
  private static validRoutes: Set<string> = new Set();

  static initialize() {
    // Populate valid routes from ROUTE_CONSTANTS
    this.addRoutesFromObject(ROUTE_CONSTANTS);
  }

  private static addRoutesFromObject(obj: any, prefix = '') {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        this.validRoutes.add(value);
      } else if (typeof value === 'function') {
        // For parameterized routes, we'll validate at runtime
        continue;
      } else if (typeof value === 'object') {
        this.addRoutesFromObject(value, prefix);
      }
    }
  }

  static isValidRoute(route: string): boolean {
    // Basic validation - check if route starts with /
    if (!route.startsWith('/')) {
      return false;
    }

    // Check against known valid routes
    if (this.validRoutes.has(route)) {
      return true;
    }

    // Check for dynamic routes (contains parameters)
    const dynamicRoutePattern = /\/\[.*\]/;
    if (dynamicRoutePattern.test(route)) {
      return true;
    }

    return false;
  }
}

// Initialize route validator
RouteValidator.initialize();

// Legacy ROUTES for backward compatibility
export const ROUTES = {
  TOURISM_CMS: {
    BUSINESS_MANAGEMENT: {
      ALL_BUSINESSES:
        ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.ALL_BUSINESSES,
      CREATE_BUSINESS:
        ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.CREATE,
      EDIT_BUSINESS: ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.EDIT,
      VIEW_BUSINESS: ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.VIEW,
    },
  },
} as const;

/**
 * Enhanced NavigationService Class
 * Production-ready navigation with validation, analytics, and error handling
 */
export class NavigationService {
  private static analytics: NavigationEvent[] = [];

  /**
   * Track navigation event for analytics
   */
  private static trackNavigation(
    route: string,
    metadata?: Record<string, any>
  ) {
    const event: NavigationEvent = {
      route,
      timestamp: Date.now(),
      previousRoute: NavigationHistory.getPrevious(),
      metadata,
    };

    this.analytics.push(event);
    NavigationHistory.push(route);

    // Log navigation for debugging (in development)
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('🧭 [NavigationService] Navigation:', {
        to: route,
        from: event.previousRoute,
        timestamp: event.timestamp,
        metadata,
      });
    }
  }

  /**
   * Validate route before navigation
   */
  private static validateRoute(route: string): boolean {
    if (!RouteValidator.isValidRoute(route)) {
      // eslint-disable-next-line no-console
      console.error('❌ [NavigationService] Invalid route:', route);
      return false;
    }
    return true;
  }

  /**
   * Safe navigation with comprehensive error handling
   */
  private static safeNavigate(
    route: string,
    options: { replace?: boolean; validate?: boolean } = {}
  ): boolean {
    const { replace = false, validate = true } = options;

    try {
      // Validate route if requested
      if (validate && !this.validateRoute(route)) {
        this.navigateToFallback();
        return false;
      }

      // Perform navigation
      if (replace) {
        router.replace(route as any);
      } else {
        router.push(route as any);
      }

      // Track successful navigation
      this.trackNavigation(route, { replace, validated: validate });

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(`✅ [NavigationService] Navigation successful: ${route}`);
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ [NavigationService] Navigation failed:', error);
      this.navigateToFallback();
      return false;
    }
  }

  /**
   * Navigate to fallback route (dashboard or all businesses)
   */
  private static navigateToFallback() {
    try {
      router.replace(
        ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS
          .ALL_BUSINESSES as any
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        '❌ [NavigationService] Fallback navigation failed:',
        error
      );
    }
  }

  // ===== PUBLIC NAVIGATION METHODS =====

  /**
   * Navigate to All Businesses page
   */
  static toAllBusinesses() {
    return this.safeNavigate(
      ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.ALL_BUSINESSES,
      { replace: true }
    );
  }

  /**
   * Navigate to Create Business page
   */
  static toCreateBusiness() {
    return this.safeNavigate(
      ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.CREATE
    );
  }

  /**
   * Navigate to Edit Business page
   */
  static toEditBusiness(businessId: string) {
    if (!businessId || businessId.trim() === '') {
      // eslint-disable-next-line no-console
      console.error(
        '❌ [NavigationService] Invalid business ID for edit:',
        businessId
      );
      return false;
    }

    const route =
      ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.EDIT(businessId);
    return this.safeNavigate(route, { validate: false }); // Dynamic routes skip validation
  }

  /**
   * Navigate to View Business page
   */
  static toViewBusiness(businessId: string) {
    if (!businessId || businessId.trim() === '') {
      // eslint-disable-next-line no-console
      console.error(
        '❌ [NavigationService] Invalid business ID for view:',
        businessId
      );
      return false;
    }

    const route =
      ROUTE_CONSTANTS.BUSINESS_MANAGEMENT.BUSINESS_LISTINGS.VIEW(businessId);
    return this.safeNavigate(route, { validate: false }); // Dynamic routes skip validation
  }

  /**
   * Navigate to Dashboard
   */
  static toDashboard() {
    return this.safeNavigate(ROUTE_CONSTANTS.DASHBOARD.MAIN, {
      replace: true,
    });
  }

  /**
   * Navigate to Login
   */
  static toLogin() {
    return this.safeNavigate(ROUTE_CONSTANTS.AUTH.LOGIN, { replace: true });
  }

  /**
   * Navigate to Unauthorized page
   */
  static toUnauthorized() {
    return this.safeNavigate(ROUTE_CONSTANTS.CMS.UNAUTHORIZED, {
      replace: true,
    });
  }

  /**
   * Go back in navigation stack with fallback
   */
  static goBack() {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('🧭 [NavigationService] Go back requested');
      // eslint-disable-next-line no-console
      console.log('🧭 [NavigationService] Can go back:', router.canGoBack());
    }

    if (router.canGoBack()) {
      try {
        router.back();
        this.trackNavigation('[BACK]', { action: 'back' });

        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log('✅ [NavigationService] Go back successful');
        }
        return true;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ [NavigationService] Go back failed:', error);
        this.toAllBusinesses();
        return false;
      }
    } else {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log(
          '🔄 [NavigationService] Cannot go back - navigating to fallback'
        );
      }
      this.toAllBusinesses();
      return false;
    }
  }

  /**
   * Generic safe navigation method
   */
  static navigate(route: string, options?: { replace?: boolean }) {
    return this.safeNavigate(route, options);
  }

  // ===== ANALYTICS AND DEBUGGING METHODS =====

  /**
   * Get navigation analytics
   */
  static getAnalytics(): NavigationEvent[] {
    return [...this.analytics];
  }

  /**
   * Get navigation history
   */
  static getHistory(): string[] {
    return NavigationHistory.getHistory();
  }

  /**
   * Clear navigation analytics
   */
  static clearAnalytics() {
    this.analytics = [];
    NavigationHistory.clear();
  }

  /**
   * Get current route validation status
   */
  static validateCurrentRoute(route: string): boolean {
    return RouteValidator.isValidRoute(route);
  }
}
