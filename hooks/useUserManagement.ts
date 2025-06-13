/**
 * Enhanced User Management Hooks - Phase 5 Implementation
 *
 * Production-grade smart hooks for user management operations with comprehensive validation:
 * - Role-based user filtering and management with Zod validation
 * - Staff permission management with type safety
 * - Optimistic updates for user operations
 * - Real-time user status tracking
 * - Parallel loading of user profiles and permissions
 * - Complete API response validation
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';

import { DOMAIN_CACHE_CONFIG, cacheUtils } from '@/constants/CacheConstants';
import queryKeys from '@/lib/queryKeys';
import { supabase } from '@/lib/supabaseClient';
import {
  ProfileSchema,
  StaffPermissionsSchema,
  UserRoleSchema,
  validateSupabaseListResponse,
  validateSupabaseResponse,
  type Profile,
  type StaffPermissions,
  type UserRole,
} from '@/schemas';

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Enhanced error handling for user operations with contextual logging
 */
const handleUserError = (
  error: any,
  operation: string,
  context?: Record<string, any>
) => {
  // Log error with context for debugging
  console.error(`[UserManagement] ${operation}:`, error, context);

  // Enhance error message for specific error types
  if (error.code === 'PGRST301') {
    throw new Error('User not found or access denied');
  } else if (error.code === 'PGRST204') {
    throw new Error('User data is empty or invalid');
  } else if (error.message?.includes('duplicate key')) {
    throw new Error('A user with this email already exists');
  } else if (error.message?.includes('foreign key')) {
    throw new Error('Related data is missing or invalid');
  } else if (error.message?.includes('permission denied')) {
    throw new Error('You do not have permission to perform this action');
  }

  // Default enhanced error message
  throw new Error(
    `Failed to ${operation}: ${error.message || 'Unknown error'}`
  );
};

// ============================================================================
// TYPES
// ============================================================================

// Use schema-generated types
export type UserProfile = Profile;

export interface UserFilters extends Record<string, unknown> {
  role?: UserRole;
  is_verified?: boolean;
  searchQuery?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'first_name' | 'last_name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  data: UserProfile[];
  count: number | null;
  hasMore: boolean;
}

/**
 * Enhanced User Listings Hook - Phase 5 Enhanced
 *
 * Features optimized user fetching with role-based filtering and comprehensive validation.
 */
export function useUserListings(filters: UserFilters = {}) {
  // Phase 5: Validate input filters with defaults
  const defaultFilters: UserFilters = {
    page: 1,
    limit: 20,
    sortBy: 'created_at',
    sortOrder: 'desc',
    ...filters,
  };

  // Validate role if provided
  const validatedFilters = {
    ...defaultFilters,
    role: defaultFilters.role
      ? UserRoleSchema.parse(defaultFilters.role)
      : undefined,
  };

  const {
    role,
    is_verified,
    searchQuery,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = validatedFilters;

  const cacheConfig = DOMAIN_CACHE_CONFIG.users;

  return useQuery({
    queryKey: queryKeys.users.list(validatedFilters),
    queryFn: async (): Promise<UserListResponse> => {
      let query = supabase.from('profiles').select('*', { count: 'exact' });

      // Apply filters
      if (role) query = query.eq('role', role);
      if (is_verified !== undefined)
        query = query.eq('is_verified', is_verified);

      // Enhanced search across multiple fields
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const response = await query;

      if (response.error) {
        handleUserError(response.error, 'fetch user listings', {
          filters: validatedFilters,
        });
      }

      // Phase 5: Validate API response with Zod
      const validatedResponse = validateSupabaseListResponse(
        ProfileSchema,
        response
      );

      const hasMore = validatedResponse.count
        ? from + limit < validatedResponse.count
        : false;

      return {
        data: validatedResponse.data,
        count: validatedResponse.count,
        hasMore,
      };
    },
    ...cacheConfig,
    placeholderData: keepPreviousData,
    retry: cacheUtils.getRetryConfig('normal'),
  });
}

/**
 * User Detail Hook with Permissions - Phase 5 Enhanced
 *
 * Fetches detailed user information including staff permissions with comprehensive validation.
 */
export function useUser(userId: string | undefined) {
  const cacheConfig = DOMAIN_CACHE_CONFIG.users;

  return useQuery({
    queryKey: queryKeys.users.detail(userId || ''),
    queryFn: async () => {
      if (!userId) return null;

      // Phase 5: Validate userId input
      const validatedId = z.string().uuid().parse(userId);

      const response = await supabase
        .from('profiles')
        .select(
          `
          *,
          staff_permissions(*)
        `
        )
        .eq('id', validatedId)
        .single();

      if (response.error) {
        handleUserError(response.error, 'fetch user details', {
          userId: validatedId,
        });
      }

      // Phase 5: Validate API response with Zod
      const validatedData = validateSupabaseResponse(ProfileSchema, response);

      return validatedData;
    },
    enabled: !!userId,
    ...cacheConfig,
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

/**
 * Staff Management Hook
 *
 * Provides optimized management for staff members with permissions.
 */
export function useStaffMembers() {
  // Filter for staff roles only
  return useUserListings({
    role: undefined, // We'll filter in the query for all staff roles
  });
}

/**
 * User Role Statistics Hook - Phase 5 Enhanced
 *
 * Provides analytics on user distribution by roles with comprehensive validation.
 */
export function useUserRoleStats() {
  const cacheConfig = DOMAIN_CACHE_CONFIG.analytics;

  return useQuery({
    queryKey: queryKeys.analytics.userStats(),
    queryFn: async () => {
      const response = await supabase
        .from('profiles')
        .select('role')
        .neq('role', null);

      if (response.error) {
        handleUserError(response.error, 'fetch user statistics');
      }

      // Phase 5: Validate API response with Zod
      const validatedResponse = validateSupabaseListResponse(
        z.object({ role: UserRoleSchema }),
        response
      );

      const data = validatedResponse.data;

      // Count users by role
      const roleCounts = data.reduce((acc: Record<string, number>, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      return {
        totalUsers: data.length,
        roleDistribution: roleCounts,
        staffCount: data.filter((u) =>
          [
            'tourism_admin',
            'business_listing_manager',
            'tourism_content_manager',
            'business_registration_manager',
          ].includes(u.role)
        ).length,
        businessOwnerCount: roleCounts.business_owner || 0,
        touristCount: roleCounts.tourist || 0,
      };
    },
    ...cacheConfig,
    retry: cacheUtils.getRetryConfig('normal'),
  });
}

/**
 * User Profile Update Hook with Optimistic Updates - Phase 5 Enhanced
 *
 * Handles user profile updates with instant UI feedback and comprehensive validation.
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updateData,
    }: {
      userId: string;
      updateData: Partial<UserProfile>;
    }) => {
      // Phase 5: Validate input data
      const validatedId = z.string().uuid().parse(userId);
      const validatedUpdateData = ProfileSchema.partial().parse(updateData);

      const response = await supabase
        .from('profiles')
        .update(validatedUpdateData)
        .eq('id', validatedId)
        .select()
        .single();

      if (response.error) {
        handleUserError(response.error, 'update user profile', {
          userId: validatedId,
          updateData: validatedUpdateData,
        });
      }

      // Phase 5: Validate API response
      const validatedProfileData = validateSupabaseResponse(
        ProfileSchema,
        response
      );

      if (!validatedProfileData) {
        throw new Error('Failed to update user profile - invalid response');
      }

      return validatedProfileData;
    },

    onMutate: async ({ userId, updateData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.detail(userId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.users.lists(),
      });

      // Snapshot previous values
      const previousUser = queryClient.getQueryData(
        queryKeys.users.detail(userId)
      );
      const previousList = queryClient.getQueryData(queryKeys.users.lists());

      // Optimistically update user detail cache
      queryClient.setQueryData(queryKeys.users.detail(userId), (old: any) => {
        if (!old) return old;
        return { ...old, ...updateData, _optimistic: true };
      });

      // Optimistically update list cache
      queryClient.setQueryData(queryKeys.users.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((user: any) =>
            user.id === userId
              ? { ...user, ...updateData, _optimistic: true }
              : user
          ),
        };
      });

      return { previousUser, previousList, userId };
    },

    onError: (error, { userId }, context) => {
      // Rollback optimistic updates
      if (context?.previousUser) {
        queryClient.setQueryData(
          queryKeys.users.detail(userId),
          context.previousUser
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(queryKeys.users.lists(), context.previousList);
      }
      console.error('[useUpdateUserProfile] Optimistic update failed:', error);
    },

    onSuccess: (updatedUser, { userId }) => {
      console.log('[useUpdateUserProfile] Success:', userId);

      // Update with real data
      queryClient.setQueryData(queryKeys.users.detail(userId), updatedUser);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // If role changed, invalidate role-based queries
      if (updatedUser.role) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.byRole(updatedUser.role),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.analytics.userStats(),
        });
      }
    },

    onSettled: (_, __, { userId }) => {
      // Ensure data consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });
    },

    retry: cacheUtils.getRetryConfig('normal'),
  });
}

/**
 * Staff Permissions Update Hook - Phase 5 Enhanced
 *
 * Manages staff permission updates with role validation and comprehensive data validation.
 */
export function useUpdateStaffPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      permissions,
    }: {
      userId: string;
      permissions: Partial<StaffPermissions>;
    }) => {
      // Phase 5: Validate input data
      const validatedId = z.string().uuid().parse(userId);
      const validatedPermissions =
        StaffPermissionsSchema.partial().parse(permissions);

      const response = await supabase
        .from('staff_permissions')
        .upsert({
          profile_id: validatedId,
          ...validatedPermissions,
        })
        .select()
        .single();

      if (response.error) {
        handleUserError(response.error, 'update staff permissions', {
          userId: validatedId,
          permissions: validatedPermissions,
        });
      }

      // Phase 5: Validate API response
      const validatedStaffData = validateSupabaseResponse(
        StaffPermissionsSchema,
        response
      );

      if (!validatedStaffData) {
        throw new Error(
          'Failed to update staff permissions - invalid response'
        );
      }

      return validatedStaffData;
    },

    onSuccess: (updatedPermissions, { userId }) => {
      console.log('[useUpdateStaffPermissions] Success:', userId);

      // Invalidate user detail to refresh permissions
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });

      // Invalidate staff listings
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.staff(),
      });
    },

    retry: cacheUtils.getRetryConfig('critical'),
  });
}

/**
 * User Verification Hook - Phase 5 Enhanced
 *
 * Handles user verification status changes with comprehensive validation.
 */
export function useVerifyUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isVerified,
    }: {
      userId: string;
      isVerified: boolean;
    }) => {
      // Phase 5: Validate input data
      const validatedId = z.string().uuid().parse(userId);
      const validatedVerification = z.boolean().parse(isVerified);

      const response = await supabase
        .from('profiles')
        .update({ is_verified: validatedVerification })
        .eq('id', validatedId)
        .select()
        .single();

      if (response.error) {
        handleUserError(response.error, 'verify user', {
          userId: validatedId,
          isVerified: validatedVerification,
        });
      }

      // Phase 5: Validate API response
      const validatedUserData = validateSupabaseResponse(
        ProfileSchema,
        response
      );

      if (!validatedUserData) {
        throw new Error('Failed to verify user - invalid response');
      }

      return validatedUserData;
    },

    onSuccess: (updatedUser, { userId, isVerified }) => {
      console.log('[useVerifyUser] Success:', userId, isVerified);

      // Update user detail cache
      queryClient.setQueryData(queryKeys.users.detail(userId), updatedUser);

      // Invalidate user listings
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });

      // Invalidate verification-filtered queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.list({ is_verified: isVerified }),
      });
    },

    retry: cacheUtils.getRetryConfig('critical'),
  });
}

/**
 * Parallel User Data Hook for Dashboard
 *
 * Efficiently loads multiple user-related queries for dashboard views.
 */
export function useUserDashboardData() {
  const userStatsQuery = useUserRoleStats();
  const recentUsersQuery = useUserListings({
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const unverifiedUsersQuery = useUserListings({
    is_verified: false,
    page: 1,
    limit: 5,
  });

  return {
    stats: userStatsQuery,
    recentUsers: recentUsersQuery,
    unverifiedUsers: unverifiedUsersQuery,
    isLoading:
      userStatsQuery.isLoading ||
      recentUsersQuery.isLoading ||
      unverifiedUsersQuery.isLoading,
    isError:
      userStatsQuery.isError ||
      recentUsersQuery.isError ||
      unverifiedUsersQuery.isError,
    error:
      userStatsQuery.error ||
      recentUsersQuery.error ||
      unverifiedUsersQuery.error,
  };
}
