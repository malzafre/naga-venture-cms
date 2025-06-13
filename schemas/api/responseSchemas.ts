// filepath: schemas/api/responseSchemas.ts
/**
 * API Response Schemas - Phase 5 Implementation
 *
 * Comprehensive Zod schemas for all API responses.
 * Validates Supabase responses, error handling, and data consistency.
 */

import { z } from 'zod';

import {
  DateSchema,
  PaginationResponseSchema,
  UuidSchema,
} from '../common/baseSchemas';

// ============================================================================
// GENERIC API RESPONSE SCHEMAS
// ============================================================================

/**
 * Generic API error schema
 */
export const ApiErrorSchema = z.object({
  message: z.string(),
  details: z.string().optional(),
  hint: z.string().optional(),
  code: z.string().optional(),
  status: z.number().optional(),
});

/**
 * Generic API success response
 */
export const ApiSuccessResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: dataSchema,
    error: z.null(),
    status: z.number().optional(),
    statusText: z.string().optional(),
  });

/**
 * Generic API error response
 */
export const ApiErrorResponseSchema = z.object({
  data: z.null(),
  error: ApiErrorSchema,
  status: z.number().optional(),
  statusText: z.string().optional(),
});

/**
 * Generic API response (success or error)
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([ApiSuccessResponseSchema(dataSchema), ApiErrorResponseSchema]);

// ============================================================================
// SUPABASE SPECIFIC SCHEMAS
// ============================================================================

/**
 * Supabase PostgresError schema
 */
export const PostgresErrorSchema = z.object({
  message: z.string(),
  details: z.string().optional(),
  hint: z.string().optional(),
  code: z.string(),
});

/**
 * Supabase single record response
 */
export const SupabaseSingleResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: dataSchema.nullable(),
    error: PostgresErrorSchema.nullable(),
    count: z.null(),
    status: z.number(),
    statusText: z.string(),
  });

/**
 * Supabase multiple records response
 */
export const SupabaseListResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema).nullable(),
    error: PostgresErrorSchema.nullable(),
    count: z.number().nullable(),
    status: z.number(),
    statusText: z.string(),
  });

/**
 * Supabase mutation response (insert/update/delete)
 */
export const SupabaseMutationResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema).nullable(),
    error: PostgresErrorSchema.nullable(),
    count: z.number().nullable(),
    status: z.number(),
    statusText: z.string(),
  });

// ============================================================================
// PAGINATION RESPONSE SCHEMAS
// ============================================================================

/**
 * Paginated API response schema
 */
export const PaginatedApiResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationResponseSchema,
    error: ApiErrorSchema.nullable(),
  });

/**
 * Infinite query response schema
 */
export const InfiniteQueryResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: z.array(dataSchema),
    nextCursor: z.string().nullable(),
    hasNextPage: z.boolean(),
    totalCount: z.number().optional(),
    error: ApiErrorSchema.nullable(),
  });

// ============================================================================
// MUTATION RESPONSE SCHEMAS
// ============================================================================

/**
 * Create operation response schema
 */
export const CreateResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().default('Record created successfully'),
    error: ApiErrorSchema.nullable(),
  });

/**
 * Update operation response schema
 */
export const UpdateResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().default('Record updated successfully'),
    error: ApiErrorSchema.nullable(),
  });

/**
 * Delete operation response schema
 */
export const DeleteResponseSchema = z.object({
  data: z.object({
    id: UuidSchema,
    deleted: z.boolean(),
  }),
  message: z.string().default('Record deleted successfully'),
  error: ApiErrorSchema.nullable(),
});

/**
 * Bulk operation response schema
 */
export const BulkOperationResponseSchema = z.object({
  data: z.object({
    affected_count: z.number().int().min(0),
    successful_ids: z.array(UuidSchema),
    failed_ids: z.array(UuidSchema),
  }),
  message: z.string(),
  error: ApiErrorSchema.nullable(),
});

// ============================================================================
// FILE UPLOAD RESPONSE SCHEMAS
// ============================================================================

/**
 * File upload response schema
 */
export const FileUploadResponseSchema = z.object({
  data: z.object({
    url: z.string().url(),
    path: z.string(),
    filename: z.string(),
    size: z.number().positive(),
    mimetype: z.string(),
    upload_id: UuidSchema.optional(),
  }),
  message: z.string().default('File uploaded successfully'),
  error: ApiErrorSchema.nullable(),
});

/**
 * Multiple file upload response schema
 */
export const MultipleFileUploadResponseSchema = z.object({
  data: z.object({
    successful_uploads: z.array(FileUploadResponseSchema.shape.data),
    failed_uploads: z.array(
      z.object({
        filename: z.string(),
        error: z.string(),
      })
    ),
    total_uploaded: z.number().int().min(0),
  }),
  message: z.string(),
  error: ApiErrorSchema.nullable(),
});

// ============================================================================
// ANALYTICS RESPONSE SCHEMAS
// ============================================================================

/**
 * Analytics data point schema
 */
export const AnalyticsDataPointSchema = z.object({
  date: DateSchema,
  value: z.number(),
  label: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Analytics response schema
 */
export const AnalyticsResponseSchema = z.object({
  data: z.object({
    metrics: z.array(AnalyticsDataPointSchema),
    summary: z.object({
      total: z.number(),
      average: z.number(),
      growth_percentage: z.number().optional(),
      period: z.string(),
    }),
    breakdown: z.record(z.number()).optional(),
  }),
  error: ApiErrorSchema.nullable(),
});

// ============================================================================
// SEARCH RESPONSE SCHEMAS
// ============================================================================

/**
 * Search result item schema
 */
export const SearchResultItemSchema = z.object({
  id: UuidSchema,
  type: z.enum(['business', 'tourist_spot', 'event', 'category']),
  title: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  image_url: z.string().optional(),
  score: z.number().min(0).max(1).optional(),
  highlighted_fields: z.array(z.string()).optional(),
});

/**
 * Search response schema
 */
export const SearchResponseSchema = z.object({
  data: z.object({
    results: z.array(SearchResultItemSchema),
    total_count: z.number().int().min(0),
    search_time_ms: z.number().positive(),
    suggestions: z.array(z.string()).optional(),
    filters_applied: z.record(z.unknown()).optional(),
  }),
  pagination: PaginationResponseSchema.optional(),
  error: ApiErrorSchema.nullable(),
});

// ============================================================================
// HEALTH CHECK SCHEMAS
// ============================================================================

/**
 * Health check response schema
 */
export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: DateSchema,
  version: z.string(),
  services: z.record(
    z.object({
      status: z.enum(['up', 'down', 'degraded']),
      response_time_ms: z.number().positive().optional(),
      last_check: DateSchema,
      error: z.string().optional(),
    })
  ),
});

// ============================================================================
// VALIDATION RESPONSE SCHEMAS
// ============================================================================

/**
 * Validation error detail schema
 */
export const ValidationErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
  value: z.unknown().optional(),
});

/**
 * Validation error response schema
 */
export const ValidationErrorResponseSchema = z.object({
  data: z.null(),
  error: z.object({
    message: z.string().default('Validation failed'),
    type: z.literal('validation_error'),
    details: z.array(ValidationErrorDetailSchema),
  }),
  status: z.literal(400),
  statusText: z.literal('Bad Request'),
});

// ============================================================================
// AUTHENTICATION RESPONSE SCHEMAS
// ============================================================================

/**
 * Auth token response schema
 */
export const AuthTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().positive(),
  token_type: z.string().default('Bearer'),
});

/**
 * Auth session response schema
 */
export const AuthSessionResponseSchema = z.object({
  data: z
    .object({
      user: z.object({
        id: UuidSchema,
        email: z.string().email(),
        role: z.string(),
      }),
      session: AuthTokenResponseSchema.nullable(),
    })
    .nullable(),
  error: ApiErrorSchema.nullable(),
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type PostgresError = z.infer<typeof PostgresErrorSchema>;
export type AnalyticsDataPoint = z.infer<typeof AnalyticsDataPointSchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type ValidationErrorDetail = z.infer<typeof ValidationErrorDetailSchema>;
export type ValidationErrorResponse = z.infer<
  typeof ValidationErrorResponseSchema
>;
export type AuthTokenResponse = z.infer<typeof AuthTokenResponseSchema>;
export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>;
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;
export type MultipleFileUploadResponse = z.infer<
  typeof MultipleFileUploadResponseSchema
>;
export type BulkOperationResponse = z.infer<typeof BulkOperationResponseSchema>;

// ============================================================================
// RESPONSE VALIDATION HELPERS
// ============================================================================

/**
 * Validates and transforms Supabase response to standard format
 */
export const validateSupabaseResponse = <T extends z.ZodTypeAny>(
  dataSchema: T,
  response: unknown
) => {
  const supabaseSchema = SupabaseSingleResponseSchema(dataSchema);
  const validatedResponse = supabaseSchema.parse(response);

  if (validatedResponse.error) {
    throw new Error(validatedResponse.error.message);
  }

  return validatedResponse.data;
};

/**
 * Validates and transforms Supabase list response to standard format
 */
export const validateSupabaseListResponse = <T extends z.ZodTypeAny>(
  dataSchema: T,
  response: unknown
) => {
  const supabaseSchema = SupabaseListResponseSchema(dataSchema);
  const validatedResponse = supabaseSchema.parse(response);

  if (validatedResponse.error) {
    throw new Error(validatedResponse.error.message);
  }

  return {
    data: validatedResponse.data || [],
    count: validatedResponse.count,
  };
};
