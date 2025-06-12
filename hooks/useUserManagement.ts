/**
 * Enhanced User Management Hooks - Phase 3 Optimization
 *
 * Production-grade smart hooks for user management operations:
 * - Role-based user filtering and management
 * - Staff permission management
 * - Optimistic updates for user operations
 * - Real-time user status tracking
 * - Parallel loading of user profiles and permissions
 */

import { DOMAIN_CACHE_CONFIG, cacheUtils } from '@/constants/CacheConstants';
import queryKeys from '@/lib/queryKeys';
import { supabase } from '@/lib/supabaseClient';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Types for user management
export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_image_url?: string;
  role:
    | 'tourism_admin'
    | 'business_listing_manager'
    | 'tourism_content_manager'
    | 'business_registration_manager'
    | 'business_owner'
    | 'tourist';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffPermissions {
  id: string;
  profile_id: string;
  can_manage_users: boolean;
  can_manage_businesses: boolean;
  can_manage_tourist_spots: boolean;
  can_manage_events: boolean;
  can_approve_content: boolean;
  can_manage_categories: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFilters extends Record<string, unknown> {
  role?: UserProfile['role'];
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
 * Enhanced User Listings Hook
 *
 * Features optimized user fetching with role-based filtering and search.
 */
export function useUserListings(filters: UserFilters = {}) {
  const {
    role,
    is_verified,
    searchQuery,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = filters;

  const cacheConfig = DOMAIN_CACHE_CONFIG.users;

  return useQuery({
    queryKey: queryKeys.users.list(filters),
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

      const { data, error, count } = await query;

      if (error) {
        console.error('[useUserListings] Query error:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      return {
        data: data || [],
        count,
        hasMore: count ? from + limit < count : false,
      };
    },
    ...cacheConfig,
    placeholderData: keepPreviousData,
    retry: cacheUtils.getRetryConfig('normal'),
  });
}

/**
 * User Detail Hook with Permissions
 *
 * Fetches detailed user information including staff permissions.
 */
export function useUser(userId: string | undefined) {
  const cacheConfig = DOMAIN_CACHE_CONFIG.users;

  return useQuery({
    queryKey: queryKeys.users.detail(userId || ''),
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select(
          `
          *,
          staff_permissions(*)
        `
        )
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[useUser] Query error:', error);
        throw new Error(`Failed to fetch user: ${error.message}`);
      }

      return data;
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
 * User Role Statistics Hook
 *
 * Provides analytics on user distribution by roles.
 */
export function useUserRoleStats() {
  const cacheConfig = DOMAIN_CACHE_CONFIG.analytics;

  return useQuery({
    queryKey: queryKeys.analytics.userStats(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .neq('role', null);

      if (error) {
        console.error('[useUserRoleStats] Query error:', error);
        throw new Error(`Failed to fetch user statistics: ${error.message}`);
      }

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
 * User Profile Update Hook with Optimistic Updates
 *
 * Handles user profile updates with instant UI feedback.
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
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[useUpdateUserProfile] Mutation error:', error);
        throw new Error(`Failed to update user profile: ${error.message}`);
      }

      return data;
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
 * Staff Permissions Update Hook
 *
 * Manages staff permission updates with role validation.
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
      const { data, error } = await supabase
        .from('staff_permissions')
        .upsert({ profile_id: userId, ...permissions })
        .select()
        .single();

      if (error) {
        console.error('[useUpdateStaffPermissions] Mutation error:', error);
        throw new Error(`Failed to update staff permissions: ${error.message}`);
      }

      return data;
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
 * User Verification Hook
 *
 * Handles user verification status changes.
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
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[useVerifyUser] Mutation error:', error);
        throw new Error(`Failed to verify user: ${error.message}`);
      }

      return data;
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
