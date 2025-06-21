import React from 'react';
import { StyleSheet, View } from 'react-native';

import { SkeletonLoader } from '@/components/atoms/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';

/**
 * AmenityCardSkeleton - Molecule Component
 *
 * Skeleton loading placeholder for AmenityCard component.
 * Matches the visual structure of the actual card for smooth loading experience.
 */

export const AmenityCardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundCard }]}
    >
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          {/* Icon and Name */}
          <View style={styles.titleSection}>
            <SkeletonLoader
              width={40}
              height={40}
              borderRadius={8}
              style={styles.iconSkeleton}
            />
            <View style={styles.nameContainer}>
              <SkeletonLoader width="70%" height={18} borderRadius={4} />
              <View style={{ height: 4 }} />
              <SkeletonLoader width="40%" height={14} borderRadius={4} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <SkeletonLoader width={34} height={34} borderRadius={6} />
            <SkeletonLoader width={34} height={34} borderRadius={6} />
            <SkeletonLoader width={34} height={34} borderRadius={6} />
          </View>
        </View>

        {/* Usage Statistics */}
        <View style={styles.statsSection}>
          <View
            style={[styles.statGroup, { backgroundColor: colors.background }]}
          >
            <View style={styles.statItem}>
              <SkeletonLoader width={50} height={12} borderRadius={4} />
              <View style={{ height: 4 }} />
              <SkeletonLoader width={35} height={16} borderRadius={4} />
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <SkeletonLoader width={40} height={12} borderRadius={4} />
              <View style={{ height: 4 }} />
              <SkeletonLoader width={30} height={16} borderRadius={4} />
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <SkeletonLoader width={30} height={12} borderRadius={4} />
              <View style={{ height: 4 }} />
              <SkeletonLoader width={40} height={16} borderRadius={4} />
            </View>
          </View>
        </View>
      </View>

      {/* Usage Indicator Bar */}
      <View style={styles.usageBar}>
        <SkeletonLoader width="100%" height={3} borderRadius={0} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconSkeleton: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsSection: {
    marginTop: 8,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E1E1E1',
    marginHorizontal: 8,
  },
  usageBar: {
    height: 3,
    backgroundColor: '#F0F0F0',
  },
});
