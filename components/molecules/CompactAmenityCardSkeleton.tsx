import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SkeletonLoader } from '@/components/atoms/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';

/**
 * CompactAmenityCardSkeleton - Molecule Component
 *
 * Skeleton loading placeholder for CompactAmenityCard component.
 * Matches the compact card structure for grid layout.
 */

export const CompactAmenityCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundCard }]}
    >
      {/* Header with Icon and Actions */}
      <View style={styles.header}>
        <SkeletonLoader width={48} height={48} borderRadius={12} />
        <View style={styles.actions}>
          <SkeletonLoader width={32} height={32} borderRadius={8} />
          <SkeletonLoader width={32} height={32} borderRadius={8} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <SkeletonLoader
          width="85%"
          height={18}
          borderRadius={4}
          style={styles.nameSkeletonTop}
        />
        <SkeletonLoader
          width="65%"
          height={16}
          borderRadius={4}
          style={styles.nameSkeletonBottom}
        />

        {/* Usage Indicator */}
        <View style={styles.usageContainer}>
          <SkeletonLoader width={8} height={8} borderRadius={4} />
          <SkeletonLoader
            width={60}
            height={12}
            borderRadius={4}
            style={styles.usageTextSkeleton}
          />
        </View>

        {/* Date */}
        <SkeletonLoader
          width={45}
          height={12}
          borderRadius={4}
          style={styles.dateSkeleton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameSkeletonTop: {
    marginBottom: 6,
  },
  nameSkeletonBottom: {
    marginBottom: 12,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTextSkeleton: {
    marginLeft: 6,
  },
  dateSkeleton: {
    marginTop: 'auto',
  },
});
