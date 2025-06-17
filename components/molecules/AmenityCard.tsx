import { DotsThreeVertical, PencilSimple, Trash } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { CMSText } from '@/components/atoms';
import type { AmenityComplete } from '@/schemas/amenitiesSchemas';

/**
 * AmenityCard - Molecule Component
 *
 * A card component for displaying amenity information in lists.
 * Shows usage statistics, audit information, and provides action buttons.
 *
 * Following atomic design principles as a reusable molecule.
 */

interface AmenityCardProps {
  amenity: AmenityComplete;
  onEdit?: (amenity: AmenityComplete) => void;
  onDelete?: (amenity: AmenityComplete) => void;
  onPress?: (amenity: AmenityComplete) => void;
  showUsageStats?: boolean;
  showAuditInfo?: boolean;
  isSelected?: boolean;
}

export const AmenityCard: React.FC<AmenityCardProps> = ({
  amenity,
  onEdit,
  onDelete,
  onPress,
  showUsageStats = true,
  showAuditInfo = false,
  isSelected = false,
}) => {
  const handleEdit = (event: any) => {
    event.stopPropagation();
    onEdit?.(amenity);
  };

  const handleDelete = (event: any) => {
    event.stopPropagation();
    onDelete?.(amenity);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUsageColor = (count: number): string => {
    if (count === 0) return '#999';
    if (count < 5) return '#FF9500';
    if (count < 20) return '#007AFF';
    return '#34C759';
  };

  const getUsageText = (count: number): string => {
    if (count === 0) return 'Not used';
    if (count === 1) return '1 use';
    return `${count} uses`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={() => onPress?.(amenity)}
      activeOpacity={0.7}
    >
      {/* Main Content */}
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.header}>
          {/* Icon and Name */}
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              {amenity.icon_url ? (
                <CMSText style={styles.iconText}>🏷️</CMSText>
              ) : (
                <CMSText style={styles.iconText}>📋</CMSText>
              )}
            </View>
            <View style={styles.nameContainer}>
              <CMSText style={styles.name}>{amenity.name}</CMSText>
              {amenity.icon_url && (
                <CMSText style={styles.iconLabel}>
                  {amenity.icon_url.replace('ph:', '').replace(/-/g, ' ')}
                </CMSText>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <PencilSimple size={18} color="#007AFF" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <Trash size={18} color="#FF3B30" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton}>
              <DotsThreeVertical size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Usage Statistics */}
        {showUsageStats && (
          <View style={styles.statsSection}>
            <View style={styles.statGroup}>
              <View style={styles.statItem}>
                <CMSText style={styles.statLabel}>Businesses</CMSText>
                <CMSText
                  style={[
                    styles.statValue,
                    { color: getUsageColor(amenity.business_count) },
                  ]}
                >
                  {getUsageText(amenity.business_count)}
                </CMSText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <CMSText style={styles.statLabel}>Rooms</CMSText>
                <CMSText
                  style={[
                    styles.statValue,
                    { color: getUsageColor(amenity.room_count) },
                  ]}
                >
                  {getUsageText(amenity.room_count)}
                </CMSText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <CMSText style={styles.statLabel}>Total</CMSText>
                <CMSText
                  style={[
                    styles.statValue,
                    styles.totalStat,
                    { color: getUsageColor(amenity.total_usage) },
                  ]}
                >
                  {getUsageText(amenity.total_usage)}
                </CMSText>
              </View>
            </View>
          </View>
        )}

        {/* Audit Information */}
        {showAuditInfo && (
          <View style={styles.auditSection}>
            <View style={styles.auditRow}>
              <CMSText style={styles.auditLabel}>Created:</CMSText>
              <CMSText style={styles.auditValue}>
                {formatDate(amenity.created_at)}
                {amenity.created_by_profile && (
                  <CMSText style={styles.auditUser}>
                    {' '}
                    by {amenity.created_by_profile.first_name}{' '}
                    {amenity.created_by_profile.last_name}
                  </CMSText>
                )}
              </CMSText>
            </View>
            {amenity.updated_at !== amenity.created_at && (
              <View style={styles.auditRow}>
                <CMSText style={styles.auditLabel}>Updated:</CMSText>
                <CMSText style={styles.auditValue}>
                  {formatDate(amenity.updated_at)}
                  {amenity.updated_by_profile && (
                    <CMSText style={styles.auditUser}>
                      {' '}
                      by {amenity.updated_by_profile.first_name}{' '}
                      {amenity.updated_by_profile.last_name}
                    </CMSText>
                  )}
                </CMSText>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Usage Indicator Bar */}
      {showUsageStats && (
        <View style={styles.usageBar}>
          <View
            style={[
              styles.usageIndicator,
              {
                backgroundColor: getUsageColor(amenity.total_usage),
                opacity: amenity.total_usage === 0 ? 0.3 : 1,
              },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
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
  selectedContainer: {
    borderColor: '#007AFF',
    borderWidth: 2,
    shadowOpacity: 0.1,
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
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
  },
  statsSection: {
    marginTop: 8,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalStat: {
    fontSize: 15,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E1E1E1',
    marginHorizontal: 8,
  },
  auditSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  auditRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  auditLabel: {
    fontSize: 12,
    color: '#666',
    width: 60,
  },
  auditValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  auditUser: {
    color: '#007AFF',
  },
  usageBar: {
    height: 3,
    backgroundColor: '#F0F0F0',
  },
  usageIndicator: {
    height: '100%',
    width: '100%',
  },
});
