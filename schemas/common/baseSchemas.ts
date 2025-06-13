// filepath: schemas/common/baseSchemas.ts
/**
 * Base Schemas - Phase 5 Implementation
 *
 * Common validation schemas used across the application.
 * These provide consistent validation patterns for reusable field types.
 */

import { z } from 'zod';

// ============================================================================
// COMMON FIELD VALIDATIONS
// ============================================================================

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
 * Phone number validation (flexible format, allows null)
 * More permissive regex to handle various phone number formats in the database
 */
export const PhoneSchema = z
  .string()
  .regex(/^[\+]?[\d\s\-\(\)\.]{7,20}$/, 'Please enter a valid phone number')
  .nullable()
  .optional()
  .or(z.literal(''));

/**
 * URL validation (optional, allows null)
 */
export const UrlSchema = z
  .string()
  .url('Please enter a valid URL')
  .nullable()
  .optional()
  .or(z.literal(''));

/**
 * Required URL validation
 */
export const RequiredUrlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Please enter a valid URL');

/**
 * UUID validation
 */
export const UuidSchema = z.string().uuid('Invalid ID format');

/**
 * UUID validation (alias for backward compatibility)
 */
export const UUIDSchema = UuidSchema;

/**
 * Name validation (for names, titles, etc.)
 * Very flexible regex to allow business names with various characters including accents, quotes, symbols
 */
export const NameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[\p{L}\p{N}\p{P}\p{S}\s]+$/u, 'Name contains invalid characters');

/**
 * Text content validation (for descriptions, etc.)
 */
export const TextContentSchema = z
  .string()
  .min(10, 'Content must be at least 10 characters')
  .max(2000, 'Content must be less than 2000 characters');

/**
 * Short text validation (for short descriptions)
 */
export const ShortTextSchema = z
  .string()
  .min(3, 'Text must be at least 3 characters')
  .max(255, 'Text must be less than 255 characters');

// ============================================================================
// LOCATION VALIDATIONS
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
 * Coordinates validation
 */
export const CoordinatesSchema = z.object({
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

/**
 * Address validation
 */
export const AddressSchema = z
  .string()
  .min(10, 'Please enter a complete address')
  .max(500, 'Address must be less than 500 characters');

/**
 * City validation
 */
export const CitySchema = z
  .string()
  .min(2, 'City name must be at least 2 characters')
  .max(100, 'City name must be less than 100 characters');

/**
 * Province/State validation
 */
export const ProvinceSchema = z
  .string()
  .min(2, 'Province must be at least 2 characters')
  .max(100, 'Province must be less than 100 characters');

/**
 * Postal code validation (flexible for different countries, allows null)
 */
export const PostalCodeSchema = z
  .string()
  .min(3, 'Postal code must be at least 3 characters')
  .max(20, 'Postal code must be less than 20 characters')
  .regex(/^[A-Za-z0-9\s\-]+$/, 'Postal code contains invalid characters')
  .nullable()
  .optional()
  .or(z.literal(''));

/**
 * Complete location validation including coordinates
 */
export const GeographicLocationSchema = z.object({
  address: AddressSchema,
  city: CitySchema,
  province: ProvinceSchema,
  postal_code: PostalCodeSchema,
  latitude: LatitudeSchema,
  longitude: LongitudeSchema,
});

// ============================================================================
// BASE ENTITY SCHEMAS
// ============================================================================

/**
 * Base entity fields that all entities should have
 * Using more flexible timestamp validation to handle Supabase formats
 */
export const BaseEntitySchema = z.object({
  id: UuidSchema,
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

// ============================================================================
// DATETIME VALIDATIONS
// ============================================================================

/**
 * Date validation (flexible format for Supabase timestamps)
 */
export const DateSchema = z.string().or(z.date());

/**
 * Time validation (HH:MM format)
 */
export const TimeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format')
  .optional();

/**
 * Timestamp validation for created_at/updated_at fields
 * More flexible to handle Supabase timestamp formats
 */
export const TimestampSchema = z.object({
  created_at: z.string().or(z.date()).optional(),
  updated_at: z.string().or(z.date()).optional(),
});

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

/**
 * Pagination query parameters
 */
export const PaginationQuerySchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  search: z
    .string()
    .max(255, 'Search query must be less than 255 characters')
    .optional(),
});

/**
 * Pagination parameters (alias for backward compatibility)
 */
export const PaginationParamsSchema = PaginationQuerySchema;

/**
 * Sort order validation
 */
export const SortOrderSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * Generic pagination response
 */
export const PaginationResponseSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

/**
 * Image upload validation
 */
export const ImageUploadSchema = z.object({
  uri: z.string().min(1, 'Image URI is required'),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({
      message: 'Only JPEG, PNG, and WebP images are allowed',
    }),
  }),
  name: z.string().min(1, 'Image name is required'),
  size: z.number().max(5 * 1024 * 1024, 'Image size must be less than 5MB'),
});

/**
 * Multiple images upload validation
 */
export const MultipleImagesSchema = z
  .array(ImageUploadSchema)
  .min(1, 'At least one image is required')
  .max(10, 'Maximum 10 images allowed');

// ============================================================================
// STATUS ENUMS
// ============================================================================

/**
 * Generic status validation
 */
export const StatusSchema = z.enum(['active', 'inactive'], {
  errorMap: () => ({ message: 'Status must be either active or inactive' }),
});

/**
 * Approval status validation
 */
export const ApprovalStatusSchema = z.enum(
  ['pending', 'approved', 'rejected'],
  {
    errorMap: () => ({ message: 'Invalid approval status' }),
  }
);

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type Email = z.infer<typeof EmailSchema>;
export type Password = z.infer<typeof PasswordSchema>;
export type Phone = z.infer<typeof PhoneSchema>;
export type Url = z.infer<typeof UrlSchema>;
export type Uuid = z.infer<typeof UuidSchema>;
export type Name = z.infer<typeof NameSchema>;
export type TextContent = z.infer<typeof TextContentSchema>;
export type ShortText = z.infer<typeof ShortTextSchema>;
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
export type ImageUpload = z.infer<typeof ImageUploadSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type ApprovalStatus = z.infer<typeof ApprovalStatusSchema>;
export type GeographicLocation = z.infer<typeof GeographicLocationSchema>;
export type BaseEntity = z.infer<typeof BaseEntitySchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
