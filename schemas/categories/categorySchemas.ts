// filepath: schemas/categories/categorySchemas.ts
/**
 * Category Schemas - Phase 5 Implementation
 *
 * Comprehensive Zod schemas for category management.
 * Validates main categories, sub-categories, and category assignments.
 */

import { z } from 'zod';

import {
  DateSchema,
  NameSchema,
  PaginationQuerySchema,
  PaginationResponseSchema,
  TextContentSchema,
  UrlSchema,
  UuidSchema,
} from '../common/baseSchemas';

// ============================================================================
// MAIN CATEGORY SCHEMAS
// ============================================================================

/**
 * Main category schema (from database)
 */
export const MainCategorySchema = z.object({
  id: UuidSchema,
  name: NameSchema,
  description: TextContentSchema.optional(),
  icon_url: UrlSchema,
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
  created_at: DateSchema,
  updated_at: DateSchema,
  created_by: UuidSchema.nullable(),
  updated_by: UuidSchema.nullable(),
});

/**
 * Main category creation form schema
 */
export const MainCategoryCreateFormSchema = z.object({
  name: NameSchema,
  description: TextContentSchema.optional(),
  icon_url: UrlSchema,
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

/**
 * Main category update form schema
 */
export const MainCategoryUpdateFormSchema =
  MainCategoryCreateFormSchema.partial();

/**
 * Main category insert schema
 */
export const MainCategoryInsertSchema = z.object({
  name: NameSchema,
  description: z.string().nullable(),
  icon_url: z.string().nullable(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
  created_by: UuidSchema.optional(),
});

/**
 * Main category update schema
 */
export const MainCategoryUpdateSchema =
  MainCategoryInsertSchema.partial().extend({
    updated_by: UuidSchema.optional(),
  });

// ============================================================================
// SUB CATEGORY SCHEMAS
// ============================================================================

/**
 * Sub category schema (from database)
 */
export const SubCategorySchema = z.object({
  id: UuidSchema,
  main_category_id: UuidSchema,
  name: NameSchema,
  description: TextContentSchema.optional(),
  icon_url: UrlSchema,
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
  created_at: DateSchema,
  updated_at: DateSchema,
  created_by: UuidSchema.nullable(),
  updated_by: UuidSchema.nullable(),
});

/**
 * Sub category with main category information
 */
export const SubCategoryWithMainSchema = SubCategorySchema.extend({
  main_category: MainCategorySchema.pick({
    id: true,
    name: true,
    is_active: true,
  }),
});

/**
 * Sub category creation form schema
 */
export const SubCategoryCreateFormSchema = z.object({
  main_category_id: UuidSchema,
  name: NameSchema,
  description: TextContentSchema.optional(),
  icon_url: UrlSchema,
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

/**
 * Sub category update form schema
 */
export const SubCategoryUpdateFormSchema =
  SubCategoryCreateFormSchema.partial();

/**
 * Sub category insert schema
 */
export const SubCategoryInsertSchema = z.object({
  main_category_id: UuidSchema,
  name: NameSchema,
  description: z.string().nullable(),
  icon_url: z.string().nullable(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
  created_by: UuidSchema.optional(),
});

/**
 * Sub category update schema
 */
export const SubCategoryUpdateSchema = SubCategoryInsertSchema.partial().extend(
  {
    updated_by: UuidSchema.optional(),
  }
);

// ============================================================================
// CATEGORY HIERARCHY SCHEMAS
// ============================================================================

/**
 * Category hierarchy schema (main category with sub-categories)
 */
export const CategoryHierarchySchema = MainCategorySchema.extend({
  sub_categories: z.array(SubCategorySchema),
});

/**
 * Category tree node schema (for tree view components)
 */
export const CategoryTreeNodeSchema = z.object({
  id: UuidSchema,
  name: NameSchema,
  type: z.enum(['main', 'sub']),
  parent_id: UuidSchema.nullable(),
  is_active: z.boolean(),
  display_order: z.number().int(),
  children: z.array(z.lazy(() => CategoryTreeNodeSchema)).optional(),
});

// ============================================================================
// FILTER & QUERY SCHEMAS
// ============================================================================

/**
 * Main category filter schema
 */
export const MainCategoryFiltersSchema = z
  .object({
    search: z.string().optional(),
    is_active: z.boolean().optional(),
    created_by: UuidSchema.optional(),
  })
  .extend(PaginationQuerySchema.shape);

/**
 * Sub category filter schema
 */
export const SubCategoryFiltersSchema = z
  .object({
    search: z.string().optional(),
    main_category_id: UuidSchema.optional(),
    is_active: z.boolean().optional(),
    created_by: UuidSchema.optional(),
  })
  .extend(PaginationQuerySchema.shape);

/**
 * Category search schema
 */
export const CategorySearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(255),
  type: z.enum(['main', 'sub', 'all']).default('all'),
  filters: z
    .object({
      is_active: z.boolean().optional(),
      main_category_id: UuidSchema.optional(),
    })
    .optional(),
});

// ============================================================================
// CATEGORY ASSIGNMENT SCHEMAS
// ============================================================================

/**
 * Category assignment schema (for businesses, tourist spots, etc.)
 */
export const CategoryAssignmentSchema = z.object({
  entity_type: z.enum(['business', 'tourist_spot', 'event']),
  entity_id: UuidSchema,
  sub_category_id: UuidSchema,
});

/**
 * Bulk category assignment schema
 */
export const BulkCategoryAssignmentSchema = z.object({
  entity_type: z.enum(['business', 'tourist_spot', 'event']),
  entity_ids: z
    .array(UuidSchema)
    .min(1, 'At least one entity must be selected'),
  sub_category_ids: z
    .array(UuidSchema)
    .min(1, 'At least one category must be selected'),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * Main category API response schema
 */
export const MainCategoryApiResponseSchema = z.object({
  data: MainCategorySchema.nullable(),
  error: z.string().nullable(),
});

/**
 * Main category list API response schema
 */
export const MainCategoryListApiResponseSchema = z
  .object({
    data: z.array(MainCategorySchema),
    count: z.number().nullable(),
    error: z.string().nullable(),
  })
  .extend(PaginationResponseSchema.shape);

/**
 * Sub category API response schema
 */
export const SubCategoryApiResponseSchema = z.object({
  data: SubCategorySchema.nullable(),
  error: z.string().nullable(),
});

/**
 * Sub category list API response schema
 */
export const SubCategoryListApiResponseSchema = z
  .object({
    data: z.array(SubCategorySchema),
    count: z.number().nullable(),
    error: z.string().nullable(),
  })
  .extend(PaginationResponseSchema.shape);

/**
 * Category hierarchy API response schema
 */
export const CategoryHierarchyApiResponseSchema = z.object({
  data: z.array(CategoryHierarchySchema),
  count: z.number().nullable(),
  error: z.string().nullable(),
});

/**
 * Category mutation response schema
 */
export const CategoryMutationResponseSchema = z.object({
  data: z.union([MainCategorySchema, SubCategorySchema]).nullable(),
  error: z.string().nullable(),
  status: z.number(),
  statusText: z.string(),
});

// ============================================================================
// CATEGORY ANALYTICS SCHEMAS
// ============================================================================

/**
 * Category usage statistics schema
 */
export const CategoryUsageStatsSchema = z.object({
  category_id: UuidSchema,
  category_name: NameSchema,
  category_type: z.enum(['main', 'sub']),
  usage_count: z.number().int().min(0),
  entity_type: z.enum(['business', 'tourist_spot', 'event']),
  last_used: DateSchema.nullable(),
});

/**
 * Category analytics response schema
 */
export const CategoryAnalyticsResponseSchema = z.object({
  data: z.object({
    total_main_categories: z.number().int(),
    total_sub_categories: z.number().int(),
    active_categories: z.number().int(),
    usage_stats: z.array(CategoryUsageStatsSchema),
    popular_categories: z.array(CategoryUsageStatsSchema),
  }),
  error: z.string().nullable(),
});

// ============================================================================
// CATEGORY OPERATION SCHEMAS
// ============================================================================

/**
 * Category reorder schema
 */
export const CategoryReorderSchema = z.object({
  category_type: z.enum(['main', 'sub']),
  reorder_data: z
    .array(
      z.object({
        id: UuidSchema,
        display_order: z.number().int().min(0),
      })
    )
    .min(1, 'At least one category must be provided'),
});

/**
 * Category bulk operation schema
 */
export const CategoryBulkOperationSchema = z.object({
  operation: z.enum(['activate', 'deactivate', 'delete']),
  category_type: z.enum(['main', 'sub']),
  category_ids: z
    .array(UuidSchema)
    .min(1, 'At least one category must be selected'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type MainCategory = z.infer<typeof MainCategorySchema>;
export type MainCategoryCreateForm = z.infer<
  typeof MainCategoryCreateFormSchema
>;
export type MainCategoryUpdateForm = z.infer<
  typeof MainCategoryUpdateFormSchema
>;
export type MainCategoryInsert = z.infer<typeof MainCategoryInsertSchema>;
export type MainCategoryUpdate = z.infer<typeof MainCategoryUpdateSchema>;
export type SubCategory = z.infer<typeof SubCategorySchema>;
export type SubCategoryWithMain = z.infer<typeof SubCategoryWithMainSchema>;
export type SubCategoryCreateForm = z.infer<typeof SubCategoryCreateFormSchema>;
export type SubCategoryUpdateForm = z.infer<typeof SubCategoryUpdateFormSchema>;
export type SubCategoryInsert = z.infer<typeof SubCategoryInsertSchema>;
export type SubCategoryUpdate = z.infer<typeof SubCategoryUpdateSchema>;
export type CategoryHierarchy = z.infer<typeof CategoryHierarchySchema>;
export type CategoryTreeNode = z.infer<typeof CategoryTreeNodeSchema>;
export type MainCategoryFilters = z.infer<typeof MainCategoryFiltersSchema>;
export type SubCategoryFilters = z.infer<typeof SubCategoryFiltersSchema>;
export type CategorySearch = z.infer<typeof CategorySearchSchema>;
export type CategoryAssignment = z.infer<typeof CategoryAssignmentSchema>;
export type BulkCategoryAssignment = z.infer<
  typeof BulkCategoryAssignmentSchema
>;
export type MainCategoryApiResponse = z.infer<
  typeof MainCategoryApiResponseSchema
>;
export type MainCategoryListApiResponse = z.infer<
  typeof MainCategoryListApiResponseSchema
>;
export type SubCategoryApiResponse = z.infer<
  typeof SubCategoryApiResponseSchema
>;
export type SubCategoryListApiResponse = z.infer<
  typeof SubCategoryListApiResponseSchema
>;
export type CategoryHierarchyApiResponse = z.infer<
  typeof CategoryHierarchyApiResponseSchema
>;
export type CategoryMutationResponse = z.infer<
  typeof CategoryMutationResponseSchema
>;
export type CategoryUsageStats = z.infer<typeof CategoryUsageStatsSchema>;
export type CategoryAnalyticsResponse = z.infer<
  typeof CategoryAnalyticsResponseSchema
>;
export type CategoryReorder = z.infer<typeof CategoryReorderSchema>;
export type CategoryBulkOperation = z.infer<typeof CategoryBulkOperationSchema>;
