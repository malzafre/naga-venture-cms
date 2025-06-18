// filepath: schemas/storage.schemas.ts
/**
 * Storage and File Management Schemas
 *
 * Comprehensive validation schemas for file uploads, image management,
 * and storage operations across the application.
 */

import { z } from 'zod';
import {
  NonNegativeIntegerSchema,
  OptionalTextAreaSchema,
  UrlSchema,
  UuidSchema,
} from '../base.schemas';

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

/**
 * File upload validation schema
 */
export const FileUploadSchema = z.object({
  file: z.any(), // File object from form data
  entityType: z.enum([
    'business',
    'tourist_spot',
    'event',
    'promotion',
    'room',
    'review',
    'profile',
  ]),
  entityId: UuidSchema,
  isPublic: z.boolean().default(true),
  maxSizeBytes: z
    .number()
    .positive()
    .default(5 * 1024 * 1024), // 5MB default
  allowedMimeTypes: z
    .array(z.string())
    .default([
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ]),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

/**
 * Image upload validation schema (stricter than general file upload)
 */
export const ImageUploadSchema = z.object({
  file: z.any(),
  entityType: z.enum([
    'business',
    'tourist_spot',
    'event',
    'promotion',
    'room',
    'review',
    'profile',
  ]),
  entityId: UuidSchema,
  caption: OptionalTextAreaSchema,
  isPrimary: z.boolean().default(false),
  displayOrder: NonNegativeIntegerSchema.default(0),
  maxWidth: z.number().positive().optional(),
  maxHeight: z.number().positive().optional(),
  quality: z.number().min(0.1).max(1).default(0.8),
});

export type ImageUpload = z.infer<typeof ImageUploadSchema>;

// ============================================================================
// STORAGE VALIDATION SCHEMAS (Business-specific moved to avoid conflicts)
// ============================================================================

/**
 * Storage business ID validation
 */
export const StorageBusinessIdSchema = UuidSchema;

/**
 * Storage image update schema (generic)
 */
export const StorageImageUpdateSchema = z.object({
  imageId: UuidSchema,
  caption: OptionalTextAreaSchema,
  isPrimary: z.boolean().optional(),
  displayOrder: NonNegativeIntegerSchema.optional(),
});

export type StorageImageUpdate = z.infer<typeof StorageImageUpdateSchema>;

// ============================================================================
// STORAGE BUCKET SCHEMAS
// ============================================================================

/**
 * Storage bucket configuration schema
 */
export const StorageBucketSchema = z.object({
  name: z.string().min(1, 'Bucket name is required'),
  isPublic: z.boolean().default(true),
  allowedMimeTypes: z.array(z.string()),
  maxFileSize: z.number().positive(),
  path: z.string().min(1, 'Storage path is required'),
});

export type StorageBucket = z.infer<typeof StorageBucketSchema>;

/**
 * File metadata schema
 */
export const FileMetadataSchema = z.object({
  id: UuidSchema,
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().positive('File size must be positive'),
  url: UrlSchema,
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: UuidSchema,
  uploadedBy: UuidSchema.optional(),
  uploadedAt: z.string().datetime(),
  isPublic: z.boolean().default(true),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

// ============================================================================
// IMAGE PROCESSING SCHEMAS
// ============================================================================

/**
 * Image processing options schema
 */
export const ImageProcessingOptionsSchema = z.object({
  resize: z
    .object({
      width: z.number().positive().optional(),
      height: z.number().positive().optional(),
      fit: z
        .enum(['cover', 'contain', 'fill', 'inside', 'outside'])
        .default('cover'),
    })
    .optional(),
  quality: z.number().min(0.1).max(1).default(0.8),
  format: z.enum(['jpeg', 'png', 'webp']).optional(),
  blur: z.number().min(0.3).max(1000).optional(),
  sharpen: z.number().min(0).max(10).optional(),
  grayscale: z.boolean().default(false),
});

export type ImageProcessingOptions = z.infer<
  typeof ImageProcessingOptionsSchema
>;

/**
 * Image variant schema (for different sizes/formats)
 */
export const ImageVariantSchema = z.object({
  id: UuidSchema,
  originalImageId: UuidSchema,
  variant: z.enum(['thumbnail', 'small', 'medium', 'large', 'original']),
  width: z.number().positive(),
  height: z.number().positive(),
  url: UrlSchema,
  size: z.number().positive(),
  mimeType: z.string(),
  createdAt: z.string().datetime(),
});

export type ImageVariant = z.infer<typeof ImageVariantSchema>;

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

/**
 * Bulk file operation schema
 */
export const BulkFileOperationSchema = z.object({
  fileIds: z.array(UuidSchema).min(1, 'At least one file ID is required'),
  operation: z.enum(['delete', 'archive', 'make_public', 'make_private']),
  reason: z.string().optional(),
});

export type BulkFileOperation = z.infer<typeof BulkFileOperationSchema>;

/**
 * Bulk image processing schema
 */
export const BulkImageProcessingSchema = z.object({
  imageIds: z.array(UuidSchema).min(1, 'At least one image ID is required'),
  processingOptions: ImageProcessingOptionsSchema,
  generateVariants: z
    .array(z.enum(['thumbnail', 'small', 'medium', 'large']))
    .optional(),
});

export type BulkImageProcessing = z.infer<typeof BulkImageProcessingSchema>;

// ============================================================================
// STORAGE ANALYTICS SCHEMAS
// ============================================================================

/**
 * Storage usage analytics schema
 */
export const StorageAnalyticsSchema = z.object({
  totalFiles: z.number().min(0),
  totalSize: z.number().min(0),
  usageByEntityType: z.record(
    z.string(),
    z.object({
      fileCount: z.number().min(0),
      totalSize: z.number().min(0),
      averageSize: z.number().min(0),
    })
  ),
  usageByMimeType: z.record(
    z.string(),
    z.object({
      fileCount: z.number().min(0),
      totalSize: z.number().min(0),
    })
  ),
  monthlyUploadTrend: z.array(
    z.object({
      month: z.string(),
      uploadCount: z.number().min(0),
      totalSize: z.number().min(0),
    })
  ),
});

export type StorageAnalytics = z.infer<typeof StorageAnalyticsSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * File size validation (in bytes)
 */
export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size > 0 && size <= maxSize;
};

/**
 * MIME type validation
 */
export const validateMimeType = (
  mimeType: string,
  allowedTypes: string[]
): boolean => {
  return allowedTypes.includes(mimeType);
};

/**
 * Image dimension validation
 */
export const validateImageDimensions = (
  width: number,
  height: number,
  maxWidth?: number,
  maxHeight?: number
): boolean => {
  if (maxWidth && width > maxWidth) return false;
  if (maxHeight && height > maxHeight) return false;
  return width > 0 && height > 0;
};

/**
 * Generate storage path
 */
export const generateStoragePath = (
  entityType: string,
  entityId: string,
  filename: string
): string => {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${entityType}/${entityId}/${timestamp}_${sanitizedFilename}`;
};

/**
 * Extract file extension from filename
 */
export const getFileExtension = (filename: string): string | null => {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : null;
};

/**
 * Check if file is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

// ============================================================================
// STORAGE CONSTANTS
// ============================================================================

/**
 * Default storage configuration
 */
export const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  IMAGE_VARIANTS: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  },
} as const;
