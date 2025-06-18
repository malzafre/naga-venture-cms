// filepath: schemas/tourism.schemas.ts
/**
 * Tourism Content Schemas - Centralized Schema Library
 *
 * Comprehensive validation schemas for tourism content management in the NAGA VENTURE project.
 * Provides type-safe validation for tourist spots, events, and related tourism entities.
 */

import { z } from 'zod';
import {
  BaseEntitySchema,
  CoordinatesSchema,
  DateSchema,
  EmailSchema,
  GeographicLocationSchema,
  ImageSchema,
  NameSchema,
  OptionalNameSchema,
  PaginationSchema,
  PhoneSchema,
  SearchSchema,
  SortSchema,
  UrlSchema,
  UuidSchema,
} from './base.schemas';

// ============================================================================
// TOURISM ENUMS AND CONSTANTS
// ============================================================================

/**
 * Tourist spot categories
 */
export const TouristSpotTypeSchema = z.enum([
  'historical_site',
  'natural_attraction',
  'cultural_landmark',
  'religious_site',
  'museum',
  'park_recreation',
  'adventure_sports',
  'beach_resort',
  'shopping_district',
  'entertainment_venue',
  'educational_facility',
  'architectural_marvel',
]);

export type TouristSpotType = z.infer<typeof TouristSpotTypeSchema>;

/**
 * Tourist spot status options
 */
export const TouristSpotStatusSchema = z.enum([
  'active',
  'inactive',
  'under_maintenance',
  'temporarily_closed',
  'permanently_closed',
  'pending_approval',
]);

export type TouristSpotStatus = z.infer<typeof TouristSpotStatusSchema>;

/**
 * Event types for tourism events
 */
export const EventTypeSchema = z.enum([
  'festival',
  'cultural_event',
  'religious_celebration',
  'sports_event',
  'conference',
  'workshop',
  'exhibition',
  'concert',
  'food_festival',
  'community_event',
  'seasonal_celebration',
  'educational_program',
]);

export type EventType = z.infer<typeof EventTypeSchema>;

/**
 * Event status options
 */
export const EventStatusSchema = z.enum([
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
  'postponed',
  'rescheduled',
]);

export type EventStatus = z.infer<typeof EventStatusSchema>;

// ============================================================================
// TOURIST SPOT SCHEMAS
// ============================================================================

/**
 * Base tourist spot schema
 */
export const TouristSpotBaseSchema = z.object({
  name: NameSchema,
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000),
  short_description: z.string().max(200).optional(),
  type: TouristSpotTypeSchema,
  status: TouristSpotStatusSchema.default('pending_approval'),
  location: GeographicLocationSchema,
  coordinates: CoordinatesSchema.optional(),
  contact_info: z
    .object({
      phone: PhoneSchema.optional(),
      email: EmailSchema.optional(),
      website: UrlSchema.optional(),
    })
    .optional(),
  operating_hours: z
    .object({
      monday: z.string().optional(),
      tuesday: z.string().optional(),
      wednesday: z.string().optional(),
      thursday: z.string().optional(),
      friday: z.string().optional(),
      saturday: z.string().optional(),
      sunday: z.string().optional(),
      holidays: z.string().optional(),
    })
    .optional(),
  entrance_fee: z
    .object({
      adult: z.number().min(0).optional(),
      child: z.number().min(0).optional(),
      senior: z.number().min(0).optional(),
      student: z.number().min(0).optional(),
      group_discount: z.number().min(0).max(100).optional(),
    })
    .optional(),
  accessibility_features: z.array(z.string()).optional(),
  amenities: z.array(UuidSchema).optional(),
  is_featured: z.boolean().default(false),
  is_seasonal: z.boolean().default(false),
  seasonal_info: z.string().optional(),
  best_visit_time: z.string().optional(),
  safety_guidelines: z.array(z.string()).optional(),
  tags: z.array(z.string()).max(20).optional(),
});

/**
 * Complete tourist spot schema with database fields
 */
export const TouristSpotSchema = TouristSpotBaseSchema.extend({
  ...BaseEntitySchema.shape,
  average_rating: z.number().min(0).max(5).optional(),
  review_count: z.number().int().min(0).default(0),
  visit_count: z.number().int().min(0).default(0),
  popularity_score: z.number().min(0).max(100).default(0),
  verified_at: DateSchema.nullable().optional(),
  verified_by: UuidSchema.nullable().optional(),
});

export type TouristSpot = z.infer<typeof TouristSpotSchema>;

/**
 * Schema for creating tourist spots
 */
export const TouristSpotCreateSchema = TouristSpotBaseSchema.extend({
  created_by: UuidSchema,
  main_category_id: UuidSchema.optional(),
  sub_category_ids: z.array(UuidSchema).max(5).optional(),
});

export type TouristSpotCreate = z.infer<typeof TouristSpotCreateSchema>;

/**
 * Schema for updating tourist spots
 */
export const TouristSpotUpdateSchema = TouristSpotBaseSchema.partial().extend({
  updated_by: UuidSchema.optional(),
});

export type TouristSpotUpdate = z.infer<typeof TouristSpotUpdateSchema>;

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

/**
 * Base event schema
 */
export const EventBaseSchema = z.object({
  title: NameSchema,
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000),
  short_description: z.string().max(200).optional(),
  type: EventTypeSchema,
  status: EventStatusSchema.default('upcoming'),
  start_date: DateSchema,
  end_date: DateSchema,
  location: GeographicLocationSchema,
  coordinates: CoordinatesSchema.optional(),
  venue_name: z.string().max(200).optional(),
  organizer: z.object({
    name: NameSchema,
    contact_person: OptionalNameSchema,
    phone: PhoneSchema.optional(),
    email: EmailSchema.optional(),
    website: UrlSchema.optional(),
  }),
  ticket_info: z
    .object({
      is_free: z.boolean().default(true),
      price_range: z
        .object({
          min: z.number().min(0),
          max: z.number().min(0),
        })
        .optional(),
      booking_url: UrlSchema.optional(),
      booking_phone: PhoneSchema.optional(),
      advance_booking_required: z.boolean().default(false),
    })
    .optional(),
  capacity: z
    .object({
      max_attendees: z.number().int().min(1).optional(),
      current_registrations: z.number().int().min(0).default(0),
    })
    .optional(),
  is_featured: z.boolean().default(false),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(), // For recurring events
  age_restrictions: z
    .object({
      min_age: z.number().int().min(0).optional(),
      max_age: z.number().int().optional(),
      family_friendly: z.boolean().default(true),
    })
    .optional(),
  accessibility_info: z.string().optional(),
  weather_dependent: z.boolean().default(false),
  cancellation_policy: z.string().optional(),
  tags: z.array(z.string()).max(20).optional(),
});

/**
 * Complete event schema with database fields
 */
export const EventSchema = EventBaseSchema.extend({
  ...BaseEntitySchema.shape,
  registration_count: z.number().int().min(0).default(0),
  view_count: z.number().int().min(0).default(0),
  interest_count: z.number().int().min(0).default(0),
  check_in_count: z.number().int().min(0).default(0),
  published_at: DateSchema.nullable().optional(),
  published_by: UuidSchema.nullable().optional(),
}).refine((data) => data.end_date >= data.start_date, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

export type Event = z.infer<typeof EventSchema>;

/**
 * Schema for creating events
 */
export const EventCreateSchema = EventBaseSchema.extend({
  created_by: UuidSchema,
  main_category_id: UuidSchema.optional(),
  sub_category_ids: z.array(UuidSchema).max(5).optional(),
});

export type EventCreate = z.infer<typeof EventCreateSchema>;

/**
 * Schema for updating events
 */
export const EventUpdateSchema = EventBaseSchema.partial().extend({
  updated_by: UuidSchema.optional(),
});

export type EventUpdate = z.infer<typeof EventUpdateSchema>;

// ============================================================================
// TOURISM IMAGE SCHEMAS
// ============================================================================

/**
 * Tourist spot image schema
 */
export const TouristSpotImageSchema = ImageSchema.extend({
  tourist_spot_id: UuidSchema,
  category: z
    .enum(['exterior', 'interior', 'amenities', 'surroundings', 'activities'])
    .optional(),
});

export type TouristSpotImage = z.infer<typeof TouristSpotImageSchema>;

/**
 * Event image schema
 */
export const EventImageSchema = ImageSchema.extend({
  event_id: UuidSchema,
  category: z
    .enum(['promotional', 'venue', 'past_event', 'organizer'])
    .optional(),
});

export type EventImage = z.infer<typeof EventImageSchema>;

// ============================================================================
// FILTERING AND SEARCH SCHEMAS
// ============================================================================

/**
 * Tourist spot filtering schema
 */
export const TouristSpotFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  type: TouristSpotTypeSchema.optional(),
  status: TouristSpotStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  is_seasonal: z.boolean().optional(),
  has_entrance_fee: z.boolean().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  accessibility_required: z.boolean().optional(),
  main_category_id: UuidSchema.optional(),
  tags: z.array(z.string()).optional(),
});

export type TouristSpotFilters = z.infer<typeof TouristSpotFiltersSchema>;

/**
 * Event filtering schema
 */
export const EventFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  type: EventTypeSchema.optional(),
  status: EventStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  is_free: z.boolean().optional(),
  start_date_from: DateSchema.optional(),
  start_date_to: DateSchema.optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  family_friendly: z.boolean().optional(),
  organizer_name: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type EventFilters = z.infer<typeof EventFiltersSchema>;

// ============================================================================
// ANALYTICS AND REPORTING SCHEMAS
// ============================================================================

/**
 * Tourism analytics schema
 */
export const TourismAnalyticsSchema = z.object({
  total_spots: z.number().int().min(0),
  active_spots: z.number().int().min(0),
  featured_spots: z.number().int().min(0),
  total_events: z.number().int().min(0),
  upcoming_events: z.number().int().min(0),
  spots_by_type: z.array(
    z.object({
      type: TouristSpotTypeSchema,
      count: z.number().int().min(0),
      percentage: z.number().min(0).max(100),
    })
  ),
  events_by_type: z.array(
    z.object({
      type: EventTypeSchema,
      count: z.number().int().min(0),
      percentage: z.number().min(0).max(100),
    })
  ),
  popular_destinations: z.array(TouristSpotSchema).max(10),
  trending_events: z.array(EventSchema).max(10),
});

export type TourismAnalytics = z.infer<typeof TourismAnalyticsSchema>;

/**
 * Tourism dashboard data schema
 */
export const TourismDashboardDataSchema = z.object({
  overview: TourismAnalyticsSchema,
  recent_additions: z.object({
    spots: z.array(TouristSpotSchema).max(5),
    events: z.array(EventSchema).max(5),
  }),
  performance_metrics: z.object({
    total_visits: z.number().int().min(0),
    total_reviews: z.number().int().min(0),
    average_rating: z.number().min(0).max(5),
    growth_rate: z.number(),
  }),
  seasonal_trends: z.array(
    z.object({
      month: z.string(),
      spot_visits: z.number().int().min(0),
      event_attendance: z.number().int().min(0),
    })
  ),
});

export type TourismDashboardData = z.infer<typeof TourismDashboardDataSchema>;

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk tourism operations schema
 */
export const BulkTourismOperationSchema = z.object({
  operation: z.enum([
    'activate',
    'deactivate',
    'feature',
    'unfeature',
    'delete',
    'verify',
  ]),
  entity_type: z.enum(['tourist_spot', 'event']),
  entity_ids: z.array(UuidSchema).min(1).max(50),
  data: z.record(z.any()).optional(),
  performed_by: UuidSchema,
});

export type BulkTourismOperation = z.infer<typeof BulkTourismOperationSchema>;

// ============================================================================
// EXPORT TOURISM CONSTANTS
// ============================================================================

/**
 * Tourist spot types for easy access
 */
export const TOURIST_SPOT_TYPES = [
  'historical_site',
  'natural_attraction',
  'cultural_landmark',
  'religious_site',
  'museum',
  'park_recreation',
  'adventure_sports',
  'beach_resort',
  'shopping_district',
  'entertainment_venue',
  'educational_facility',
  'architectural_marvel',
] as const;

/**
 * Event types for easy access
 */
export const EVENT_TYPES = [
  'festival',
  'cultural_event',
  'religious_celebration',
  'sports_event',
  'conference',
  'workshop',
  'exhibition',
  'concert',
  'food_festival',
  'community_event',
  'seasonal_celebration',
  'educational_program',
] as const;

/**
 * Tourism status options
 */
export const TOURISM_STATUS_OPTIONS = [
  'active',
  'inactive',
  'under_maintenance',
  'temporarily_closed',
  'permanently_closed',
  'pending_approval',
] as const;

/**
 * Event status options
 */
export const EVENT_STATUS_OPTIONS = [
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
  'postponed',
  'rescheduled',
] as const;
