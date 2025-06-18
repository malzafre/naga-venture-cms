// filepath: schemas/tourism/tourist-spot.schemas.ts
/**
 * Tourist Spot Schemas - Centralized Schema Library
 *
 * Comprehensive validation schemas for tourist spots and attractions in the NAGA VENTURE project.
 * Provides type-safe validation for tourist spot CRUD operations, location handling, and filtering.
 */

import { z } from 'zod';
import {
  BaseEntitySchema,
  DateSchema,
  GeographicLocationSchema,
  ImageSchema,
  NameSchema,
  OptionalPriceSchema,
  OptionalRatingSchema,
  OptionalTimeSchema,
  PaginationSchema,
  PhoneSchema,
  SearchSchema,
  SortSchema,
  TextAreaSchema,
  TouristSpotStatusSchema,
  TouristSpotTypeSchema,
  UrlSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// TOURIST SPOT CORE SCHEMAS
// ============================================================================

/**
 * Tourist spot basic information schema
 */
export const TouristSpotBaseSchema = z.object({
  name: NameSchema,
  description: TextAreaSchema,
  spot_type: TouristSpotTypeSchema,
  ...GeographicLocationSchema.shape, // address, city, province, coordinates, google_maps_place_id
  contact_phone: PhoneSchema,
  contact_email: z.string().email('Invalid email format').optional(),
  website: UrlSchema.optional(),
  opening_time: OptionalTimeSchema,
  closing_time: OptionalTimeSchema,
  entry_fee: OptionalPriceSchema,
  status: TouristSpotStatusSchema.default('active'),
  is_featured: z.boolean().default(false),
});

/**
 * Tourist spot creation schema
 */
export const TouristSpotCreateSchema = TouristSpotBaseSchema.extend({
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
});

/**
 * Tourist spot update schema (all fields optional except id)
 */
export const TouristSpotUpdateSchema = TouristSpotBaseSchema.partial().extend({
  id: UuidSchema,
});

/**
 * Complete tourist spot schema (from database)
 */
export const TouristSpotCompleteSchema = BaseEntitySchema.extend({
  ...TouristSpotBaseSchema.shape,
  average_rating: OptionalRatingSchema,
  review_count: z.number().min(0).default(0),
  created_by: UuidSchema.nullable(),
  updated_by: UuidSchema.nullable(),
  images: z
    .array(
      ImageSchema.extend({
        tourist_spot_id: UuidSchema,
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
});

// ============================================================================
// TOURIST SPOT FILTERING AND SEARCH SCHEMAS
// ============================================================================

/**
 * Tourist spot filters schema
 */
export const TouristSpotFiltersSchema = z.object({
  search: SearchSchema,
  spot_type: TouristSpotTypeSchema.optional(),
  status: TouristSpotStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  city: z.string().optional(),
  category_id: UuidSchema.optional(),
  min_rating: z.number().min(0).max(5).optional(),
  has_entry_fee: z.boolean().optional(),
  is_open_now: z.boolean().optional(),
  // Geographic filters
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_km: z.number().positive().optional(),
  created_by: UuidSchema.optional(),
  date_from: DateSchema.optional(),
  date_to: DateSchema.optional(),
});

/**
 * Tourist spot sorting schema
 */
export const TouristSpotSortSchema = SortSchema.extend({
  field: z.enum([
    'name',
    'created_at',
    'updated_at',
    'average_rating',
    'review_count',
    'entry_fee',
    'spot_type',
    'status',
  ]),
});

/**
 * Tourist spot list query schema
 */
export const TouristSpotListQuerySchema = z.object({
  ...TouristSpotFiltersSchema.shape,
  ...TouristSpotSortSchema.shape,
  ...PaginationSchema.shape,
});

// ============================================================================
// TOURIST SPOT API RESPONSE SCHEMAS
// ============================================================================

/**
 * Tourist spot list response schema
 */
export const TouristSpotListResponseSchema = z.object({
  data: z.array(TouristSpotCompleteSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
  }),
  filters: TouristSpotFiltersSchema.partial(),
});

/**
 * Tourist spot analytics schema
 */
export const TouristSpotAnalyticsSchema = z.object({
  total_spots: z.number(),
  active_spots: z.number(),
  featured_spots: z.number(),
  spots_by_type: z.record(TouristSpotTypeSchema, z.number()),
  spots_by_status: z.record(TouristSpotStatusSchema, z.number()),
  average_rating: z.number().optional(),
  total_reviews: z.number(),
  spots_with_images: z.number(),
  popular_locations: z.array(
    z.object({
      city: z.string(),
      count: z.number(),
    })
  ),
});

// ============================================================================
// TOURIST SPOT BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk tourist spot operation schema
 */
export const BulkTouristSpotOperationSchema = z.object({
  operation: z.enum([
    'activate',
    'deactivate',
    'feature',
    'unfeature',
    'delete',
  ]),
  spot_ids: z
    .array(UuidSchema)
    .min(1, 'At least one tourist spot must be selected'),
  reason: z.string().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TouristSpotBase = z.infer<typeof TouristSpotBaseSchema>;
export type TouristSpotCreate = z.infer<typeof TouristSpotCreateSchema>;
export type TouristSpotUpdate = z.infer<typeof TouristSpotUpdateSchema>;
export type TouristSpotComplete = z.infer<typeof TouristSpotCompleteSchema>;
export type TouristSpotFilters = z.infer<typeof TouristSpotFiltersSchema>;
export type TouristSpotSort = z.infer<typeof TouristSpotSortSchema>;
export type TouristSpotListQuery = z.infer<typeof TouristSpotListQuerySchema>;
export type TouristSpotListResponse = z.infer<
  typeof TouristSpotListResponseSchema
>;
export type TouristSpotAnalytics = z.infer<typeof TouristSpotAnalyticsSchema>;
export type BulkTouristSpotOperation = z.infer<
  typeof BulkTouristSpotOperationSchema
>;
