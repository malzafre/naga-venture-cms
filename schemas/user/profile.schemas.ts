// filepath: schemas/profile.schemas.ts
/**
 * Profile and User Management Schemas
 *
 * Comprehensive validation schemas for user profiles, staff management,
 * and permission systems based on the database structure.
 */

import { z } from 'zod';
import {
  BaseFiltersSchema,
  EmailSchema,
  OptionalNameSchema,
  OptionalUrlSchema,
  PhoneSchema,
  UserRoleSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// STAFF PERMISSIONS SCHEMA
// ============================================================================

/**
 * Staff permissions schema based on database structure
 */
export const StaffPermissionsSchema = z.object({
  id: UuidSchema,
  profile_id: UuidSchema,
  can_manage_users: z.boolean().default(false),
  can_manage_businesses: z.boolean().default(false),
  can_manage_tourist_spots: z.boolean().default(false),
  can_manage_events: z.boolean().default(false),
  can_approve_content: z.boolean().default(false),
  can_manage_categories: z.boolean().default(false),
  can_moderate_business_content: z.boolean().default(false),
  can_moderate_tourism_content: z.boolean().default(false),
  can_approve_business_applications: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type StaffPermissions = z.infer<typeof StaffPermissionsSchema>;

/**
 * Staff permissions update schema (for mutations)
 */
export const StaffPermissionsUpdateSchema = StaffPermissionsSchema.omit({
  id: true,
  profile_id: true,
  created_at: true,
  updated_at: true,
}).partial();

export type StaffPermissionsUpdate = z.infer<
  typeof StaffPermissionsUpdateSchema
>;

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

/**
 * Base profile schema based on database structure
 */
export const ProfileSchema = z.object({
  id: UuidSchema,
  email: EmailSchema,
  first_name: OptionalNameSchema,
  last_name: OptionalNameSchema,
  phone_number: PhoneSchema,
  profile_image_url: OptionalUrlSchema,
  role: UserRoleSchema,
  is_verified: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Profile = z.infer<typeof ProfileSchema>;

/**
 * Profile with staff permissions (for detailed user view)
 */
export const ProfileWithPermissionsSchema = ProfileSchema.extend({
  staff_permissions: z.array(StaffPermissionsSchema).nullable().optional(),
});

export type ProfileWithPermissions = z.infer<
  typeof ProfileWithPermissionsSchema
>;

/**
 * Profile creation schema
 */
export const ProfileCreateSchema = z.object({
  email: EmailSchema,
  first_name: OptionalNameSchema,
  last_name: OptionalNameSchema,
  phone_number: PhoneSchema,
  role: UserRoleSchema,
  profile_image_url: OptionalUrlSchema,
});

export type ProfileCreate = z.infer<typeof ProfileCreateSchema>;

/**
 * Profile update schema
 */
export const ProfileUpdateSchema = ProfileSchema.omit({
  id: true,
  email: true, // Email updates require special handling
  created_at: true,
  updated_at: true,
}).partial();

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

// ============================================================================
// USER MANAGEMENT OPERATION SCHEMAS
// ============================================================================

/**
 * User role update schema
 */
export const UserRoleUpdateSchema = z.object({
  role: UserRoleSchema,
});

export type UserRoleUpdate = z.infer<typeof UserRoleUpdateSchema>;

/**
 * User verification schema
 */
export const UserVerificationSchema = z.object({
  is_verified: z.boolean(),
});

export type UserVerification = z.infer<typeof UserVerificationSchema>;

/**
 * Staff creation schema
 */
export const StaffCreateSchema = z.object({
  email: EmailSchema,
  role: UserRoleSchema.refine(
    (role) =>
      [
        'tourism_admin',
        'business_listing_manager',
        'tourism_content_manager',
        'business_registration_manager',
      ].includes(role),
    { message: 'Only staff roles are allowed for staff creation' }
  ),
  firstName: OptionalNameSchema,
  lastName: OptionalNameSchema,
  phoneNumber: PhoneSchema,
  permissions: StaffPermissionsUpdateSchema.optional(),
});

export type StaffCreate = z.infer<typeof StaffCreateSchema>;

/**
 * Staff creation response schema
 */
export const StaffCreateResponseSchema = z.object({
  id: UuidSchema,
  email: EmailSchema,
  role: UserRoleSchema,
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  is_verified: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  temporaryPassword: z.string().optional(),
  message: z.string().optional(),
});

export type StaffCreateResponse = z.infer<typeof StaffCreateResponseSchema>;

// ============================================================================
// FILTERING AND QUERY SCHEMAS
// ============================================================================

/**
 * User filters schema
 */
export const UserFiltersSchema = BaseFiltersSchema.extend({
  role: UserRoleSchema.optional(),
  is_verified: z.boolean().optional(),
  sortBy: z
    .enum(['created_at', 'first_name', 'last_name', 'email'])
    .default('created_at'),
});

export type UserFilters = z.infer<typeof UserFiltersSchema>;

/**
 * Staff filters schema (only staff roles)
 */
export const StaffFiltersSchema = UserFiltersSchema.extend({
  role: UserRoleSchema.refine(
    (role) =>
      !role ||
      [
        'tourism_admin',
        'business_listing_manager',
        'tourism_content_manager',
        'business_registration_manager',
      ].includes(role),
    { message: 'Only staff roles are allowed in staff filters' }
  ).optional(),
});

export type StaffFilters = z.infer<typeof StaffFiltersSchema>;

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

/**
 * User role statistics schema
 */
export const UserRoleStatsSchema = z.object({
  totalUsers: z.number(),
  roleDistribution: z.record(z.string(), z.number()),
  staffCount: z.number(),
  businessOwnerCount: z.number(),
  touristCount: z.number(),
});

export type UserRoleStats = z.infer<typeof UserRoleStatsSchema>;

/**
 * User dashboard data schema
 */
export const UserDashboardDataSchema = z.object({
  stats: UserRoleStatsSchema,
  recentUsers: z.array(ProfileSchema),
  unverifiedUsers: z.array(ProfileSchema),
  totalCount: z.number().optional(),
});

export type UserDashboardData = z.infer<typeof UserDashboardDataSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * User ID validation schema (for params)
 */
export const UserIdParamSchema = z.object({
  userId: UuidSchema,
});

export type UserIdParam = z.infer<typeof UserIdParamSchema>;

/**
 * Bulk user operation schema
 */
export const BulkUserOperationSchema = z.object({
  userIds: z.array(UuidSchema).min(1, 'At least one user ID is required'),
  operation: z.enum(['verify', 'unverify', 'delete', 'archive']),
});

export type BulkUserOperation = z.infer<typeof BulkUserOperationSchema>;
