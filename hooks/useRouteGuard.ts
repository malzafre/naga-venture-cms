// hooks/useRouteGuard.ts
import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/useAuthModern';
import type { Database } from '@/types/database';

type UserRole = Database['public']['Enums']['user_role'];

// Route permission type definition
interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
}

// Centralized role group definitions to eliminate redundancy and improve maintainability
const ADMIN_ROLES: UserRole[] = [
  'tourism_admin',
  'business_listing_manager',
  'tourism_content_manager',
  'business_registration_manager',
];

const CONTENT_MANAGEMENT_ROLES: UserRole[] = [
  'tourism_admin',
  'tourism_content_manager',
  'business_listing_manager',
];

const BUSINESS_MANAGEMENT_ROLES: UserRole[] = [
  'tourism_admin',
  'business_listing_manager',
  'business_registration_manager',
];

const BUSINESS_REGISTRATION_ROLES: UserRole[] = [
  'tourism_admin',
  'business_registration_manager',
];

const TOURISM_CONTENT_ROLES: UserRole[] = [
  'tourism_admin',
  'tourism_content_manager',
];

const USER_MANAGEMENT_ROLES: UserRole[] = [
  'tourism_admin',
  'business_registration_manager',
  'business_listing_manager',
];

const ANALYTICS_ROLES: UserRole[] = [
  'tourism_admin',
  'business_listing_manager',
  'business_registration_manager',
];

// Tourism admin only routes (system administration, etc.)
const ADMIN_ONLY_ROLES: UserRole[] = ['tourism_admin'];

// Helper function to check if a role is an admin role
export const isAdminRole = (role: UserRole | null | undefined): boolean => {
  return role ? ADMIN_ROLES.includes(role) : false;
};

// Route permissions configuration following NAGA VENTURE RBAC Documentation exactly
const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard - All admin roles have access
  {
    path: '/(sidebar)/dashboard',
    allowedRoles: ADMIN_ROLES,
  },
  // Legacy Dashboard path
  {
    path: '/TourismCMS/(admin)/dashboard',
    allowedRoles: ADMIN_ROLES,
  },
  // ========== USER MANAGEMENT SECTION ==========
  // User Management Parent - Tourism Admin and Business Registration Manager
  {
    path: '/TourismCMS/(admin)/user-management',
    allowedRoles: USER_MANAGEMENT_ROLES,
  }, // Staff Management
  {
    path: '/TourismCMS/(admin)/user-management/staff-management',
    allowedRoles: ADMIN_ONLY_ROLES,
  }, // Business Owners
  {
    path: '/TourismCMS/(admin)/user-management/business-owners',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  }, // Tourist Accounts
  {
    path: '/TourismCMS/(admin)/user-management/tourist-accounts',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // ========== NEW USER MANAGEMENT ROUTES ==========
  // User Management Routes
  {
    path: '/(sidebar)/user-management/business-owners',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  {
    path: '/(sidebar)/user-management/staff-management',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  {
    path: '/(sidebar)/user-management/tourist-accounts',
    allowedRoles: ADMIN_ONLY_ROLES,
  },

  // ========== BUSINESS MANAGEMENT SECTION ==========
  // Business Management Parent
  {
    path: '/TourismCMS/(admin)/business-management',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  }, // Business Listings
  {
    path: '/TourismCMS/(admin)/business-management/business-listings/all-businesses',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  {
    path: '/TourismCMS/(admin)/business-management/business-listings/accommodations',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  {
    path: '/TourismCMS/(admin)/business-management/business-listings/shops-services',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  {
    path: '/TourismCMS/(admin)/business-management/business-listings/featured-businesses',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  // Business CRUD operations
  {
    path: '/TourismCMS/(admin)/business-management/business-listings/create',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  {
    path: '/TourismCMS/(admin)/business-management/business-listings/edit',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  {
    path: '/TourismCMS/(admin)/business-management/business-listings/view',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  // Business Registrations - Main Page
  {
    path: '/(sidebar)/business-management/business-registrations',
    allowedRoles: BUSINESS_REGISTRATION_ROLES,
  },
  // Category Management
  {
    path: '/(sidebar)/categories/category-management',
    allowedRoles: CONTENT_MANAGEMENT_ROLES,
  },

  // ========== NEW CONTENT MANAGEMENT ROUTES ==========
  // Content Management Routes
  {
    path: '/(sidebar)/content-management/content-approval',
    allowedRoles: CONTENT_MANAGEMENT_ROLES,
  },
  {
    path: '/(sidebar)/content-management/reviews-ratings',
    allowedRoles: CONTENT_MANAGEMENT_ROLES,
  },

  // Business Registrations (Legacy and detailed routes)
  {
    path: '/TourismCMS/(admin)/business-management/business-registrations/pending-approvals',
    allowedRoles: BUSINESS_REGISTRATION_ROLES,
  },
  {
    path: '/TourismCMS/(admin)/business-management/business-registrations/registration-history',
    allowedRoles: BUSINESS_REGISTRATION_ROLES,
  },
  {
    path: '/TourismCMS/(admin)/business-management/business-registrations/rejected-applications',
    allowedRoles: BUSINESS_REGISTRATION_ROLES,
  }, // Business Analytics
  {
    path: '/TourismCMS/(admin)/business-management/business-analytics',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },

  // ========== TOURISM CONTENT SECTION ==========
  // Tourism Content Parent
  {
    path: '/TourismCMS/(admin)/tourism-content',
    allowedRoles: TOURISM_CONTENT_ROLES,
  },
  // Tourist Spots
  {
    path: '/TourismCMS/(admin)/tourism-content/tourist-spots',
    allowedRoles: TOURISM_CONTENT_ROLES,
  },
  // Events Management
  {
    path: '/TourismCMS/(admin)/tourism-content/events-management',
    allowedRoles: TOURISM_CONTENT_ROLES,
  },
  // Promotions
  {
    path: '/TourismCMS/(admin)/tourism-content/promotions',
    allowedRoles: TOURISM_CONTENT_ROLES,
  },

  // ========== CONTENT MANAGEMENT SECTION ==========
  // Content Management Parent
  {
    path: '/TourismCMS/(admin)/content-management',
    allowedRoles: CONTENT_MANAGEMENT_ROLES,
  },
  // Content Approval
  {
    path: '/TourismCMS/(admin)/content-management/content-approval',
    allowedRoles: CONTENT_MANAGEMENT_ROLES,
  },
  // Reviews & Ratings
  {
    path: '/TourismCMS/(admin)/content-management/reviews-ratings',
    allowedRoles: CONTENT_MANAGEMENT_ROLES,
  },

  // ========== CATEGORIES & ORGANIZATION SECTION ==========
  // Categories Parent
  {
    path: '/TourismCMS/(admin)/categories-organization',
    allowedRoles: CONTENT_MANAGEMENT_ROLES,
  }, // Business Categories
  {
    path: '/TourismCMS/(admin)/categories-organization/business-categories',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  }, // Tourism Categories
  {
    path: '/TourismCMS/(admin)/categories-organization/tourism-categories',
    allowedRoles: TOURISM_CONTENT_ROLES,
  },
  // ========== BOOKINGS & FINANCE SECTION ==========
  // Bookings & Finance Parent
  {
    path: '/TourismCMS/(admin)/bookings-finance',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // Booking Management
  {
    path: '/TourismCMS/(admin)/bookings-finance/booking-management',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // Financial Overview
  {
    path: '/TourismCMS/(admin)/bookings-finance/financial-overview',
    allowedRoles: ADMIN_ONLY_ROLES,
  },

  // ========== ANALYTICS & REPORTING SECTION ==========
  // Analytics Parent
  {
    path: '/TourismCMS/(admin)/analytics-reporting',
    allowedRoles: ANALYTICS_ROLES,
  }, // Platform Analytics
  {
    path: '/TourismCMS/(admin)/analytics-reporting/platform-analytics',
    allowedRoles: ADMIN_ONLY_ROLES,
  }, // Business Analytics Detail
  {
    path: '/TourismCMS/(admin)/analytics-reporting/business-analytics-detail',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  // Tourism Analytics
  {
    path: '/TourismCMS/(admin)/analytics-reporting/tourism-analytics',
    allowedRoles: TOURISM_CONTENT_ROLES,
  },
  // Registration Analytics
  {
    path: '/TourismCMS/(admin)/analytics-reporting/registration-analytics',
    allowedRoles: BUSINESS_REGISTRATION_ROLES,
  },
  // ========== NEW ANALYTICS & REPORTING ROUTES ==========
  // Analytics & Reporting Routes
  {
    path: '/(sidebar)/analytics-reporting/platform-analytics',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  {
    path: '/(sidebar)/analytics-reporting/tourism-analytics',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  {
    path: '/(sidebar)/analytics-reporting/registration-analytics',
    allowedRoles: BUSINESS_REGISTRATION_ROLES,
  },
  {
    path: '/(sidebar)/analytics-reporting/business-analytics-detail',
    allowedRoles: BUSINESS_MANAGEMENT_ROLES,
  },
  // ========== SYSTEM ADMINISTRATION SECTION ==========
  // System Administration Parent
  {
    path: '/TourismCMS/(admin)/system-administration',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // System Settings
  {
    path: '/TourismCMS/(admin)/system-administration/system-settings',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // API Management
  {
    path: '/TourismCMS/(admin)/system-administration/api-management',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // Security & Backup
  {
    path: '/TourismCMS/(admin)/system-administration/security-backup',
    allowedRoles: ADMIN_ONLY_ROLES,
  },

  // ========== LEGACY ROUTES (for backward compatibility) ==========
  // Analytics - All admin roles (but content varies by role)
  {
    path: '/TourismCMS/(admin)/analytics',
    allowedRoles: ANALYTICS_ROLES,
  },
  // System Settings (legacy)
  {
    path: '/TourismCMS/(admin)/system-settings',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // API Management (legacy)
  {
    path: '/TourismCMS/(admin)/api-management',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
  // Security & Backup (legacy)
  {
    path: '/TourismCMS/(admin)/security-backup',
    allowedRoles: ADMIN_ONLY_ROLES,
  },
];

/**
 * Hook to check if the current user has permission to access a specific route
 * @param routePath - The route path to check
 * @returns Object containing hasAccess boolean and redirect function
 */
export function useRoutePermission(routePath: string) {
  const { userProfile } = useAuth();

  const hasAccess = () => {
    if (!userProfile?.role) return false;

    const routePermission = ROUTE_PERMISSIONS.find(
      (permission) => permission.path === routePath
    );

    if (!routePermission) {
      // If route is not in permissions config, deny access by default
      console.warn(`Route ${routePath} not found in ROUTE_PERMISSIONS config`);
      return false;
    }

    return routePermission.allowedRoles.includes(userProfile.role);
  };

  return {
    hasAccess: hasAccess(),
    userRole: userProfile?.role || null,
    redirectToUnauthorized: () => router.replace('/(sidebar)/unauthorized'),
  };
}

/**
 * Hook that automatically redirects unauthorized users
 * Use this in components that need route protection
 * @param routePath - The route path to protect
 */
export function useRouteGuard(routePath: string) {
  const { user, userProfile, isLoading, isUserProfileLoading } = useAuth();
  const { hasAccess, redirectToUnauthorized } = useRoutePermission(routePath);

  useEffect(() => {
    // Wait for auth to complete loading
    if (isLoading || isUserProfileLoading) return;

    // If no user, redirect to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // If user but no profile or no access, redirect to unauthorized
    if (!userProfile || !hasAccess) {
      redirectToUnauthorized();
      return;
    }
  }, [
    user,
    userProfile,
    isLoading,
    isUserProfileLoading,
    hasAccess,
    redirectToUnauthorized,
  ]);

  return {
    isLoading: isLoading || isUserProfileLoading,
    hasAccess,
    user,
    userProfile,
  };
}

/**
 * Utility function to check if a user role has access to a specific route
 * Useful for conditional rendering in UI
 * @param userRole - The user role to check
 * @param routePath - The route path to check
 * @returns boolean indicating if the role has access
 */
export function checkRouteAccess(
  userRole: UserRole | null,
  routePath: string
): boolean {
  if (!userRole) return false;

  const routePermission = ROUTE_PERMISSIONS.find(
    (permission) => permission.path === routePath
  );

  if (!routePermission) return false;

  return routePermission.allowedRoles.includes(userRole);
}

export { ROUTE_PERMISSIONS };
export type { RoutePermission, UserRole };
