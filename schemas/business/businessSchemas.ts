// filepath: schemas/business/businessSchemas.ts
/**
 * Business Schemas - Phase 5 Implementation
 *
 * Comprehensive Zod schemas for business-related data validation.
 * Validates business forms, API responses, and database operations.
 */

import { z } from 'zod';

import {
  AddressSchema,
  CitySchema,
  DateSchema,
  EmailSchema,
  LatitudeSchema,
  LongitudeSchema,
  NameSchema,
  OptionalEmailSchema,
  PaginationQuerySchema,
  PaginationResponseSchema,
  PhoneSchema,
  PostalCodeSchema,
  ProvinceSchema,
  TextContentSchema,
  UrlSchema,
  UuidSchema,
} from '../common/baseSchemas';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Business type validation
 */
export const BusinessTypeSchema = z.enum(['accommodation', 'shop', 'service'], {
  errorMap: () => ({ message: 'Please select a valid business type' }),
});

/**
 * Business status validation
 */
export const BusinessStatusSchema = z.enum(
  ['pending', 'approved', 'rejected', 'inactive'],
  {
    errorMap: () => ({ message: 'Invalid business status' }),
  }
);

// ============================================================================
// CORE BUSINESS SCHEMAS
// ============================================================================

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
 * Business coordinates extraction schema
 */
export const BusinessCoordinatesSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

/**
 * Complete business schema (from database)
 */
export const BusinessSchema = z.object({
  id: UuidSchema,
  owner_id: UuidSchema.nullable(),
  business_name: NameSchema,
  business_type: BusinessTypeSchema,
  description: TextContentSchema.min(
    200,
    'Description must be at least 200 characters'
  ),
  address: AddressSchema,
  city: CitySchema,
  province: ProvinceSchema,
  postal_code: PostalCodeSchema.nullable(),
  phone: PhoneSchema.nullable(),
  email: OptionalEmailSchema,
  website: UrlSchema.nullable(),
  facebook_url: UrlSchema.nullable(),
  instagram_url: UrlSchema.nullable(),
  twitter_url: UrlSchema.nullable(),
  location: z.string(), // PostGIS GEOGRAPHY(POINT) format
  google_maps_place_id: z.string().nullable(),
  status: BusinessStatusSchema,
  is_claimed: z.boolean(),
  is_featured: z.boolean(),
  average_rating: z.number().min(0).max(5).nullable(),
  review_count: z.number().int().min(0),
  created_at: DateSchema,
  updated_at: DateSchema,
  approved_at: DateSchema.nullable(),
  approved_by: UuidSchema.nullable(),
  rejection_reason: z.string().nullable(),
});

// ============================================================================
// FORM SCHEMAS
// ============================================================================

/**
 * Business creation form schema
 */
export const BusinessCreateFormSchema = z.object({
  // Step 1: Basic Information
  business_name: NameSchema,
  business_type: BusinessTypeSchema,
  description: TextContentSchema.min(
    200,
    'Description must be at least 200 characters'
  ),

  // Step 2: Location Information
  address: AddressSchema,
  city: CitySchema,
  province: ProvinceSchema,
  // FIX: Make postal_code optional by allowing an empty string
  postal_code: PostalCodeSchema.or(z.literal('')),
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,

  // Step 3: Contact Information
  // FIX: Make phone optional by allowing an empty string
  phone: PhoneSchema.or(z.literal('')),
  // FIX: Email is already correctly optional
  email: EmailSchema.optional().or(z.literal('')),
  // FIX: Make all URL fields truly optional by allowing an empty string
  website: UrlSchema.or(z.literal('')),
  facebook_url: UrlSchema.or(z.literal('')),
  instagram_url: UrlSchema.or(z.literal('')),
  twitter_url: UrlSchema.or(z.literal('')),
});

/**
 * Step-specific validation schemas for multi-step forms
 */
export const BusinessFormStep1Schema = BusinessCreateFormSchema.pick({
  business_name: true,
  business_type: true,
  description: true,
});

export const BusinessFormStep2Schema = BusinessCreateFormSchema.pick({
  address: true,
  city: true,
  province: true,
  postal_code: true,
  latitude: true,
  longitude: true,
});

export const BusinessFormStep3Schema = BusinessCreateFormSchema.pick({
  phone: true,
  email: true,
  website: true,
  facebook_url: true,
  instagram_url: true,
  twitter_url: true,
});

/**
 * Business update form schema (all fields optional except required ones)
 */
export const BusinessUpdateFormSchema = BusinessCreateFormSchema.partial({
  business_name: true,
  business_type: true,
  description: true,
  address: true,
  city: true,
  province: true,
  postal_code: true,
  latitude: true,
  longitude: true,
  phone: true,
  email: true,
  website: true,
  facebook_url: true,
  instagram_url: true,
  twitter_url: true,
});

/**
 * Business database insert schema
 */
export const BusinessInsertSchema = z.object({
  business_name: NameSchema,
  business_type: BusinessTypeSchema,
  description: TextContentSchema.min(200),
  address: AddressSchema,
  city: CitySchema,
  province: ProvinceSchema,
  postal_code: PostalCodeSchema.nullable(),
  phone: PhoneSchema.nullable(),
  email: EmailSchema.optional().or(z.literal('')).nullable(),
  website: UrlSchema.nullable(),
  facebook_url: UrlSchema.nullable(),
  instagram_url: UrlSchema.nullable(),
  twitter_url: UrlSchema.nullable(),
  location: z.string(), // PostGIS format: "POINT(lng lat)"
  owner_id: UuidSchema.optional(),
});

/**
 * Business database update schema
 */
export const BusinessUpdateSchema = BusinessInsertSchema.partial();

// ============================================================================
// FILTER & QUERY SCHEMAS
// ============================================================================

/**
 * Business filter schema
 */
export const BusinessFiltersSchema = z
  .object({
    search: z.string().optional(),
    status: BusinessStatusSchema.optional(),
    business_type: BusinessTypeSchema.optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    is_featured: z.boolean().optional(),
    is_claimed: z.boolean().optional(),
    has_location: z.boolean().optional(),
  })
  .extend(PaginationQuerySchema.shape);

/**
 * Business search schema
 */
export const BusinessSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(255),
  filters: BusinessFiltersSchema.optional(),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * Single business API response
 */
export const BusinessApiResponseSchema = z.object({
  data: BusinessSchema.nullable(),
  error: z.string().nullable(),
});

/**
 * Business list API response
 */
export const BusinessListApiResponseSchema = z
  .object({
    data: z.array(BusinessSchema),
    count: z.number().nullable(),
    error: z.string().nullable(),
  })
  .extend(PaginationResponseSchema.shape);

/**
 * Business mutation response
 */
export const BusinessMutationResponseSchema = z.object({
  data: BusinessSchema.nullable(),
  error: z.string().nullable(),
  status: z.number(),
  statusText: z.string(),
});

// ============================================================================
// BUSINESS CATEGORIES SCHEMAS
// ============================================================================

/**
 * Business category assignment schema
 */
export const BusinessCategorySchema = z.object({
  id: UuidSchema,
  business_id: UuidSchema,
  sub_category_id: UuidSchema,
  created_at: DateSchema,
});

/**
 * Business category assignment form
 */
export const BusinessCategoryAssignSchema = z.object({
  business_id: UuidSchema,
  sub_category_id: UuidSchema,
});

// ============================================================================
// BUSINESS HOURS SCHEMAS
// ============================================================================

/**
 * Business hours schema
 */
export const BusinessHoursSchema = z.object({
  id: UuidSchema,
  business_id: UuidSchema,
  day_of_week: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  open_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable(),
  close_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable(),
  is_closed: z.boolean(),
  created_at: DateSchema,
  updated_at: DateSchema,
});

/**
 * Business hours form schema
 */
export const BusinessHoursFormSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  open_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable(),
  close_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .nullable(),
  is_closed: z.boolean(),
});

// ============================================================================
// BUSINESS IMAGES SCHEMAS
// ============================================================================

/**
 * Business image schema
 */
export const BusinessImageSchema = z.object({
  id: UuidSchema,
  business_id: UuidSchema,
  image_url: UrlSchema.refine((val) => val !== '', 'Image URL is required'),
  caption: z.string().max(255).optional(),
  is_primary: z.boolean(),
  display_order: z.number().int().min(0),
  created_at: DateSchema,
  updated_at: DateSchema,
});

/**
 * Business image upload schema
 */
export const BusinessImageUploadSchema = z.object({
  business_id: UuidSchema,
  image_url: UrlSchema.refine((val) => val !== '', 'Image URL is required'),
  caption: z.string().max(255).optional(),
  is_primary: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BusinessType = z.infer<typeof BusinessTypeSchema>;
export type BusinessStatus = z.infer<typeof BusinessStatusSchema>;
export type Business = z.infer<typeof BusinessSchema>;
export type BusinessCreateForm = z.infer<typeof BusinessCreateFormSchema>;
export type BusinessFormStep1 = z.infer<typeof BusinessFormStep1Schema>;
export type BusinessFormStep2 = z.infer<typeof BusinessFormStep2Schema>;
export type BusinessFormStep3 = z.infer<typeof BusinessFormStep3Schema>;
export type BusinessUpdateForm = z.infer<typeof BusinessUpdateFormSchema>;
export type BusinessInsert = z.infer<typeof BusinessInsertSchema>;
export type BusinessUpdate = z.infer<typeof BusinessUpdateSchema>;
export type BusinessFilters = z.infer<typeof BusinessFiltersSchema>;
export type BusinessSearch = z.infer<typeof BusinessSearchSchema>;
export type BusinessApiResponse = z.infer<typeof BusinessApiResponseSchema>;
export type BusinessListApiResponse = z.infer<
  typeof BusinessListApiResponseSchema
>;
export type BusinessMutationResponse = z.infer<
  typeof BusinessMutationResponseSchema
>;
export type BusinessCategory = z.infer<typeof BusinessCategorySchema>;
export type BusinessCategoryAssign = z.infer<
  typeof BusinessCategoryAssignSchema
>;
export type BusinessHours = z.infer<typeof BusinessHoursSchema>;
export type BusinessHoursForm = z.infer<typeof BusinessHoursFormSchema>;
export type BusinessImage = z.infer<typeof BusinessImageSchema>;
export type BusinessImageUpload = z.infer<typeof BusinessImageUploadSchema>;
export type BusinessCoordinates = z.infer<typeof BusinessCoordinatesSchema>;
