// filepath: schemas/tourism/event.schemas.ts
/**
 * Event Schemas - Centralized Schema Library
 *
 * Comprehensive validation schemas for events and activities in the NAGA VENTURE project.
 * Provides type-safe validation for event CRUD operations, scheduling, and filtering.
 */

import { z } from 'zod';
import {
  BaseEntitySchema,
  DateSchema,
  EventStatusSchema,
  GeographicLocationSchema,
  ImageSchema,
  NameSchema,
  OptionalPriceSchema,
  OptionalRatingSchema,
  PaginationSchema,
  SearchSchema,
  SortSchema,
  TextAreaSchema,
  TimeSchema,
  UrlSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// EVENT CORE SCHEMAS
// ============================================================================

/**
 * Event basic information schema (without validation)
 */
const EventBaseObjectSchema = z.object({
  name: NameSchema,
  description: TextAreaSchema,
  start_date: DateSchema,
  end_date: DateSchema,
  start_time: TimeSchema.optional(),
  end_time: TimeSchema.optional(),
  venue_name: z.string().min(1, 'Venue name is required'),
  ...GeographicLocationSchema.shape, // address, city, province, coordinates, google_maps_place_id
  tourist_spot_id: UuidSchema.optional(),
  business_id: UuidSchema.optional(),
  entry_fee: OptionalPriceSchema,
  organizer_name: z.string().optional(),
  organizer_contact: z.string().optional(),
  organizer_email: z.string().email('Invalid email format').optional(),
  website: UrlSchema.optional(),
  status: EventStatusSchema.default('upcoming'),
  is_featured: z.boolean().default(false),
});

/**
 * Event basic information schema (with validation)
 */
export const EventBaseSchema = EventBaseObjectSchema.refine(
  (data) => data.start_date <= data.end_date,
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

/**
 * Event creation schema
 */
export const EventCreateSchema = EventBaseObjectSchema.extend({
  // Additional validation for creation
  images: z
    .array(
      z.object({
        image_url: z.string().url(),
        caption: z.string().optional(),
        is_primary: z.boolean(),
        display_order: z.number(),
      })
    )
    .max(10, 'Maximum 10 images allowed')
    .optional(),
  categories: z
    .array(
      z.object({
        id: UuidSchema,
        name: z.string(),
        main_category_name: z.string().optional(),
      })
    )
    .optional(),
}).refine((data) => data.start_date <= data.end_date, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

/**
 * Event update schema (all fields optional except id)
 */
export const EventUpdateSchema = EventBaseObjectSchema.partial().extend({
  id: UuidSchema,
});

/**
 * Complete event schema (from database)
 */
export const EventCompleteSchema = BaseEntitySchema.extend({
  ...EventBaseObjectSchema.shape,
  average_rating: OptionalRatingSchema,
  review_count: z.number().min(0).default(0),
  created_by: UuidSchema.nullable(),
  updated_by: UuidSchema.nullable(),
  images: z
    .array(
      ImageSchema.extend({
        event_id: UuidSchema,
      })
    )
    .optional(),
  categories: z
    .array(
      z.object({
        id: UuidSchema,
        name: z.string(),
        main_category_id: UuidSchema,
        main_category_name: z.string(),
      })
    )
    .optional(),
  // Related entities
  tourist_spot: z
    .object({
      id: UuidSchema,
      name: z.string(),
    })
    .optional(),
  business: z
    .object({
      id: UuidSchema,
      business_name: z.string(),
    })
    .optional(),
});

// ============================================================================
// EVENT FILTERING AND SEARCH SCHEMAS
// ============================================================================

/**
 * Event filters schema
 */
export const EventFiltersSchema = z.object({
  search: SearchSchema,
  status: EventStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  city: z.string().optional(),
  category_id: UuidSchema.optional(),
  min_rating: z.number().min(0).max(5).optional(),
  has_entry_fee: z.boolean().optional(),
  tourist_spot_id: UuidSchema.optional(),
  business_id: UuidSchema.optional(),
  organizer_name: z.string().optional(),
  // Date filters
  start_date_from: DateSchema.optional(),
  start_date_to: DateSchema.optional(),
  end_date_from: DateSchema.optional(),
  end_date_to: DateSchema.optional(),
  // Geographic filters
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_km: z.number().positive().optional(),
  created_by: UuidSchema.optional(),
});

/**
 * Event sorting schema
 */
export const EventSortSchema = SortSchema.extend({
  field: z.enum([
    'name',
    'start_date',
    'end_date',
    'created_at',
    'updated_at',
    'average_rating',
    'review_count',
    'entry_fee',
    'status',
  ]),
});

/**
 * Event list query schema
 */
export const EventListQuerySchema = z.object({
  ...EventFiltersSchema.shape,
  ...EventSortSchema.shape,
  ...PaginationSchema.shape,
});

// ============================================================================
// EVENT API RESPONSE SCHEMAS
// ============================================================================

/**
 * Event list response schema
 */
export const EventListResponseSchema = z.object({
  data: z.array(EventCompleteSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
  filters: EventFiltersSchema.partial(),
});

/**
 * Event analytics schema
 */
export const EventAnalyticsSchema = z.object({
  total_events: z.number(),
  upcoming_events: z.number(),
  ongoing_events: z.number(),
  completed_events: z.number(),
  featured_events: z.number(),
  events_by_status: z.record(EventStatusSchema, z.number()),
  events_by_month: z.array(
    z.object({
      month: z.string(),
      count: z.number(),
    })
  ),
  average_rating: z.number().optional(),
  total_reviews: z.number(),
  events_with_images: z.number(),
  popular_venues: z.array(
    z.object({
      venue_name: z.string(),
      count: z.number(),
    })
  ),
});

// ============================================================================
// EVENT BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk event operation schema
 */
export const BulkEventOperationSchema = z.object({
  operation: z.enum(['activate', 'cancel', 'feature', 'unfeature', 'delete']),
  event_ids: z.array(UuidSchema).min(1, 'At least one event must be selected'),
  reason: z.string().optional(),
});

// ============================================================================
// EVENT CALENDAR SCHEMAS
// ============================================================================

/**
 * Event calendar query schema
 */
export const EventCalendarQuerySchema = z.object({
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  city: z.string().optional(),
  status: EventStatusSchema.optional(),
  category_id: UuidSchema.optional(),
});

/**
 * Event calendar response schema
 */
export const EventCalendarResponseSchema = z.object({
  year: z.number(),
  month: z.number(),
  events: z.array(
    z.object({
      id: UuidSchema,
      name: z.string(),
      start_date: DateSchema,
      end_date: DateSchema,
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      venue_name: z.string(),
      status: EventStatusSchema,
      is_featured: z.boolean(),
      entry_fee: z.number().optional(),
    })
  ),
  statistics: z.object({
    total_events: z.number(),
    events_by_day: z.record(z.string(), z.number()),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type EventBase = z.infer<typeof EventBaseSchema>;
export type EventCreate = z.infer<typeof EventCreateSchema>;
export type EventUpdate = z.infer<typeof EventUpdateSchema>;
export type EventComplete = z.infer<typeof EventCompleteSchema>;
export type EventFilters = z.infer<typeof EventFiltersSchema>;
export type EventSort = z.infer<typeof EventSortSchema>;
export type EventListQuery = z.infer<typeof EventListQuerySchema>;
export type EventListResponse = z.infer<typeof EventListResponseSchema>;
export type EventAnalytics = z.infer<typeof EventAnalyticsSchema>;
export type BulkEventOperation = z.infer<typeof BulkEventOperationSchema>;
export type EventCalendarQuery = z.infer<typeof EventCalendarQuerySchema>;
export type EventCalendarResponse = z.infer<typeof EventCalendarResponseSchema>;

// Note: EventStatus type is available from base.schemas.ts through the main index export
