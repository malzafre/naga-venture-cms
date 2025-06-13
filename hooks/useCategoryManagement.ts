// // filepath: hooks/useCategoryManagement.ts
// /**
//  * Enhanced Category Management Hooks - Phase 5 Implementation
//  *
//  * Production-grade smart hooks for category management operations with comprehensive validation:
//  * - Main and sub-category CRUD operations with Zod validation
//  * - Category hierarchy management with type safety
//  * - Optimistic updates for category operations
//  * - Real-time category usage tracking
//  * - Complete API response validation
//  * - Category assignment and bulk operations
//  */

// import {
//   keepPreviousData,
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from '@tanstack/react-query';
// import { z } from 'zod';

// import { DOMAIN_CACHE_CONFIG, cacheUtils } from '@/constants/CacheConstants';
// import queryKeys from '@/lib/queryKeys';
// import { supabase } from '@/lib/supabaseClient';
// import {
//   MainCategoryFiltersSchema,
//   MainCategorySchema,
//   SubCategoryFiltersSchema,
//   SubCategorySchema,
//   SubCategoryWithMainSchema,
//   validateSupabaseListResponse,
//   validateSupabaseResponse,
//   type MainCategory,
//   type MainCategoryFilters,
//   type MainCategoryInsert,
//   type MainCategoryUpdate,
//   type SubCategory,
//   type SubCategoryFilters,
//   type SubCategoryInsert,
//   type SubCategoryUpdate,
//   type SubCategoryWithMain,
// } from '@/schemas';

// // ============================================================================
// // ERROR HANDLING
// // ============================================================================

// /**
//  * Enhanced error handling for category operations with contextual logging
//  */
// const handleCategoryError = (
//   error: any,
//   operation: string,
//   context?: Record<string, any>
// ) => {
//   // Log error with context for debugging (development only)
//   if (__DEV__) {
//     console.error(`[CategoryManagement] ${operation}:`, error, context);
//   }

//   // Transform database errors to user-friendly messages
//   if (error.code === '23505') {
//     throw new Error('A category with this name already exists');
//   } else if (error.code === '23503') {
//     throw new Error('Cannot delete category that is being used');
//   } else if (error.message?.includes('permission denied')) {
//     throw new Error('You do not have permission to perform this action');
//   }

//   // Default enhanced error message
//   throw new Error(
//     `Failed to ${operation}: ${error.message || 'Unknown error'}`
//   );
// };

// // ============================================================================
// // TYPES
// // ============================================================================

// export interface MainCategoryListResponse {
//   data: MainCategory[];
//   count: number | null;
//   hasMore: boolean;
// }

// export interface SubCategoryListResponse {
//   data: SubCategoryWithMain[];
//   count: number | null;
//   hasMore: boolean;
// }

// // ============================================================================
// // MAIN CATEGORY HOOKS
// // ============================================================================

// /**
//  * Enhanced Main Categories Hook - Phase 5 Enhanced
//  *
//  * Features optimized main category fetching with comprehensive validation.
//  */
// export function useMainCategories(filters: MainCategoryFilters = {}) {
//   // Phase 5: Validate input filters with defaults
//   const defaultFilters: MainCategoryFilters = {
//     page: 1,
//     limit: 20,
//     ...filters,
//   };

//   const validatedFilters = MainCategoryFiltersSchema.parse(defaultFilters);

//   const {
//     search,
//     is_active,
//     created_by,
//     page = 1,
//     limit = 20,
//   } = validatedFilters;

//   const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

//   return useQuery({
//     queryKey: queryKeys.categories.mainList(validatedFilters),
//     queryFn: async (): Promise<MainCategoryListResponse> => {
//       let query = supabase
//         .from('main_categories')
//         .select('*', { count: 'exact' });

//       // Apply filters
//       if (is_active !== undefined) query = query.eq('is_active', is_active);
//       if (created_by) query = query.eq('created_by', created_by);

//       // Enhanced search across multiple fields
//       if (search && search.trim()) {
//         const searchTerm = search.trim();
//         query = query.or(
//           `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
//         );
//       }

//       // Apply sorting
//       query = query.order('display_order', { ascending: true });
//       query = query.order('name', { ascending: true });

//       // Apply pagination
//       const from = (page - 1) * limit;
//       const to = from + limit - 1;
//       query = query.range(from, to);

//       const response = await query;

//       if (response.error) {
//         handleCategoryError(response.error, 'fetch main categories', {
//           filters: validatedFilters,
//         });
//       }

//       // Phase 5: Validate API response with Zod
//       const validatedResponse = validateSupabaseListResponse(
//         MainCategorySchema,
//         response
//       );

//       const hasMore = validatedResponse.count
//         ? from + limit < validatedResponse.count
//         : false;

//       return {
//         data: validatedResponse.data,
//         count: validatedResponse.count,
//         hasMore,
//       };
//     },
//     ...cacheConfig,
//     placeholderData: keepPreviousData,
//     retry: cacheUtils.getRetryConfig('normal'),
//   });
// }

// /**
//  * Main Category Detail Hook - Phase 5 Enhanced
//  *
//  * Fetches detailed main category information with comprehensive validation.
//  */
// export function useMainCategory(categoryId: string | undefined) {
//   const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

//   return useQuery({
//     queryKey: queryKeys.categories.mainDetail(categoryId || ''),
//     queryFn: async () => {
//       if (!categoryId) return null;

//       // Phase 5: Validate categoryId input
//       const validatedId = z.string().uuid().parse(categoryId);

//       const response = await supabase
//         .from('main_categories')
//         .select('*')
//         .eq('id', validatedId)
//         .single();

//       if (response.error) {
//         handleCategoryError(response.error, 'fetch main category details', {
//           categoryId: validatedId,
//         });
//       }

//       // Phase 5: Validate API response with Zod
//       const validatedData = validateSupabaseResponse(
//         MainCategorySchema,
//         response
//       );

//       return validatedData;
//     },
//     enabled: !!categoryId,
//     ...cacheConfig,
//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// // ============================================================================
// // SUB CATEGORY HOOKS
// // ============================================================================

// /**
//  * Enhanced Sub Categories Hook - Phase 5 Enhanced
//  *
//  * Features optimized sub category fetching with main category relations and comprehensive validation.
//  */
// export function useSubCategories(filters: SubCategoryFilters = {}) {
//   // Phase 5: Validate input filters with defaults
//   const defaultFilters: SubCategoryFilters = {
//     page: 1,
//     limit: 20,
//     ...filters,
//   };

//   const validatedFilters = SubCategoryFiltersSchema.parse(defaultFilters);

//   const {
//     search,
//     main_category_id,
//     is_active,
//     created_by,
//     page = 1,
//     limit = 20,
//   } = validatedFilters;

//   const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

//   return useQuery({
//     queryKey: queryKeys.categories.subList(validatedFilters),
//     queryFn: async (): Promise<SubCategoryListResponse> => {
//       let query = supabase.from('sub_categories').select(
//         `
//           *,
//           main_categories!sub_categories_main_category_id_fkey(
//             id,
//             name,
//             is_active
//           )
//         `,
//         { count: 'exact' }
//       );

//       // Apply filters
//       if (main_category_id)
//         query = query.eq('main_category_id', main_category_id);
//       if (is_active !== undefined) query = query.eq('is_active', is_active);
//       if (created_by) query = query.eq('created_by', created_by);

//       // Enhanced search across multiple fields
//       if (search && search.trim()) {
//         const searchTerm = search.trim();
//         query = query.or(
//           `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
//         );
//       }

//       // Apply sorting
//       query = query.order('display_order', { ascending: true });
//       query = query.order('name', { ascending: true });

//       // Apply pagination
//       const from = (page - 1) * limit;
//       const to = from + limit - 1;
//       query = query.range(from, to);

//       const response = await query;

//       if (response.error) {
//         handleCategoryError(response.error, 'fetch sub categories', {
//           filters: validatedFilters,
//         });
//       }

//       // Phase 5: Validate API response with Zod
//       const validatedResponse = validateSupabaseListResponse(
//         SubCategoryWithMainSchema,
//         response
//       );

//       const hasMore = validatedResponse.count
//         ? from + limit < validatedResponse.count
//         : false;

//       return {
//         data: validatedResponse.data,
//         count: validatedResponse.count,
//         hasMore,
//       };
//     },
//     ...cacheConfig,
//     placeholderData: keepPreviousData,
//     retry: cacheUtils.getRetryConfig('normal'),
//   });
// }

// /**
//  * Sub Category Detail Hook - Phase 5 Enhanced
//  *
//  * Fetches detailed sub category information with main category relation and comprehensive validation.
//  */
// export function useSubCategory(categoryId: string | undefined) {
//   const cacheConfig = DOMAIN_CACHE_CONFIG.categories;

//   return useQuery({
//     queryKey: queryKeys.categories.subDetail(categoryId || ''),
//     queryFn: async () => {
//       if (!categoryId) return null;

//       // Phase 5: Validate categoryId input
//       const validatedId = z.string().uuid().parse(categoryId);

//       const response = await supabase
//         .from('sub_categories')
//         .select(
//           `
//           *,
//           main_categories!sub_categories_main_category_id_fkey(
//             id,
//             name,
//             is_active
//           )
//         `
//         )
//         .eq('id', validatedId)
//         .single();

//       if (response.error) {
//         handleCategoryError(response.error, 'fetch sub category details', {
//           categoryId: validatedId,
//         });
//       }

//       // Phase 5: Validate API response with Zod
//       const validatedData = validateSupabaseResponse(
//         SubCategoryWithMainSchema,
//         response
//       );

//       return validatedData;
//     },
//     enabled: !!categoryId,
//     ...cacheConfig,
//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// // ============================================================================
// // MAIN CATEGORY MUTATION HOOKS
// // ============================================================================

// /**
//  * Main Category Creation Hook - Phase 5 Enhanced
//  *
//  * Creates a new main category with comprehensive validation.
//  */
// export function useCreateMainCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (
//       categoryData: MainCategoryInsert
//     ): Promise<MainCategory> => {
//       // Phase 5: Validate input data with Zod
//       const validatedData = MainCategorySchema.omit({
//         id: true,
//         created_at: true,
//         updated_at: true,
//       }).parse(categoryData);

//       const response = await supabase
//         .from('main_categories')
//         .insert(validatedData)
//         .select()
//         .single();

//       if (response.error) {
//         handleCategoryError(response.error, 'create main category', {
//           categoryData: validatedData,
//         });
//       }

//       // Phase 5: Validate API response
//       const validatedCategoryData = validateSupabaseResponse(
//         MainCategorySchema,
//         response
//       );

//       if (!validatedCategoryData) {
//         throw new Error('Failed to create main category - invalid response');
//       }

//       return validatedCategoryData;
//     },

//     onSuccess: (newCategory) => {
//       console.log('[useCreateMainCategory] Success:', newCategory.id);

//       // Invalidate main category listings to trigger refetch
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.categories.mainLists(),
//       });

//       // Set detail cache for immediate navigation
//       queryClient.setQueryData(
//         queryKeys.categories.mainDetail(newCategory.id),
//         newCategory
//       );
//     },

//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// /**
//  * Main Category Update Hook - Phase 5 Enhanced
//  *
//  * Updates an existing main category with comprehensive validation.
//  */
// export function useUpdateMainCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       categoryId,
//       updateData,
//     }: {
//       categoryId: string;
//       updateData: MainCategoryUpdate;
//     }): Promise<MainCategory> => {
//       // Phase 5: Validate input data
//       const validatedId = z.string().uuid().parse(categoryId);
//       const validatedUpdateData = MainCategorySchema.partial()
//         .omit({
//           id: true,
//           created_at: true,
//           updated_at: true,
//         })
//         .parse(updateData);

//       const response = await supabase
//         .from('main_categories')
//         .update({
//           ...validatedUpdateData,
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', validatedId)
//         .select()
//         .single();

//       if (response.error) {
//         handleCategoryError(response.error, 'update main category', {
//           categoryId: validatedId,
//           updateData: validatedUpdateData,
//         });
//       }

//       // Phase 5: Validate API response
//       const validatedCategoryData = validateSupabaseResponse(
//         MainCategorySchema,
//         response
//       );

//       if (!validatedCategoryData) {
//         throw new Error('Failed to update main category - invalid response');
//       }

//       return validatedCategoryData;
//     },

//     onSuccess: (updatedCategory, { categoryId }) => {
//       console.log('[useUpdateMainCategory] Success:', categoryId);

//       // Update detail cache
//       queryClient.setQueryData(
//         queryKeys.categories.mainDetail(categoryId),
//         updatedCategory
//       );

//       // Invalidate main category listings
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.categories.mainLists(),
//       });
//     },

//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// /**
//  * Main Category Deletion Hook - Phase 5 Enhanced
//  *
//  * Deletes a main category with validation and cache cleanup.
//  */
// export function useDeleteMainCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (categoryId: string): Promise<void> => {
//       // Phase 5: Validate input data
//       const validatedId = z.string().uuid().parse(categoryId);

//       const response = await supabase
//         .from('main_categories')
//         .delete()
//         .eq('id', validatedId);

//       if (response.error) {
//         handleCategoryError(response.error, 'delete main category', {
//           categoryId: validatedId,
//         });
//       }
//     },

//     onSuccess: (_, categoryId) => {
//       console.log('[useDeleteMainCategory] Success:', categoryId);

//       // Remove from detail cache
//       queryClient.removeQueries({
//         queryKey: queryKeys.categories.mainDetail(categoryId),
//       });

//       // Invalidate listings
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.categories.mainLists(),
//       });

//       // Invalidate sub-categories for this main category
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.categories.subLists(),
//       });
//     },

//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// // ============================================================================
// // SUB CATEGORY MUTATION HOOKS
// // ============================================================================

// /**
//  * Sub Category Creation Hook - Phase 5 Enhanced
//  *
//  * Creates a new sub category with comprehensive validation.
//  */
// export function useCreateSubCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (
//       categoryData: SubCategoryInsert
//     ): Promise<SubCategory> => {
//       // Phase 5: Validate input data with Zod
//       const validatedData = SubCategorySchema.omit({
//         id: true,
//         created_at: true,
//         updated_at: true,
//       }).parse(categoryData);

//       const response = await supabase
//         .from('sub_categories')
//         .insert(validatedData)
//         .select()
//         .single();

//       if (response.error) {
//         handleCategoryError(response.error, 'create sub category', {
//           categoryData: validatedData,
//         });
//       }

//       // Phase 5: Validate API response
//       const validatedCategoryData = validateSupabaseResponse(
//         SubCategorySchema,
//         response
//       );

//       if (!validatedCategoryData) {
//         throw new Error('Failed to create sub category - invalid response');
//       }

//       return validatedCategoryData;
//     },

//     onSuccess: (newCategory) => {
//       console.log('[useCreateSubCategory] Success:', newCategory.id);

//       // Invalidate sub category listings
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.categories.subLists(),
//       });

//       // Set detail cache for immediate navigation
//       queryClient.setQueryData(
//         queryKeys.categories.subDetail(newCategory.id),
//         newCategory
//       );
//     },

//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// /**
//  * Sub Category Update Hook - Phase 5 Enhanced
//  *
//  * Updates an existing sub category with comprehensive validation.
//  */
// export function useUpdateSubCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       categoryId,
//       updateData,
//     }: {
//       categoryId: string;
//       updateData: SubCategoryUpdate;
//     }): Promise<SubCategory> => {
//       // Phase 5: Validate input data
//       const validatedId = z.string().uuid().parse(categoryId);
//       const validatedUpdateData = SubCategorySchema.partial()
//         .omit({
//           id: true,
//           created_at: true,
//           updated_at: true,
//         })
//         .parse(updateData);

//       const response = await supabase
//         .from('sub_categories')
//         .update({
//           ...validatedUpdateData,
//           updated_at: new Date().toISOString(),
//         })
//         .eq('id', validatedId)
//         .select()
//         .single();

//       if (response.error) {
//         handleCategoryError(response.error, 'update sub category', {
//           categoryId: validatedId,
//           updateData: validatedUpdateData,
//         });
//       }

//       // Phase 5: Validate API response
//       const validatedCategoryData = validateSupabaseResponse(
//         SubCategorySchema,
//         response
//       );

//       if (!validatedCategoryData) {
//         throw new Error('Failed to update sub category - invalid response');
//       }

//       return validatedCategoryData;
//     },

//     onSuccess: (updatedCategory, { categoryId }) => {
//       console.log('[useUpdateSubCategory] Success:', categoryId);

//       // Update detail cache
//       queryClient.setQueryData(
//         queryKeys.categories.subDetail(categoryId),
//         updatedCategory
//       );

//       // Invalidate sub category listings
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.categories.subLists(),
//       });
//     },

//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// /**
//  * Sub Category Deletion Hook - Phase 5 Enhanced
//  *
//  * Deletes a sub category with validation and cache cleanup.
//  */
// export function useDeleteSubCategory() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (categoryId: string): Promise<void> => {
//       // Phase 5: Validate input data
//       const validatedId = z.string().uuid().parse(categoryId);

//       const response = await supabase
//         .from('sub_categories')
//         .delete()
//         .eq('id', validatedId);

//       if (response.error) {
//         handleCategoryError(response.error, 'delete sub category', {
//           categoryId: validatedId,
//         });
//       }
//     },

//     onSuccess: (_, categoryId) => {
//       console.log('[useDeleteSubCategory] Success:', categoryId);

//       // Remove from detail cache
//       queryClient.removeQueries({
//         queryKey: queryKeys.categories.subDetail(categoryId),
//       });

//       // Invalidate listings
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.categories.subLists(),
//       });

//       // Invalidate business categories that might use this sub-category
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.businesses.all,
//       });
//     },

//     retry: cacheUtils.getRetryConfig('critical'),
//   });
// }

// // ============================================================================
// // ANALYTICS HOOKS
// // ============================================================================

// /**
//  * Category Analytics Hook - Phase 5 Enhanced
//  *
//  * Provides analytics data for category usage and statistics.
//  */
// export function useCategoryAnalytics() {
//   const cacheConfig = DOMAIN_CACHE_CONFIG.analytics;

//   return useQuery({
//     queryKey: queryKeys.categories.analytics(),
//     queryFn: async () => {
//       // Fetch category counts
//       const [mainCategoriesResponse, subCategoriesResponse] = await Promise.all(
//         [
//           supabase
//             .from('main_categories')
//             .select('id, is_active', { count: 'exact' }),
//           supabase
//             .from('sub_categories')
//             .select('id, is_active', { count: 'exact' }),
//         ]
//       );

//       if (mainCategoriesResponse.error) {
//         handleCategoryError(
//           mainCategoriesResponse.error,
//           'fetch main categories analytics'
//         );
//       }

//       if (subCategoriesResponse.error) {
//         handleCategoryError(
//           subCategoriesResponse.error,
//           'fetch sub categories analytics'
//         );
//       }

//       const mainCategories = mainCategoriesResponse.data || [];
//       const subCategories = subCategoriesResponse.data || [];

//       return {
//         totalMainCategories: mainCategories.length,
//         activeMainCategories: mainCategories.filter((c) => c.is_active).length,
//         totalSubCategories: subCategories.length,
//         activeSubCategories: subCategories.filter((c) => c.is_active).length,
//         categoryUtilization: {
//           main:
//             (mainCategories.filter((c) => c.is_active).length /
//               Math.max(mainCategories.length, 1)) *
//             100,
//           sub:
//             (subCategories.filter((c) => c.is_active).length /
//               Math.max(subCategories.length, 1)) *
//             100,
//         },
//       };
//     },
//     ...cacheConfig,
//     retry: cacheUtils.getRetryConfig('normal'),
//   });
// }

// // ============================================================================
// // DASHBOARD DATA HOOK
// // ============================================================================

// /**
//  * Category Dashboard Data Hook
//  *
//  * Efficiently loads multiple category-related queries for dashboard views.
//  */
// export function useCategoryDashboardData() {
//   const analyticsQuery = useCategoryAnalytics();
//   const recentMainCategoriesQuery = useMainCategories({
//     page: 1,
//     limit: 5,
//   });
//   const recentSubCategoriesQuery = useSubCategories({
//     page: 1,
//     limit: 5,
//   });

//   return {
//     analytics: analyticsQuery,
//     recentMainCategories: recentMainCategoriesQuery,
//     recentSubCategories: recentSubCategoriesQuery,
//     isLoading:
//       analyticsQuery.isLoading ||
//       recentMainCategoriesQuery.isLoading ||
//       recentSubCategoriesQuery.isLoading,
//     isError:
//       analyticsQuery.isError ||
//       recentMainCategoriesQuery.isError ||
//       recentSubCategoriesQuery.isError,
//     error:
//       analyticsQuery.error ||
//       recentMainCategoriesQuery.error ||
//       recentSubCategoriesQuery.error,
//   };
// }
