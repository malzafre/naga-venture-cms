// filepath: services/StorageService.ts
/**
 * Storage Service - Supabase Storage Integration
 *
 * Handles file uploads and management with Supabase Storage.
 * Follows security best practices and error handling patterns.
 */

import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export interface ImageFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export interface UploadResult {
  url: string;
  path: string;
  fullPath: string;
}

const STORAGE_CONFIG = {
  BUCKET_NAME: 'business-images',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CACHE_CONTROL: '3600', // 1 hour
} as const;

// ============================================================================
// ERROR HANDLING
// ============================================================================

class StorageError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

// ============================================================================
// STORAGE SERVICE
// ============================================================================

export class StorageService {
  /**
   * Validate image file before upload
   */
  private static validateImageFile(file: ImageFile): void {
    // Check file size
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      throw new StorageError(
        `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum ${
          STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024
        }MB`
      );
    }

    // Check file type
    if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
      throw new StorageError(
        `File type ${file.type} not allowed. Allowed types: ${STORAGE_CONFIG.ALLOWED_TYPES.join(
          ', '
        )}`
      );
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      throw new StorageError('File name is required');
    }
  }
  /**
   * Generate unique file path for business images
   */
  private static generateBusinessImagePath(businessId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    return `businesses/${businessId}/${timestamp}_${sanitizedFileName}`;
  }

  /**
   * Convert React Native image picker result to blob for upload
   */
  private static async imageToBlob(imageFile: ImageFile): Promise<Blob> {
    try {
      const response = await fetch(imageFile.uri);
      if (!response.ok) {
        throw new StorageError('Failed to fetch image data');
      }
      return await response.blob();
    } catch (error) {
      throw new StorageError(`Failed to convert image to blob: ${error}`);
    }
  }

  /**
   * Upload single business image to Supabase Storage
   */
  static async uploadBusinessImage(
    businessId: string,
    imageFile: ImageFile
  ): Promise<UploadResult> {
    try {
      // Validate inputs
      z.string().uuid().parse(businessId);
      this.validateImageFile(imageFile);

      // Generate unique file path
      const filePath = this.generateBusinessImagePath(businessId, imageFile.name);

      // Convert image to blob
      const blob = await this.imageToBlob(imageFile);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(filePath, blob, {
          cacheControl: STORAGE_CONFIG.CACHE_CONTROL,
          contentType: imageFile.type,
          upsert: false,
        });

      if (error) {
        console.error('[StorageService] Upload error:', error);

        if (error.message.includes('Duplicate')) {
          throw new StorageError('A file with this name already exists');
        } else if (error.message.includes('size')) {
          throw new StorageError('File size exceeds storage limits');
        } else if (error.message.includes('permission')) {
          throw new StorageError('Permission denied for file upload');
        }

        throw new StorageError(`Upload failed: ${error.message}`);
      }

      if (!data?.path) {
        throw new StorageError('Upload succeeded but no file path returned');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(data.path);

      if (!urlData?.publicUrl) {
        throw new StorageError('Failed to get public URL for uploaded file');
      }

      return {
        url: urlData.publicUrl,
        path: data.path,
        fullPath: data.fullPath,
      };
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      console.error('[StorageService] Unexpected upload error:', error);
      throw new StorageError(`Unexpected error during upload: ${error}`);
    }
  }

  /**
   * Upload multiple business images
   */
  static async uploadBusinessImages(
    businessId: string,
    imageFiles: ImageFile[]
  ): Promise<UploadResult[]> {
    try {
      // Validate inputs
      z.string().uuid().parse(businessId);

      if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
        throw new StorageError('No images provided for upload');
      }

      if (imageFiles.length > 10) {
        throw new StorageError('Maximum 10 images allowed per business');
      }

      // Upload all images in parallel
      const uploadPromises = imageFiles.map((file, index) =>
        this.uploadBusinessImage(businessId, file).catch((error) => ({
          error,
          index,
          fileName: file.name,
        }))
      );

      const results = await Promise.all(uploadPromises);

      // Check for errors
      const errors = results.filter(
        (result): result is { error: any; index: number; fileName: string } => 'error' in result
      );

      if (errors.length > 0) {
        const errorMessages = errors.map(
          ({ error, index, fileName }) => `${fileName} (${index + 1}): ${error.message}`
        );
        throw new StorageError(
          `Failed to upload ${errors.length} images:\n${errorMessages.join('\n')}`
        );
      }

      return results as UploadResult[];
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      console.error('[StorageService] Unexpected batch upload error:', error);
      throw new StorageError(`Unexpected error during batch upload: ${error}`);
    }
  }

  /**
   * Delete business image from storage
   */
  static async deleteBusinessImage(imagePath: string): Promise<void> {
    try {
      if (!imagePath || imagePath.trim() === '') {
        throw new StorageError('Image path is required for deletion');
      }

      const { error } = await supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).remove([imagePath]);

      if (error) {
        console.error('[StorageService] Delete error:', error);

        if (error.message.includes('not found')) {
          // File already deleted, this is not an error
          console.warn('[StorageService] File not found, may already be deleted:', imagePath);
          return;
        }

        throw new StorageError(`Failed to delete image: ${error.message}`);
      }

      console.log('[StorageService] Image deleted successfully:', imagePath);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      console.error('[StorageService] Unexpected delete error:', error);
      throw new StorageError(`Unexpected error during deletion: ${error}`);
    }
  }

  /**
   * Delete multiple business images
   */
  static async deleteBusinessImages(imagePaths: string[]): Promise<void> {
    try {
      if (!Array.isArray(imagePaths) || imagePaths.length === 0) {
        throw new StorageError('No image paths provided for deletion');
      }

      const validPaths = imagePaths.filter((path) => path && path.trim() !== '');

      if (validPaths.length === 0) {
        throw new StorageError('No valid image paths provided for deletion');
      }

      const { error } = await supabase.storage.from(STORAGE_CONFIG.BUCKET_NAME).remove(validPaths);

      if (error) {
        console.error('[StorageService] Batch delete error:', error);
        throw new StorageError(`Failed to delete images: ${error.message}`);
      }

      console.log('[StorageService] Images deleted successfully:', validPaths.length);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      console.error('[StorageService] Unexpected batch delete error:', error);
      throw new StorageError(`Unexpected error during batch deletion: ${error}`);
    }
  }

  /**
   * Get storage configuration for client-side validation
   */
  static getStorageConfig() {
    return {
      maxFileSize: STORAGE_CONFIG.MAX_FILE_SIZE,
      allowedTypes: STORAGE_CONFIG.ALLOWED_TYPES,
      maxImages: 10,
      bucketName: STORAGE_CONFIG.BUCKET_NAME,
    };
  }
}

export default StorageService;
