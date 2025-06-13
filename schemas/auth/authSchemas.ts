// filepath: schemas/auth/authSchemas.ts
/**
 * Authentication Schemas - Phase 5 Implementation
 *
 * Comprehensive Zod schemas for authentication and user management.
 * Validates login forms, registration, profiles, and auth API responses.
 */

import { z } from 'zod';

import {
  DateSchema,
  EmailSchema,
  NameSchema,
  PasswordSchema,
  PhoneSchema,
  UrlSchema,
  UuidSchema,
} from '../common/baseSchemas';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * User role validation
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

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Login form schema
 */
export const LoginFormSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Registration form schema
 */
export const RegisterFormSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    first_name: NameSchema.optional(),
    last_name: NameSchema.optional(),
    phone_number: PhoneSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Password reset request schema
 */
export const PasswordResetRequestSchema = z.object({
  email: EmailSchema,
});

/**
 * Password reset form schema
 */
export const PasswordResetFormSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Change password form schema
 */
export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: PasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

/**
 * User profile schema (from database)
 */
export const ProfileSchema = z.object({
  id: UuidSchema,
  email: EmailSchema,
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  profile_image_url: UrlSchema.nullable(),
  role: UserRoleSchema,
  is_verified: z.boolean(),
  created_at: DateSchema,
  updated_at: DateSchema,
});

/**
 * Profile update form schema
 */
export const ProfileUpdateFormSchema = z.object({
  first_name: NameSchema.optional(),
  last_name: NameSchema.optional(),
  phone_number: PhoneSchema,
  profile_image_url: UrlSchema,
});

/**
 * Profile insert schema (for new users)
 */
export const ProfileInsertSchema = z.object({
  id: UuidSchema,
  email: EmailSchema,
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  role: UserRoleSchema.default('tourist'),
  is_verified: z.boolean().default(false),
});

// ============================================================================
// STAFF PERMISSIONS SCHEMAS
// ============================================================================

/**
 * Staff permissions schema
 */
export const StaffPermissionsSchema = z.object({
  id: UuidSchema,
  profile_id: UuidSchema,
  can_manage_users: z.boolean(),
  can_manage_businesses: z.boolean(),
  can_manage_tourist_spots: z.boolean(),
  can_manage_events: z.boolean(),
  can_approve_content: z.boolean(),
  can_manage_categories: z.boolean(),
  created_at: DateSchema,
  updated_at: DateSchema,
});

/**
 * Staff permissions update form schema
 */
export const StaffPermissionsUpdateSchema = z.object({
  can_manage_users: z.boolean().optional(),
  can_manage_businesses: z.boolean().optional(),
  can_manage_tourist_spots: z.boolean().optional(),
  can_manage_events: z.boolean().optional(),
  can_approve_content: z.boolean().optional(),
  can_manage_categories: z.boolean().optional(),
});

// ============================================================================
// AUTH SESSION SCHEMAS
// ============================================================================

/**
 * Auth session schema
 */
export const AuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  user: z.object({
    id: UuidSchema,
    email: EmailSchema,
    email_confirmed_at: DateSchema.nullable(),
    last_sign_in_at: DateSchema.nullable(),
    created_at: DateSchema,
    updated_at: DateSchema,
  }),
});

/**
 * Auth user schema (Supabase user object)
 */
export const AuthUserSchema = z.object({
  id: UuidSchema,
  email: EmailSchema.nullable(),
  email_confirmed_at: DateSchema.nullable(),
  last_sign_in_at: DateSchema.nullable(),
  created_at: DateSchema,
  updated_at: DateSchema,
  user_metadata: z.record(z.unknown()).optional(),
  app_metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * Login API response schema
 */
export const LoginApiResponseSchema = z.object({
  data: z
    .object({
      user: AuthUserSchema.nullable(),
      session: AuthSessionSchema.nullable(),
    })
    .nullable(),
  error: z
    .object({
      message: z.string(),
      status: z.number().optional(),
    })
    .nullable(),
});

/**
 * Profile API response schema
 */
export const ProfileApiResponseSchema = z.object({
  data: ProfileSchema.nullable(),
  error: z.string().nullable(),
});

/**
 * Profile list API response schema
 */
export const ProfileListApiResponseSchema = z.object({
  data: z.array(ProfileSchema),
  count: z.number().nullable(),
  error: z.string().nullable(),
});

/**
 * Auth operation response schema
 */
export const AuthOperationResponseSchema = z.object({
  data: z
    .object({
      user: AuthUserSchema.nullable(),
      session: AuthSessionSchema.nullable(),
    })
    .nullable(),
  error: z
    .object({
      message: z.string(),
      status: z.number().optional(),
    })
    .nullable(),
});

// ============================================================================
// ROLE VALIDATION SCHEMAS
// ============================================================================

/**
 * Admin role check schema
 */
export const AdminRoleSchema = z.object({
  role: z.literal('tourism_admin'),
});

/**
 * Manager role check schema
 */
export const ManagerRoleSchema = z.object({
  role: z.enum([
    'business_listing_manager',
    'tourism_content_manager',
    'business_registration_manager',
  ]),
});

/**
 * Staff role check schema (admin + managers)
 */
export const StaffRoleSchema = z.object({
  role: z.enum([
    'tourism_admin',
    'business_listing_manager',
    'tourism_content_manager',
    'business_registration_manager',
  ]),
});

/**
 * Business owner role check schema
 */
export const BusinessOwnerRoleSchema = z.object({
  role: z.literal('business_owner'),
});

// ============================================================================
// PERMISSION CHECK SCHEMAS
// ============================================================================

/**
 * Route permission check schema
 */
export const RoutePermissionSchema = z.object({
  userRole: UserRoleSchema,
  requiredRole: UserRoleSchema.optional(),
  requiredPermissions: z.array(z.string()).optional(),
  resourceId: UuidSchema.optional(),
});

/**
 * Permission context schema
 */
export const PermissionContextSchema = z.object({
  action: z.enum(['create', 'read', 'update', 'delete']),
  resource: z.enum(['business', 'tourist_spot', 'event', 'user', 'category']),
  resourceId: UuidSchema.optional(),
  ownerId: UuidSchema.optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginForm = z.infer<typeof LoginFormSchema>;
export type RegisterForm = z.infer<typeof RegisterFormSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordResetForm = z.infer<typeof PasswordResetFormSchema>;
export type ChangePasswordForm = z.infer<typeof ChangePasswordFormSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileUpdateForm = z.infer<typeof ProfileUpdateFormSchema>;
export type ProfileInsert = z.infer<typeof ProfileInsertSchema>;
export type StaffPermissions = z.infer<typeof StaffPermissionsSchema>;
export type StaffPermissionsUpdate = z.infer<
  typeof StaffPermissionsUpdateSchema
>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginApiResponse = z.infer<typeof LoginApiResponseSchema>;
export type ProfileApiResponse = z.infer<typeof ProfileApiResponseSchema>;
export type ProfileListApiResponse = z.infer<
  typeof ProfileListApiResponseSchema
>;
export type AuthOperationResponse = z.infer<typeof AuthOperationResponseSchema>;
export type RoutePermission = z.infer<typeof RoutePermissionSchema>;
export type PermissionContext = z.infer<typeof PermissionContextSchema>;
