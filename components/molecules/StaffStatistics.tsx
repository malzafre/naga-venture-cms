/**
 * Staff Statistics Header Component
 *
 * Displays statistics about staff members in compact dot format.
 * Part of the atomic design refactoring following the smart hook/dumb component pattern.
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CMSButton, CMSText } from '@/components/atoms';
import { useTheme } from '@/constants/useTheme';
import { type Profile } from '@/schemas';

interface StaffStatisticsProps {
  staffMembers: Profile[];
  totalCount: number;
  title?: string;
  onAddStaff?: () => void;
}

export default function StaffStatistics({
  staffMembers,
  totalCount,
  title = 'Staff Management',
  onAddStaff,
}: StaffStatisticsProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Calculate statistics
  const adminCount = useMemo(
    () => staffMembers.filter((s) => s.role === 'tourism_admin').length,
    [staffMembers]
  );

  const managerCount = useMemo(
    () =>
      staffMembers.filter(
        (s) =>
          s.role === 'business_listing_manager' ||
          s.role === 'tourism_content_manager' ||
          s.role === 'business_registration_manager'
      ).length,
    [staffMembers]
  );

  const activeCount = useMemo(
    () => staffMembers.filter((s) => s.is_verified).length,
    [staffMembers]
  );
  return (
    <View style={styles.container}>
      {/* Title and Stats Section */}
      <View style={styles.titleSection}>
        <CMSText type="title" style={styles.title}>
          {title}
        </CMSText>

        {/* Stats Indicators - positioned under title */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, styles.totalDot]} />
            <Text style={styles.statText}>{totalCount} Total</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statDot, styles.adminDot]} />
            <Text style={styles.statText}>{adminCount} Admins</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statDot, styles.managerDot]} />
            <Text style={styles.statText}>{managerCount} Managers</Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statDot, styles.activeDot]} />
            <Text style={styles.statText}>{activeCount} Active</Text>
          </View>
        </View>
      </View>

      {/* Add Button - positioned on the right */}
      {onAddStaff && (
        <CMSButton title="+ Add Staff Member" onPress={onAddStaff} style={styles.addButton} />
      )}
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
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
      color: colors.text,
      marginBottom: 6,
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
      color: colors.textSecondary,
    },

    addButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },

    totalDot: {
      backgroundColor: '#3B82F6', // Blue
    },

    adminDot: {
      backgroundColor: '#F59E0B', // Orange/Amber
    },

    managerDot: {
      backgroundColor: '#10B981', // Green
    },

    activeDot: {
      backgroundColor: '#06B6D4', // Cyan
    },
  });
