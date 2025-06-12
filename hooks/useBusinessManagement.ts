// filepath: hooks/useBusinessManagement.ts
import { DOMAIN_CACHE_CONFIG, cacheUtils } from '@/constants/CacheConstants';
import queryKeys from '@/lib/queryKeys';
import { supabase } from '@/lib/supabaseClient';
import { ErrorService } from '@/services/ErrorService';
import {
  Business,
  BusinessInsert,
  BusinessUpdate,
  BusinessWithImages,
} from '@/types/supabase';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

/**
 * Enhanced Business Management Hooks - Phase 4 with Error Handling
 *
 * Smart hooks for business management operations following the "Smart Hook, Dumb Component" pattern.
 * Features implemented:
 * - Optimistic updates for instant UI feedback
 * - Enhanced caching with domain-specific configurations
 * - Comprehensive error handling with boundary integration
 * - Smart retry strategies with exponential backoff
 * - Infinite queries for large datasets
 * - Parallel query execution for related data
 */

// Enhanced error handling for business operations
const handleBusinessError = (
  error: any,
  operation: string,
  context?: Record<string, any>
) => {
  // Log error with context
  ErrorService.logError(error, {
    operation,
    hook: 'useBusinessManagement',
    ...context,
  });

  // Enhance error message for specific error types
  if (error.code === 'PGRST301') {
    throw new Error('Business not found or access denied');
  } else if (error.code === 'PGRST204') {
    throw new Error('Business data is empty or invalid');
  } else if (error.message?.includes('duplicate key')) {
    throw new Error('A business with this information already exists');
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

// Enhanced Query Keys using the new factory
export const businessQueryKeys = queryKeys.businesses;

// Enhanced Types for Phase 3
export interface BusinessFilters extends Record<string, unknown> {
  status?: 'pending' | 'approved' | 'rejected' | 'inactive';
  business_type?: 'accommodation' | 'shop' | 'service';
  searchQuery?: string;
  category?: string;
  owner?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'business_name' | 'average_rating';
  sortOrder?: 'asc' | 'desc';
}

export interface BusinessListResponse {
  data: Business[];
  count: number | null;
  hasMore: boolean;
  nextCursor?: string;
}

export interface OptimisticBusinessUpdate extends Partial<Business> {
  id: string;
  _optimistic?: boolean;
  _timestamp?: number;
}

/**
 * Hook: useBusinessListings
 *
 * Fetches paginated and filtered list of businesses with optimized caching.
 * Supports status filtering, business type filtering, and text search.
 */
export function useBusinessListings(filters: BusinessFilters = {}) {
  const {
    status,
    business_type,
    searchQuery,
    owner,
    featured,
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = filters;

  return useQuery({
    queryKey: businessQueryKeys.list(filters),
    queryFn: async (): Promise<BusinessListResponse> => {
      let query = supabase.from('businesses').select(
        `
          *,
          business_images!business_images_business_id_fkey(
            id,
            image_url,
            is_primary,
            caption
          ),
          business_categories!business_categories_business_id_fkey(
            sub_categories!business_categories_sub_category_id_fkey(
              id,
              name,
              main_categories!sub_categories_main_category_id_fkey(
                id,
                name
              )
            )
          ),
          profiles!businesses_owner_id_fkey(
            id,
            first_name,
            last_name,
            email
          )
        `,
        { count: 'exact' }
      );

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (business_type) {
        query = query.eq('business_type', business_type);
      }

      if (searchQuery && searchQuery.trim()) {
        query = query.or(
          `business_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      if (owner) {
        query = query.eq('owner', owner);
      }

      if (featured !== undefined) {
        query = query.eq('featured', featured);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by dynamic sort criteria
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query;

      if (error) {
        handleBusinessError(error, 'fetch businesses', { filters });
      }

      const hasMore = count ? from + limit < count : false;

      return {
        data: data || [],
        count,
        hasMore,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
}

/**
 * Hook: useBusiness
 *
 * Fetches detailed data for a single business including related images and categories.
 */
export function useBusiness(businessId: string | undefined) {
  return useQuery({
    queryKey: businessQueryKeys.detail(businessId || ''),
    queryFn: async (): Promise<BusinessWithImages | null> => {
      if (!businessId) return null;

      const { data, error } = await supabase
        .from('businesses')
        .select(
          `
          *,
          business_images!business_images_business_id_fkey(
            id,
            image_url,
            is_primary,
            caption,
            display_order
          ),
          business_categories!business_categories_business_id_fkey(
            id,
            sub_categories!business_categories_sub_category_id_fkey(
              id,
              name,
              description,
              main_categories!sub_categories_main_category_id_fkey(
                id,
                name,
                description
              )
            )
          ),
          business_amenities!business_amenities_business_id_fkey(
            amenities!business_amenities_amenity_id_fkey(
              id,
              name,
              icon_url
            )
          ),
          profiles!businesses_owner_id_fkey(
            id,
            first_name,
            last_name,
            email,
            phone_number
          )
        `
        )
        .eq('id', businessId)
        .single();

      if (error) {
        handleBusinessError(error, 'fetch business details', { businessId });
      }

      return data;
    },
    enabled: !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook: useCreateBusiness (Simplified)
 *
 * Mutation for creating a new business with automatic cache invalidation.
 * Uses the KISS principle - just invalidate queries instead of complex cache manipulation.
 */
export function useCreateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessData: BusinessInsert): Promise<Business> => {
      const { data, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) {
        handleBusinessError(error, 'create business', { businessData });
      }

      return data;
    },
    // BEST PRACTICE: Simplify the success handler.
    onSuccess: (newBusiness) => {
      console.log('[useCreateBusiness] Success:', newBusiness.id);
      // Just tell TanStack Query that any query including the 'lists' key is now stale.
      // It will automatically refetch the data, ensuring the UI is 100% consistent with the server.
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.lists() });

      // You can still optimistically set the detail cache if you want faster
      // navigation to the new item's detail page.
      queryClient.setQueryData(
        businessQueryKeys.detail(newBusiness.id as string),
        newBusiness
      );
    },
    onError: (error) => {
      console.error('[useCreateBusiness] Mutation error:', error);
    },
  });
}

/**
 * Hook: useUpdateBusiness (Simplified)
 *
 * Mutation for updating an existing business with selective cache invalidation.
 */
export function useUpdateBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      updateData,
    }: {
      businessId: string;
      updateData: BusinessUpdate;
    }): Promise<Business> => {
      const { data, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        handleBusinessError(error, 'update business', {
          businessId,
          updateData,
        });
      }

      return data;
    },
    onSuccess: (updatedBusiness, { businessId }) => {
      console.log('[useUpdateBusiness] Success:', businessId);
      // Invalidate both the list and the specific detail view.
      // This is simpler and less error-prone than manually updating the cache item.
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.detail(businessId),
      });
    },
    onError: (error) => {
      console.error('[useUpdateBusiness] Mutation error:', error);
    },
  });
}

/**
 * Hook: useDeleteBusiness (Simplified)
 *
 * Mutation for deleting a business with confirmation dialog and cache cleanup.
 */
export function useDeleteBusiness() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessId: string): Promise<void> => {
      // Note: In a real app, you might want to soft delete instead
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId);

      if (error) {
        console.error('[useDeleteBusiness] Error deleting business:', error);
        throw new Error(`Failed to delete business: ${error.message}`);
      }
    },
    onSuccess: (_, businessId) => {
      console.log('[useDeleteBusiness] Success:', businessId);
      // After deleting, just invalidate the list.
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.lists() });

      // You can also immediately remove the detail query from the cache.
      queryClient.removeQueries({
        queryKey: businessQueryKeys.detail(businessId),
      });
    },
    onError: (error) => {
      console.error('[useDeleteBusiness] Mutation error:', error);
    },
  });
}

/**
 * Hook: useBusinessCategories
 *
 * Fetches all business categories for form dropdowns and filters.
 */
export function useBusinessCategories() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_categories')
        .select(
          `
          id,
          name,
          description,
          main_categories!sub_categories_main_category_id_fkey(
            id,
            name,
            description
          )
        `
        )
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error(
          '[useBusinessCategories] Error fetching categories:',
          error
        );
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - categories change infrequently
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Enhanced Infinite Business Listings Hook
 *
 * Optimized for handling thousands of businesses with cursor-based pagination.
 * Perfect for infinite scroll UI patterns.
 */
export function useInfiniteBusinessListings(filters: BusinessFilters = {}) {
  const {
    status,
    business_type,
    searchQuery,
    owner,
    featured,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = filters;

  const cacheConfig = DOMAIN_CACHE_CONFIG.businesses;

  return useInfiniteQuery({
    queryKey: [...businessQueryKeys.list(filters), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      let query = supabase.from('businesses').select(
        `
          *,
          business_images!business_images_business_id_fkey(
            id,
            image_url,
            is_primary,
            caption
          ),
          business_categories!business_categories_business_id_fkey(
            sub_categories!business_categories_sub_category_id_fkey(
              id,
              name,
              main_categories!sub_categories_main_category_id_fkey(
                id,
                name
              )
            )
          )
        `,
        { count: 'exact' }
      );

      // Apply filters
      if (status) query = query.eq('status', status);
      if (business_type) query = query.eq('business_type', business_type);
      if (featured !== undefined) query = query.eq('is_featured', featured);
      if (owner) query = query.eq('owner_id', owner);

      // Enhanced search with full-text search capabilities
      if (searchQuery && searchQuery.trim()) {
        const searchTerm = searchQuery.trim();
        query = query.or(
          `business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
        );
      }

      // Apply sorting and pagination
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      const from = (pageParam - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('[useInfiniteBusinessListings] Query error:', error);
        throw new Error(`Failed to fetch businesses: ${error.message}`);
      }

      const hasMore = count
        ? (pageParam - 1) * limit + (data?.length || 0) < count
        : false;

      return {
        data: data || [],
        nextCursor: hasMore ? pageParam + 1 : undefined,
        hasMore,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1,
    ...cacheConfig,
    staleTime: cacheConfig.staleTime * 0.5, // Shorter stale time for infinite queries
  });
}

/**
 * Parallel Business Analytics Hook for Dashboard
 *
 * Efficiently loads multiple business-related queries for dashboard views.
 * Perfect for analytics and reporting dashboards.
 */
export function useBusinessAnalytics(
  businessId?: string,
  timeframe: string = 'month'
) {
  const cacheConfig = DOMAIN_CACHE_CONFIG.analytics;

  // Main business data (if businessId provided)
  const businessQuery = useBusiness(businessId);

  // Business statistics
  const statsQuery = useQuery({
    queryKey: businessQueryKeys.stats
      ? businessQueryKeys.stats(timeframe)
      : ['business-stats', timeframe],
    queryFn: async () => {
      // Business overview statistics
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('status, business_type, is_featured, created_at');

      if (businessError) {
        console.error(
          '[useBusinessAnalytics] Stats query error:',
          businessError
        );
        throw new Error(
          `Failed to fetch business statistics: ${businessError.message}`
        );
      }

      // Calculate statistics
      const totalBusinesses = businesses?.length || 0;
      const pendingBusinesses =
        businesses?.filter((b) => b.status === 'pending').length || 0;
      const approvedBusinesses =
        businesses?.filter((b) => b.status === 'approved').length || 0;
      const featuredBusinesses =
        businesses?.filter((b) => b.is_featured).length || 0;

      const typeDistribution =
        businesses?.reduce((acc: Record<string, number>, business) => {
          acc[business.business_type] = (acc[business.business_type] || 0) + 1;
          return acc;
        }, {}) || {};

      return {
        totalBusinesses,
        pendingBusinesses,
        approvedBusinesses,
        featuredBusinesses,
        typeDistribution,
        approvalRate:
          totalBusinesses > 0
            ? (approvedBusinesses / totalBusinesses) * 100
            : 0,
      };
    },
    enabled: true,
    ...cacheConfig,
  });

  // Business reviews (if businessId provided)
  const reviewsQuery = useQuery({
    queryKey: businessId
      ? businessQueryKeys.reviews(businessId)
      : ['business-reviews', 'none'],
    queryFn: async () => {
      if (!businessId) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('[useBusinessAnalytics] Reviews query error:', error);
        throw new Error(`Failed to fetch reviews: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!businessId,
    ...cacheConfig,
  });

  return {
    business: businessQuery,
    stats: statsQuery,
    reviews: reviewsQuery,
    isLoading:
      businessQuery.isLoading || statsQuery.isLoading || reviewsQuery.isLoading,
    isError:
      businessQuery.isError || statsQuery.isError || reviewsQuery.isError,
    error: businessQuery.error || statsQuery.error || reviewsQuery.error,
  };
}

/**
 * Enhanced useCreateBusiness with Optimistic Updates
 *
 * This is an alternative version with optimistic updates for instant feedback.
 * Use this when you want immediate UI updates before server confirmation.
 */
export function useCreateBusinessOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (businessData: BusinessInsert): Promise<Business> => {
      const { data, error } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();

      if (error) {
        console.error(
          '[useCreateBusinessOptimistic] Error creating business:',
          error
        );
        throw new Error(`Failed to create business: ${error.message}`);
      }

      return data;
    },

    // Optimistic update implementation
    onMutate: async (newBusiness) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: businessQueryKeys.lists() });

      // Snapshot previous value
      const previousBusinesses = queryClient.getQueryData(
        businessQueryKeys.lists()
      );

      // Optimistically update the cache
      queryClient.setQueryData(businessQueryKeys.lists(), (old: any) => {
        if (!old) return old;

        const optimisticBusiness: OptimisticBusinessUpdate = {
          id: `temp-${Date.now()}`,
          ...newBusiness,
          _optimistic: true,
          _timestamp: Date.now(),
          status: 'pending',
          created_at: new Date().toISOString(),
        };

        return {
          ...old,
          data: [optimisticBusiness, ...old.data],
          count: (old.count || 0) + 1,
        };
      });

      return { previousBusinesses };
    },

    onError: (error, newBusiness, context) => {
      // Rollback on error
      if (context?.previousBusinesses) {
        queryClient.setQueryData(
          businessQueryKeys.lists(),
          context.previousBusinesses
        );
      }
      console.error(
        '[useCreateBusinessOptimistic] Optimistic update failed:',
        error
      );
    },

    onSuccess: (newBusiness) => {
      console.log('[useCreateBusinessOptimistic] Success:', newBusiness.id);

      // Update the optimistic entry with real data
      queryClient.setQueryData(businessQueryKeys.lists(), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          data: old.data.map((business: any) =>
            business._optimistic && business._timestamp ? newBusiness : business
          ),
        };
      });

      // Set the detail cache for immediate navigation
      queryClient.setQueryData(
        businessQueryKeys.detail(newBusiness.id),
        newBusiness
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.lists() });
    },

    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.all });
    },

    retry: cacheUtils.getRetryConfig('normal'),
  });
}

/**
 * Enhanced useUpdateBusiness with Optimistic Updates
 *
 * Alternative version with optimistic updates for instant feedback.
 */
export function useUpdateBusinessOptimistic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      businessId,
      updateData,
    }: {
      businessId: string;
      updateData: BusinessUpdate;
    }): Promise<Business> => {
      const { data, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', businessId)
        .select()
        .single();

      if (error) {
        console.error(
          '[useUpdateBusinessOptimistic] Error updating business:',
          error
        );
        throw new Error(`Failed to update business: ${error.message}`);
      }

      return data;
    },

    onMutate: async ({ businessId, updateData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: businessQueryKeys.detail(businessId),
      });
      await queryClient.cancelQueries({ queryKey: businessQueryKeys.lists() });

      // Snapshot previous values
      const previousBusiness = queryClient.getQueryData(
        businessQueryKeys.detail(businessId)
      );
      const previousList = queryClient.getQueryData(businessQueryKeys.lists());

      // Optimistically update detail cache
      queryClient.setQueryData(
        businessQueryKeys.detail(businessId),
        (old: any) => {
          if (!old) return old;
          return { ...old, ...updateData, _optimistic: true };
        }
      );

      // Optimistically update list cache
      queryClient.setQueryData(businessQueryKeys.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((business: any) =>
            business.id === businessId
              ? { ...business, ...updateData, _optimistic: true }
              : business
          ),
        };
      });

      return { previousBusiness, previousList, businessId };
    },

    onError: (error, { businessId }, context) => {
      // Rollback optimistic updates
      if (context?.previousBusiness) {
        queryClient.setQueryData(
          businessQueryKeys.detail(businessId),
          context.previousBusiness
        );
      }
      if (context?.previousList) {
        queryClient.setQueryData(
          businessQueryKeys.lists(),
          context.previousList
        );
      }
      console.error(
        '[useUpdateBusinessOptimistic] Optimistic update failed:',
        error
      );
    },

    onSuccess: (updatedBusiness, { businessId }) => {
      console.log('[useUpdateBusinessOptimistic] Success:', businessId);

      // Update with real data
      queryClient.setQueryData(
        businessQueryKeys.detail(businessId),
        updatedBusiness
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: businessQueryKeys.lists() });
    },

    onSettled: (_, __, { businessId }) => {
      // Ensure data consistency
      queryClient.invalidateQueries({
        queryKey: businessQueryKeys.detail(businessId),
      });
    },

    retry: cacheUtils.getRetryConfig('normal'),
  });
}
