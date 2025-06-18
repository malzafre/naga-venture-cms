// filepath: schemas/business.schemas.ts
/**
 * Business Schemas - Centralized Schema Library
 *
 * Comprehensive validation schemas for business management in the NAGA VENTURE project.
 * Provides type-safe validation for business CRUD operations, location handling, and filtering.
 */

import { z } from 'zod';
import {
  BaseEntitySchema,
  BusinessStatusSchema,
  BusinessTypeSchema,
  DateSchema,
  EmailSchema,
  LatitudeSchema,
  LongitudeSchema,
  NameSchema,
  OptionalNameSchema,
  PaginationSchema,
  PhoneSchema,
  SearchSchema,
  UrlSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// LOCATION AND GEOGRAPHY SCHEMAS
// ============================================================================

/**
 * Business coordinates schema
 */
export const BusinessCoordinatesSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

export type BusinessCoordinates = z.infer<typeof BusinessCoordinatesSchema>;

/**
 * Business location schema (PostGIS POINT format)
 */
export const BusinessLocationSchema = z
  .object({
    latitude: LatitudeSchema,
    longitude: LongitudeSchema,
  })
  .transform(({ latitude, longitude }) => `POINT(${longitude} ${latitude})`);

/**
 * Address schema for businesses
 */
export const BusinessAddressSchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters').max(255),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  province: z
    .string()
    .min(2, 'Province must be at least 2 characters')
    .max(100),
  postal_code: z.string().max(20).nullable().optional(),
  coordinates: BusinessCoordinatesSchema.optional(),
  google_maps_place_id: z.string().nullable().optional(),
});

export type BusinessAddress = z.infer<typeof BusinessAddressSchema>;

// ============================================================================
// CORE BUSINESS SCHEMAS
// ============================================================================

/**
 * Base business schema with core fields
 */
export const BusinessBaseSchema = z.object({
  business_name: NameSchema,
  business_type: BusinessTypeSchema,
  description: z
    .string()
    .min(200, 'Description must be at least 200 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(255),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  province: z
    .string()
    .min(2, 'Province must be at least 2 characters')
    .max(100),
  postal_code: z.string().max(20).nullable().optional(),
  phone: PhoneSchema,
  email: EmailSchema.nullable().optional(),
  website: UrlSchema.nullable().optional(),
  facebook_url: UrlSchema.nullable().optional(),
  instagram_url: UrlSchema.nullable().optional(),
  twitter_url: UrlSchema.nullable().optional(),
  location: z.string().optional(), // PostGIS GEOGRAPHY(POINT) format
  google_maps_place_id: z.string().nullable().optional(),
  status: BusinessStatusSchema.default('pending'),
  is_claimed: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

/**
 * Complete business schema with database fields
 */
export const BusinessSchema = BusinessBaseSchema.extend({
  ...BaseEntitySchema.shape,
  owner_id: UuidSchema.nullable().optional(),
  average_rating: z.number().min(0).max(5).nullable().optional(),
  review_count: z.number().int().min(0).default(0),
  approved_at: DateSchema.nullable().optional(),
  approved_by: UuidSchema.nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  // Relationships
  business_images: z.array(z.any()).optional(),
  amenities: z.array(z.any()).optional(),
  categories: z.array(z.any()).optional(),
});

export type Business = z.infer<typeof BusinessSchema>;

/**
 * Schema for creating new businesses
 */
export const BusinessCreateSchema = BusinessBaseSchema.extend({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
  owner_id: UuidSchema.optional(),
  images: z.array(z.any()).optional(), // For form handling
});

export type BusinessCreate = z.infer<typeof BusinessCreateSchema>;

/**
 * Schema for updating businesses
 */
export const BusinessUpdateSchema = BusinessBaseSchema.partial().extend({
  latitude: LatitudeSchema.optional(),
  longitude: LongitudeSchema.optional(),
  updated_by: UuidSchema.optional(),
});

export type BusinessUpdate = z.infer<typeof BusinessUpdateSchema>;

// ============================================================================
// BUSINESS IMAGE SCHEMAS
// ============================================================================

/**
 * Business image schema
 */
export const BusinessImageSchema = z.object({
  id: UuidSchema,
  business_id: UuidSchema,
  image_url: UrlSchema,
  caption: OptionalNameSchema,
  is_primary: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
  created_at: DateSchema,
  updated_at: DateSchema,
});

export type BusinessImage = z.infer<typeof BusinessImageSchema>;

/**
 * Business form image schema (for form state)
 */
export const BusinessFormImageSchema = z.object({
  id: z.string().min(1),
  uri: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  size: z.number().positive(),
  caption: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export type BusinessFormImage = z.infer<typeof BusinessFormImageSchema>;

// ============================================================================
// FILTERING AND SEARCH SCHEMAS
// ============================================================================

/**
 * Business filtering schema
 */
export const BusinessFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  business_type: BusinessTypeSchema.optional(),
  status: BusinessStatusSchema.optional(),
  is_claimed: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  has_images: z.boolean().optional(),
  owner_id: UuidSchema.optional(),
  // Geographic filtering
  near_coordinates: BusinessCoordinatesSchema.optional(),
  radius_km: z.number().min(0.1).max(100).optional(),
  // Legacy fields for backwards compatibility
  search: z.string().max(255).optional(), // Legacy alias for searchQuery
});

export type BusinessFilters = z.infer<typeof BusinessFiltersSchema>;

// ============================================================================
// ANALYTICS AND REPORTING SCHEMAS
// ============================================================================

/**
 * Business analytics schema
 */
export const BusinessAnalyticsSchema = z.object({
  business_id: UuidSchema,
  business_name: NameSchema,
  business_type: BusinessTypeSchema,
  total_views: z.number().int().min(0),
  total_bookings: z.number().int().min(0),
  average_rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().int().min(0),
  revenue: z.number().min(0).nullable(),
  growth_rate: z.number(),
  last_updated: DateSchema,
});

export type BusinessAnalytics = z.infer<typeof BusinessAnalyticsSchema>;

/**
 * Business dashboard data schema
 */
export const BusinessDashboardDataSchema = z.object({
  total_businesses: z.number().int().min(0),
  active_businesses: z.number().int().min(0),
  pending_approvals: z.number().int().min(0),
  featured_businesses: z.number().int().min(0),
  by_type: z.array(
    z.object({
      type: BusinessTypeSchema,
      count: z.number().int().min(0),
      percentage: z.number().min(0).max(100),
    })
  ),
  by_location: z.array(
    z.object({
      city: z.string(),
      count: z.number().int().min(0),
    })
  ),
  recent_businesses: z.array(BusinessSchema).max(5),
  top_rated: z.array(BusinessSchema).max(10),
});

export type BusinessDashboardData = z.infer<typeof BusinessDashboardDataSchema>;

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

/**
 * Business creation form schema
 */
export const BusinessCreateFormSchema = z.object({
  // Step 1: Basic Information
  business_name: NameSchema,
  business_type: BusinessTypeSchema,
  description: z
    .string()
    .min(200, 'Description must be at least 200 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),

  // Step 2: Location Information
  address: z.string().min(5, 'Address must be at least 5 characters').max(255),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  province: z
    .string()
    .min(2, 'Province must be at least 2 characters')
    .max(100),
  postal_code: z.string().max(20).or(z.literal('')).optional(),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,

  // Step 3: Contact Information
  phone: PhoneSchema,
  email: EmailSchema.or(z.literal('')).optional(),
  website: UrlSchema.or(z.literal('')).optional(),

  // Step 4: Social Media (optional)
  facebook_url: UrlSchema.or(z.literal('')).optional(),
  instagram_url: UrlSchema.or(z.literal('')).optional(),
  twitter_url: UrlSchema.or(z.literal('')).optional(),

  // Step 5: Images
  images: z
    .array(BusinessFormImageSchema)
    .min(1, 'At least one image is required')
    .max(10),
});

export type BusinessCreateForm = z.infer<typeof BusinessCreateFormSchema>;

/**
 * Business update form schema
 */
export const BusinessUpdateFormSchema = BusinessCreateFormSchema.partial();

export type BusinessUpdateForm = z.infer<typeof BusinessUpdateFormSchema>;

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk business operations schema
 */
export const BulkBusinessOperationSchema = z.object({
  operation: z.enum([
    'approve',
    'reject',
    'activate',
    'deactivate',
    'feature',
    'unfeature',
  ]),
  business_ids: z.array(UuidSchema).min(1).max(50),
  reason: z.string().max(500).optional(),
  performed_by: UuidSchema,
});

export type BulkBusinessOperation = z.infer<typeof BulkBusinessOperationSchema>;

// ============================================================================
// LEGACY ALIASES FOR BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * Legacy aliases for backwards compatibility with existing hooks
 */
export const BusinessInsertSchema = BusinessCreateSchema;
export const BusinessFiltersQuerySchema = BusinessFiltersSchema;

export type BusinessInsert = BusinessCreate;
export type BusinessFiltersQuery = BusinessFilters;

/**
 * Business with full relationships schema
 */
export const BusinessWithRelationsSchema = BusinessSchema.extend({
  owner: z.any().optional(), // Profile information
  business_images: z.array(BusinessImageSchema).optional(),
  amenities: z.array(z.any()).optional(),
  categories: z.array(z.any()).optional(),
  reviews: z.array(z.any()).optional(),
});

export type BusinessWithRelations = z.infer<typeof BusinessWithRelationsSchema>;

// ============================================================================
