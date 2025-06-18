// filepath: schemas/amenitiesSchemas.ts
/**
 * Amenities Schemas for NAGA VENTURE Tourism CMS
 *
 * Comprehensive Zod schemas for amenities management with full type safety:
 * - Amenity CRUD operations with validation
 * - Usage analytics data structures
 * - Search and filtering schemas
 * - Audit trail support
 *
 * Following established patterns from categoriesSchemas.ts
 */

import { z } from 'zod';

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Base schema for common amenity fields
 * Includes core validation rules for amenity data
 */
const AmenityBaseSchema = z.object({
  name: z
    .string()
    .min(2, 'Amenity name must be at least 2 characters long')
    .max(50, 'Amenity name cannot exceed 50 characters')
    .trim(),
  icon_url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val.startsWith('ph:') || val.startsWith('phosphor:'),
      'Icon must be a valid Phosphor icon name (e.g., ph:wifi, phosphor:car)'
    ),
});

// ============================================================================
// CRUD SCHEMAS
// ============================================================================

/**
 * Schema for creating a new amenity
 * Used in create operations with proper validation
 */
export const AmenityInsertSchema = AmenityBaseSchema.extend({
  created_by: z.string().uuid().optional().nullable(),
});
export type AmenityInsert = z.infer<typeof AmenityInsertSchema>;

/**
 * Schema for updating an existing amenity
 * All fields are optional for partial updates
 */
export const AmenityUpdateSchema = AmenityBaseSchema.partial().extend({
  updated_by: z.string().uuid().optional().nullable(),
});
export type AmenityUpdate = z.infer<typeof AmenityUpdateSchema>;

/**
 * Complete amenity schema including database-generated fields
 * Used for API responses and display
 */
export const AmenitySchema = AmenityBaseSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().uuid().optional().nullable(),
  updated_by: z.string().uuid().optional().nullable(),
});
export type Amenity = z.infer<typeof AmenitySchema>;

// ============================================================================
// ENHANCED SCHEMAS WITH RELATIONSHIPS
// ============================================================================

/**
 * Amenity with usage statistics
 * Includes business and room usage counts for analytics
 */
export const AmenityWithUsageSchema = AmenitySchema.extend({
  business_count: z.number().int().min(0).default(0),
  room_count: z.number().int().min(0).default(0),
  total_usage: z.number().int().min(0).default(0),
});
export type AmenityWithUsage = z.infer<typeof AmenityWithUsageSchema>;

/**
 * Amenity with creator/updater profile information
 * For displaying audit trail information
 */
export const AmenityWithAuditSchema = AmenitySchema.extend({
  created_by_profile: z
    .object({
      id: z.string().uuid(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().email(),
    })
    .nullable()
    .optional(),
  updated_by_profile: z
    .object({
      id: z.string().uuid(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().email(),
    })
    .nullable()
    .optional(),
});
export type AmenityWithAudit = z.infer<typeof AmenityWithAuditSchema>;

/**
 * Complete amenity schema with usage stats and audit info
 * Used in the main management interface
 */
export const AmenityCompleteSchema = AmenityWithUsageSchema.extend({
  created_by_profile: z
    .object({
      id: z.string().uuid(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().email(),
    })
    .nullable()
    .optional(),
  updated_by_profile: z
    .object({
      id: z.string().uuid(),
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().email(),
    })
    .nullable()
    .optional(),
});
export type AmenityComplete = z.infer<typeof AmenityCompleteSchema>;

// ============================================================================
// FILTER AND SEARCH SCHEMAS
// ============================================================================

/**
 * Comprehensive filters for amenities queries
 * Supports search, sorting, and pagination
 */
export const AmenityFiltersSchema = z.object({
  search: z.string().optional(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
  has_usage: z.boolean().optional(), // Filter amenities with/without usage
  min_usage_count: z.number().int().min(0).optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z
    .enum(['name', 'created_at', 'updated_at', 'total_usage'])
    .optional()
    .default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  include_usage: z.boolean().optional().default(true),
  include_audit: z.boolean().optional().default(false),
});
export type AmenityFilters = z.infer<typeof AmenityFiltersSchema>;

// ============================================================================
// USAGE ANALYTICS SCHEMAS
// ============================================================================

/**
 * Usage statistics for a single amenity
 * Detailed breakdown of where the amenity is used
 */
export const AmenityUsageStatsSchema = z.object({
  amenity_id: z.string().uuid(),
  amenity_name: z.string(),
  business_usage: z.object({
    count: z.number().int().min(0),
    businesses: z
      .array(
        z.object({
          id: z.string().uuid(),
          business_name: z.string(),
          business_type: z.enum(['accommodation', 'shop', 'service']),
        })
      )
      .optional(),
  }),
  room_usage: z.object({
    count: z.number().int().min(0),
    rooms: z
      .array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          business_name: z.string(),
          business_id: z.string().uuid(),
        })
      )
      .optional(),
  }),
  total_usage: z.number().int().min(0),
  last_used: z.string().nullable().optional(),
});
export type AmenityUsageStats = z.infer<typeof AmenityUsageStatsSchema>;

/**
 * Overall amenities usage summary
 * For dashboard analytics and reporting
 */
export const AmenitiesUsageSummarySchema = z.object({
  total_amenities: z.number().int().min(0),
  used_amenities: z.number().int().min(0),
  unused_amenities: z.number().int().min(0),
  most_used_amenities: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      icon_url: z.string().nullable(),
      usage_count: z.number().int().min(0),
    })
  ),
  least_used_amenities: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      icon_url: z.string().nullable(),
      usage_count: z.number().int().min(0),
    })
  ),
  usage_by_type: z.object({
    business_amenities: z.number().int().min(0),
    room_amenities: z.number().int().min(0),
  }),
});
export type AmenitiesUsageSummary = z.infer<typeof AmenitiesUsageSummarySchema>;

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

/**
 * Client-side form validation schema
 * Used in React Hook Form with additional UI-specific validation
 */
export const AmenityFormSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Amenity name must be at least 2 characters long')
      .max(50, 'Amenity name cannot exceed 50 characters')
      .trim()
      .refine(
        (val) => !/[<>\"'&]/.test(val),
        'Amenity name cannot contain special HTML characters'
      ),
    icon_url: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => !val || val.startsWith('ph:') || val.startsWith('phosphor:'),
        'Please select a valid icon from the icon picker'
      ),
  })
  .strict(); // Prevent additional fields

export type AmenityFormData = z.infer<typeof AmenityFormSchema>;

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * API response schema for amenities list
 * Includes pagination metadata
 */
export const AmenitiesListResponseSchema = z.object({
  data: z.array(AmenityCompleteSchema),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});
export type AmenitiesListResponse = z.infer<typeof AmenitiesListResponseSchema>;

/**
 * API response schema for single amenity operations
 */
export const AmenityResponseSchema = z.object({
  data: AmenityCompleteSchema,
  message: z.string().optional(),
});
export type AmenityResponse = z.infer<typeof AmenityResponseSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate amenity name uniqueness (to be used in hooks)
 * @param name - Amenity name to validate
 * @param excludeId - ID to exclude from uniqueness check (for updates)
 */
export const validateAmenityNameUniqueness = (
  name: string,
  excludeId?: string
) => {
  return z
    .string()
    .refine(
      async (val) => {
        // This will be implemented in the hook layer
        // Placeholder for now
        return true;
      },
      { message: 'An amenity with this name already exists' }
    )
    .parse(name);
};

/**
 * Validate icon URL format for Phosphor icons
 * @param iconUrl - Icon URL to validate
 */
export const validatePhosphorIcon = (iconUrl: string | null | undefined) => {
  if (!iconUrl) return true;
  return iconUrl.startsWith('ph:') || iconUrl.startsWith('phosphor:');
};

// All schemas and types are already exported above where they're defined
// No need for a separate export block
