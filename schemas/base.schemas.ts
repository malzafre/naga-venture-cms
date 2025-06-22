// filepath: schemas/base.schemas.ts
/**
 * Base Schemas - Centralized Schema Library
 *
 * Truly common, reusable schemas used across the entire application.
 * These provide consistent validation patterns for fundamental data types.
 */

import { z } from 'zod';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

/**
 * User role validation based on database enum
 * Used across authentication and user management
 */
export const UserRoleSchema = z.enum(
  [
    'tourism_admin',
    'business_listing_manager',
    'tourism_content_manager',
    'business_registration_manager',
    'business_owner',
    'tourist',
  ],
  {
    errorMap: () => ({ message: 'Invalid user role' }),
  }
);

export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * Staff role validator
 */
export const STAFF_ROLES: UserRole[] = [
  'tourism_admin',
  'business_listing_manager',
  'tourism_content_manager',
  'business_registration_manager',
];

/**
 * Check if a role is a staff role
 */
export const isStaffRole = (role: UserRole): boolean => {
  return STAFF_ROLES.includes(role);
};

// ============================================================================
// PRIMITIVE VALIDATIONS
// ============================================================================

/**
 * UUID validation with proper error messages
 */
export const UuidSchema = z.string().uuid('Invalid ID format');

/**
 * Email validation with proper error messages
 */
export const EmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters');

/**
 * Optional email validation (allows null, undefined, or empty string)
 */
export const OptionalEmailSchema = z
  .string()
  .email('Please enter a valid email address')
  .max(255, 'Email must be less than 255 characters')
  .nullable()
  .optional()
  .or(z.literal(''));

/**
 * Password validation with security requirements
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  );

/**
 * Phone number validation (flexible format, allows null and empty string)
 */
export const PhoneSchema = z
  .string()
  .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be less than 20 characters')
  .nullable()
  .optional()
  .or(z.literal(''));

/**
 * Name validation for first names, last names, etc.
 */
export const NameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters');

/**
 * Optional name schema
 */
export const OptionalNameSchema = z
  .string()
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]*$/, 'Name contains invalid characters')
  .nullable()
  .optional()
  .or(z.literal(''));

/**
 * Business name validation - more permissive than personal names
 * Allows numbers, special characters, and international characters commonly found in business names
 */
export const BusinessNameSchema = z
  .string()
  .min(1, 'Business name is required')
  .max(200, 'Business name must be less than 200 characters')
  .regex(
    /^[\p{L}\p{N}\p{P}\p{S}\p{Z}]+$/u,
    'Business name contains invalid characters'
  );

/**
 * URL validation
 */
export const UrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL must be less than 2048 characters');

/**
 * Optional URL validation
 */
export const OptionalUrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(2048, 'URL must be less than 2048 characters')
  .nullable()
  .optional()
  .or(z.literal(''));

/**
 * Text area validation for descriptions
 */
export const TextAreaSchema = z
  .string()
  .min(1, 'Description is required')
  .max(5000, 'Description must be less than 5000 characters');

/**
 * Optional text area validation
 */
export const OptionalTextAreaSchema = z
  .string()
  .max(5000, 'Description must be less than 5000 characters')
  .nullable()
  .optional()
  .or(z.literal(''));

// ============================================================================
// DATE AND TIME VALIDATIONS
// ============================================================================

/**
 * Date validation
 */
export const DateSchema = z.coerce.date({
  errorMap: () => ({ message: 'Please enter a valid date' }),
});

/**
 * Date string validation (for database storage)
 * Flexible format that accepts Supabase's timestamp format
 */
export const DateStringSchema = z.string().refine(
  (value) => {
    // Try to parse the date - if it's valid, accept it
    const date = new Date(value);
    return !isNaN(date.getTime());
  },
  {
    message: 'Please enter a valid date and time',
  }
);

/**
 * Time validation (HH:MM format)
 */
export const TimeSchema = z
  .string()
  .regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Please enter a valid time (HH:MM)'
  );

/**
 * Optional time validation
 */
export const OptionalTimeSchema = z
  .string()
  .regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Please enter a valid time (HH:MM)'
  )
  .nullable()
  .optional()
  .or(z.literal(''));

// ============================================================================
// NUMERIC VALIDATIONS
// ============================================================================

/**
 * Positive integer validation
 */
export const PositiveIntegerSchema = z
  .number()
  .int('Must be a whole number')
  .positive('Must be a positive number');

/**
 * Non-negative integer validation (includes 0)
 */
export const NonNegativeIntegerSchema = z
  .number()
  .int('Must be a whole number')
  .min(0, 'Must be 0 or greater');

/**
 * Price validation (positive number with up to 2 decimal places)
 */
export const PriceSchema = z
  .number()
  .positive('Price must be greater than 0')
  .multipleOf(0.01, 'Price can have at most 2 decimal places');

/**
 * Optional price validation
 */
export const OptionalPriceSchema = z
  .number()
  .positive('Price must be greater than 0')
  .multipleOf(0.01, 'Price can have at most 2 decimal places')
  .nullable()
  .optional();

/**
 * Rating validation (1-5 scale)
 */
export const RatingSchema = z
  .number()
  .int('Rating must be a whole number')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5');

/**
 * Optional rating validation
 */
export const OptionalRatingSchema = z
  .number()
  .min(0, 'Rating must be 0 or greater')
  .max(5, 'Rating must be at most 5')
  .nullable()
  .optional();

// ============================================================================
// GEOGRAPHIC VALIDATIONS
// ============================================================================

/**
 * Latitude validation
 */
export const LatitudeSchema = z
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

/**
 * Longitude validation
 */
export const LongitudeSchema = z
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

/**
 * Coordinates schema
 */
export const CoordinatesSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

/**
 * Geographic location schema
 */
export const GeographicLocationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().default('Naga City'),
  province: z.string().default('Camarines Sur'),
  coordinates: CoordinatesSchema,
  google_maps_place_id: z.string().optional(),
});

// ============================================================================
// COMMON ENTITY SCHEMAS
// ============================================================================

/**
 * Base entity fields (timestamps and audit fields)
 */
export const BaseEntitySchema = z.object({
  id: UuidSchema,
  created_at: DateStringSchema,
  updated_at: DateStringSchema,
});

/**
 * Auditable entity fields (includes created_by/updated_by)
 */
export const AuditableEntitySchema = BaseEntitySchema.extend({
  created_by: UuidSchema.nullable().optional(),
  updated_by: UuidSchema.nullable().optional(),
});

/**
 * Image schema for various entities
 */
export const ImageSchema = z.object({
  id: UuidSchema,
  image_url: UrlSchema,
  caption: OptionalTextAreaSchema,
  is_primary: z.boolean().default(false),
  display_order: NonNegativeIntegerSchema.default(0),
  created_at: DateStringSchema,
  updated_at: DateStringSchema,
});

// ============================================================================
// PAGINATION AND FILTERING SCHEMAS
// ============================================================================

/**
 * Pagination schema
 */
export const PaginationSchema = z.object({
  page: PositiveIntegerSchema.default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * Sort schema
 */
export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Search schema
 */
export const SearchSchema = z.object({
  searchQuery: z.string().max(255).optional(),
});

/**
 * Base filters schema (combines pagination, sort, and search)
 */
export const BaseFiltersSchema =
  PaginationSchema.merge(SortSchema).merge(SearchSchema);

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Success response schema
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});

/**
 * Error response schema
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

/**
 * List response schema factory
 */
export const createListResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    data: z.array(itemSchema),
    count: z.number().nullable(),
    hasMore: z.boolean().optional(),
  });

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

/**
 * Boolean string schema (for form inputs)
 */
export const BooleanStringSchema = z
  .string()
  .transform((val) => val === 'true')
  .pipe(z.boolean());

/**
 * Nullable string schema (converts empty strings to null)
 */
export const NullableStringSchema = z
  .string()
  .transform((val) => (val.trim() === '' ? null : val))
  .nullable();

/**
 * JSON schema validation
 */
export const JsonSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonSchema),
    z.record(JsonSchema),
  ])
);

// ============================================================================
// DATABASE ENUM SCHEMAS (Based on MCP Database Structure)
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

/**
 * Tourist spot type validation
 */
export const TouristSpotTypeSchema = z.enum(
  ['natural', 'cultural', 'historical', 'religious', 'recreational', 'other'],
  {
    errorMap: () => ({ message: 'Invalid tourist spot type' }),
  }
);

/**
 * Tourist spot status validation
 */
export const TouristSpotStatusSchema = z.enum(
  ['active', 'inactive', 'under_maintenance', 'coming_soon'],
  {
    errorMap: () => ({ message: 'Invalid tourist spot status' }),
  }
);

/**
 * Event status validation
 */
export const EventStatusSchema = z.enum(
  ['upcoming', 'ongoing', 'completed', 'cancelled'],
  {
    errorMap: () => ({ message: 'Invalid event status' }),
  }
);

/**
 * Booking status validation
 */
export const BookingStatusSchema = z.enum(
  ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
  {
    errorMap: () => ({ message: 'Invalid booking status' }),
  }
);

/**
 * Payment status validation
 */
export const PaymentStatusSchema = z.enum(
  ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
  {
    errorMap: () => ({ message: 'Invalid payment status' }),
  }
);

/**
 * Payment method validation
 */
export const PaymentMethodSchema = z.enum(
  ['gcash', 'paypal', 'xendit', 'credit_card', 'cash'],
  {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }
);

/**
 * Review type validation
 */
export const ReviewTypeSchema = z.enum(['business', 'tourist_spot', 'event'], {
  errorMap: () => ({ message: 'Invalid review type' }),
});

/**
 * Promotion status validation
 */
export const PromotionStatusSchema = z.enum(
  ['active', 'scheduled', 'expired', 'cancelled'],
  {
    errorMap: () => ({ message: 'Invalid promotion status' }),
  }
);

/**
 * Content type validation (for content management)
 */
export const ContentTypeSchema = z.enum(
  ['business_profile', 'tourist_spot', 'event', 'promotion'],
  {
    errorMap: () => ({ message: 'Invalid content type' }),
  }
);

/**
 * Content status validation
 */
export const ContentStatusSchema = z.enum(['pending', 'approved', 'rejected'], {
  errorMap: () => ({ message: 'Invalid content status' }),
});

/**
 * Page view type validation
 */
export const PageViewTypeSchema = z.enum(
  ['business', 'tourist_spot', 'event', 'promotion'],
  {
    errorMap: () => ({ message: 'Invalid page view type' }),
  }
);

// Export common type definitions
export type BusinessType = z.infer<typeof BusinessTypeSchema>;
export type BusinessStatus = z.infer<typeof BusinessStatusSchema>;
export type TouristSpotType = z.infer<typeof TouristSpotTypeSchema>;
export type TouristSpotStatus = z.infer<typeof TouristSpotStatusSchema>;
export type EventStatus = z.infer<typeof EventStatusSchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type ReviewType = z.infer<typeof ReviewTypeSchema>;
export type PromotionStatus = z.infer<typeof PromotionStatusSchema>;
export type ContentType = z.infer<typeof ContentTypeSchema>;
export type ContentStatus = z.infer<typeof ContentStatusSchema>;
export type PageViewType = z.infer<typeof PageViewTypeSchema>;
