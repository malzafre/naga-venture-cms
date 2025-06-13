// // filepath: hooks/useTouristSpotManagement.ts
// /**
//  * Enhanced Tourist Spot Management Hooks - Phase 5 Implementation
//  *
//  * Production-grade smart hooks for tourist spot management operations with comprehensive validation:
//  * - Tourist spot CRUD operations with Zod validation
//  * - Geographic location management with type safety
//  * - Optimistic updates for tourist spot operations
//  * - Real-time tourist spot analytics tracking
//  * - Complete API response validation
//  * - Tourist spot assignment and bulk operations
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
//   BulkTouristSpotOperationSchema,
//   TouristSpotAnalyticsSchema,
//   TouristSpotDashboardDataSchema,
//   TouristSpotFeatureUpdateSchema,
//   TouristSpotFiltersSchema,
//   TouristSpotSchema,
//   TouristSpotStatusUpdateSchema,
//   TouristSpotWithRelationsSchema,
//   validateSupabaseListResponse,
//   validateSupabaseResponse,
//   type BulkTouristSpotOperation,
//   type TouristSpotFeatureUpdate,
//   type TouristSpotFilters,
//   type TouristSpotInsert,
//   type TouristSpotStatusUpdate,
//   type TouristSpotUpdate,
// } from '@/schemas';

// // ============================================================================
// // ERROR HANDLING
// // ============================================================================

// /**
//  * Enhanced error handling for tourist spot operations with contextual logging
//  */
// const handleTouristSpotError = (
//   error: any,
//   operation: string,
//   context?: Record<string, any>
// ) => {
//   // Log error with context for debugging
//   console.error(`Tourist Spot ${operation} Error:`, {
//     error: error.message || error,
//     context,
//     timestamp: new Date().toISOString(),
//   });

//   // Provide user-friendly error messages
//   const errorMessage = error?.message || 'An unexpected error occurred';

//   if (errorMessage.includes('duplicate key value')) {
//     throw new Error(
//       'A tourist spot with this name already exists at this location'
//     );
//   }

//   if (errorMessage.includes('foreign key violation')) {
//     throw new Error('Referenced category or location does not exist');
//   }

//   if (
//     errorMessage.includes('permission denied') ||
//     errorMessage.includes('RLS')
//   ) {
//     throw new Error('You do not have permission to perform this action');
//   }

//   if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
//     throw new Error(
//       'Network error. Please check your connection and try again'
//     );
//   }

//   throw new Error(errorMessage);
// };

// // ============================================================================
// // QUERY HOOKS
// // ============================================================================

// /**
//  * Fetch tourist spots with filters, search, and pagination
//  */
// export const useTouristSpots = (filters?: TouristSpotFilters) => {
//   // Validate filters with Zod schema
//   const validatedFilters = filters
//     ? TouristSpotFiltersSchema.parse(filters)
//     : undefined;

//   return useQuery({
//     queryKey: queryKeys.touristSpots.filtered(validatedFilters || {}),
//     queryFn: async () => {
//       try {
//         let query = supabase
//           .from('tourist_spots')
//           .select(
//             `
//             *,
//             tourist_spot_images (
//               id,
//               image_url,
//               caption,
//               is_primary,
//               display_order
//             ),
//             tourist_spot_categories (
//               sub_categories (
//                 id,
//                 name,
//                 main_categories (
//                   name
//                 )
//               )
//             )
//           `
//           )
//           .order('created_at', { ascending: false });

//         // Apply filters with validation
//         if (validatedFilters?.search) {
//           query = query.or(
//             `name.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`
//           );
//         }

//         if (validatedFilters?.spot_type) {
//           query = query.eq('spot_type', validatedFilters.spot_type);
//         }

//         if (validatedFilters?.status) {
//           query = query.eq('status', validatedFilters.status);
//         }

//         if (validatedFilters?.is_featured !== undefined) {
//           query = query.eq('is_featured', validatedFilters.is_featured);
//         }

//         if (validatedFilters?.city) {
//           query = query.eq('city', validatedFilters.city);
//         }

//         if (validatedFilters?.has_entry_fee !== undefined) {
//           if (validatedFilters.has_entry_fee) {
//             query = query.not('entry_fee', 'is', null);
//           } else {
//             query = query.is('entry_fee', null);
//           }
//         }

//         if (validatedFilters?.min_rating) {
//           query = query.gte('average_rating', validatedFilters.min_rating);
//         }

//         if (validatedFilters?.date_from) {
//           query = query.gte('created_at', validatedFilters.date_from);
//         }

//         if (validatedFilters?.date_to) {
//           query = query.lte('created_at', validatedFilters.date_to);
//         }

//         if (validatedFilters?.created_by) {
//           query = query.eq('created_by', validatedFilters.created_by);
//         }

//         // Apply pagination
//         const offset =
//           ((validatedFilters?.page || 1) - 1) * (validatedFilters?.limit || 10);
//         const limit = validatedFilters?.limit || 10;

//         query = query.range(offset, offset + limit - 1);

//         const { data, error, count } = await query;

//         if (error) {
//           throw error;
//         } // Validate API response
//         const validatedData = validateSupabaseListResponse(
//           TouristSpotWithRelationsSchema,
//           { data, count, status: 200, statusText: 'OK', error: null }
//         );

//         return {
//           data: validatedData,
//           count: count || 0,
//           page: validatedFilters?.page || 1,
//           limit: validatedFilters?.limit || 10,
//           totalPages: Math.ceil((count || 0) / (validatedFilters?.limit || 10)),
//         };
//       } catch (error) {
//         handleTouristSpotError(error, 'fetch tourist spots', {
//           filters: validatedFilters,
//         });
//         throw error;
//       }
//     },
//     placeholderData: keepPreviousData,
//     staleTime: DOMAIN_CACHE_CONFIG.touristSpots.staleTime,
//     gcTime: DOMAIN_CACHE_CONFIG.touristSpots.gcTime,
//   });
// };

// /**
//  * Fetch single tourist spot by ID
//  */
// export const useTouristSpot = (spotId?: string) => {
//   // Validate UUID with Zod
//   const validatedId = spotId ? z.string().uuid().parse(spotId) : undefined;

//   return useQuery({
//     queryKey: queryKeys.touristSpots.detail(validatedId || ''),
//     queryFn: async () => {
//       if (!validatedId) {
//         throw new Error('Tourist spot ID is required');
//       }

//       try {
//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .select(
//             `
//             *,
//             tourist_spot_images (
//               id,
//               image_url,
//               caption,
//               is_primary,
//               display_order
//             ),
//             tourist_spot_categories (
//               sub_categories (
//                 id,
//                 name,
//                 main_categories (
//                   name
//                 )
//               )
//             )
//           `
//           )
//           .eq('id', validatedId)
//           .single();

//         if (error) {
//           throw error;
//         } // Validate API response
//         return validateSupabaseResponse(TouristSpotWithRelationsSchema, data);
//       } catch (error) {
//         handleTouristSpotError(error, 'fetch tourist spot', {
//           spotId: validatedId,
//         });
//         throw error;
//       }
//     },
//     enabled: !!validatedId,
//     staleTime: DOMAIN_CACHE_CONFIG.touristSpots.staleTime,
//     gcTime: DOMAIN_CACHE_CONFIG.touristSpots.gcTime,
//   });
// };

// /**
//  * Fetch featured tourist spots
//  */
// export const useFeaturedTouristSpots = (limit = 6) => {
//   const validatedLimit = z.number().min(1).max(20).parse(limit);

//   return useQuery({
//     queryKey: queryKeys.touristSpots.featured(),
//     queryFn: async () => {
//       try {
//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .select(
//             `
//             *,
//             tourist_spot_images!inner (
//               id,
//               image_url,
//               caption,
//               is_primary
//             )
//           `
//           )
//           .eq('is_featured', true)
//           .eq('status', 'active')
//           .eq('tourist_spot_images.is_primary', true)
//           .order('average_rating', { ascending: false, nullsFirst: false })
//           .limit(validatedLimit);

//         if (error) {
//           throw error;
//         }

//         // Validate API response
//         return validateSupabaseListResponse(
//           TouristSpotWithRelationsSchema,
//           data || [],
//           'featured tourist spots'
//         );
//       } catch (error) {
//         handleTouristSpotError(error, 'fetch featured tourist spots', {
//           limit: validatedLimit,
//         });
//         throw error;
//       }
//     },
//     staleTime: DOMAIN_CACHE_CONFIG.touristSpots.staleTime,
//     gcTime: DOMAIN_CACHE_CONFIG.touristSpots.gcTime,
//   });
// };

// /**
//  * Fetch tourist spot analytics
//  */
// export const useTouristSpotAnalytics = () => {
//   return useQuery({
//     queryKey: queryKeys.touristSpots.analytics(),
//     queryFn: async () => {
//       try {
//         // Fetch analytics data using RPC function or aggregations
//         const [
//           spotsCount,
//           spotsByType,
//           spotsByStatus,
//           recentActivity,
//           popularSpots,
//         ] = await Promise.all([
//           // Total counts
//           supabase
//             .from('tourist_spots')
//             .select('spot_type, status, is_featured', { count: 'exact' }),

//           // Spots by type
//           supabase.from('tourist_spots').select('spot_type'),

//           // Spots by status
//           supabase.from('tourist_spots').select('status'),

//           // Recent activity (last 10)
//           supabase
//             .from('tourist_spots')
//             .select('id, name, created_at, updated_at')
//             .order('updated_at', { ascending: false })
//             .limit(10),

//           // Popular spots
//           supabase
//             .from('tourist_spots')
//             .select('id, name, average_rating, review_count')
//             .not('average_rating', 'is', null)
//             .order('average_rating', { ascending: false })
//             .limit(5),
//         ]);

//         if (spotsCount.error) throw spotsCount.error;
//         if (spotsByType.error) throw spotsByType.error;
//         if (spotsByStatus.error) throw spotsByStatus.error;
//         if (recentActivity.error) throw recentActivity.error;
//         if (popularSpots.error) throw popularSpots.error;

//         // Process and validate the analytics data
//         const analytics = {
//           total_spots: spotsCount.count || 0,
//           active_spots:
//             spotsCount.data?.filter((s) => s.status === 'active').length || 0,
//           featured_spots:
//             spotsCount.data?.filter((s) => s.is_featured).length || 0,
//           spots_by_type: Object.fromEntries(
//             (spotsByType.data || []).map((item) => [
//               item.spot_type,
//               item.count || 0,
//             ])
//           ),
//           spots_by_status: Object.fromEntries(
//             (spotsByStatus.data || []).map((item) => [
//               item.status,
//               item.count || 0,
//             ])
//           ),
//           average_rating: 0, // Calculate from aggregation if needed
//           total_reviews: 0, // Calculate from aggregation if needed
//           recent_activity: (recentActivity.data || []).map((spot) => ({
//             id: spot.id,
//             name: spot.name,
//             action: 'updated' as const,
//             timestamp: spot.updated_at,
//           })),
//           popular_spots: popularSpots.data || [],
//         };

//         // Validate analytics response
//         return TouristSpotAnalyticsSchema.parse(analytics);
//       } catch (error) {
//         handleTouristSpotError(error, 'fetch tourist spot analytics');
//         throw error;
//       }
//     },
//     staleTime: DOMAIN_CACHE_CONFIG.analytics.staleTime, // Use analytics config
//     gcTime: DOMAIN_CACHE_CONFIG.analytics.gcTime,
//   });
// };

// /**
//  * Fetch tourist spot dashboard data
//  */
// export const useTouristSpotDashboardData = () => {
//   return useQuery({
//     queryKey: queryKeys.touristSpots.dashboard(),
//     queryFn: async () => {
//       try {
//         const [overviewData, recentSpots, topRatedSpots] = await Promise.all([
//           // Overview stats
//           supabase.from('tourist_spots').select('status, is_featured'),

//           // Recent spots
//           supabase
//             .from('tourist_spots')
//             .select('id, name, spot_type, status, created_at')
//             .order('created_at', { ascending: false })
//             .limit(5),

//           // Top rated spots
//           supabase
//             .from('tourist_spots')
//             .select('id, name, average_rating, review_count')
//             .not('average_rating', 'is', null)
//             .order('average_rating', { ascending: false })
//             .limit(5),
//         ]);

//         if (overviewData.error) throw overviewData.error;
//         if (recentSpots.error) throw recentSpots.error;
//         if (topRatedSpots.error) throw topRatedSpots.error;

//         const overview = overviewData.data || [];
//         const dashboardData = {
//           overview: {
//             total_spots: overview.length,
//             active_spots: overview.filter((s) => s.status === 'active').length,
//             inactive_spots: overview.filter((s) => s.status === 'inactive')
//               .length,
//             featured_spots: overview.filter((s) => s.is_featured).length,
//             pending_reviews: 0, // Would need to query reviews table
//           },
//           recent_spots: recentSpots.data || [],
//           top_rated_spots: topRatedSpots.data || [],
//           activity_summary: {
//             new_spots_this_week: 0, // Would need date filtering
//             new_reviews_this_week: 0, // Would need to query reviews
//             featured_spots_this_month: 0, // Would need date filtering
//           },
//         };

//         // Validate dashboard data response
//         return TouristSpotDashboardDataSchema.parse(dashboardData);
//       } catch (error) {
//         handleTouristSpotError(error, 'fetch tourist spot dashboard data');
//         throw error;
//       }
//     },
//     staleTime: 60000, // 1 minute
//     gcTime: 300000, // 5 minutes
//   });
// };

// // ============================================================================
// // MUTATION HOOKS
// // ============================================================================

// /**
//  * Create new tourist spot
//  */
// export const useCreateTouristSpot = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (touristSpotData: TouristSpotInsert) => {
//       try {
//         // Validate input data
//         const validatedData = z
//           .object({
//             name: z.string().min(2).max(100),
//             description: z.string().min(50).max(2000),
//             spot_type: z.enum([
//               'natural',
//               'cultural',
//               'historical',
//               'religious',
//               'recreational',
//               'other',
//             ]),
//             address: z.string().min(10).max(200),
//             city: z.string().optional(),
//             province: z.string().optional(),
//             location: z.object({
//               latitude: z.number(),
//               longitude: z.number(),
//             }),
//             contact_phone: z.string().optional(),
//             contact_email: z.string().email().optional(),
//             website: z.string().url().optional(),
//             opening_time: z.string().optional(),
//             closing_time: z.string().optional(),
//             entry_fee: z.number().min(0).optional(),
//             status: z
//               .enum(['active', 'inactive', 'under_maintenance', 'coming_soon'])
//               .optional(),
//           })
//           .parse(touristSpotData);

//         // Transform location for PostGIS
//         const insertData = {
//           ...validatedData,
//           location: `POINT(${validatedData.location.longitude} ${validatedData.location.latitude})`,
//         };

//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .insert(insertData)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         } // Validate response
//         return validateSupabaseResponse(TouristSpotSchema, data);
//       } catch (error) {
//         handleTouristSpotError(error, 'create tourist spot', {
//           touristSpotData,
//         });
//         throw error;
//       }
//     },
//     onSuccess: (newTouristSpot) => {
//       // Invalidate relevant queries
//       cacheUtils.invalidateDomainQueries(queryClient, 'touristSpots');

//       // Add to cache optimistically
//       queryClient.setQueryData(
//         queryKeys.touristSpots.detail(newTouristSpot.id),
//         newTouristSpot
//       );
//     },
//   });
// };

// /**
//  * Update existing tourist spot
//  */
// export const useUpdateTouristSpot = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (touristSpotData: TouristSpotUpdate) => {
//       try {
//         // Validate input data with partial schema
//         const validatedData = z
//           .object({
//             id: z.string().uuid(),
//             name: z.string().min(2).max(100).optional(),
//             description: z.string().min(50).max(2000).optional(),
//             spot_type: z
//               .enum([
//                 'natural',
//                 'cultural',
//                 'historical',
//                 'religious',
//                 'recreational',
//                 'other',
//               ])
//               .optional(),
//             address: z.string().min(10).max(200).optional(),
//             city: z.string().optional(),
//             province: z.string().optional(),
//             location: z
//               .object({
//                 latitude: z.number(),
//                 longitude: z.number(),
//               })
//               .optional(),
//             contact_phone: z.string().optional(),
//             contact_email: z.string().email().optional(),
//             website: z.string().url().optional(),
//             opening_time: z.string().optional(),
//             closing_time: z.string().optional(),
//             entry_fee: z.number().min(0).optional(),
//             status: z
//               .enum(['active', 'inactive', 'under_maintenance', 'coming_soon'])
//               .optional(),
//           })
//           .parse(touristSpotData);

//         const { id, ...updateData } = validatedData;

//         // Transform location if provided
//         const finalUpdateData = {
//           ...updateData,
//           ...(updateData.location && {
//             location: `POINT(${updateData.location.longitude} ${updateData.location.latitude})`,
//           }),
//           updated_at: new Date().toISOString(),
//         };

//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .update(finalUpdateData)
//           .eq('id', id)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         } // Validate response
//         return validateSupabaseResponse(TouristSpotSchema, data);
//       } catch (error) {
//         handleTouristSpotError(error, 'update tourist spot', {
//           touristSpotData,
//         });
//         throw error;
//       }
//     },
//     onSuccess: (updatedTouristSpot) => {
//       // Update cache with new data
//       queryClient.setQueryData(
//         queryKeys.touristSpots.detail(updatedTouristSpot.id),
//         updatedTouristSpot
//       );

//       // Invalidate list queries to refresh
//       cacheUtils.invalidateListQueries(queryClient, 'touristSpots');
//     },
//   });
// };

// /**
//  * Delete tourist spot
//  */
// export const useDeleteTouristSpot = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (spotId: string) => {
//       try {
//         // Validate ID
//         const validatedId = z.string().uuid().parse(spotId);

//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .delete()
//           .eq('id', validatedId)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         }

//         return data;
//       } catch (error) {
//         handleTouristSpotError(error, 'delete tourist spot', { spotId });
//         throw error;
//       }
//     },
//     onSuccess: (_, spotId) => {
//       // Remove from cache
//       queryClient.removeQueries({
//         queryKey: queryKeys.touristSpots.detail(spotId),
//       });

//       // Invalidate list queries
//       cacheUtils.invalidateListQueries(queryClient, 'touristSpots');
//     },
//   });
// };

// /**
//  * Update tourist spot status
//  */
// export const useUpdateTouristSpotStatus = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (statusUpdate: TouristSpotStatusUpdate) => {
//       try {
//         // Validate input
//         const validatedUpdate =
//           TouristSpotStatusUpdateSchema.parse(statusUpdate);

//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .update({
//             status: validatedUpdate.status,
//             updated_at: new Date().toISOString(),
//           })
//           .eq('id', validatedUpdate.id)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         }
//         return validateSupabaseResponse(TouristSpotSchema, data);
//       } catch (error) {
//         handleTouristSpotError(error, 'update tourist spot status', {
//           statusUpdate,
//         });
//         throw error;
//       }
//     },
//     onSuccess: (updatedSpot) => {
//       // Update cache
//       queryClient.setQueryData(
//         queryKeys.touristSpots.detail(updatedSpot.id),
//         updatedSpot
//       );

//       // Invalidate list queries
//       cacheUtils.invalidateListQueries(queryClient, 'touristSpots');
//     },
//   });
// };

// /**
//  * Update tourist spot featured status
//  */
// export const useUpdateTouristSpotFeature = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (featureUpdate: TouristSpotFeatureUpdate) => {
//       try {
//         // Validate input
//         const validatedUpdate =
//           TouristSpotFeatureUpdateSchema.parse(featureUpdate);

//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .update({
//             is_featured: validatedUpdate.is_featured,
//             updated_at: new Date().toISOString(),
//           })
//           .eq('id', validatedUpdate.id)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         }
//         return validateSupabaseResponse(TouristSpotSchema, data);
//       } catch (error) {
//         handleTouristSpotError(error, 'update tourist spot feature', {
//           featureUpdate,
//         });
//         throw error;
//       }
//     },
//     onSuccess: (updatedSpot) => {
//       // Update cache
//       queryClient.setQueryData(
//         queryKeys.touristSpots.detail(updatedSpot.id),
//         updatedSpot
//       );

//       // Invalidate featured spots and list queries
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.touristSpots.featured(),
//       });
//       cacheUtils.invalidateListQueries(queryClient, 'touristSpots');
//     },
//   });
// };

// /**
//  * Bulk tourist spot operations
//  */
// export const useBulkTouristSpotOperation = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (operation: BulkTouristSpotOperation) => {
//       try {
//         // Validate operation
//         const validatedOperation =
//           BulkTouristSpotOperationSchema.parse(operation);

//         const updates: Record<string, any> = {
//           updated_at: new Date().toISOString(),
//         };

//         switch (validatedOperation.operation) {
//           case 'activate':
//             updates.status = 'active';
//             break;
//           case 'deactivate':
//             updates.status = 'inactive';
//             break;
//           case 'feature':
//             updates.is_featured = true;
//             break;
//           case 'unfeature':
//             updates.is_featured = false;
//             break;
//           case 'delete':
//             // Handle delete separately
//             const { data, error } = await supabase
//               .from('tourist_spots')
//               .delete()
//               .in('id', validatedOperation.ids)
//               .select('id');

//             if (error) throw error;
//             return { deletedIds: data?.map((item) => item.id) || [] };
//         }

//         const { data, error } = await supabase
//           .from('tourist_spots')
//           .update(updates)
//           .in('id', validatedOperation.ids)
//           .select();

//         if (error) {
//           throw error;
//         }

//         return {
//           updatedSpots: validateSupabaseListResponse(
//             TouristSpotSchema,
//             data || [],
//             'bulk tourist spot operation'
//           ),
//         };
//       } catch (error) {
//         handleTouristSpotError(error, 'bulk tourist spot operation', {
//           operation,
//         });
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       // Invalidate all tourist spot queries
//       cacheUtils.invalidateDomainQueries(queryClient, 'touristSpots');
//     },
//   });
// };
