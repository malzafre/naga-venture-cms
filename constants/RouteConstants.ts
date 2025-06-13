// filepath: constants/RouteConstants.ts

/**
 * Route Constants
 * Centralized routing constants to eliminate magic strings throughout the application
 * Following coding guidelines for consistent navigation
 */

export const ROUTE_CONSTANTS = {
  // Authentication Routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },

  // Main App Routes
  ROOT: '/',
  NOT_FOUND: '+not-found',

  // CMS Base Routes
  CMS: {
    BASE: '/(sidebar)',
    UNAUTHORIZED: '/(sidebar)/unauthorized',
  },

  // Dashboard
  DASHBOARD: {
    MAIN: '/(sidebar)/dashboard',
  },

  // User Management
  USER_MANAGEMENT: {
    BASE: '/(sidebar)/user-management',
    STAFF_MANAGEMENT: '/(sidebar)/user-management/staff-management',
    BUSINESS_OWNERS: '/(sidebar)/user-management/business-owners',
    TOURIST_ACCOUNTS: '/(sidebar)/user-management/tourist-accounts',
  },

  // Business Management
  BUSINESS_MANAGEMENT: {
    BASE: '/(sidebar)/business-management',
    BUSINESS_LISTINGS: {
      BASE: '/(sidebar)/business-management/business-listings',
      ALL_BUSINESSES:
        '/(sidebar)/business-management/business-listings/all-businesses',
      ACCOMMODATIONS:
        '/(sidebar)/business-management/business-listings/accommodations',
      SHOPS_SERVICES:
        '/(sidebar)/business-management/business-listings/shops-services',
      FEATURED_BUSINESSES:
        '/(sidebar)/business-management/business-listings/featured-businesses',
      CREATE: '/(sidebar)/business-management/business-listings/create',
      EDIT: (id: string) =>
        `/(sidebar)/business-management/business-listings/edit/${id}`,
      VIEW: (id: string) =>
        `/(sidebar)/business-management/business-listings/view/${id}`,
    },
    BUSINESS_REGISTRATIONS: {
      BASE: '/(sidebar)/business-management/business-registrations',
      PENDING_APPROVALS:
        '/(sidebar)/business-management/business-registrations/pending-approvals',
      REGISTRATION_HISTORY:
        '/(sidebar)/business-management/business-registrations/registration-history',
      REJECTED_APPLICATIONS:
        '/(sidebar)/business-management/business-registrations/rejected-applications',
    },
    BUSINESS_ANALYTICS: '/(sidebar)/business-management/business-analytics',
  },

  // Tourism Content
  TOURISM_CONTENT: {
    BASE: '/(sidebar)/tourism-content',
    TOURIST_SPOTS: '/(sidebar)/tourism-content/tourist-spots',
    EVENTS_MANAGEMENT: '/(sidebar)/tourism-content/events-management',
    PROMOTIONS: '/(sidebar)/tourism-content/promotions',
  },

  // Content Management
  CONTENT_MANAGEMENT: {
    BASE: '/(sidebar)/content-management',
    CONTENT_APPROVAL: '/(sidebar)/content-management/content-approval',
    REVIEWS_RATINGS: '/(sidebar)/content-management/reviews-ratings',
  },
  // Categories & Organization
  CATEGORIES: {
    BASE: '/(sidebar)/categories',
    CATEGORY_MANAGEMENT: '/(sidebar)/categories/category-management',
  },

  // Bookings & Finance
  BOOKINGS_FINANCE: {
    BASE: '/(sidebar)/bookings-finance',
    BOOKING_MANAGEMENT: '/(sidebar)/bookings-finance/booking-management',
    FINANCIAL_OVERVIEW: '/(sidebar)/bookings-finance/financial-overview',
  },

  // Analytics & Reporting
  ANALYTICS_REPORTING: {
    BASE: '/(sidebar)/analytics-reporting',
    PLATFORM_ANALYTICS: '/(sidebar)/analytics-reporting/platform-analytics',
    BUSINESS_ANALYTICS_DETAIL:
      '/(sidebar)/analytics-reporting/business-analytics-detail',
    TOURISM_ANALYTICS: '/(sidebar)/analytics-reporting/tourism-analytics',
    REGISTRATION_ANALYTICS:
      '/(sidebar)/analytics-reporting/registration-analytics',
  },

  // System Administration
  SYSTEM_ADMINISTRATION: {
    BASE: '/(sidebar)/system-administration',
    SYSTEM_SETTINGS: '/(sidebar)/system-administration/system-settings',
    API_MANAGEMENT: '/(sidebar)/system-administration/api-management',
    SECURITY_BACKUP: '/(sidebar)/system-administration/security-backup',
  },
} as const;

export type RouteConstants = typeof ROUTE_CONSTANTS;
