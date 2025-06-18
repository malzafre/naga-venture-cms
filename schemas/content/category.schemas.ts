// filepath: schemas/categories.schemas.ts
/**
 * Categories Schemas - Centralized Schema Library
 *
 * Comprehensive validation schemas for category management in the NAGA VENTURE project.
 * Provides type-safe validation for main and sub-category CRUD operations, hierarchy, and filtering.
 */

import { z } from 'zod';
import {
  BaseEntitySchema,
  DateSchema,
  NameSchema,
  OptionalNameSchema,
  PaginationSchema,
  SearchSchema,
  SortSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// CATEGORY TYPE ENUMS
// ============================================================================

/**
 * Category types for different business domains
 */
export const CategoryTypeSchema = z.enum([
  'business',
  'tourism',
  'accommodation',
  'dining',
  'entertainment',
  'transportation',
  'shopping',
  'services',
]);

export type CategoryType = z.infer<typeof CategoryTypeSchema>;

/**
 * Category status options
 */
export const CategoryStatusSchema = z.enum([
  'active',
  'inactive',
  'archived',
  'pending_review',
]);

export type CategoryStatus = z.infer<typeof CategoryStatusSchema>;

// ============================================================================
// MAIN CATEGORY SCHEMAS
// ============================================================================

/**
 * Base schema for main category fields
 */
export const MainCategoryBaseSchema = z.object({
  name: NameSchema,
  description: OptionalNameSchema,
  type: CategoryTypeSchema.default('business'),
  status: CategoryStatusSchema.default('active'),
  display_order: z.number().int().min(0).default(0),
  color_code: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .optional(),
  icon_url: z.string().max(255).optional(),
  is_featured: z.boolean().default(false),
  meta_description: z.string().max(500).optional(),
  meta_keywords: z.array(z.string()).max(20).optional(),
});

/**
 * Complete main category schema with database fields
 */
export const MainCategorySchema = MainCategoryBaseSchema.extend({
  ...BaseEntitySchema.shape,
  business_count: z.number().int().min(0).default(0),
  sub_categories_count: z.number().int().min(0).default(0),
});

export type MainCategory = z.infer<typeof MainCategorySchema>;

/**
 * Schema for creating new main categories
 */
export const MainCategoryCreateSchema = MainCategoryBaseSchema.omit({
  display_order: true,
}).extend({
  created_by: UuidSchema.optional(),
});

export type MainCategoryCreate = z.infer<typeof MainCategoryCreateSchema>;

/**
 * Schema for updating main categories
 */
export const MainCategoryUpdateSchema = MainCategoryBaseSchema.partial().extend(
  {
    updated_by: UuidSchema.optional(),
  }
);

export type MainCategoryUpdate = z.infer<typeof MainCategoryUpdateSchema>;

// ============================================================================
// SUB CATEGORY SCHEMAS
// ============================================================================

/**
 * Base schema for sub-category fields
 */
export const SubCategoryBaseSchema = z.object({
  name: NameSchema,
  description: OptionalNameSchema,
  main_category_id: UuidSchema,
  display_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  icon_url: z.string().max(255).optional(),
  meta_description: z.string().max(500).optional(),
  specialized_features: z.array(z.string()).max(10).optional(),
});

/**
 * Complete sub-category schema with database fields
 */
export const SubCategorySchema = SubCategoryBaseSchema.extend({
  ...BaseEntitySchema.shape,
  business_count: z.number().int().min(0).default(0),
});

export type SubCategory = z.infer<typeof SubCategorySchema>;

/**
 * Schema for creating new sub-categories
 */
export const SubCategoryCreateSchema = SubCategoryBaseSchema.omit({
  display_order: true,
}).extend({
  created_by: UuidSchema.optional(),
});

export type SubCategoryCreate = z.infer<typeof SubCategoryCreateSchema>;

/**
 * Schema for updating sub-categories
 */
export const SubCategoryUpdateSchema = SubCategoryBaseSchema.partial().extend({
  updated_by: UuidSchema.optional(),
});

export type SubCategoryUpdate = z.infer<typeof SubCategoryUpdateSchema>;

// ============================================================================
// CATEGORY RELATIONSHIPS SCHEMAS
// ============================================================================

/**
 * Main category with sub-categories included
 */
export const MainCategoryWithSubCategoriesSchema = MainCategorySchema.extend({
  sub_categories: z.array(SubCategorySchema),
});

export type MainCategoryWithSubCategories = z.infer<
  typeof MainCategoryWithSubCategoriesSchema
>;

/**
 * Sub-category with main category included
 */
export const SubCategoryWithMainSchema = SubCategorySchema.extend({
  main_category: MainCategorySchema,
});

export type SubCategoryWithMain = z.infer<typeof SubCategoryWithMainSchema>;

/**
 * Category hierarchy response schema
 */
export const CategoryHierarchySchema = z.object({
  main_categories: z.array(MainCategoryWithSubCategoriesSchema),
  total_main_categories: z.number().int().min(0),
  total_sub_categories: z.number().int().min(0),
  active_categories: z.number().int().min(0),
});

export type CategoryHierarchy = z.infer<typeof CategoryHierarchySchema>;

// ============================================================================
// FILTERING AND SEARCH SCHEMAS
// ============================================================================

/**
 * Main category filtering schema
 */
export const MainCategoryFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  type: CategoryTypeSchema.optional(),
  status: CategoryStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  has_sub_categories: z.boolean().optional(),
  min_business_count: z.number().int().min(0).optional(),
  // Legacy fields for backwards compatibility
  search: z.string().max(255).optional(), // Legacy alias for searchQuery
  is_active: z.boolean().optional(),
  created_by: UuidSchema.optional(),
});

export type MainCategoryFilters = z.infer<typeof MainCategoryFiltersSchema>;

/**
 * Sub-category filtering schema
 */
export const SubCategoryFiltersSchema = z.object({
  ...SearchSchema.shape,
  ...PaginationSchema.shape,
  ...SortSchema.shape,
  main_category_id: UuidSchema.optional(),
  is_active: z.boolean().optional(),
  min_business_count: z.number().int().min(0).optional(),
  // Legacy fields for backwards compatibility
  search: z.string().max(255).optional(), // Legacy alias for searchQuery
  created_by: UuidSchema.optional(),
});

export type SubCategoryFilters = z.infer<typeof SubCategoryFiltersSchema>;

// ============================================================================
// ANALYTICS AND REPORTING SCHEMAS
// ============================================================================

/**
 * Category analytics schema
 */
export const CategoryAnalyticsSchema = z.object({
  category_id: UuidSchema,
  category_name: NameSchema,
  category_type: CategoryTypeSchema,
  business_count: z.number().int().min(0),
  sub_categories_count: z.number().int().min(0),
  growth_rate: z.number(),
  popularity_score: z.number().min(0).max(100),
  last_updated: DateSchema,
});

export type CategoryAnalytics = z.infer<typeof CategoryAnalyticsSchema>;

/**
 * Category dashboard data schema
 */
export const CategoryDashboardDataSchema = z.object({
  total_main_categories: z.number().int().min(0),
  total_sub_categories: z.number().int().min(0),
  active_categories: z.number().int().min(0),
  featured_categories: z.number().int().min(0),
  categories_by_type: z.array(
    z.object({
      type: CategoryTypeSchema,
      count: z.number().int().min(0),
      percentage: z.number().min(0).max(100),
    })
  ),
  most_popular_categories: z.array(CategoryAnalyticsSchema).max(10),
  recent_categories: z.array(MainCategorySchema).max(5),
  category_growth_trends: z.array(
    z.object({
      month: z.string(),
      new_categories: z.number().int().min(0),
      total_businesses: z.number().int().min(0),
    })
  ),
});

export type CategoryDashboardData = z.infer<typeof CategoryDashboardDataSchema>;

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk category operations schema
 */
export const BulkCategoryOperationSchema = z.object({
  operation: z.enum([
    'activate',
    'deactivate',
    'delete',
    'update_type',
    'reorder',
  ]),
  main_category_ids: z.array(UuidSchema).min(1).max(50).optional(),
  sub_category_ids: z.array(UuidSchema).min(1).max(100).optional(),
  data: z.record(z.any()).optional(), // Operation-specific data
  performed_by: UuidSchema,
});

export type BulkCategoryOperation = z.infer<typeof BulkCategoryOperationSchema>;

/**
 * Category reordering schema
 */
export const CategoryReorderSchema = z.object({
  categories: z
    .array(
      z.object({
        id: UuidSchema,
        display_order: z.number().int().min(0),
      })
    )
    .min(1)
    .max(100),
  updated_by: UuidSchema,
});

export type CategoryReorder = z.infer<typeof CategoryReorderSchema>;

// ============================================================================
// BUSINESS CATEGORY ASSIGNMENT SCHEMAS
// ============================================================================

/**
 * Business category assignment schema
 */
export const BusinessCategoryAssignmentSchema = z.object({
  business_id: UuidSchema,
  main_category_id: UuidSchema,
  sub_category_ids: z.array(UuidSchema).max(5),
  is_primary: z.boolean().default(false),
  assigned_by: UuidSchema,
});

export type BusinessCategoryAssignment = z.infer<
  typeof BusinessCategoryAssignmentSchema
>;

// ============================================================================
// EXPORT CATEGORY CONSTANTS
// ============================================================================

/**
 * Default category types for easy access
 */
export const CATEGORY_TYPES = [
  'business',
  'tourism',
  'accommodation',
  'dining',
  'entertainment',
  'transportation',
  'shopping',
  'services',
] as const;

/**
 * Default category statuses
 */
export const CATEGORY_STATUSES = [
  'active',
  'inactive',
  'archived',
  'pending_review',
] as const;

// ============================================================================
// LEGACY ALIASES FOR BACKWARDS COMPATIBILITY
// ============================================================================

/**
 * Legacy aliases for backwards compatibility with existing hooks
 */
export const MainCategoryInsertSchema = MainCategoryCreateSchema;
export const SubCategoryInsertSchema = SubCategoryCreateSchema;

export type MainCategoryInsert = MainCategoryCreate;
export type SubCategoryInsert = SubCategoryCreate;

// ============================================================================
