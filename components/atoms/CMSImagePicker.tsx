// filepath: components/atoms/CMSImagePicker.tsx
/**
 * CMSImagePicker Atom Component
 *
 * A reusable image picker component with drag & drop support.
 * Follows atomic design principles and coding guidelines.
 * Now uses useImagePicker hook for all business logic.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageFile, useImagePicker } from '@/hooks/shared/useImagePicker';
import { useTheme } from '@/hooks/useTheme';

// ============================================================================
// TYPES
// ============================================================================

interface CMSImagePickerProps {
  onImagesSelected: (images: ImageFile[]) => void;
  maxImages?: number;
  currentImageCount?: number;
  disabled?: boolean;
  style?: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function CMSImagePicker({
  onImagesSelected,
  maxImages = 10,
  currentImageCount = 0,
  disabled = false,
  style,
}: CMSImagePickerProps) {
  const { theme } = useTheme();
  const { pickImages, remainingSlots, isMaxReached } = useImagePicker({
    maxImages,
    currentImageCount,
    onImagesSelected,
  });

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

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        isMaxReached && styles.maxReached,
        style,
      ]}
      onPress={() => !disabled && pickImages()}
      disabled={disabled || isMaxReached}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.primaryText}>
          {isMaxReached ? 'Maximum Images Reached' : 'Add Images'}
        </Text>
        <Text style={styles.secondaryText}>
          {isMaxReached
            ? `${currentImageCount}/${maxImages} images selected`
            : `Tap to select up to ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`}
        </Text>
        <Text style={styles.helperText}>
          Supports JPEG, PNG, WebP • Max 5MB each
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export type { ImageFile };
