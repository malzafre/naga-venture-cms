// // filepath: hooks/useEventManagement.ts
// /**
//  * Enhanced Event Management Hooks - Phase 5 Implementation
//  *
//  * Production-grade smart hooks for event management operations with comprehensive validation:
//  * - Event CRUD operations with Zod validation
//  * - Date and time validation with business rules
//  * - Optimistic updates for event operations
//  * - Real-time event analytics tracking
//  * - Complete API response validation
//  * - Event calendar integration and bulk operations
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
//   BulkEventOperationSchema,
//   CalendarEventSchema,
//   EventAnalyticsSchema,
//   EventCalendarFiltersSchema,
//   EventDashboardDataSchema,
//   EventFeatureUpdateSchema,
//   EventFiltersSchema,
//   EventSchema,
//   EventStatusUpdateSchema,
//   EventWithRelationsSchema,
//   validateSupabaseListResponse,
//   validateSupabaseResponse,
//   type BulkEventOperation,
//   type EventCalendarFilters,
//   type EventFeatureUpdate,
//   type EventFilters,
//   type EventInsert,
//   type EventStatusUpdate,
//   type EventUpdate,
// } from '@/schemas';

// // ============================================================================
// // ERROR HANDLING
// // ============================================================================

// /**
//  * Enhanced error handling for event operations with contextual logging
//  */
// const handleEventError = (
//   error: any,
//   operation: string,
//   context?: Record<string, any>
// ) => {
//   // Log error with context for debugging
//   console.error(`Event ${operation} Error:`, {
//     error: error.message || error,
//     context,
//     timestamp: new Date().toISOString(),
//   });

//   // Provide user-friendly error messages
//   const errorMessage = error?.message || 'An unexpected error occurred';

//   if (errorMessage.includes('duplicate key value')) {
//     throw new Error(
//       'An event with this name already exists at this date and location'
//     );
//   }

//   if (errorMessage.includes('foreign key violation')) {
//     throw new Error(
//       'Referenced tourist spot, business, or category does not exist'
//     );
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
//  * Fetch events with filters, search, and pagination
//  */
// export const useEvents = (filters?: EventFilters) => {
//   // Validate filters with Zod schema
//   const validatedFilters = filters
//     ? EventFiltersSchema.parse(filters)
//     : undefined;

//   return useQuery({
//     queryKey: queryKeys.events.filtered(validatedFilters || {}),
//     queryFn: async () => {
//       try {
//         let query = supabase
//           .from('events')
//           .select(
//             `
//             *,
//             event_images (
//               id,
//               image_url,
//               caption,
//               is_primary,
//               display_order
//             ),
//             event_categories (
//               sub_categories (
//                 id,
//                 name,
//                 main_categories (
//                   name
//                 )
//               )
//             ),
//             tourist_spots (
//               id,
//               name,
//               spot_type
//             ),
//             businesses (
//               id,
//               business_name,
//               business_type
//             )
//           `
//           )
//           .order('start_date', { ascending: true });

//         // Apply filters with validation
//         if (validatedFilters?.search) {
//           query = query.or(
//             `name.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%,venue_name.ilike.%${validatedFilters.search}%`
//           );
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

//         if (validatedFilters?.date_from) {
//           query = query.gte('start_date', validatedFilters.date_from);
//         }

//         if (validatedFilters?.date_to) {
//           query = query.lte('end_date', validatedFilters.date_to);
//         }

//         if (validatedFilters?.min_rating) {
//           query = query.gte('average_rating', validatedFilters.min_rating);
//         }

//         if (validatedFilters?.tourist_spot_id) {
//           query = query.eq('tourist_spot_id', validatedFilters.tourist_spot_id);
//         }

//         if (validatedFilters?.business_id) {
//           query = query.eq('business_id', validatedFilters.business_id);
//         }

//         if (validatedFilters?.organizer_name) {
//           query = query.ilike(
//             'organizer_name',
//             `%${validatedFilters.organizer_name}%`
//           );
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
//         }

//         // Validate API response
//         const validatedData = validateSupabaseListResponse(
//           EventWithRelationsSchema,
//           data,
//           'events'
//         );

//         return {
//           data: validatedData,
//           count: count || 0,
//           page: validatedFilters?.page || 1,
//           limit: validatedFilters?.limit || 10,
//           totalPages: Math.ceil((count || 0) / (validatedFilters?.limit || 10)),
//         };
//       } catch (error) {
//         handleEventError(error, 'fetch events', { filters: validatedFilters });
//         throw error;
//       }
//     },
//     placeholderData: keepPreviousData,
//     staleTime: DOMAIN_CACHE_CONFIG.events.staleTime,
//     gcTime: DOMAIN_CACHE_CONFIG.events.gcTime,
//   });
// };

// /**
//  * Fetch single event by ID
//  */
// export const useEvent = (eventId?: string) => {
//   // Validate UUID with Zod
//   const validatedId = eventId ? z.string().uuid().parse(eventId) : undefined;

//   return useQuery({
//     queryKey: queryKeys.events.detail(validatedId || ''),
//     queryFn: async () => {
//       if (!validatedId) {
//         throw new Error('Event ID is required');
//       }

//       try {
//         const { data, error } = await supabase
//           .from('events')
//           .select(
//             `
//             *,
//             event_images (
//               id,
//               image_url,
//               caption,
//               is_primary,
//               display_order
//             ),
//             event_categories (
//               sub_categories (
//                 id,
//                 name,
//                 main_categories (
//                   name
//                 )
//               )
//             ),
//             tourist_spots (
//               id,
//               name,
//               spot_type
//             ),
//             businesses (
//               id,
//               business_name,
//               business_type
//             )
//           `
//           )
//           .eq('id', validatedId)
//           .single();

//         if (error) {
//           throw error;
//         } // Validate API response
//         return validateSupabaseResponse(EventWithRelationsSchema, data);
//       } catch (error) {
//         handleEventError(error, 'fetch event', { eventId: validatedId });
//         throw error;
//       }
//     },
//     enabled: !!validatedId,
//     staleTime: DOMAIN_CACHE_CONFIG.events.staleTime,
//     gcTime: DOMAIN_CACHE_CONFIG.events.gcTime,
//   });
// };

// /**
//  * Fetch events for calendar view
//  */
// export const useCalendarEvents = (filters?: EventCalendarFilters) => {
//   // Validate filters with Zod schema
//   const validatedFilters = filters
//     ? EventCalendarFiltersSchema.parse(filters)
//     : undefined;

//   return useQuery({
//     queryKey: queryKeys.events.calendar(validatedFilters || {}),
//     queryFn: async () => {
//       try {
//         let query = supabase.from('events').select(`
//             id,
//             name,
//             start_date,
//             end_date,
//             start_time,
//             end_time,
//             status,
//             is_featured,
//             venue_name,
//             entry_fee
//           `);

//         // Apply calendar-specific filters
//         if (validatedFilters?.date) {
//           const startOfMonth = new Date(validatedFilters.date);
//           startOfMonth.setDate(1);
//           const endOfMonth = new Date(startOfMonth);
//           endOfMonth.setMonth(endOfMonth.getMonth() + 1);

//           query = query
//             .gte('start_date', startOfMonth.toISOString().split('T')[0])
//             .lte('start_date', endOfMonth.toISOString().split('T')[0]);
//         }

//         if (validatedFilters?.status) {
//           query = query.eq('status', validatedFilters.status);
//         }

//         if (validatedFilters?.is_featured !== undefined) {
//           query = query.eq('is_featured', validatedFilters.is_featured);
//         }

//         if (validatedFilters?.category_id) {
//           query = query.eq(
//             'event_categories.sub_category_id',
//             validatedFilters.category_id
//           );
//         }

//         const { data, error } = await query.order('start_date', {
//           ascending: true,
//         });

//         if (error) {
//           throw error;
//         }

//         // Validate API response
//         return validateSupabaseListResponse(
//           CalendarEventSchema,
//           data || [],
//           'calendar events'
//         );
//       } catch (error) {
//         handleEventError(error, 'fetch calendar events', {
//           filters: validatedFilters,
//         });
//         throw error;
//       }
//     },
//     staleTime: DOMAIN_CACHE_CONFIG.events.staleTime,
//     gcTime: DOMAIN_CACHE_CONFIG.events.gcTime,
//   });
// };

// /**
//  * Fetch featured events
//  */
// export const useFeaturedEvents = (limit = 6) => {
//   const validatedLimit = z.number().min(1).max(20).parse(limit);

//   return useQuery({
//     queryKey: queryKeys.events.featured(),
//     queryFn: async () => {
//       try {
//         const { data, error } = await supabase
//           .from('events')
//           .select(
//             `
//             *,
//             event_images!inner (
//               id,
//               image_url,
//               caption,
//               is_primary
//             )
//           `
//           )
//           .eq('is_featured', true)
//           .in('status', ['upcoming', 'ongoing'])
//           .eq('event_images.is_primary', true)
//           .order('start_date', { ascending: true })
//           .limit(validatedLimit);

//         if (error) {
//           throw error;
//         }

//         // Validate API response
//         return validateSupabaseListResponse(
//           EventWithRelationsSchema,
//           data || [],
//           'featured events'
//         );
//       } catch (error) {
//         handleEventError(error, 'fetch featured events', {
//           limit: validatedLimit,
//         });
//         throw error;
//       }
//     },
//     staleTime: DOMAIN_CACHE_CONFIG.events.staleTime,
//     gcTime: DOMAIN_CACHE_CONFIG.events.gcTime,
//   });
// };

// /**
//  * Fetch upcoming events
//  */
// export const useUpcomingEvents = (limit = 10) => {
//   const validatedLimit = z.number().min(1).max(50).parse(limit);

//   return useQuery({
//     queryKey: queryKeys.events.upcoming(),
//     queryFn: async () => {
//       try {
//         const today = new Date().toISOString().split('T')[0];

//         const { data, error } = await supabase
//           .from('events')
//           .select(
//             `
//             id,
//             name,
//             start_date,
//             end_date,
//             start_time,
//             venue_name,
//             status,
//             is_featured,
//             entry_fee
//           `
//           )
//           .gte('start_date', today)
//           .eq('status', 'upcoming')
//           .order('start_date', { ascending: true })
//           .limit(validatedLimit);

//         if (error) {
//           throw error;
//         } // Validate API response with minimal schema for upcoming events
//         const UpcomingEventSchema = z.object({
//           id: z.string(),
//           name: z.string(),
//           start_date: z.string(),
//           end_date: z.string(),
//           start_time: z.string().optional(),
//           venue_name: z.string(),
//           status: z.string(),
//           is_featured: z.boolean(),
//           entry_fee: z.number().optional(),
//         });
//         return validateSupabaseListResponse(UpcomingEventSchema, data || []);
//       } catch (error) {
//         handleEventError(error, 'fetch upcoming events', {
//           limit: validatedLimit,
//         });
//         throw error;
//       }
//     },
//     staleTime: 300000, // 5 minutes
//     gcTime: 600000, // 10 minutes
//   });
// };

// /**
//  * Fetch event analytics
//  */
// export const useEventAnalytics = () => {
//   return useQuery({
//     queryKey: queryKeys.events.analytics(),
//     queryFn: async () => {
//       try {
//         // Fetch analytics data using aggregations
//         const [
//           eventsCount,
//           eventsByStatus,
//           eventsByMonth,
//           recentActivity,
//           popularEvents,
//         ] = await Promise.all([
//           // Total counts by status
//           supabase
//             .from('events')
//             .select('status, is_featured', { count: 'exact' }), // Events by status
//           supabase.from('events').select('status'),

//           // Events by month (last 12 months)
//           supabase
//             .from('events')
//             .select('start_date')
//             .gte(
//               'start_date',
//               new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
//             ),

//           // Recent activity
//           supabase
//             .from('events')
//             .select('id, name, created_at, updated_at, status')
//             .order('updated_at', { ascending: false })
//             .limit(10),

//           // Popular events
//           supabase
//             .from('events')
//             .select('id, name, average_rating, review_count')
//             .not('average_rating', 'is', null)
//             .order('average_rating', { ascending: false })
//             .limit(5),
//         ]);

//         if (eventsCount.error) throw eventsCount.error;
//         if (eventsByStatus.error) throw eventsByStatus.error;
//         if (eventsByMonth.error) throw eventsByMonth.error;
//         if (recentActivity.error) throw recentActivity.error;
//         if (popularEvents.error) throw popularEvents.error;

//         // Process events by month
//         const eventsByMonthData = (eventsByMonth.data || []).reduce(
//           (acc, event) => {
//             const monthKey = new Date(event.start_date)
//               .toISOString()
//               .substring(0, 7);
//             acc[monthKey] = (acc[monthKey] || 0) + 1;
//             return acc;
//           },
//           {} as Record<string, number>
//         );

//         // Process and validate the analytics data
//         const events = eventsCount.data || [];
//         const analytics = {
//           total_events: eventsCount.count || 0,
//           upcoming_events: events.filter((e) => e.status === 'upcoming').length,
//           ongoing_events: events.filter((e) => e.status === 'ongoing').length,
//           completed_events: events.filter((e) => e.status === 'completed')
//             .length,
//           cancelled_events: events.filter((e) => e.status === 'cancelled')
//             .length,
//           featured_events: events.filter((e) => e.is_featured).length,
//           events_by_month: eventsByMonthData,
//           events_by_status: Object.fromEntries(
//             (eventsByStatus.data || []).map((item) => [
//               item.status,
//               item.count || 0,
//             ])
//           ),
//           average_rating: 0, // Calculate from aggregation if needed
//           total_reviews: 0, // Calculate from aggregation if needed
//           popular_events: popularEvents.data || [],
//           recent_activity: (recentActivity.data || []).map((event) => ({
//             id: event.id,
//             name: event.name,
//             action:
//               event.created_at === event.updated_at
//                 ? 'created'
//                 : ('updated' as const),
//             timestamp: event.updated_at,
//           })),
//         };

//         // Validate analytics response
//         return EventAnalyticsSchema.parse(analytics);
//       } catch (error) {
//         handleEventError(error, 'fetch event analytics');
//         throw error;
//       }
//     },
//     staleTime: DOMAIN_CACHE_CONFIG.analytics.staleTime, // Use analytics config
//     gcTime: DOMAIN_CACHE_CONFIG.analytics.gcTime,
//   });
// };

// /**
//  * Fetch event dashboard data
//  */
// export const useEventDashboardData = () => {
//   return useQuery({
//     queryKey: queryKeys.events.dashboard(),
//     queryFn: async () => {
//       try {
//         const [overviewData, upcomingEvents, featuredEvents] =
//           await Promise.all([
//             // Overview stats
//             supabase.from('events').select('status, is_featured'),

//             // Upcoming events
//             supabase
//               .from('events')
//               .select('id, name, start_date, end_date, venue_name, status')
//               .eq('status', 'upcoming')
//               .order('start_date', { ascending: true })
//               .limit(5),

//             // Featured events
//             supabase
//               .from('events')
//               .select('id, name, start_date, average_rating, review_count')
//               .eq('is_featured', true)
//               .not('average_rating', 'is', null)
//               .order('average_rating', { ascending: false })
//               .limit(5),
//           ]);

//         if (overviewData.error) throw overviewData.error;
//         if (upcomingEvents.error) throw upcomingEvents.error;
//         if (featuredEvents.error) throw featuredEvents.error;

//         const overview = overviewData.data || [];
//         const dashboardData = {
//           overview: {
//             total_events: overview.length,
//             upcoming_events: overview.filter((e) => e.status === 'upcoming')
//               .length,
//             ongoing_events: overview.filter((e) => e.status === 'ongoing')
//               .length,
//             completed_events: overview.filter((e) => e.status === 'completed')
//               .length,
//             featured_events: overview.filter((e) => e.is_featured).length,
//             pending_reviews: 0, // Would need to query reviews table
//           },
//           upcoming_events: upcomingEvents.data || [],
//           featured_events: featuredEvents.data || [],
//           activity_summary: {
//             new_events_this_week: 0, // Would need date filtering
//             completed_events_this_week: 0, // Would need date filtering
//             new_reviews_this_week: 0, // Would need to query reviews
//           },
//         };

//         // Validate dashboard data response
//         return EventDashboardDataSchema.parse(dashboardData);
//       } catch (error) {
//         handleEventError(error, 'fetch event dashboard data');
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
//  * Create new event
//  */
// export const useCreateEvent = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (eventData: EventInsert) => {
//       try {
//         // Validate input data
//         const validatedData = z
//           .object({
//             name: z.string().min(3).max(150),
//             description: z.string().min(50).max(3000),
//             start_date: z.string().date(),
//             end_date: z.string().date(),
//             start_time: z.string().optional(),
//             end_time: z.string().optional(),
//             venue_name: z.string().min(2).max(100),
//             address: z.string().min(10).max(200),
//             city: z.string().optional(),
//             province: z.string().optional(),
//             location: z.object({
//               latitude: z.number(),
//               longitude: z.number(),
//             }),
//             tourist_spot_id: z.string().uuid().optional(),
//             business_id: z.string().uuid().optional(),
//             entry_fee: z.number().min(0).optional(),
//             organizer_name: z.string().optional(),
//             organizer_contact: z.string().optional(),
//             organizer_email: z.string().email().optional(),
//             website: z.string().url().optional(),
//             status: z
//               .enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
//               .optional(),
//           })
//           .refine(
//             (data) => {
//               const startDate = new Date(data.start_date);
//               const endDate = new Date(data.end_date);
//               return endDate >= startDate;
//             },
//             {
//               message: 'End date must be after or equal to start date',
//             }
//           )
//           .parse(eventData);

//         // Transform location for PostGIS
//         const insertData = {
//           ...validatedData,
//           location: `POINT(${validatedData.location.longitude} ${validatedData.location.latitude})`,
//         };

//         const { data, error } = await supabase
//           .from('events')
//           .insert(insertData)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         }

//         // Validate response
//         return validateSupabaseResponse(EventSchema, data);
//       } catch (error) {
//         handleEventError(error, 'create event', { eventData });
//         throw error;
//       }
//     },
//     onSuccess: (newEvent) => {
//       // Invalidate relevant queries
//       cacheUtils.invalidateDomainQueries(queryClient, 'events');

//       // Add to cache optimistically
//       queryClient.setQueryData(queryKeys.events.detail(newEvent.id), newEvent);
//     },
//   });
// };

// /**
//  * Update existing event
//  */
// export const useUpdateEvent = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (eventData: EventUpdate) => {
//       try {
//         // Validate input data with partial schema
//         const validatedData = z
//           .object({
//             id: z.string().uuid(),
//             name: z.string().min(3).max(150).optional(),
//             description: z.string().min(50).max(3000).optional(),
//             start_date: z.string().date().optional(),
//             end_date: z.string().date().optional(),
//             start_time: z.string().optional(),
//             end_time: z.string().optional(),
//             venue_name: z.string().min(2).max(100).optional(),
//             address: z.string().min(10).max(200).optional(),
//             city: z.string().optional(),
//             province: z.string().optional(),
//             location: z
//               .object({
//                 latitude: z.number(),
//                 longitude: z.number(),
//               })
//               .optional(),
//             tourist_spot_id: z.string().uuid().optional(),
//             business_id: z.string().uuid().optional(),
//             entry_fee: z.number().min(0).optional(),
//             organizer_name: z.string().optional(),
//             organizer_contact: z.string().optional(),
//             organizer_email: z.string().email().optional(),
//             website: z.string().url().optional(),
//             status: z
//               .enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
//               .optional(),
//           })
//           .parse(eventData);

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
//           .from('events')
//           .update(finalUpdateData)
//           .eq('id', id)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         } // Validate response
//         return validateSupabaseResponse(EventSchema, data);
//       } catch (error) {
//         handleEventError(error, 'update event', { eventData });
//         throw error;
//       }
//     },
//     onSuccess: (updatedEvent) => {
//       // Update cache with new data
//       queryClient.setQueryData(
//         queryKeys.events.detail(updatedEvent.id),
//         updatedEvent
//       );

//       // Invalidate list queries to refresh
//       cacheUtils.invalidateListQueries(queryClient, 'events');
//     },
//   });
// };

// /**
//  * Delete event
//  */
// export const useDeleteEvent = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (eventId: string) => {
//       try {
//         // Validate ID
//         const validatedId = z.string().uuid().parse(eventId);

//         const { data, error } = await supabase
//           .from('events')
//           .delete()
//           .eq('id', validatedId)
//           .select()
//           .single();

//         if (error) {
//           throw error;
//         }

//         return data;
//       } catch (error) {
//         handleEventError(error, 'delete event', { eventId });
//         throw error;
//       }
//     },
//     onSuccess: (_, eventId) => {
//       // Remove from cache
//       queryClient.removeQueries({
//         queryKey: queryKeys.events.detail(eventId),
//       });

//       // Invalidate list queries
//       cacheUtils.invalidateListQueries(queryClient, 'events');
//     },
//   });
// };

// /**
//  * Update event status
//  */
// export const useUpdateEventStatus = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (statusUpdate: EventStatusUpdate) => {
//       try {
//         // Validate input
//         const validatedUpdate = EventStatusUpdateSchema.parse(statusUpdate);

//         const { data, error } = await supabase
//           .from('events')
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
//         return validateSupabaseResponse(EventSchema, data);
//       } catch (error) {
//         handleEventError(error, 'update event status', { statusUpdate });
//         throw error;
//       }
//     },
//     onSuccess: (updatedEvent) => {
//       // Update cache
//       queryClient.setQueryData(
//         queryKeys.events.detail(updatedEvent.id),
//         updatedEvent
//       );

//       // Invalidate list queries
//       cacheUtils.invalidateListQueries(queryClient, 'events');
//     },
//   });
// };

// /**
//  * Update event featured status
//  */
// export const useUpdateEventFeature = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (featureUpdate: EventFeatureUpdate) => {
//       try {
//         // Validate input
//         const validatedUpdate = EventFeatureUpdateSchema.parse(featureUpdate);

//         const { data, error } = await supabase
//           .from('events')
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
//         return validateSupabaseResponse(EventSchema, data);
//       } catch (error) {
//         handleEventError(error, 'update event feature', { featureUpdate });
//         throw error;
//       }
//     },
//     onSuccess: (updatedEvent) => {
//       // Update cache
//       queryClient.setQueryData(
//         queryKeys.events.detail(updatedEvent.id),
//         updatedEvent
//       );

//       // Invalidate featured events and list queries
//       queryClient.invalidateQueries({
//         queryKey: queryKeys.events.featured(),
//       });
//       cacheUtils.invalidateListQueries(queryClient, 'events');
//     },
//   });
// };

// /**
//  * Bulk event operations
//  */
// export const useBulkEventOperation = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (operation: BulkEventOperation) => {
//       try {
//         // Validate operation
//         const validatedOperation = BulkEventOperationSchema.parse(operation);

//         const updates: Record<string, any> = {
//           updated_at: new Date().toISOString(),
//         };

//         switch (validatedOperation.operation) {
//           case 'feature':
//             updates.is_featured = true;
//             break;
//           case 'unfeature':
//             updates.is_featured = false;
//             break;
//           case 'cancel':
//             updates.status = 'cancelled';
//             break;
//           case 'complete':
//             updates.status = 'completed';
//             break;
//           case 'delete':
//             // Handle delete separately
//             const { data, error } = await supabase
//               .from('events')
//               .delete()
//               .in('id', validatedOperation.ids)
//               .select('id');

//             if (error) throw error;
//             return { deletedIds: data?.map((item) => item.id) || [] };
//         }

//         const { data, error } = await supabase
//           .from('events')
//           .update(updates)
//           .in('id', validatedOperation.ids)
//           .select();

//         if (error) {
//           throw error;
//         }

//         return {
//           updatedEvents: validateSupabaseListResponse(
//             EventSchema,
//             data || [],
//             'bulk event operation'
//           ),
//         };
//       } catch (error) {
//         handleEventError(error, 'bulk event operation', { operation });
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       // Invalidate all event queries
//       cacheUtils.invalidateDomainQueries(queryClient, 'events');
//     },
//   });
// };
