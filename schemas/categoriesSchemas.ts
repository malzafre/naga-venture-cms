// filepath: schemas/categoriesSchemas.ts
import { z } from 'zod';

// Import from a central location - these functions are assumed to be used by the hooks that import these schemas

// Base schema for common category fields
const CategoryBaseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
  // icon_url is intentionally omitted as per requirements
});

// Schema for creating a new Main Category
export const MainCategoryInsertSchema = CategoryBaseSchema.extend({
  created_by: z.string().uuid().optional().nullable(), // Allow null values from database
});
export type MainCategoryInsert = z.infer<typeof MainCategoryInsertSchema>;

// Schema for updating an existing Main Category
export const MainCategoryUpdateSchema = MainCategoryInsertSchema.partial();
export type MainCategoryUpdate = z.infer<typeof MainCategoryUpdateSchema>;

// Schema for a Main Category (including DB-generated fields)
export const MainCategorySchema = MainCategoryInsertSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(), // Use string instead of datetime for better compatibility
  updated_at: z.string(), // Use string instead of datetime for better compatibility
  updated_by: z.string().uuid().optional().nullable(),
});
export type MainCategory = z.infer<typeof MainCategorySchema>;

// Schema for creating a new Sub Category
export const SubCategoryInsertSchema = CategoryBaseSchema.extend({
  main_category_id: z.string().uuid('Invalid Main Category ID'),
  created_by: z.string().uuid().optional().nullable(), // Allow null values from database
});
export type SubCategoryInsert = z.infer<typeof SubCategoryInsertSchema>;

// Schema for updating an existing Sub Category
export const SubCategoryUpdateSchema = SubCategoryInsertSchema.partial();
export type SubCategoryUpdate = z.infer<typeof SubCategoryUpdateSchema>;

// Schema for a Sub Category (including DB-generated fields)
export const SubCategorySchema = SubCategoryInsertSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(), // Use string instead of datetime for better compatibility
  updated_at: z.string(), // Use string instead of datetime for better compatibility
  updated_by: z.string().uuid().optional().nullable(),
});
export type SubCategory = z.infer<typeof SubCategorySchema>;

// Schema for SubCategory with its MainCategory details (for display purposes)
export const SubCategoryWithMainSchema = SubCategorySchema.extend({
  main_categories: MainCategorySchema.pick({
    id: true,
    name: true,
    is_active: true,
  }).optional(),
});
export type SubCategoryWithMain = z.infer<typeof SubCategoryWithMainSchema>;

// Schema for MainCategory with its SubCategory details
export const MainCategoryWithSubCategoriesSchema = MainCategorySchema.extend({
  sub_categories: z.array(SubCategorySchema).optional().default([]),
});
export type MainCategoryWithSubCategories = z.infer<
  typeof MainCategoryWithSubCategoriesSchema
>;

// Filters for fetching main categories
export const MainCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  created_by: z.string().uuid().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z
    .enum(['name', 'display_order', 'created_at'])
    .optional()
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
export type MainCategoryFilters = z.infer<typeof MainCategoryFiltersSchema>;

// Filters for fetching sub categories
export const SubCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  main_category_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
  created_by: z.string().uuid().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z
    .enum(['name', 'display_order', 'created_at'])
    .optional()
    .default('display_order'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
export type SubCategoryFilters = z.infer<typeof SubCategoryFiltersSchema>;

// Removed duplicate utility functions validateSupabaseResponse and validateSupabaseListResponse
// They are now imported from ./api/responseSchemas
