// schemas/tourism/eventSchemas.ts
/**
 * Event Validation Schemas - Phase 5 Implementation
 *
 * Comprehensive validation schemas for event management operations.
 * Features:
 * - Complete CRUD validation with Zod
 * - Date and time validation
 * - Event scheduling validation
 * - Type-safe schema definitions
 * - API response validation patterns
 */

import { z } from 'zod';

import {
  BaseEntitySchema,
  GeographicLocationSchema,
  PaginationParamsSchema,
  TimestampSchema,
  UUIDSchema,
} from '../common/baseSchemas';

// ============================================================================
// ENUMS & TYPES
// ============================================================================

/**
 * Event status enumeration
 */
export const EventStatusSchema = z.enum([
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
]);

/**
 * Event type definitions
 */
export type EventStatus = z.infer<typeof EventStatusSchema>;

// ============================================================================
// CORE SCHEMAS
// ============================================================================

/**
 * Event base schema without refinements (to avoid ZodEffects issues)
 */
const EventBaseSchema = z.object({
  name: z
    .string()
    .min(3, 'Event name must be at least 3 characters')
    .max(150, 'Event name must be less than 150 characters')
    .trim(),
  description: z
    .string()
    .min(100, 'Event description must be at least 100 characters')
    .max(2000, 'Event description must be less than 2000 characters')
    .trim(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format')
    .optional(),
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format')
    .optional(),
  venue_name: z
    .string()
    .min(3, 'Venue name must be at least 3 characters')
    .max(100, 'Venue name must be less than 100 characters')
    .trim(),
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters')
    .trim(),
  city: z.string().default('Naga City'),
  province: z.string().default('Camarines Sur'),
  location: GeographicLocationSchema,
  tourist_spot_id: UUIDSchema.optional(),
  business_id: UUIDSchema.optional(),
  entry_fee: z.number().min(0, 'Entry fee must be non-negative').optional(),
  organizer_name: z
    .string()
    .min(2, 'Organizer name must be at least 2 characters')
    .max(100, 'Organizer name must be less than 100 characters')
    .optional(),
  organizer_contact: z
    .string()
    .min(10, 'Contact must be at least 10 characters')
    .max(20, 'Contact must be less than 20 characters')
    .optional(),
  organizer_email: z.string().email('Invalid email format').optional(),
  website: z.string().url('Invalid website URL').optional(),
  status: EventStatusSchema.default('upcoming'),
  is_featured: z.boolean().default(false),
});

/**
 * Main Event schema with refinements for date validation
 */
export const EventSchema = EventBaseSchema.refine(
  (data) => {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
).refine(
  (data) => {
    // If both start_time and end_time are provided for same-day events
    if (data.start_time && data.end_time && data.start_date === data.end_date) {
      return data.end_time >= data.start_time;
    }
    return true;
  },
  {
    message:
      'End time must be after or equal to start time for same-day events',
    path: ['end_time'],
  }
);

/**
 * Event with relations schema (using base schema to avoid ZodEffects issues)
 */
export const EventWithRelationsSchema = EventBaseSchema.extend({
  ...BaseEntitySchema.shape,
  ...TimestampSchema.shape,
  // Relations
  tourist_spot: z
    .object({
      id: UUIDSchema,
      name: z.string(),
      spot_type: z.string(),
    })
    .optional(),
  business: z
    .object({
      id: UUIDSchema,
      business_name: z.string(),
      business_type: z.string(),
    })
    .optional(),
  categories: z
    .array(
      z.object({
        id: UUIDSchema,
        name: z.string(),
        main_category: z.object({
          id: UUIDSchema,
          name: z.string(),
        }),
      })
    )
    .default([]),
  images: z
    .array(
      z.object({
        id: UUIDSchema,
        image_url: z.string().url(),
        caption: z.string().optional(),
        is_primary: z.boolean(),
        display_order: z.number(),
      })
    )
    .default([]),
});

// ============================================================================
// FORM SCHEMAS
// ============================================================================

/**
 * Event creation schema (using base schema)
 */
export const CreateEventSchema = EventBaseSchema.pick({
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  start_time: true,
  end_time: true,
  venue_name: true,
  address: true,
  city: true,
  province: true,
  location: true,
  tourist_spot_id: true,
  business_id: true,
  entry_fee: true,
  organizer_name: true,
  organizer_contact: true,
  organizer_email: true,
  website: true,
}).extend({
  // Additional creation-specific fields
  category_ids: z.array(UUIDSchema).min(1, 'At least one category is required'),
  image_urls: z
    .array(z.string().url())
    .max(10, 'Maximum 10 images allowed')
    .optional(),
});

/**
 * Event update schema (using base schema, all fields optional)
 */
export const UpdateEventSchema = EventBaseSchema.pick({
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  start_time: true,
  end_time: true,
  venue_name: true,
  address: true,
  city: true,
  province: true,
  location: true,
  tourist_spot_id: true,
  business_id: true,
  entry_fee: true,
  organizer_name: true,
  organizer_contact: true,
  organizer_email: true,
  website: true,
})
  .partial()
  .extend({
    category_ids: z.array(UUIDSchema).optional(),
    image_urls: z.array(z.string().url()).max(10).optional(),
  });

/**
 * Event status update schema
 */
export const EventStatusUpdateSchema = z.object({
  status: EventStatusSchema,
});

/**
 * Event feature toggle schema
 */
export const EventFeatureToggleSchema = z.object({
  is_featured: z.boolean(),
});

// ============================================================================
// FILTER & SEARCH SCHEMAS
// ============================================================================

/**
 * Event filters schema
 */
export const EventFiltersSchema = z
  .object({
    // Text search
    search_query: z.string().optional(),

    // Status filters
    status: EventStatusSchema.optional(),
    is_featured: z.boolean().optional(),

    // Date filters
    start_date_from: z.string().optional(),
    start_date_to: z.string().optional(),
    end_date_from: z.string().optional(),
    end_date_to: z.string().optional(),

    // Location filters
    city: z.string().optional(),
    province: z.string().optional(),

    // Category filters
    category_ids: z.array(UUIDSchema).optional(),
    main_category_id: UUIDSchema.optional(),
    // Price filters
    free_events_only: z.boolean().optional(),
    has_entry_fee: z.boolean().optional(),
    max_entry_fee: z.number().min(0).optional(),

    // Date range filters (legacy compatibility)
    date_from: z.string().optional(),
    date_to: z.string().optional(),

    // Rating filters
    min_rating: z.number().min(0).max(5).optional(),

    // Organizer filters
    organizer_name: z.string().optional(),

    // Relation filters
    tourist_spot_id: UUIDSchema.optional(),
    business_id: UUIDSchema.optional(),
    created_by: UUIDSchema.optional(),

    // Sorting
    sort_by: z
      .enum([
        'name',
        'start_date',
        'end_date',
        'created_at',
        'updated_at',
        'entry_fee',
      ])
      .default('start_date'),
    sort_order: z.enum(['asc', 'desc']).default('asc'),
  })
  .merge(PaginationParamsSchema);

/**
 * Calendar events filters schema
 */
export const CalendarEventsFiltersSchema = z.object({
  start_date: z.string(),
  end_date: z.string(),
  status: z.array(EventStatusSchema).optional(),
  category_ids: z.array(UUIDSchema).optional(),
});

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk event operations schema
 */
export const BulkEventOperationsSchema = z.object({
  event_ids: z.array(UUIDSchema).min(1, 'At least one event must be selected'),
  operation: z.enum([
    'update_status',
    'toggle_featured',
    'delete',
    'bulk_edit',
  ]),
  data: z
    .object({
      status: EventStatusSchema.optional(),
      is_featured: z.boolean().optional(),
      category_ids: z.array(UUIDSchema).optional(),
    })
    .optional(),
});

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

/**
 * Event analytics response schema
 */
export const EventAnalyticsSchema = z.object({
  overview: z.object({
    total_events: z.number(),
    upcoming_events: z.number(),
    ongoing_events: z.number(),
    completed_events: z.number(),
    cancelled_events: z.number(),
    featured_events: z.number(),
    average_entry_fee: z.number().optional(),
  }),
  charts: z.object({
    events_by_status: z.array(z.tuple([z.string(), z.number()])),
    events_by_month: z.array(z.tuple([z.string(), z.number()])),
    popular_categories: z.array(z.tuple([z.string(), z.number()])),
  }),
  recent_activity: z.array(
    z.object({
      id: UUIDSchema,
      name: z.string(),
      status: EventStatusSchema,
      start_date: z.string(),
      created_at: z.string(),
    })
  ),
});

// ============================================================================
// SCHEMA ALIASES FOR COMPATIBILITY
// ============================================================================

export const BulkEventOperationSchema = BulkEventOperationsSchema;
export const CalendarEventSchema = EventWithRelationsSchema;
export const EventCalendarFiltersSchema = CalendarEventsFiltersSchema;
export const EventDashboardDataSchema = EventAnalyticsSchema;
export const EventFeatureUpdateSchema = EventFeatureToggleSchema;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Event = z.infer<typeof EventSchema>;
export type EventWithRelations = z.infer<typeof EventWithRelationsSchema>;
export type CreateEventData = z.infer<typeof CreateEventSchema>;
export type UpdateEventData = z.infer<typeof UpdateEventSchema>;
export type EventFilters = z.infer<typeof EventFiltersSchema>;
export type CalendarEventsFilters = z.infer<typeof CalendarEventsFiltersSchema>;
export type BulkEventOperations = z.infer<typeof BulkEventOperationsSchema>;
export type EventAnalytics = z.infer<typeof EventAnalyticsSchema>;
export type EventStatusUpdate = z.infer<typeof EventStatusUpdateSchema>;
export type EventFeatureToggle = z.infer<typeof EventFeatureToggleSchema>;

// Additional exports for compatibility
export type EventInsert = CreateEventData;
export type EventUpdate = UpdateEventData;
export type EventCalendarFilters = CalendarEventsFilters;
export type BulkEventOperation = BulkEventOperations;
export type EventFeatureUpdate = EventFeatureToggle;
export type CalendarEvent = EventWithRelations;
export type EventDashboardData = EventAnalytics;
