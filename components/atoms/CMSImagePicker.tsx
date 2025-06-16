// filepath: components/atoms/CMSImagePicker.tsx
/**
 * CMSImagePicker Atom Component
 *
 * A reusable image picker component with drag & drop support.
 * Follows atomic design principles and coding guidelines.
 */

import * as ImagePicker from 'expo-image-picker';
import React, { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/constants/useTheme';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageFile {
  uri: string;
  type: string;
  name: string;
  size: number;
}

interface CMSImagePickerProps {
  onImagesSelected: (images: ImageFile[]) => void;
  maxImages?: number;
  currentImageCount?: number;
  disabled?: boolean;
  style?: any;
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
// COMPONENT
// ============================================================================

export default function CMSImagePicker({
  onImagesSelected,
  maxImages = STORAGE_CONFIG.MAX_IMAGES,
  currentImageCount = 0,
  disabled = false,
  style,
}: CMSImagePickerProps) {
  console.log('🖼️ [CMSImagePicker] Component rendered with props:', {
    maxImages,
    currentImageCount,
    disabled,
    hasOnImagesSelected: typeof onImagesSelected === 'function',
  });

  const { theme } = useTheme();

  // Dynamic styles using theme
  const styles = StyleSheet.create({
    container: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120,
    },
    disabled: {
      borderColor: theme.colors.neutral300,
      backgroundColor: theme.colors.backgroundSecondary,
      opacity: 0.6,
    },
    maxReached: {
      borderColor: theme.colors.neutral300,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    content: {
      alignItems: 'center',
    },
    icon: {
      fontSize: 32,
      marginBottom: 8,
    },
    primaryText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    secondaryText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      textAlign: 'center',
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.neutral500,
      textAlign: 'center',
    },
  });

  /**
   * Validate selected image file
   */
  const validateImage = useCallback((asset: ImagePicker.ImagePickerAsset): ImageFile | null => {
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
        asset.fileName || `image_${Date.now()}.${asset.type?.split('/')[1] || 'jpg'}`;

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
      console.error('[CMSImagePicker] Error validating image:', error);
      Alert.alert('Error', 'Failed to process selected image');
      return null;
    }
  }, []);
  /**
   * Handle image selection from gallery
   */
  const selectFromGallery = useCallback(async () => {
    console.log('📱 [CMSImagePicker] selectFromGallery called');
    console.log('📱 [CMSImagePicker] Current state:', { disabled, currentImageCount, maxImages });

    try {
      console.log('📷 [CMSImagePicker] Requesting media library permissions...');
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('📷 [CMSImagePicker] Permission result:', permissionResult);

      if (!permissionResult.granted) {
        console.log('❌ [CMSImagePicker] Permission denied');
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select images'
        );
        return;
      }

      // Calculate remaining slots
      const remainingSlots = maxImages - currentImageCount;
      console.log('🎯 [CMSImagePicker] Remaining slots:', remainingSlots);

      if (remainingSlots <= 0) {
        console.log('❌ [CMSImagePicker] No remaining slots');
        Alert.alert('Maximum Images', `Maximum ${maxImages} images allowed`);
        return;
      }

      console.log('🎯 [CMSImagePicker] Launching image picker with config:', {
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
      });

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: remainingSlots > 1,
        selectionLimit: remainingSlots,
        quality: 0.8,
        exif: false,
      });

      console.log('🎯 [CMSImagePicker] Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('✅ [CMSImagePicker] Images selected:', result.assets.length);

        // Validate and process selected images
        const validImages: ImageFile[] = [];

        for (const asset of result.assets) {
          console.log('🔍 [CMSImagePicker] Validating asset:', asset.uri);
          const validImage = validateImage(asset);
          if (validImage) {
            validImages.push(validImage);
            console.log('✅ [CMSImagePicker] Asset validated successfully');
          } else {
            console.log('❌ [CMSImagePicker] Asset validation failed');
          }
        }

        if (validImages.length > 0) {
          console.log(
            '📤 [CMSImagePicker] Calling onImagesSelected with:',
            validImages.length,
            'images'
          );
          onImagesSelected(validImages);
        } else {
          console.log('❌ [CMSImagePicker] No valid images to select');
        }
      } else {
        console.log('🚫 [CMSImagePicker] User cancelled or no images selected');
      }
    } catch (error) {
      console.error('❌ [CMSImagePicker] Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to select images from gallery');
    }
  }, [maxImages, currentImageCount, onImagesSelected, validateImage, disabled]);

  /**
   * Handle taking photo with camera
   */
  const takePhoto = useCallback(async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow camera access to take photos');
        return;
      }

      // Check remaining slots
      const remainingSlots = maxImages - currentImageCount;
      if (remainingSlots <= 0) {
        Alert.alert('Maximum Images', `Maximum ${maxImages} images allowed`);
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const validImage = validateImage(asset);

        if (validImage) {
          onImagesSelected([validImage]);
        }
      }
    } catch (error) {
      console.error('[CMSImagePicker] Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  }, [maxImages, currentImageCount, onImagesSelected, validateImage]); /**
   * Show action sheet for image selection options
   */
  const showImageOptions = useCallback(() => {
    console.log('🎛️ [CMSImagePicker] showImageOptions called');
    console.log('🎛️ [CMSImagePicker] Component state:', { disabled, currentImageCount, maxImages });

    if (disabled) {
      console.log('❌ [CMSImagePicker] Component is disabled');
      return;
    }

    const remainingSlots = maxImages - currentImageCount;
    if (remainingSlots <= 0) {
      console.log('❌ [CMSImagePicker] Max images reached');
      Alert.alert('Maximum Images', `Maximum ${maxImages} images allowed`);
      return;
    }

    console.log(
      '📱 [CMSImagePicker] Directly calling selectFromGallery (bypassing action sheet for debugging)'
    );
    // For debugging: directly call selectFromGallery instead of showing action sheet
    selectFromGallery();

    // Original action sheet code (commented out for debugging):
    /*
    console.log('📱 [CMSImagePicker] Showing action sheet');
    Alert.alert('Select Image', 'Choose how you want to add an image', [
      {
        text: 'Camera',
        onPress: () => {
          console.log('📸 [CMSImagePicker] Camera selected');
          takePhoto();
        },
      },
      {
        text: 'Photo Library',
        onPress: () => {
          console.log('📚 [CMSImagePicker] Photo Library selected');
          selectFromGallery();
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          console.log('🚫 [CMSImagePicker] User cancelled action sheet');
        },
      },
    ]);
    */
  }, [selectFromGallery, disabled, currentImageCount, maxImages]);

  // ============================================================================
  // RENDER
  // ============================================================================
  const remainingSlots = maxImages - currentImageCount;
  const isMaxReached = remainingSlots <= 0;

  console.log('🎨 [CMSImagePicker] Rendering with state:', {
    remainingSlots,
    isMaxReached,
    disabled,
    currentImageCount,
    maxImages,
  });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        isMaxReached && styles.maxReached,
        style,
      ]}
      onPress={() => {
        console.log('👆 [CMSImagePicker] TouchableOpacity pressed');
        showImageOptions();
      }}
      disabled={disabled || isMaxReached}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.primaryText}>
          {isMaxReached ? 'Maximum Images Reached' : 'Add Images'}{' '}
        </Text>
        <Text style={styles.secondaryText}>
          {isMaxReached
            ? `${currentImageCount}/${maxImages} images selected`
            : `Tap to select up to ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`}
        </Text>
        <Text style={styles.helperText}>Supports JPEG, PNG, WebP • Max 5MB each</Text>
      </View>
    </TouchableOpacity>
  );
}
