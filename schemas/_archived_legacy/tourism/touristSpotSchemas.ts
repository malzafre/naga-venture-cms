// filepath: schemas/tourism/touristSpotSchemas.ts
/**
 * Tourist Spot Validation Schemas - Phase 5 Implementation
 *
 * Comprehensive validation schemas for tourist spot management operations.
 * Features:
 * - Complete CRUD validation with Zod
 * - Geographic location validation
 * - Type-safe schema definitions
 * - API response validation patterns
 * - Search and filter validation
 */

import { z } from 'zod';

import {
  BaseEntitySchema,
  GeographicLocationSchema,
  TimestampSchema,
  UUIDSchema,
} from '../common/baseSchemas';

// ============================================================================
// ENUMS & TYPES
// ============================================================================

/**
 * Tourist spot status enumeration
 */
export const TouristSpotStatusSchema = z.enum([
  'active',
  'inactive',
  'under_maintenance',
  'coming_soon',
]);

/**
 * Tourist spot type enumeration
 */
export const TouristSpotTypeSchema = z.enum([
  'natural',
  'cultural',
  'historical',
  'religious',
  'recreational',
  'other',
]);

// ============================================================================
// CORE SCHEMAS
// ============================================================================

/**
 * Tourist spot base schema
 */
export const TouristSpotBaseSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  spot_type: TouristSpotTypeSchema,
  address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters')
    .trim(),
  city: z.string().default('Naga City'),
  province: z.string().default('Camarines Sur'),
  location: GeographicLocationSchema,
  google_maps_place_id: z.string().optional(),
  contact_phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .optional(),
  contact_email: z.string().email('Invalid email format').optional(),
  website: z.string().url('Invalid website URL').optional(),
  opening_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional(),
  closing_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
    .optional(),
  entry_fee: z
    .number()
    .min(0, 'Entry fee cannot be negative')
    .max(10000, 'Entry fee seems too high')
    .optional(),
  status: TouristSpotStatusSchema.default('active'),
  is_featured: z.boolean().default(false),
});

/**
 * Complete tourist spot schema with database fields
 */
export const TouristSpotSchema = TouristSpotBaseSchema.extend({
  ...BaseEntitySchema.shape,
  average_rating: z.number().min(0).max(5).optional(),
  review_count: z.number().min(0).default(0),
  created_by: UUIDSchema.optional(),
  updated_by: UUIDSchema.optional(),
});

/**
 * Tourist spot with related data
 */
export const TouristSpotWithRelationsSchema = TouristSpotSchema.extend({
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
    .optional(),
  categories: z
    .array(
      z.object({
        id: UUIDSchema,
        name: z.string(),
        main_category_name: z.string().optional(),
      })
    )
    .optional(),
  reviews: z
    .array(
      z.object({
        id: UUIDSchema,
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        reviewer_name: z.string(),
        created_at: z.string(),
      })
    )
    .optional(),
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

/**
 * Tourist spot creation schema
 */
export const TouristSpotInsertSchema = TouristSpotBaseSchema.omit({
  status: true,
  is_featured: true,
}).extend({
  status: TouristSpotStatusSchema.optional(),
  is_featured: z.boolean().optional(),
});

/**
 * Tourist spot update schema
 */
export const TouristSpotUpdateSchema = TouristSpotBaseSchema.partial().extend({
  id: UUIDSchema,
});

/**
 * Tourist spot filters schema
 */
export const TouristSpotFiltersSchema = z.object({
  search: z.string().optional(),
  spot_type: TouristSpotTypeSchema.optional(),
  status: TouristSpotStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  city: z.string().optional(),
  has_entry_fee: z.boolean().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  category_id: UUIDSchema.optional(),
  created_by: UUIDSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ============================================================================
// OPERATION SCHEMAS
// ============================================================================

/**
 * Bulk tourist spot operations schema
 */
export const BulkTouristSpotOperationSchema = z.object({
  ids: z.array(UUIDSchema).min(1, 'At least one tourist spot must be selected'),
  operation: z.enum([
    'activate',
    'deactivate',
    'feature',
    'unfeature',
    'delete',
  ]),
  reason: z
    .string()
    .min(3, 'Reason is required for bulk operations')
    .optional(),
});

/**
 * Tourist spot status update schema
 */
export const TouristSpotStatusUpdateSchema = z.object({
  id: UUIDSchema,
  status: TouristSpotStatusSchema,
  reason: z.string().min(3, 'Reason is required for status changes').optional(),
});

/**
 * Tourist spot feature update schema
 */
export const TouristSpotFeatureUpdateSchema = z.object({
  id: UUIDSchema,
  is_featured: z.boolean(),
  feature_reason: z.string().optional(),
});

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

/**
 * Tourist spot analytics schema
 */
export const TouristSpotAnalyticsSchema = z.object({
  total_spots: z.number(),
  active_spots: z.number(),
  featured_spots: z.number(),
  spots_by_type: z.record(TouristSpotTypeSchema, z.number()),
  spots_by_status: z.record(TouristSpotStatusSchema, z.number()),
  average_rating: z.number().min(0).max(5),
  total_reviews: z.number(),
  recent_activity: z.array(
    z.object({
      id: UUIDSchema,
      name: z.string(),
      action: z.enum(['created', 'updated', 'featured', 'reviewed']),
      timestamp: TimestampSchema,
    })
  ),
  popular_spots: z.array(
    z.object({
      id: UUIDSchema,
      name: z.string(),
      rating: z.number(),
      review_count: z.number(),
      view_count: z.number().optional(),
    })
  ),
});

/**
 * Tourist spot dashboard data schema
 */
export const TouristSpotDashboardDataSchema = z.object({
  overview: z.object({
    total_spots: z.number(),
    active_spots: z.number(),
    inactive_spots: z.number(),
    featured_spots: z.number(),
    pending_reviews: z.number(),
  }),
  recent_spots: z.array(
    TouristSpotSchema.pick({
      id: true,
      name: true,
      spot_type: true,
      status: true,
      created_at: true,
    })
  ),
  top_rated_spots: z.array(
    TouristSpotSchema.pick({
      id: true,
      name: true,
      average_rating: true,
      review_count: true,
    })
  ),
  activity_summary: z.object({
    new_spots_this_week: z.number(),
    new_reviews_this_week: z.number(),
    featured_spots_this_month: z.number(),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TouristSpotStatus = z.infer<typeof TouristSpotStatusSchema>;
export type TouristSpotType = z.infer<typeof TouristSpotTypeSchema>;
export type TouristSpot = z.infer<typeof TouristSpotSchema>;
export type TouristSpotWithRelations = z.infer<
  typeof TouristSpotWithRelationsSchema
>;
export type TouristSpotInsert = z.infer<typeof TouristSpotInsertSchema>;
export type TouristSpotUpdate = z.infer<typeof TouristSpotUpdateSchema>;
export type TouristSpotFilters = z.infer<typeof TouristSpotFiltersSchema>;
export type BulkTouristSpotOperation = z.infer<
  typeof BulkTouristSpotOperationSchema
>;
export type TouristSpotStatusUpdate = z.infer<
  typeof TouristSpotStatusUpdateSchema
>;
export type TouristSpotFeatureUpdate = z.infer<
  typeof TouristSpotFeatureUpdateSchema
>;
export type TouristSpotAnalytics = z.infer<typeof TouristSpotAnalyticsSchema>;
export type TouristSpotDashboardData = z.infer<
  typeof TouristSpotDashboardDataSchema
>;
