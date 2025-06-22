import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { AmenityComplete } from '@/schemas';

/**
 * CompactAmenityCard - Molecule Component
 *
 * A compact card component for displaying amenity information in a grid layout.
 * Simplified design without statistics for better space utilization.
 */

interface CompactAmenityCardProps {
  amenity: AmenityComplete;
  onEdit?: () => void;
  onDelete?: () => void;
  onPress?: () => void;
}

export const CompactAmenityCard: React.FC<CompactAmenityCardProps> = ({
  amenity,
  onEdit,
  onDelete,
  onPress,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const getIconFromUrl = (iconUrl?: string) => {
    if (!iconUrl) return 'category';
    // Extract icon name from phosphor URL format
    const iconName = iconUrl
      .replace('ph:', '')
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return iconName as keyof typeof MaterialIcons.glyphMap;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEdit = (event: any) => {
    event.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (event: any) => {
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.backgroundCard }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with Icon and Actions */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <MaterialIcons
            name={getIconFromUrl(amenity.icon_url || undefined)}
            size={24}
            color={colors.primary}
          />
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.success + '15' },
              ]}
              onPress={handleEdit}
            >
              <MaterialIcons name="edit" size={16} color={colors.success} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: colors.error + '15' },
              ]}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={16} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.name, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {amenity.name}
        </Text>

        {/* Usage Indicator */}
        <View style={styles.usageContainer}>
          <View
            style={[
              styles.usageIndicator,
              {
                backgroundColor:
                  amenity.total_usage > 0
                    ? colors.success
                    : colors.textSecondary,
              },
            ]}
          />
          <Text style={[styles.usageText, { color: colors.textSecondary }]}>
            {amenity.total_usage > 0
              ? `${amenity.total_usage} uses`
              : 'Not used'}
          </Text>
        </View>

        {/* Date */}
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatDate(amenity.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 8,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  usageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    marginTop: 'auto',
  },
});
