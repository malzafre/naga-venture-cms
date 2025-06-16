// filepath: hooks/useBusinessImageManagement.ts
/**
 * Business Image Management Hook
 *
 * Handles image upload, deletion, and management for business forms.
 * Follows the "Smart Hook, Dumb Component" pattern.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import queryKeys from '@/lib/queryKeys';
import { supabase } from '@/lib/supabaseClient';
import { BusinessImageUploadSchema, type BusinessImageUpload } from '@/schemas';
import { StorageService, type ImageFile } from '@/services/StorageService';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageItem extends ImageFile {
  id: string;
  isUploaded?: boolean;
  caption?: string;
  isPrimary?: boolean;
  uploadProgress?: number;
}

export interface BusinessImageManagementOptions {
  businessId?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useBusinessImageManagement({
  businessId,
  onError,
  onSuccess,
}: BusinessImageManagementOptions = {}) {
  console.log('🎯 [useBusinessImageManagement] Hook initialized with:', { businessId });

  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // ============================================================================
  // UPLOAD MUTATION
  // ============================================================================

  const uploadImagesMutation = useMutation({
    mutationFn: async ({
      businessId: targetBusinessId,
      images,
    }: {
      businessId: string;
      images: ImageItem[];
    }) => {
      if (!targetBusinessId) {
        throw new Error('Business ID is required for image upload');
      }

      const results = [];
      const imagesToUpload = images.filter((img) => !img.isUploaded);

      if (imagesToUpload.length === 0) {
        return [];
      }

      setIsUploading(true);

      try {
        // Upload images to storage
        for (const [index, image] of imagesToUpload.entries()) {
          setUploadProgress((prev) => ({
            ...prev,
            [image.id]: (index / imagesToUpload.length) * 50, // 50% for storage upload
          }));

          const uploadResult = await StorageService.uploadBusinessImage(targetBusinessId, image);

          setUploadProgress((prev) => ({
            ...prev,
            [image.id]: 50 + (index / imagesToUpload.length) * 25, // 75% after storage
          }));

          // Save to database
          const imageData: BusinessImageUpload = {
            business_id: targetBusinessId,
            image_url: uploadResult.url,
            caption: image.caption || '',
            is_primary: image.isPrimary || false,
            display_order: index,
          };

          // Validate data
          const validatedData = BusinessImageUploadSchema.parse(imageData);

          const { data, error } = await supabase
            .from('business_images')
            .insert([validatedData])
            .select()
            .single();

          if (error) {
            throw new Error(`Database error: ${error.message}`);
          }

          setUploadProgress((prev) => ({
            ...prev,
            [image.id]: 100,
          }));

          results.push({
            ...data,
            tempId: image.id,
          });
        }

        return results;
      } finally {
        setIsUploading(false);
        setUploadProgress({});
      }
    },
    onSuccess: (data) => {
      // Invalidate business queries to refresh data
      if (businessId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.businesses.detail(businessId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.businesses.all,
        });
      }

      onSuccess?.(`Successfully uploaded ${data.length} image${data.length === 1 ? '' : 's'}`);
    },
    onError: (error: any) => {
      console.error('[BusinessImageManagement] Upload error:', error);
      onError?.(error.message || 'Failed to upload images');
    },
  });

  // ============================================================================
  // DELETE MUTATION
  // ============================================================================

  const deleteImageMutation = useMutation({
    mutationFn: async ({ imageId, imagePath }: { imageId: string; imagePath?: string }) => {
      // Delete from database first
      const { error } = await supabase.from('business_images').delete().eq('id', imageId);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Delete from storage if path provided
      if (imagePath) {
        try {
          await StorageService.deleteBusinessImage(imagePath);
        } catch (storageError) {
          console.warn('[BusinessImageManagement] Storage deletion warning:', storageError);
          // Don't throw here as database deletion succeeded
        }
      }
    },
    onSuccess: () => {
      // Invalidate business queries to refresh data
      if (businessId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.businesses.detail(businessId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.businesses.all,
        });
      }

      onSuccess?.('Image deleted successfully');
    },
    onError: (error: any) => {
      console.error('[BusinessImageManagement] Delete error:', error);
      onError?.(error.message || 'Failed to delete image');
    },
  });

  // ============================================================================
  // UPDATE PRIMARY MUTATION
  // ============================================================================

  const updatePrimaryImageMutation = useMutation({
    mutationFn: async ({
      businessId: targetBusinessId,
      imageId,
    }: {
      businessId: string;
      imageId: string;
    }) => {
      // First, set all images for this business to non-primary
      const { error: resetError } = await supabase
        .from('business_images')
        .update({ is_primary: false })
        .eq('business_id', targetBusinessId);

      if (resetError) {
        throw new Error(`Reset primary error: ${resetError.message}`);
      }

      // Then set the selected image as primary
      const { error: setPrimaryError } = await supabase
        .from('business_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (setPrimaryError) {
        throw new Error(`Set primary error: ${setPrimaryError.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate business queries to refresh data
      if (businessId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.businesses.detail(businessId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.businesses.all,
        });
      }

      onSuccess?.('Primary image updated successfully');
    },
    onError: (error: any) => {
      console.error('[BusinessImageManagement] Update primary error:', error);
      onError?.(error.message || 'Failed to update primary image');
    },
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Convert form images to database format for upload
   */
  const convertFormImagesToUpload = useCallback((images: ImageItem[]): ImageItem[] => {
    return images.map((img, index) => ({
      ...img,
      isPrimary: index === 0 && images.length > 0, // First image is primary by default
      display_order: index,
    }));
  }, []);
  /**
   * Upload images for a business
   */
  const uploadImages = useCallback(
    (targetBusinessId: string, images: ImageItem[]) => {
      console.log('🚀 [useBusinessImageManagement] uploadImages called with:', {
        targetBusinessId,
        imageCount: images.length,
        images: images.map((img) => ({ id: img.id, name: img.name, size: img.size })),
      });

      const convertedImages = convertFormImagesToUpload(images);
      console.log('🔄 [useBusinessImageManagement] Converted images:', convertedImages.length);

      uploadImagesMutation.mutate({
        businessId: targetBusinessId,
        images: convertedImages,
      });
    },
    [uploadImagesMutation, convertFormImagesToUpload]
  );

  /**
   * Delete an image
   */
  const deleteImage = useCallback(
    (imageId: string, imagePath?: string) => {
      deleteImageMutation.mutate({ imageId, imagePath });
    },
    [deleteImageMutation]
  );

  /**
   * Update primary image
   */
  const updatePrimaryImage = useCallback(
    (targetBusinessId: string, imageId: string) => {
      updatePrimaryImageMutation.mutate({
        businessId: targetBusinessId,
        imageId,
      });
    },
    [updatePrimaryImageMutation]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    isUploading,
    uploadProgress,
    isDeleting: deleteImageMutation.isPending,
    isUpdatingPrimary: updatePrimaryImageMutation.isPending,

    // Actions
    uploadImages,
    deleteImage,
    updatePrimaryImage,

    // Mutation objects for advanced usage
    uploadImagesMutation,
    deleteImageMutation,
    updatePrimaryImageMutation,

    // Helpers
    convertFormImagesToUpload,
  };
}

export default useBusinessImageManagement;
