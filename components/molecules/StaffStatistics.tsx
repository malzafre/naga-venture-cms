/**
 * Staff Statistics Header Component
 *
 * Displays statistics about staff members in card format.
 * Part of the atomic design refactoring following the smart hook/dumb component pattern.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CMSText } from '@/components/atoms';
import { useTheme } from '@/constants/useTheme';
import { type Profile } from '@/schemas';

interface StatCardData {
  icon: string;
  value: number;
  label: string;
  color: string;
}

interface StaffStatisticsProps {
  staffMembers: Profile[];
  totalCount: number;
}

export default function StaffStatistics({
  staffMembers,
  totalCount,
}: StaffStatisticsProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  const statistics: StatCardData[] = useMemo(
    () => [
      {
        icon: '👥',
        value: totalCount,
        label: 'Total Staff',
        color: colors.primary,
      },
      {
        icon: '👑',
        value: staffMembers.filter((s) => s.role === 'tourism_admin').length,
        label: 'Admins',
        color: colors.error,
      },
      {
        icon: '✏️',
        value: staffMembers.filter(
          (s) => s.role.includes('content') || s.role.includes('listing')
        ).length,
        label: 'Editors',
        color: colors.success,
      },
      {
        icon: '📊',
        value: staffMembers.filter((s) => s.is_verified).length,
        label: 'Active',
        color: colors.info,
      },
    ],
    [staffMembers, totalCount, colors]
  );

  return (
    <View style={styles.statsContainer}>
      {statistics.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </View>
  );
}

type StatCardProps = StatCardData;

function StatCard({ icon, value, label, color }: StatCardProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <CMSText style={[styles.statIconText, { color }]}>{icon}</CMSText>
      </View>
      <View style={styles.statContent}>
        <CMSText type="title" style={styles.statNumber}>
          {value}
        </CMSText>
        <CMSText type="caption" style={styles.statLabel}>
          {label}
        </CMSText>
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    statsContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      elevation: 2,
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    },
    statIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statIconText: {
      fontSize: 18,
    },
    statContent: {
      flex: 1,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 2,
      color: colors.text,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });
