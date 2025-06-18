// filepath: schemas/amenities.schemas.ts
/**
 * Amenities Schemas - Centralized Schema Library
 *
 * Comprehensive validation schemas for amenities management in the NAGA VENTURE project.
 * Provides type-safe validation for amenity CRUD operations, filtering, and analytics.
 */

import { z } from 'zod';
import {
  BaseEntitySchema,
  DateSchema,
  EmailSchema,
  NameSchema,
  OptionalNameSchema,
  PaginationSchema,
  SearchSchema,
  SortSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// AMENITY ENUMS AND CONSTANTS
// ============================================================================

/**
 * Amenity categories for grouping related amenities
 */
export const AmenityCategorySchema = z.enum([
  'accommodation',
  'connectivity',
  'transportation',
  'dining',
  'recreation',
  'wellness',
  'business',
  'accessibility',
  'security',
  'convenience',
  'entertainment',
  'outdoor',
]);

export type AmenityCategory = z.infer<typeof AmenityCategorySchema>;

/**
 * Amenity availability levels
 */
export const AmenityAvailabilitySchema = z.enum([
  'always',
  'seasonal',
  'on_request',
  'limited',
  'temporarily_unavailable',
]);

export type AmenityAvailability = z.infer<typeof AmenityAvailabilitySchema>;

// ============================================================================
// CORE AMENITY SCHEMAS
// ============================================================================

/**
 * Base amenity schema with core fields
 */
export const AmenityBaseSchema = z.object({
  name: NameSchema,
  description: OptionalNameSchema,
  icon_url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val.startsWith('ph:') || val.startsWith('phosphor:'),
      'Icon must be a valid Phosphor icon name (e.g., ph:wifi, phosphor:car)'
    ),
  category: AmenityCategorySchema.optional(),
  availability: AmenityAvailabilitySchema.default('always'),
  is_premium: z.boolean().default(false),
  additional_cost: z.number().min(0).nullable().optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

/**
 * Complete amenity schema with database fields
 */
export const AmenitySchema = AmenityBaseSchema.extend({
  ...BaseEntitySchema.shape,
  usage_count: z.number().int().min(0).default(0),
  last_used_at: DateSchema.nullable().optional(),
});

export type Amenity = z.infer<typeof AmenitySchema>;

/**
 * Schema for creating new amenities
 */
export const AmenityCreateSchema = z.object({
  name: NameSchema,
  description: OptionalNameSchema,
  icon_url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val.startsWith('ph:') || val.startsWith('phosphor:'),
      'Icon must be a valid Phosphor icon name (e.g., ph:wifi, phosphor:car)'
    ),
  category: AmenityCategorySchema.optional(),
  availability: AmenityAvailabilitySchema.default('always').optional(),
  is_premium: z.boolean().default(false).optional(),
  additional_cost: z.number().min(0).nullable().optional(),
  is_active: z.boolean().default(true).optional(),
  display_order: z.number().int().min(0).default(0).optional(),
  created_by: UuidSchema.nullable().optional(),
});

export type AmenityCreate = z.infer<typeof AmenityCreateSchema>;

/**
 * Schema for updating amenities
 */
export const AmenityUpdateSchema = AmenityBaseSchema.partial().extend({
  updated_by: UuidSchema.nullable().optional(),
});

export type AmenityUpdate = z.infer<typeof AmenityUpdateSchema>;

// ============================================================================
// AMENITY ASSIGNMENT SCHEMAS
// ============================================================================

/**
 * Schema for business amenity assignments
 */
export const BusinessAmenitySchema = z.object({
  id: UuidSchema,
  business_id: UuidSchema,
  amenity_id: UuidSchema,
  is_available: z.boolean().default(true),
  additional_info: z.string().max(255).optional(),
  cost_per_use: z.number().min(0).nullable().optional(),
  created_at: DateSchema,
  updated_at: DateSchema,
  // Relations
  amenity: AmenitySchema.optional(),
});

export type BusinessAmenity = z.infer<typeof BusinessAmenitySchema>;

/**
 * Schema for creating business amenity assignments
 */
export const BusinessAmenityCreateSchema = z.object({
  business_id: UuidSchema,
  amenity_id: UuidSchema,
  is_available: z.boolean().default(true),
  additional_info: z.string().max(255).optional(),
  cost_per_use: z.number().min(0).nullable().optional(),
});

export type BusinessAmenityCreate = z.infer<typeof BusinessAmenityCreateSchema>;

/**
 * Schema for updating business amenity assignments
 */
export const BusinessAmenityUpdateSchema =
  BusinessAmenityCreateSchema.partial().omit({
    business_id: true,
    amenity_id: true,
  });

export type BusinessAmenityUpdate = z.infer<typeof BusinessAmenityUpdateSchema>;

// ============================================================================
// FILTERING AND SEARCH SCHEMAS
// ============================================================================

/**
 * Amenity filtering schema
 */
export const AmenityFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  category: AmenityCategorySchema.optional(),
  availability: AmenityAvailabilitySchema.optional(),
  is_premium: z.boolean().optional(),
  is_active: z.boolean().optional(),
  business_id: UuidSchema.optional(), // Filter by business usage
  min_usage_count: z.number().int().min(0).optional(),
  has_additional_cost: z.boolean().optional(),
  // Legacy fields for backwards compatibility
  search: z.string().max(255).optional(), // Legacy alias for searchQuery
  include_audit: z.boolean().optional(),
  include_usage: z.boolean().optional(),
  has_usage: z.boolean().optional(),
  created_by: UuidSchema.optional(),
  updated_by: UuidSchema.optional(),
});

export type AmenityFilters = z.infer<typeof AmenityFiltersSchema>;

/**
 * Business amenity filtering schema
 */
export const BusinessAmenityFiltersSchema = z.object({
  business_id: UuidSchema,
  category: AmenityCategorySchema.optional(),
  is_available: z.boolean().optional(),
  has_cost: z.boolean().optional(),
  search: z.string().optional(),
});

export type BusinessAmenityFilters = z.infer<
  typeof BusinessAmenityFiltersSchema
>;

// ============================================================================
// ANALYTICS AND REPORTING SCHEMAS
// ============================================================================

/**
 * Amenity usage analytics schema
 */
export const AmenityAnalyticsSchema = z.object({
  amenity_id: UuidSchema,
  amenity_name: NameSchema,
  category: AmenityCategorySchema,
  total_businesses: z.number().int().min(0),
  active_businesses: z.number().int().min(0),
  usage_percentage: z.number().min(0).max(100),
  average_cost: z.number().min(0).nullable(),
  trend: z.enum(['increasing', 'stable', 'decreasing']),
  last_updated: DateSchema,
});

export type AmenityAnalytics = z.infer<typeof AmenityAnalyticsSchema>;

/**
 * Amenity dashboard data schema
 */
export const AmenityDashboardDataSchema = z.object({
  total_amenities: z.number().int().min(0),
  active_amenities: z.number().int().min(0),
  categories_count: z.number().int().min(0),
  premium_amenities: z.number().int().min(0),
  most_used_amenities: z.array(AmenityAnalyticsSchema).max(10),
  category_distribution: z.array(
    z.object({
      category: AmenityCategorySchema,
      count: z.number().int().min(0),
      percentage: z.number().min(0).max(100),
    })
  ),
  recent_additions: z.array(AmenitySchema).max(5),
});

export type AmenityDashboardData = z.infer<typeof AmenityDashboardDataSchema>;

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk amenity operations schema
 */
export const BulkAmenityOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'delete', 'update_category']),
  amenity_ids: z.array(UuidSchema).min(1).max(100),
  data: z.record(z.any()).optional(), // Operation-specific data
  performed_by: UuidSchema,
});

export type BulkAmenityOperation = z.infer<typeof BulkAmenityOperationSchema>;

/**
 * Bulk business amenity assignment schema
 */
export const BulkBusinessAmenityAssignmentSchema = z.object({
  business_id: UuidSchema,
  amenity_ids: z.array(UuidSchema).min(1).max(50),
  default_availability: z.boolean().default(true),
  assigned_by: UuidSchema,
});

export type BulkBusinessAmenityAssignment = z.infer<
  typeof BulkBusinessAmenityAssignmentSchema
>;

// ============================================================================
// EXTENDED AMENITY SCHEMAS (FOR BACKWARDS COMPATIBILITY)
// ============================================================================

/**
 * Amenity with usage statistics
 */
export const AmenityWithUsageSchema = AmenitySchema.extend({
  business_count: z.number().int().min(0).default(0),
  last_assigned_at: DateSchema.nullable().optional(),
  popularity_rank: z.number().int().min(1).optional(),
  total_usage: z.number().int().min(0).default(0), // Added for backwards compatibility
});

export type AmenityWithUsage = z.infer<typeof AmenityWithUsageSchema>;

/**
 * Complete amenity schema with usage stats and profile info
 * Used in the main management interface for full context
 */
export const AmenityCompleteSchema = AmenityWithUsageSchema.extend({
  created_by_profile: z
    .object({
      id: UuidSchema,
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: EmailSchema,
    })
    .nullable()
    .optional(),
  updated_by_profile: z
    .object({
      id: UuidSchema,
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: EmailSchema,
    })
    .nullable()
    .optional(),
});

export type AmenityComplete = z.infer<typeof AmenityCompleteSchema>;

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

/**
 * Usage statistics schema for amenities
 */
export const AmenityUsageStatsSchema = z.object({
  amenity_id: UuidSchema,
  amenity_name: NameSchema.optional(), // Added for backwards compatibility
  total_businesses: z.number().int().min(0).optional(), // Made optional for flexibility
  active_assignments: z.number().int().min(0).optional(), // Made optional for flexibility
  usage_percentage: z.number().min(0).max(100).optional(), // Made optional for flexibility
  growth_rate: z.number().optional(), // Made optional for flexibility
  last_month_assignments: z.number().int().min(0).optional(), // Made optional for flexibility
  trend: z.enum(['increasing', 'stable', 'decreasing']).optional(), // Made optional for flexibility
  total_usage: z.number().int().min(0).optional(), // Added for backwards compatibility
  business_usage: z.any().optional(), // Added for backwards compatibility - flexible type
  room_usage: z.any().optional(), // Added for backwards compatibility - flexible type
});

export type AmenityUsageStats = z.infer<typeof AmenityUsageStatsSchema>;

/**
 * Usage summary for amenities dashboard
 */
export const AmenitiesUsageSummarySchema = z.object({
  total_amenities: z.number().int().min(0),
  active_amenities: z.number().int().min(0).optional(), // Made optional for flexibility
  used_amenities: z.number().int().min(0), // Added for backwards compatibility
  unused_amenities: z.number().int().min(0), // Added for backwards compatibility
  most_used: z.array(AmenityUsageStatsSchema).max(10).optional(), // Made optional
  most_used_amenities: z.array(z.any()).max(10).optional(), // Legacy alias - flexible type
  least_used: z.array(AmenityUsageStatsSchema).max(10).optional(), // Made optional
  least_used_amenities: z.array(z.any()).max(10).optional(), // Legacy alias - flexible type
  usage_by_type: z.any().optional(), // Flexible for various formats
  recent_additions: z.array(AmenitySchema).max(5).optional(), // Made optional
  summary_date: DateSchema.optional(), // Made optional
});

export type AmenitiesUsageSummary = z.infer<typeof AmenitiesUsageSummarySchema>;

// ============================================================================
