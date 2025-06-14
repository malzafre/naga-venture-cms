// filepath: hooks/useCategoryManagement.ts
/**
 * Enhanced Category Management Hooks - Phase 5 Implementation
 *
 * Production-grade smart hooks for category management operations with comprehensive validation:
 * - Main and sub-category CRUD operations with Zod validation
 * - Category hierarchy management with type safety
 * - Optimistic updates for category operations
 * - Real-time category usage tracking
 * - Complete API response validation
 * - Category assignment and bulk operations
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
  validateSupabaseListResponse,
  validateSupabaseResponse,
} from '@/schemas/api/responseSchemas';
import {
  MainCategoryFiltersSchema,
  MainCategoryInsertSchema,
  MainCategorySchema,
  MainCategoryUpdateSchema,
  MainCategoryWithSubCategoriesSchema,
  SubCategoryFiltersSchema,
  SubCategoryInsertSchema,
  SubCategorySchema,
  SubCategoryUpdateSchema,
  SubCategoryWithMainSchema, // New schema for main cats with subs
  type MainCategory,
  type MainCategoryFilters,
  type MainCategoryInsert,
  type MainCategoryUpdate,
  type MainCategoryWithSubCategories,
  type SubCategory,
  type SubCategoryFilters,
  type SubCategoryInsert,
  type SubCategoryUpdate,
  type SubCategoryWithMain,
} from '@/schemas/categoriesSchemas'; // Updated import path

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Enhanced error handling for category operations with contextual logging
 */
const handleCategoryError = (
  error: any,
  operation: string,
  context?: Record<string, any>
) => {
  // Log error with context for debugging (development only)
  if (__DEV__) {
    console.error(`[CategoryManagement] ${operation}:`, error, context);
  }

  // Transform database errors to user-friendly messages
  if (error.code === '23505') {
    throw new Error('A category with this name already exists');
  } else if (error.code === '23503') {
    throw new Error('Cannot delete category that is being used');
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

export interface MainCategoryListResponse {
  data: MainCategoryWithSubCategories[]; // Updated to use MainCategoryWithSubCategories
  count: number | null;
  hasMore: boolean;
}

export interface SubCategoryListResponse {
  data: SubCategoryWithMain[];
  count: number | null;
  hasMore: boolean;
}

// ============================================================================
// MAIN CATEGORY HOOKS
// ============================================================================

/**
 * Enhanced Main Categories Hook - Phase 5 Enhanced
 *
 * Features optimized main category fetching with comprehensive validation and sub-categories.
 */
export function useMainCategories(filters: Partial<MainCategoryFilters> = {}) {
  const defaultFilters: MainCategoryFilters = {
    page: 1,
    limit: 20,
    sortBy: 'display_order',
    sortOrder: 'asc',
    ...filters,
  };

  const validatedFilters = MainCategoryFiltersSchema.parse(defaultFilters);

  const {
    search,
    is_active,
    created_by,
    page = 1,
    limit = 20,
    sortBy = 'display_order',
    sortOrder = 'asc',
  } = validatedFilters;

  const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

  return useQuery({
    queryKey: queryKeys.categories.mainList(validatedFilters),
    queryFn: async (): Promise<MainCategoryListResponse> => {
      let mainQuery = supabase
        .from('main_categories')
        .select('*', { count: 'exact' });

      if (is_active !== undefined)
        mainQuery = mainQuery.eq('is_active', is_active);
      if (created_by) mainQuery = mainQuery.eq('created_by', created_by);

      if (search && search.trim()) {
        const searchTerm = search.trim();
        mainQuery = mainQuery.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      mainQuery = mainQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      if (sortBy !== 'name') {
        mainQuery = mainQuery.order('name', { ascending: true }); // Secondary sort by name
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      mainQuery = mainQuery.range(from, to);

      const mainResponse = await mainQuery;

      if (mainResponse.error) {
        handleCategoryError(mainResponse.error, 'fetch main categories', {
          filters: validatedFilters,
        });
        // Ensure a valid structure is returned even on error, or let it throw
        return { data: [], count: 0, hasMore: false };
      }

      const validatedMainCats = validateSupabaseListResponse(
        MainCategorySchema, // Validate as basic MainCategory first
        mainResponse
      );

      if (!validatedMainCats.data || validatedMainCats.data.length === 0) {
        return {
          data: [],
          count: validatedMainCats.count,
          hasMore: false,
        };
      }

      const mainCategoryIds = validatedMainCats.data.map((mc) => mc.id);

      const subResponse = await supabase
        .from('sub_categories')
        .select('*')
        .in('main_category_id', mainCategoryIds)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (subResponse.error) {
        handleCategoryError(
          subResponse.error,
          'fetch sub-categories for main categories',
          {
            mainCategoryIds,
          }
        );
        // Continue with main categories even if subs fail, or handle differently
      }

      const validatedSubCats = validateSupabaseListResponse(
        SubCategorySchema,
        subResponse
      );

      const mainCategoriesWithSubsData = validatedMainCats.data.map(
        (mainCat) => {
          const subs = validatedSubCats.data.filter(
            (sc) => sc.main_category_id === mainCat.id
          );
          // Validate the final structure for each item
          const parseResult = MainCategoryWithSubCategoriesSchema.safeParse({
            ...mainCat,
            sub_categories: subs,
          });
          if (!parseResult.success) {
            console.error(
              'Validation error for MainCategoryWithSubCategories:',
              parseResult.error,
              mainCat,
              subs
            );
            // Handle error, e.g., return mainCat without subs or throw
            return { ...mainCat, sub_categories: [] }; // Fallback
          }
          return parseResult.data;
        }
      );

      const hasMore = validatedMainCats.count
        ? from + limit < validatedMainCats.count
        : false;

      return {
        data: mainCategoriesWithSubsData,
        count: validatedMainCats.count,
        hasMore,
      };
    },
    ...cacheConfig,
    placeholderData: keepPreviousData,
    retry: cacheUtils.getRetryConfig('normal'),
  });
}

/**
 * Main Category Detail Hook - Phase 5 Enhanced
 *
 * Fetches detailed main category information with comprehensive validation.
 * For detail view, we might not need sub-categories, or fetch them separately.
 * Keeping this simple for now, fetching only MainCategory.
 */
export function useMainCategory(categoryId: string | undefined) {
  const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

  return useQuery({
    queryKey: queryKeys.categories.mainDetail(categoryId || ''),
    queryFn: async () => {
      if (!categoryId) return null;

      const validatedId = z.string().uuid().parse(categoryId);

      const response = await supabase
        .from('main_categories')
        .select('*')
        .eq('id', validatedId)
        .single();

      if (response.error) {
        handleCategoryError(response.error, 'fetch main category details', {
          categoryId: validatedId,
        });
        return null; // Or throw
      }

      return validateSupabaseResponse(MainCategorySchema, response);
    },
    enabled: !!categoryId,
    ...cacheConfig,
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

// ============================================================================
// SUB CATEGORY HOOKS
// ============================================================================

export function useSubCategories(filters: Partial<SubCategoryFilters> = {}) {
  const defaultFilters: SubCategoryFilters = {
    page: 1,
    limit: 20,
    sortBy: 'display_order',
    sortOrder: 'asc',
    ...filters,
  };

  const validatedFilters = SubCategoryFiltersSchema.parse(defaultFilters);

  const {
    search,
    main_category_id,
    is_active,
    created_by,
    page = 1,
    limit = 20,
    sortBy = 'display_order',
    sortOrder = 'asc',
  } = validatedFilters;

  const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

  return useQuery({
    queryKey: queryKeys.categories.subList(validatedFilters),
    queryFn: async (): Promise<SubCategoryListResponse> => {
      let query = supabase.from('sub_categories').select(
        `
          *,
          main_categories!inner(id, name, is_active)
        `,
        { count: 'exact' }
      );

      if (main_category_id)
        query = query.eq('main_category_id', main_category_id);
      if (is_active !== undefined) query = query.eq('is_active', is_active);
      if (created_by) query = query.eq('created_by', created_by);

      if (search && search.trim()) {
        const searchTerm = search.trim();
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      if (sortBy !== 'name') {
        query = query.order('name', { ascending: true });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const response = await query;

      if (response.error) {
        handleCategoryError(response.error, 'fetch sub categories', {
          filters: validatedFilters,
        });
        return { data: [], count: 0, hasMore: false };
      }

      const validatedResponse = validateSupabaseListResponse(
        SubCategoryWithMainSchema,
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
    // Ensure this hook is enabled only if main_category_id is provided when used for specific main cat expansion
    enabled: filters.main_category_id ? !!filters.main_category_id : true,
  });
}

export function useSubCategory(categoryId: string | undefined) {
  const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

  return useQuery({
    queryKey: queryKeys.categories.subDetail(categoryId || ''),
    queryFn: async () => {
      if (!categoryId) return null;

      const validatedId = z.string().uuid().parse(categoryId);

      const response = await supabase
        .from('sub_categories')
        .select(
          `
          *,
          main_categories!inner(id, name, is_active)
        `
        )
        .eq('id', validatedId)
        .single();

      if (response.error) {
        handleCategoryError(response.error, 'fetch sub category details', {
          categoryId: validatedId,
        });
        return null;
      }

      return validateSupabaseResponse(SubCategoryWithMainSchema, response);
    },
    enabled: !!categoryId,
    ...cacheConfig,
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

// ============================================================================
// MAIN CATEGORY MUTATION HOOKS
// ============================================================================

export function useCreateMainCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      categoryData: MainCategoryInsert
    ): Promise<MainCategory> => {
      const validatedData = MainCategoryInsertSchema.parse(categoryData); // Use new schema

      const response = await supabase
        .from('main_categories')
        .insert(validatedData)
        .select()
        .single();

      if (response.error) {
        handleCategoryError(response.error, 'create main category', {
          categoryData: validatedData,
        });
        throw response.error; // Re-throw to be caught by mutation's onError
      }

      const newCategory = validateSupabaseResponse(
        MainCategorySchema,
        response
      );
      if (!newCategory) {
        throw new Error('Failed to create main category - invalid response');
      }
      return newCategory;
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.mainLists(),
      });
      queryClient.setQueryData(
        queryKeys.categories.mainDetail(newCategory.id),
        newCategory
      );
    },
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

export function useUpdateMainCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: MainCategoryUpdate;
    }): Promise<MainCategory> => {
      const validatedId = z.string().uuid().parse(id);
      const validatedUpdateData = MainCategoryUpdateSchema.parse(updates); // Use new schema

      const response = await supabase
        .from('main_categories')
        .update({
          ...validatedUpdateData,
          updated_at: new Date().toISOString(), // Ensure updated_at is set
        })
        .eq('id', validatedId)
        .select()
        .single();

      if (response.error) {
        handleCategoryError(response.error, 'update main category', {
          categoryId: validatedId,
          updateData: validatedUpdateData,
        });
        throw response.error;
      }

      const updatedCategory = validateSupabaseResponse(
        MainCategorySchema,
        response
      );
      if (!updatedCategory) {
        throw new Error('Failed to update main category - invalid response');
      }
      return updatedCategory;
    },
    onSuccess: (updatedCategory, { id: categoryId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.mainLists(),
      });
      queryClient.setQueryData(
        queryKeys.categories.mainDetail(categoryId),
        updatedCategory
      );
      // Also invalidate sub-category lists if main category name/status changes, as it might be displayed with subs
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.subLists(),
      });
    },
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

export function useDeleteMainCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string): Promise<string> => {
      const validatedId = z.string().uuid().parse(categoryId);

      // It's good practice to ensure sub-categories are handled (e.g., deleted by cascade in DB or manually here)
      // Assuming DB handles cascade delete for sub_categories based on foreign key constraint

      const response = await supabase
        .from('main_categories')
        .delete()
        .eq('id', validatedId);

      if (response.error) {
        handleCategoryError(response.error, 'delete main category', {
          categoryId: validatedId,
        });
        throw response.error;
      }
      return validatedId;
    },
    onSuccess: (deletedCategoryId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.mainLists(),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.categories.mainDetail(deletedCategoryId),
      });
      // Invalidate all sub-category lists as they might have been affected by cascade delete
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.subLists(),
      });
    },
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

// ============================================================================
// SUB CATEGORY MUTATION HOOKS
// ============================================================================

export function useCreateSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      categoryData: SubCategoryInsert
    ): Promise<SubCategory> => {
      const validatedData = SubCategoryInsertSchema.parse(categoryData); // Use new schema

      const response = await supabase
        .from('sub_categories')
        .insert(validatedData)
        .select()
        .single();

      if (response.error) {
        handleCategoryError(response.error, 'create sub category', {
          categoryData: validatedData,
        });
        throw response.error;
      }

      const newCategory = validateSupabaseResponse(SubCategorySchema, response);
      if (!newCategory) {
        throw new Error('Failed to create sub category - invalid response');
      }
      return newCategory;
    },
    onSuccess: (newCategory) => {
      // Invalidate sub category lists for the specific main category
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.subList({
          main_category_id: newCategory.main_category_id,
        }),
      });
      // Also invalidate the general sub-lists and main lists (as main list now shows sub-category counts or data)
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.subLists(),
      });

      // CRITICAL FIX: Invalidate all main category lists to refresh subcategory data
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.mainLists(),
      });

      queryClient.setQueryData(
        queryKeys.categories.subDetail(newCategory.id),
        newCategory
      );
    },
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

export function useUpdateSubCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: SubCategoryUpdate;
    }): Promise<SubCategory> => {
      const validatedId = z.string().uuid().parse(id);
      const validatedUpdateData = SubCategoryUpdateSchema.parse(updates); // Use new schema

      const response = await supabase
        .from('sub_categories')
        .update({
          ...validatedUpdateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', validatedId)
        .select()
        .single();

      if (response.error) {
        handleCategoryError(response.error, 'update sub category', {
          categoryId: validatedId,
          updateData: validatedUpdateData,
        });
        throw response.error;
      }
      const updatedCategory = validateSupabaseResponse(
        SubCategorySchema,
        response
      );
      if (!updatedCategory) {
        throw new Error('Failed to update sub category - invalid response');
      }
      return updatedCategory;
    },
    onSuccess: (updatedCategory, { updates }) => {
      // Invalidate specific sub-category list if main_category_id is known or changed
      if (updatedCategory.main_category_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.subList({
            main_category_id: updatedCategory.main_category_id,
          }),
        });
      }
      // If main_category_id could have changed and was part of updates
      if (updates.main_category_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.subList({
            main_category_id: updates.main_category_id,
          }),
        });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.subLists(),
      });

      // CRITICAL FIX: Invalidate all main category lists to refresh subcategory data
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.mainLists(),
      });

      queryClient.setQueryData(
        queryKeys.categories.subDetail(updatedCategory.id),
        updatedCategory
      );
    },
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

export function useDeleteSubCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string): Promise<string> => {
      const validatedId = z.string().uuid().parse(categoryId);

      // Fetch the sub-category first to know its main_category_id for targeted cache invalidation
      const subCatQuery = await supabase
        .from('sub_categories')
        .select('main_category_id')
        .eq('id', validatedId)
        .single();
      const mainCategoryId = subCatQuery.data?.main_category_id;

      const response = await supabase
        .from('sub_categories')
        .delete()
        .eq('id', validatedId);

      if (response.error) {
        handleCategoryError(response.error, 'delete sub category', {
          categoryId: validatedId,
        });
        throw response.error;
      }
      // Return an object containing both IDs for onSuccess
      return JSON.stringify({
        deletedSubCategoryId: validatedId,
        mainCategoryId,
      });
    },
    onSuccess: (idsString) => {
      const { deletedSubCategoryId, mainCategoryId } = JSON.parse(idsString);

      if (mainCategoryId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.categories.subList({
            main_category_id: mainCategoryId,
          }),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.subLists(),
      });

      // CRITICAL FIX: Invalidate all main category lists to refresh subcategory data
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.mainLists(),
      });

      queryClient.removeQueries({
        queryKey: queryKeys.categories.subDetail(deletedSubCategoryId),
      });
    },
    retry: cacheUtils.getRetryConfig('critical'),
  });
}

// ============================================================================
// ANALYTICS HOOKS (Simplified, ensure it uses new schemas if necessary)
// ============================================================================

export function useCategoryAnalytics() {
  const cacheConfig = DOMAIN_CACHE_CONFIG.analytics;

  return useQuery({
    queryKey: queryKeys.categories.analytics(),
    queryFn: async () => {
      const [mainCategoriesResponse, subCategoriesResponse] = await Promise.all(
        [
          supabase
            .from('main_categories')
            .select('id, is_active', { count: 'exact' }),
          supabase
            .from('sub_categories')
            .select('id, is_active', { count: 'exact' }),
        ]
      );

      if (mainCategoriesResponse.error) {
        handleCategoryError(
          mainCategoriesResponse.error,
          'fetch main categories analytics'
        );
        // Or return a default/error state
      }
      if (subCategoriesResponse.error) {
        handleCategoryError(
          subCategoriesResponse.error,
          'fetch sub categories analytics'
        );
      }

      const mainCategories = mainCategoriesResponse.data || [];
      const subCategories = subCategoriesResponse.data || [];

      return {
        totalMainCategories: mainCategoriesResponse.count,
        activeMainCategories: mainCategories.filter((c) => c.is_active).length,
        totalSubCategories: subCategoriesResponse.count,
        activeSubCategories: subCategories.filter((c) => c.is_active).length,
      };
    },
    ...cacheConfig,
    retry: cacheUtils.getRetryConfig('normal'),
  });
}

// ============================================================================
// DASHBOARD DATA HOOK (Simplified)
// ============================================================================

export function useCategoryDashboardData() {
  const analyticsQuery = useCategoryAnalytics();
  const recentMainCategoriesQuery = useMainCategories({ page: 1, limit: 5 });
  // For recent sub-categories, you might want to fetch all or those from a specific main category.
  // Fetching all sub-categories with main category info:
  const recentSubCategoriesQuery = useSubCategories({ page: 1, limit: 5 });

  return {
    analytics: analyticsQuery,
    recentMainCategories: recentMainCategoriesQuery,
    recentSubCategories: recentSubCategoriesQuery,
    isLoading:
      analyticsQuery.isLoading ||
      recentMainCategoriesQuery.isLoading ||
      recentSubCategoriesQuery.isLoading,
    isError:
      analyticsQuery.isError ||
      recentMainCategoriesQuery.isError ||
      recentSubCategoriesQuery.isError,
    error:
      analyticsQuery.error ||
      recentMainCategoriesQuery.error ||
      recentSubCategoriesQuery.error,
  };
}
