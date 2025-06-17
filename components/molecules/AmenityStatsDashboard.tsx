import { ChartBar, TrendDown, TrendUp, Warning } from 'phosphor-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CMSText } from '@/components/atoms';
import { CMSStatCard } from '@/components/molecules';
import { useAmenityUsageAnalytics } from '@/hooks/features/amenities/useAmenitiesManagement';

/**
 * AmenityStatsDashboard - Molecule Component
 *
 * A comprehensive dashboard showing amenity usage statistics and analytics.
 * Displays key metrics, trends, and actionable insights.
 *
 * Following the smart hook pattern for data management.
 */

interface AmenityStatsDashboardProps {
  style?: any;
  onMostUsedPress?: () => void;
  onLeastUsedPress?: () => void;
  onUnusedPress?: () => void;
}

export const AmenityStatsDashboard: React.FC<AmenityStatsDashboardProps> = ({
  style,
  onMostUsedPress,
  onLeastUsedPress,
  onUnusedPress,
}) => {
  const { data: analytics, isLoading, isError } = useAmenityUsageAnalytics();

  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.loadingContainer}>
          <CMSText style={styles.loadingText}>Loading analytics...</CMSText>
        </View>
      </View>
    );
  }

  if (isError || !analytics) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Warning size={24} color="#FF9500" />
          <CMSText style={styles.errorText}>Failed to load analytics</CMSText>
        </View>
      </View>
    );
  }

  const utilizationRate =
    analytics.total_amenities > 0
      ? (analytics.used_amenities / analytics.total_amenities) * 100
      : 0;

  const getUtilizationColor = (): string => {
    if (utilizationRate >= 80) return '#34C759';
    if (utilizationRate >= 60) return '#007AFF';
    if (utilizationRate >= 40) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <ScrollView
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* Overview Cards */}
      <View style={styles.overviewSection}>
        <CMSText style={styles.sectionTitle}>Amenity Overview</CMSText>

        <View style={styles.statsGrid}>
          {' '}
          <CMSStatCard
            title="Total Amenities"
            value={analytics.total_amenities.toString()}
            subtitle="Available amenities"
            style={styles.statCard}
          />
          <CMSStatCard
            title="In Use"
            value={analytics.used_amenities.toString()}
            subtitle={`${utilizationRate.toFixed(1)}% utilization`}
            style={styles.statCard}
            color={getUtilizationColor()}
          />
          <CMSStatCard
            title="Unused"
            value={analytics.unused_amenities.toString()}
            subtitle="Not assigned yet"
            style={styles.statCard}
            color={analytics.unused_amenities > 0 ? '#FF9500' : '#34C759'}
          />
        </View>
      </View>

      {/* Usage Breakdown */}
      <View style={styles.breakdownSection}>
        <CMSText style={styles.sectionTitle}>Usage Breakdown</CMSText>

        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <ChartBar size={20} color="#007AFF" />
              <CMSText style={styles.breakdownTitle}>
                Business Amenities
              </CMSText>
            </View>
            <CMSText style={styles.breakdownValue}>
              {analytics.usage_by_type.business_amenities}
            </CMSText>
            <CMSText style={styles.breakdownSubtitle}>Total uses</CMSText>
          </View>

          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <ChartBar size={20} color="#34C759" />
              <CMSText style={styles.breakdownTitle}>Room Amenities</CMSText>
            </View>
            <CMSText style={styles.breakdownValue}>
              {analytics.usage_by_type.room_amenities}
            </CMSText>
            <CMSText style={styles.breakdownSubtitle}>Total uses</CMSText>
          </View>
        </View>
      </View>

      {/* Top Performers */}
      <View style={styles.performersSection}>
        <View style={styles.performerColumn}>
          <View style={styles.performerHeader}>
            <TrendUp size={20} color="#34C759" />
            <CMSText style={styles.performerTitle}>Most Used</CMSText>
            {onMostUsedPress && (
              <CMSText style={styles.viewAllLink} onPress={onMostUsedPress}>
                View All
              </CMSText>
            )}
          </View>

          <View style={styles.performerList}>
            {analytics.most_used_amenities.slice(0, 3).map((amenity, index) => (
              <View key={amenity.id} style={styles.performerItem}>
                <View style={styles.performerRank}>
                  <CMSText style={styles.rankText}>{index + 1}</CMSText>
                </View>
                <View style={styles.performerInfo}>
                  <CMSText style={styles.performerName}>{amenity.name}</CMSText>
                  <CMSText style={styles.performerCount}>
                    {amenity.usage_count} uses
                  </CMSText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.performerColumn}>
          <View style={styles.performerHeader}>
            <TrendDown size={20} color="#FF9500" />
            <CMSText style={styles.performerTitle}>Least Used</CMSText>
            {onLeastUsedPress && (
              <CMSText style={styles.viewAllLink} onPress={onLeastUsedPress}>
                View All
              </CMSText>
            )}
          </View>

          <View style={styles.performerList}>
            {analytics.least_used_amenities
              .slice(0, 3)
              .map((amenity, index) => (
                <View key={amenity.id} style={styles.performerItem}>
                  <View style={[styles.performerRank, styles.leastUsedRank]}>
                    <CMSText
                      style={[styles.rankText, styles.leastUsedRankText]}
                    >
                      {analytics.least_used_amenities.length - index}
                    </CMSText>
                  </View>
                  <View style={styles.performerInfo}>
                    <CMSText style={styles.performerName}>
                      {amenity.name}
                    </CMSText>
                    <CMSText
                      style={[styles.performerCount, styles.leastUsedCount]}
                    >
                      {amenity.usage_count} uses
                    </CMSText>
                  </View>
                </View>
              ))}
          </View>
        </View>
      </View>

      {/* Insights */}
      {(analytics.unused_amenities > 0 || utilizationRate < 50) && (
        <View style={styles.insightsSection}>
          <CMSText style={styles.sectionTitle}>
            Insights & Recommendations
          </CMSText>

          <View style={styles.insightsList}>
            {' '}
            {analytics.unused_amenities > 0 && (
              <View style={styles.insightItem}>
                <Warning size={16} color="#FF9500" />
                <CMSText style={styles.insightText}>
                  You have {analytics.unused_amenities} unused amenities that
                  could be assigned to improve listings.
                </CMSText>
              </View>
            )}
            {utilizationRate < 50 && (
              <View style={styles.insightItem}>
                <Warning size={16} color="#FF9500" />
                <CMSText style={styles.insightText}>
                  Low utilization rate ({utilizationRate.toFixed(1)}%). Consider
                  reviewing amenity relevance.
                </CMSText>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  breakdownSection: {
    marginBottom: 24,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  breakdownValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  breakdownSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  performersSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  performerColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  performerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  performerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  viewAllLink: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  performerList: {
    gap: 12,
  },
  performerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performerRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leastUsedRank: {
    backgroundColor: '#FF9500',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leastUsedRankText: {
    color: '#FFFFFF',
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  performerCount: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  leastUsedCount: {
    color: '#FF9500',
  },
  insightsSection: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
