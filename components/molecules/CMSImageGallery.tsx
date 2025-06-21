// filepath: components/molecules/CMSImageGallery.tsx
/**
 * CMSImageGallery Molecule Component
 *
 * Manages multiple images with preview, drag & drop reordering, and deletion.
 * Follows atomic design principles and coding guidelines.
 */

import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CMSImagePicker } from '@/components/atoms';
import { useTheme } from '@/hooks/useTheme';
import { type BusinessFormImage } from '@/schemas';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

// Use the simplified schema type
export type ImageItem = BusinessFormImage;

interface CMSImageGalleryProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  maxImages?: number;
  disabled?: boolean;
  showCaptions?: boolean;
}

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

const VALIDATION_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  MAX_IMAGES: 10,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate an image file against our requirements
 */
const validateImageFile = (
  file: ImageFile
): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > VALIDATION_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.`,
    };
  }
  // Check file type
  if (!VALIDATION_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: `File "${file.name}" type "${file.type}" not supported. Only JPEG, PNG, and WebP are allowed.`,
    };
  }

  return { isValid: true };
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function CMSImageGallery({
  images,
  onImagesChange,
  maxImages = 10,
  disabled = false,
  showCaptions = false,
}: CMSImageGalleryProps) {
  console.log('🖼️ [CMSImageGallery] Component rendered with props:', {
    imageCount: images.length,
    maxImages,
    disabled,
    showCaptions,
    hasOnImagesChange: typeof onImagesChange === 'function',
  });

  const { theme } = useTheme();

  // Dynamic styles using theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    counter: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    imageContainer: {
      width: '47%',
      aspectRatio: 1,
      borderRadius: 8,
      backgroundColor: theme.colors.backgroundSecondary,
      overflow: 'hidden',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
    },
    primaryText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    deleteButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.colors.error,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    setPrimaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 4,
    },
    setPrimaryText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    caption: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 8,
    },
    captionText: {
      fontSize: 11,
      color: '#FFFFFF',
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
      color: theme.colors.neutral300,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.neutral500,
      textAlign: 'center',
    },
  });
  /**
   * Handle new images selected from picker
   */ const handleImagesSelected = useCallback(
    (newImages: ImageFile[]) => {
      console.log(
        '🎯 [CMSImageGallery] handleImagesSelected called with:',
        newImages.length,
        'images'
      );
      console.log('🎯 [CMSImageGallery] Current state:', {
        currentImageCount: images.length,
        maxImages: VALIDATION_CONFIG.MAX_IMAGES,
      });

      // Check total count limit first
      const totalCount = images.length + newImages.length;
      if (totalCount > VALIDATION_CONFIG.MAX_IMAGES) {
        const allowedCount = VALIDATION_CONFIG.MAX_IMAGES - images.length;
        console.log('❌ [CMSImageGallery] Too many images:', {
          totalCount,
          maxImages: VALIDATION_CONFIG.MAX_IMAGES,
          allowedCount,
        });
        Alert.alert(
          'Too Many Images',
          `Cannot add ${newImages.length} images. Only ${allowedCount} more images allowed (maximum ${VALIDATION_CONFIG.MAX_IMAGES}).`
        );
        return;
      }

      console.log('🔍 [CMSImageGallery] Validating images...');
      // Validate each image
      const validationErrors = newImages
        .map((img, index) => {
          console.log(
            `🔍 [CMSImageGallery] Validating image ${index + 1}:`,
            img
          );
          const { isValid, error } = validateImageFile(img);
          if (!isValid) {
            console.log(
              `❌ [CMSImageGallery] Validation failed for image ${index + 1}:`,
              error
            );
          }
          return isValid ? null : error;
        })
        .filter(Boolean) as string[];

      if (validationErrors.length > 0) {
        console.log(
          '❌ [CMSImageGallery] Validation errors found:',
          validationErrors
        );
        Alert.alert('Image Validation Error', validationErrors.join('\n\n'), [
          { text: 'OK' },
        ]);
        return;
      }

      console.log('✅ [CMSImageGallery] All images validated successfully');
      // Convert to ImageItems
      const imageItems: ImageItem[] = newImages.map((img, index) => {
        const imageItem = {
          ...img,
          id: `temp_${Date.now()}_${Math.random()}`,
          isPrimary: images.length === 0 && index === 0, // First image becomes primary
        };
        console.log(
          `📝 [CMSImageGallery] Created image item ${index + 1}:`,
          imageItem
        );
        return imageItem;
      });

      console.log(
        '📤 [CMSImageGallery] Calling onImagesChange with updated images'
      );
      const updatedImages = [...images, ...imageItems];
      console.log(
        '📤 [CMSImageGallery] Updated images:',
        updatedImages.length,
        'total'
      );
      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  /**
   * Handle image deletion
   */
  const handleDeleteImage = useCallback(
    (imageId: string) => {
      Alert.alert(
        'Delete Image',
        'Are you sure you want to delete this image?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              const updatedImages = images.filter((img) => img.id !== imageId);

              // If deleted image was primary, make first remaining image primary
              if (updatedImages.length > 0) {
                const deletedImage = images.find((img) => img.id === imageId);
                if (deletedImage?.isPrimary) {
                  updatedImages[0].isPrimary = true;
                }
              }

              onImagesChange(updatedImages);
            },
          },
        ]
      );
    },
    [images, onImagesChange]
  );

  /**
   * Handle setting image as primary
   */
  const handleSetPrimary = useCallback(
    (imageId: string) => {
      const updatedImages = images.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      }));

      onImagesChange(updatedImages);
    },
    [images, onImagesChange]
  );

  /**
   * Render individual image item
   */
  const renderImageItem = useCallback(
    (image: ImageItem) => {
      return (
        <View key={image.id} style={styles.imageContainer}>
          <Image
            source={{ uri: image.uri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />

          {/* Primary badge */}
          {image.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryText}>PRIMARY</Text>
            </View>
          )}

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteImage(image.id)}
            disabled={disabled}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>

          {/* Set as primary button */}
          {!image.isPrimary && (
            <TouchableOpacity
              style={styles.imageOverlay}
              onPress={() => handleSetPrimary(image.id)}
              disabled={disabled}
              activeOpacity={0.8}
            >
              <View style={styles.setPrimaryButton}>
                <Text style={styles.setPrimaryText}>Set as Primary</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Caption */}
          {showCaptions && image.caption && (
            <View style={styles.caption}>
              <Text style={styles.captionText}>{image.caption}</Text>
            </View>
          )}
        </View>
      );
    },
    [styles, disabled, showCaptions, handleDeleteImage, handleSetPrimary]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Business Images</Text>
        <Text style={styles.counter}>
          {images.length}/{maxImages}
        </Text>
      </View>

      {/* Image Grid */}
      {images.length > 0 ? (
        <View style={styles.grid}>{images.map(renderImageItem)}</View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyText}>No images added yet</Text>
          <Text style={styles.emptySubtext}>
            Add photos to showcase your business
          </Text>
        </View>
      )}

      {/* Image Picker */}
      <CMSImagePicker
        onImagesSelected={handleImagesSelected}
        maxImages={maxImages}
        currentImageCount={images.length}
        disabled={disabled}
      />
    </View>
  );
}
