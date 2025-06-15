// filepath: components/molecules/BusinessStatsHeader.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface BusinessStatsHeaderProps {
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  suspendedCount: number;
  featuredCount: number;
  verifiedCount: number;
  title?: string;
  subtitle?: string;
}

/**
 * BusinessStatsHeader Molecule Component
 *
 * Displays business statistics in a header format with status indicators
 */
export const BusinessStatsHeader: React.FC<BusinessStatsHeaderProps> = ({
  totalCount,
  activeCount,
  pendingCount,
  suspendedCount,
  featuredCount,
  verifiedCount,
  title = 'Business Management',
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Stats Indicators */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, styles.totalDot]} />
          <Text style={styles.statText}>{totalCount} Total</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statDot, styles.activeDot]} />
          <Text style={styles.statText}>{activeCount} Active</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statDot, styles.pendingDot]} />
          <Text style={styles.statText}>{pendingCount} Pending</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statDot, styles.suspendedDot]} />
          <Text style={styles.statText}>{suspendedCount} Suspended</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statDot, styles.featuredDot]} />
          <Text style={styles.statText}>{featuredCount} Featured</Text>
        </View>

        <View style={styles.statItem}>
          <View style={[styles.statDot, styles.verifiedDot]} />
          <Text style={styles.statText}>{verifiedCount} Verified</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },

  titleSection: {
    flex: 1,
    minWidth: 200,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },

  totalDot: {
    backgroundColor: '#3B82F6',
  },

  activeDot: {
    backgroundColor: '#10B981',
  },

  pendingDot: {
    backgroundColor: '#F59E0B',
  },

  suspendedDot: {
    backgroundColor: '#EF4444',
  },

  featuredDot: {
    backgroundColor: '#7C3AED',
  },

  verifiedDot: {
    backgroundColor: '#06B6D4',
  },
});
