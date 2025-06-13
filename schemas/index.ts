// filepath: schemas/index.ts
/**
 * Schema Index - Phase 5 Implementation
 *
 * Barrel export for all validation schemas.
 * Provides centralized access to validation patterns across the application.
 */

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

// ============================================================================
// SCHEMA UTILITIES
// ============================================================================

import { z } from 'zod';

export * from './common/baseSchemas';

// ============================================================================
// FEATURE SCHEMAS
// ============================================================================

export * from './api/responseSchemas';
export * from './auth/authSchemas';
export * from './business/businessSchemas';
export * from './categories/categorySchemas';
export * from './tourism/eventSchemas';
export * from './tourism/touristSpotSchemas';

/**
 * Creates a validation function for any schema
 */
export const createValidator = <T extends z.ZodTypeAny>(schema: T) => {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
};

/**
 * Creates a safe validation function that returns success/error result
 */
export const createSafeValidator = <T extends z.ZodTypeAny>(schema: T) => {
  return (
    data: unknown
  ):
    | { success: true; data: z.infer<T> }
    | { success: false; error: z.ZodError } => {
    const result = schema.safeParse(data);
    return result;
  };
};

/**
 * Environment validation schema
 */
export const EnvironmentSchema = z.object({
  // Supabase Configuration
  EXPO_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required'),

  // Optional Environment Settings
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  EXPO_PUBLIC_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),

  // API Configuration
  EXPO_PUBLIC_API_BASE_URL: z.string().url().optional(),
  EXPO_PUBLIC_STORAGE_BUCKET: z.string().optional(),

  // Feature Flags
  EXPO_PUBLIC_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  EXPO_PUBLIC_ENABLE_NOTIFICATIONS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  EXPO_PUBLIC_ENABLE_DEBUG_MODE: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
});

/**
 * Validates environment variables
 */
export const validateEnvironment = (
  env: Record<string, string | undefined>
) => {
  try {
    return EnvironmentSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}`
      );
    }
    throw error;
  }
};

// ============================================================================
// COMMON VALIDATION PATTERNS
// ============================================================================

/**
 * Form data validation wrapper
 */
export const validateFormData = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  options?: {
    stripUnknown?: boolean;
    throwOnError?: boolean;
  }
): z.infer<T> => {
  const { stripUnknown = true, throwOnError = true } = options || {};

  try {
    const processedSchema = stripUnknown ? schema.strip() : schema;
    return processedSchema.parse(data);
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    return null;
  }
};

/**
 * API response validation wrapper
 */
export const validateApiResponse = <T extends z.ZodTypeAny>(
  schema: T,
  response: unknown,
  options?: {
    logErrors?: boolean;
    fallbackValue?: z.infer<T>;
  }
): z.infer<T> => {
  const { logErrors = true, fallbackValue } = options || {};

  try {
    return schema.parse(response);
  } catch (error) {
    if (logErrors && __DEV__) {
      console.error('[Schema Validation Error]', error);
    }

    if (fallbackValue !== undefined) {
      return fallbackValue;
    }

    throw new Error('API response validation failed');
  }
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Environment = z.infer<typeof EnvironmentSchema>;
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

// ============================================================================
// SCHEMA PRESETS
// ============================================================================

/**
 * Common form validation presets
 */
export const FormValidationPresets = {
  /**
   * Required field validation
   */
  required: (fieldName: string) =>
    z.string().min(1, `${fieldName} is required`),

  /**
   * Optional field validation
   */
  optional: (schema: z.ZodTypeAny) => schema.optional().or(z.literal('')),

  /**
   * Positive number validation
   */
  positiveNumber: (fieldName: string) =>
    z.number().positive(`${fieldName} must be a positive number`),

  /**
   * Non-negative number validation
   */
  nonNegativeNumber: (fieldName: string) =>
    z.number().min(0, `${fieldName} cannot be negative`),

  /**
   * String length validation
   */
  stringLength: (min: number, max: number, fieldName: string) =>
    z
      .string()
      .min(min, `${fieldName} must be at least ${min} characters`)
      .max(max, `${fieldName} must be no more than ${max} characters`),

  /**
   * Array validation
   */
  nonEmptyArray: <T extends z.ZodTypeAny>(schema: T, fieldName: string) =>
    z.array(schema).min(1, `At least one ${fieldName} is required`),
};

/**
 * Database operation validation presets
 */
export const DatabaseValidationPresets = {
  /**
   * UUID field validation
   */
  uuid: (fieldName: string) => z.string().uuid(`Invalid ${fieldName} format`),

  /**
   * Timestamp field validation
   */
  timestamp: z.string().datetime().or(z.date()),

  /**
   * Status enum validation
   */
  status: (values: readonly string[], fieldName: string) =>
    z.enum(values as [string, ...string[]], {
      errorMap: () => ({ message: `Invalid ${fieldName}` }),
    }),

  /**
   * Nullable field validation
   */
  nullable: <T extends z.ZodTypeAny>(schema: T) => schema.nullable(),

  /**
   * Optional with null validation
   */
  optionalNullable: <T extends z.ZodTypeAny>(schema: T) =>
    schema.optional().nullable(),
};
