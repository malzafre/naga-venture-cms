// filepath: hooks/shared/useImagePicker.ts
/**
 * useImagePicker Hook
 *
 * Smart hook that handles image picker logic, validation, and permissions.
 * Extracts business logic from CMSImagePicker component.
 */

import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Alert } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

interface UseImagePickerProps {
  maxImages?: number;
  currentImageCount?: number;
  onImagesSelected: (images: ImageFile[]) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGES: 10,
};

// ============================================================================
// HOOK
// ============================================================================

export function useImagePicker({
  maxImages = STORAGE_CONFIG.MAX_IMAGES,
  currentImageCount = 0,
  onImagesSelected,
}: UseImagePickerProps) {
  /**
   * Validate selected image file
   */
  const validateImage = useCallback(
    (asset: ImagePicker.ImagePickerAsset): ImageFile | null => {
      try {
        // Check file size
        if (asset.fileSize && asset.fileSize > STORAGE_CONFIG.MAX_FILE_SIZE) {
          Alert.alert(
            'File Too Large',
            `Image size ${(asset.fileSize / 1024 / 1024).toFixed(1)}MB exceeds maximum ${
              STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024
            }MB`
          );
          return null;
        }

        // Generate file name if not provided
        const fileName =
          asset.fileName ||
          `image_${Date.now()}.${asset.type?.split('/')[1] || 'jpg'}`;

        // Determine MIME type
        let mimeType = asset.type || 'image/jpeg';
        if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(mimeType)) {
          // Default to JPEG for unknown types
          mimeType = 'image/jpeg';
        }

        return {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
          size: asset.fileSize || 0,
        };
      } catch (error) {
        console.error('[useImagePicker] Error validating image:', error);
        Alert.alert('Error', 'Failed to process selected image');
        return null;
      }
    },
    []
  );

  /**
   * Handle image selection from gallery
   */
  const selectFromGallery = useCallback(async () => {
    console.log('📱 [useImagePicker] selectFromGallery called');
    console.log('📱 [useImagePicker] Current state:', {
      currentImageCount,
      maxImages,
    });

    try {
      console.log(
        '📷 [useImagePicker] Requesting media library permissions...'
      );
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📷 [useImagePicker] Permission result:', permissionResult);

      if (!permissionResult.granted) {
        console.log('❌ [useImagePicker] Permission denied');
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select images'
        );
        return;
      }

      // Calculate remaining slots
      const remainingSlots = maxImages - currentImageCount;
      console.log('🎯 [useImagePicker] Remaining slots:', remainingSlots);

      if (remainingSlots <= 0) {
        console.log('❌ [useImagePicker] No remaining slots');
        Alert.alert('Maximum Images', `Maximum ${maxImages} images allowed`);
        return;
      }

      console.log('🎯 [useImagePicker] Launching image picker with config:', {
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
      });

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
        quality: 0.8,
        exif: false,
      });

      console.log('🎯 [useImagePicker] Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log(
          '✅ [useImagePicker] Images selected:',
          result.assets.length
        );

        // Validate and process selected images
        const validImages: ImageFile[] = [];

        for (const asset of result.assets) {
          console.log('🔍 [useImagePicker] Validating asset:', asset.uri);
          const validImage = validateImage(asset);
          if (validImage) {
            validImages.push(validImage);
            console.log('✅ [useImagePicker] Asset validated successfully');
          } else {
            console.log('❌ [useImagePicker] Asset validation failed');
          }
        }

        if (validImages.length > 0) {
          console.log(
            '📤 [useImagePicker] Calling onImagesSelected with:',
            validImages.length,
            'images'
          );
          onImagesSelected(validImages);
        } else {
          console.log('❌ [useImagePicker] No valid images to select');
        }
      } else {
        console.log('🚫 [useImagePicker] User cancelled or no images selected');
      }
    } catch (error) {
      console.error('❌ [useImagePicker] Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select images from gallery');
    }
  }, [maxImages, currentImageCount, onImagesSelected, validateImage]);

  /**
   * Show image picker (main entry point)
   */
  const pickImages = useCallback(() => {
    console.log('🎛️ [useImagePicker] pickImages called');
    console.log('🎛️ [useImagePicker] Hook state:', {
      currentImageCount,
      maxImages,
    });

    const remainingSlots = maxImages - currentImageCount;
    if (remainingSlots <= 0) {
      console.log('❌ [useImagePicker] Max images reached');
      Alert.alert('Maximum Images', `Maximum ${maxImages} images allowed`);
      return;
    }

    console.log('📱 [useImagePicker] Calling selectFromGallery');
    selectFromGallery();
  }, [selectFromGallery, currentImageCount, maxImages]);

  // Calculate derived state
  const remainingSlots = maxImages - currentImageCount;
  const isMaxReached = remainingSlots <= 0;

  return {
    pickImages,
    remainingSlots,
    isMaxReached,
    maxFileSize: STORAGE_CONFIG.MAX_FILE_SIZE,
    allowedTypes: STORAGE_CONFIG.ALLOWED_TYPES,
  };
}
