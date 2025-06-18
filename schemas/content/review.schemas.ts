// filepath: schemas/review.schemas.ts
/**
 * Review and Rating Schemas
 *
 * Comprehensive validation schemas for review management, ratings,
 * and review responses based on the database structure.
 */

import { z } from 'zod';
import {
  AuditableEntitySchema,
  BaseFiltersSchema,
  OptionalTextAreaSchema,
  RatingSchema,
  ReviewTypeSchema,
  TextAreaSchema,
  UrlSchema,
  UuidSchema,
  type ReviewType,
} from '../base.schemas';

// ============================================================================
// REVIEW SCHEMAS
// ============================================================================

/**
 * Review base object schema (without refinements)
 */
const ReviewObjectSchema = AuditableEntitySchema.extend({
  reviewer_id: UuidSchema,
  review_type: ReviewTypeSchema,
  business_id: UuidSchema.nullable().optional(),
  tourist_spot_id: UuidSchema.nullable().optional(),
  event_id: UuidSchema.nullable().optional(),
  rating: RatingSchema,
  comment: OptionalTextAreaSchema,
  is_approved: z.boolean().default(false),
});

/**
 * Review schema based on database structure
 */
export const ReviewSchema = ReviewObjectSchema.refine(
  (data) => {
    // Ensure exactly one target is specified based on review type
    const targets = [
      data.business_id,
      data.tourist_spot_id,
      data.event_id,
    ].filter(Boolean);
    return targets.length === 1;
  },
  {
    message:
      'Exactly one target (business, tourist spot, or event) must be specified',
  }
).refine(
  (data) => {
    // Ensure the correct target is specified for the review type
    if (data.review_type === 'business' && !data.business_id) return false;
    if (data.review_type === 'tourist_spot' && !data.tourist_spot_id)
      return false;
    if (data.review_type === 'event' && !data.event_id) return false;
    return true;
  },
  {
    message: 'Review target must match the review type',
  }
);

export type Review = z.infer<typeof ReviewSchema>;

/**
 * Review creation schema
 */
export const ReviewCreateSchema = z
  .object({
    reviewer_id: UuidSchema,
    review_type: ReviewTypeSchema,
    business_id: UuidSchema.optional(),
    tourist_spot_id: UuidSchema.optional(),
    event_id: UuidSchema.optional(),
    rating: RatingSchema,
    comment: OptionalTextAreaSchema,
  })
  .refine(
    (data) => {
      // Ensure exactly one target is specified
      const targets = [
        data.business_id,
        data.tourist_spot_id,
        data.event_id,
      ].filter(Boolean);
      return targets.length === 1;
    },
    {
      message:
        'Exactly one target (business, tourist spot, or event) must be specified',
    }
  )
  .refine(
    (data) => {
      // Ensure the correct target is specified for the review type
      if (data.review_type === 'business' && !data.business_id) return false;
      if (data.review_type === 'tourist_spot' && !data.tourist_spot_id)
        return false;
      if (data.review_type === 'event' && !data.event_id) return false;
      return true;
    },
    {
      message: 'Review target must match the review type',
    }
  );

export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;

/**
 * Review update schema
 */
export const ReviewUpdateSchema = z
  .object({
    rating: RatingSchema.optional(),
    comment: OptionalTextAreaSchema,
    is_approved: z.boolean().optional(),
  })
  .partial();

export type ReviewUpdate = z.infer<typeof ReviewUpdateSchema>;

// ============================================================================
// REVIEW RESPONSE SCHEMAS
// ============================================================================

/**
 * Review response schema based on database structure
 */
export const ReviewResponseSchema = AuditableEntitySchema.extend({
  review_id: UuidSchema,
  responder_id: UuidSchema,
  response: TextAreaSchema,
});

export type ReviewResponse = z.infer<typeof ReviewResponseSchema>;

/**
 * Review response creation schema
 */
export const ReviewResponseCreateSchema = z.object({
  review_id: UuidSchema,
  responder_id: UuidSchema,
  response: TextAreaSchema,
});

export type ReviewResponseCreate = z.infer<typeof ReviewResponseCreateSchema>;

/**
 * Review response update schema
 */
export const ReviewResponseUpdateSchema = z.object({
  response: TextAreaSchema,
});

export type ReviewResponseUpdate = z.infer<typeof ReviewResponseUpdateSchema>;

// ============================================================================
// REVIEW IMAGE SCHEMAS
// ============================================================================

/**
 * Review image schema based on database structure
 */
export const ReviewImageSchema = z.object({
  id: UuidSchema,
  review_id: UuidSchema,
  image_url: UrlSchema,
  created_at: z.string().datetime(),
});

export type ReviewImage = z.infer<typeof ReviewImageSchema>;

/**
 * Review image creation schema
 */
export const ReviewImageCreateSchema = z.object({
  review_id: UuidSchema,
  image_url: UrlSchema,
});

export type ReviewImageCreate = z.infer<typeof ReviewImageCreateSchema>;

// ============================================================================
// REVIEW WITH RELATIONS SCHEMAS
// ============================================================================

/**
 * Review with response and images schema
 */
export const ReviewWithRelationsSchema = ReviewObjectSchema.extend({
  reviewer: z
    .object({
      id: UuidSchema,
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      profile_image_url: z.string().nullable(),
    })
    .optional(),
  review_responses: z.array(ReviewResponseSchema).optional(),
  review_images: z.array(ReviewImageSchema).optional(),
});

export type ReviewWithRelations = z.infer<typeof ReviewWithRelationsSchema>;

// ============================================================================
// FILTERING AND QUERY SCHEMAS
// ============================================================================

/**
 * Review filters schema
 */
export const ReviewFiltersSchema = BaseFiltersSchema.extend({
  review_type: ReviewTypeSchema.optional(),
  business_id: UuidSchema.optional(),
  tourist_spot_id: UuidSchema.optional(),
  event_id: UuidSchema.optional(),
  reviewer_id: UuidSchema.optional(),
  rating: RatingSchema.optional(),
  min_rating: RatingSchema.optional(),
  max_rating: RatingSchema.optional(),
  is_approved: z.boolean().optional(),
  has_comment: z.boolean().optional(),
  has_response: z.boolean().optional(),
  has_images: z.boolean().optional(),
  sortBy: z.enum(['created_at', 'rating', 'updated_at']).default('created_at'),
});

export type ReviewFilters = z.infer<typeof ReviewFiltersSchema>;

/**
 * Review moderation filters schema
 */
export const ReviewModerationFiltersSchema = BaseFiltersSchema.extend({
  is_approved: z.boolean().optional(),
  review_type: ReviewTypeSchema.optional(),
  requires_attention: z.boolean().optional(), // Reviews with low ratings or keywords
  sortBy: z.enum(['created_at', 'rating', 'updated_at']).default('created_at'),
});

export type ReviewModerationFilters = z.infer<
  typeof ReviewModerationFiltersSchema
>;

// ============================================================================
// REVIEW ANALYTICS SCHEMAS
// ============================================================================

/**
 * Review statistics schema
 */
export const ReviewStatsSchema = z.object({
  total_reviews: z.number().min(0),
  approved_reviews: z.number().min(0),
  pending_reviews: z.number().min(0),
  average_rating: z.number().min(0).max(5),
  rating_distribution: z.object({
    1: z.number().min(0),
    2: z.number().min(0),
    3: z.number().min(0),
    4: z.number().min(0),
    5: z.number().min(0),
  }),
  reviews_with_comments: z.number().min(0),
  reviews_with_responses: z.number().min(0),
  reviews_with_images: z.number().min(0),
});

export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

/**
 * Entity review summary schema (for businesses, tourist spots, events)
 */
export const EntityReviewSummarySchema = z.object({
  entity_id: UuidSchema,
  entity_type: ReviewTypeSchema,
  total_reviews: z.number().min(0),
  average_rating: z.number().min(0).max(5).nullable(),
  rating_distribution: z.object({
    1: z.number().min(0),
    2: z.number().min(0),
    3: z.number().min(0),
    4: z.number().min(0),
    5: z.number().min(0),
  }),
  recent_reviews: z.array(ReviewWithRelationsSchema),
});

export type EntityReviewSummary = z.infer<typeof EntityReviewSummarySchema>;

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk review operation schema
 */
export const BulkReviewOperationSchema = z.object({
  review_ids: z.array(UuidSchema).min(1, 'At least one review ID is required'),
  operation: z.enum(['approve', 'reject', 'delete', 'archive']),
  reason: z.string().optional(),
});

export type BulkReviewOperation = z.infer<typeof BulkReviewOperationSchema>;

/**
 * Review approval schema
 */
export const ReviewApprovalSchema = z.object({
  is_approved: z.boolean(),
  moderator_notes: z.string().optional(),
});

export type ReviewApproval = z.infer<typeof ReviewApprovalSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Review target validation helper
 */
export const validateReviewTarget = (
  reviewType: ReviewType,
  businessId?: string,
  touristSpotId?: string,
  eventId?: string
): boolean => {
  const targets = [businessId, touristSpotId, eventId].filter(Boolean);

  if (targets.length !== 1) return false;

  switch (reviewType) {
    case 'business':
      return !!businessId;
    case 'tourist_spot':
      return !!touristSpotId;
    case 'event':
      return !!eventId;
    default:
      return false;
  }
};

/**
 * Calculate average rating from reviews
 */
export const calculateAverageRating = (
  reviews: Pick<Review, 'rating'>[]
): number | null => {
  if (reviews.length === 0) return null;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate rating distribution from reviews
 */
export const calculateRatingDistribution = (
  reviews: Pick<Review, 'rating'>[]
): Record<number, number> => {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  return distribution;
};
