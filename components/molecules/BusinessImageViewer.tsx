// filepath: components/molecules/BusinessImageViewer.tsx
/**
 * BusinessImageViewer Molecule Component
 *
 * Displays business images in a clean, grid layout with lightbox functionality.
 * Follows atomic design principles and coding guidelines.
 */

import { Image } from 'expo-image';
import { ImageSquare, X } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/constants/useTheme';

// ============================================================================
// TYPES
// ============================================================================

interface BusinessImageViewerImage {
  id: string;
  image_url: string;
  caption?: string | null;
  is_primary: boolean;
  display_order: number;
}

interface BusinessImageViewerProps {
  images: {
    id: string;
    image_url?: string | null | undefined;
    caption?: string | null | undefined;
    is_primary: boolean;
    display_order: number;
  }[];
  title?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const IMAGE_SPACING = 8;
const IMAGES_PER_ROW = 3;
const IMAGE_SIZE =
  (screenWidth - 40 - IMAGE_SPACING * (IMAGES_PER_ROW - 1)) / IMAGES_PER_ROW;

// ============================================================================
// COMPONENT
// ============================================================================

export default function BusinessImageViewer({
  images,
  title = 'Business Images',
}: BusinessImageViewerProps) {
  console.log('🖼️ [BusinessImageViewer] Component rendered');
  console.log('🖼️ [BusinessImageViewer] Images prop:', images);
  console.log('🖼️ [BusinessImageViewer] Images length:', images?.length || 0);
  const { theme } = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  // Filter out images with invalid URLs
  const validImages =
    images?.filter(
      (image): image is BusinessImageViewerImage =>
        image &&
        typeof image.image_url === 'string' &&
        image.image_url.trim().length > 0
    ) || [];

  console.log(
    '🖼️ [BusinessImageViewer] Valid images after filtering:',
    validImages
  );

  // Early return if no valid images
  if (validImages.length === 0) {
    console.log(
      '🖼️ [BusinessImageViewer] No valid images to display, returning early'
    );
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <ImageSquare size={48} color={theme.colors.neutral100} />
        <Text style={{ color: theme.colors.textMuted, marginTop: 8 }}>
          No images available
        </Text>
      </View>
    );
  }

  // Debug each valid image
  validImages.forEach((image, index) => {
    console.log(
      `🖼️ [BusinessImageViewer] Processing valid image ${index}:`,
      image
    );
  });

  // Sort images by display_order and primary status
  const sortedImages = [...validImages].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  console.log('🖼️ [BusinessImageViewer] Sorted images:', sortedImages);

  // Dynamic styles using theme
  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginLeft: 8,
    },
    imageCount: {
      fontSize: 14,
      color: theme.colors.neutral500,
      marginLeft: 'auto',
    },
    grid: {
      paddingHorizontal: 0,
    },
    imageContainer: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      marginRight: IMAGE_SPACING,
      marginBottom: IMAGE_SPACING,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    primaryBadge: {
      position: 'absolute',
      top: 4,
      left: 4,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    primaryText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    captionOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 4,
    },
    captionText: {
      fontSize: 10,
      color: '#FFFFFF',
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.neutral200,
      borderStyle: 'dashed',
    },
    emptyIcon: {
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.neutral500,
      textAlign: 'center',
    },
    // Modal styles
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 50, // Account for status bar
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    closeButton: {
      padding: 8,
    },
    modalScrollView: {
      flex: 1,
    },
    modalImageContainer: {
      width: screenWidth,
      height: screenHeight * 0.7,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalImage: {
      width: screenWidth - 32,
      height: '100%',
      borderRadius: 8,
    },
    modalCaption: {
      padding: 16,
      alignItems: 'center',
    },
    modalCaptionText: {
      fontSize: 16,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    modalImageCounter: {
      padding: 16,
      alignItems: 'center',
    },
    modalCounterText: {
      fontSize: 14,
      color: '#CCCCCC',
    },
  });
  const renderImageItem = ({
    item,
    index,
  }: {
    item: BusinessImageViewerImage;
    index: number;
  }) => {
    console.log(
      `🖼️ [BusinessImageViewer] Rendering image item ${index}:`,
      item
    );
    console.log(`🖼️ [BusinessImageViewer] Image URL:`, item.image_url);

    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => setSelectedImageIndex(index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder="📷"
          onError={(error) => {
            console.error('🖼️ [BusinessImageViewer] Image load error:', error);
            console.error(
              '🖼️ [BusinessImageViewer] Failed image URL:',
              item.image_url
            );
          }}
          onLoad={() => {
            console.log(
              '🖼️ [BusinessImageViewer] Image loaded successfully:',
              item.image_url
            );
          }}
        />

        {item.is_primary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryText}>PRIMARY</Text>
          </View>
        )}

        {item.caption && (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionText} numberOfLines={1}>
              {item.caption}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  const renderModalImage = (image: BusinessImageViewerImage, index: number) => (
    <ScrollView
      key={image.id}
      style={styles.modalScrollView}
      contentContainerStyle={styles.modalImageContainer}
      maximumZoomScale={3}
      minimumZoomScale={1}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Image
        source={{ uri: image.image_url }}
        style={styles.modalImage}
        contentFit="contain"
        transition={300}
      />
    </ScrollView>
  );

  if (!images || images.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ImageSquare size={20} color={theme.colors.neutral500} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.emptyState}>
          <ImageSquare
            size={32}
            color={theme.colors.neutral500}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No images available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ImageSquare size={20} color={theme.colors.primary} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.imageCount}>
          {images.length} image{images.length === 1 ? '' : 's'}
        </Text>
      </View>
      <FlatList
        data={sortedImages}
        renderItem={renderImageItem}
        keyExtractor={(item) => item.id}
        numColumns={IMAGES_PER_ROW}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        ItemSeparatorComponent={() => (
          <View style={{ height: IMAGE_SPACING }} />
        )}
      />
      {/* Lightbox Modal */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedImageIndex(null)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedImageIndex !== null &&
              sortedImages[selectedImageIndex]?.is_primary
                ? 'Primary Image'
                : 'Business Image'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImageIndex(null)}
            >
              <X size={24} color="#FFFFFF" weight="bold" />
            </TouchableOpacity>
          </View>

          {selectedImageIndex !== null &&
            sortedImages[selectedImageIndex] &&
            renderModalImage(
              sortedImages[selectedImageIndex],
              selectedImageIndex
            )}

          {selectedImageIndex !== null &&
            sortedImages[selectedImageIndex]?.caption && (
              <View style={styles.modalCaption}>
                <Text style={styles.modalCaptionText}>
                  {sortedImages[selectedImageIndex].caption}
                </Text>
              </View>
            )}

          <View style={styles.modalImageCounter}>
            <Text style={styles.modalCounterText}>
              {(selectedImageIndex || 0) + 1} of {sortedImages.length}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
