'use client';

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { CMSButton, CMSText } from '@/components/atoms';
import { StaffFormModal } from '@/components/molecules';
import { StaffManagement } from '@/components/organisms';
import { useTheme } from '@/constants/useTheme';
import { useStaffListings } from '@/hooks/useUserManagement';
import { type UserRole } from '@/schemas';

// Staff roles that can be managed
const STAFF_ROLES: UserRole[] = [
  'tourism_admin',
  'business_listing_manager',
  'tourism_content_manager',
  'business_registration_manager',
];

/**
 * Staff Management Page - Tourism Admin Interface
 *
 * Comprehensive staff management system allowing Tourism Admins to:
 * - View all staff members and their roles
 * - Create new staff accounts with specific permissions
 * - Edit existing staff roles and permissions
 * - Manage access control and security settings
 */
export default function StaffManagementScreen() {
  const _router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get staff data for statistics
  const { data: allStaffData, isLoading } = useStaffListings({
    page: 1,
    limit: 1000, // Get all for statistics
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const allStaff = allStaffData?.data || [];

    const totalStaff = allStaff.length;
    const adminCount = allStaff.filter(
      (staff) => staff.role === 'tourism_admin'
    ).length;
    const managerCount = allStaff.filter(
      (staff) =>
        staff.role === 'business_listing_manager' ||
        staff.role === 'tourism_content_manager' ||
        staff.role === 'business_registration_manager'
    ).length;
    const activeCount = allStaff.filter((staff) => staff.is_verified).length;

    return {
      total: totalStaff,
      admins: adminCount,
      managers: managerCount,
      active: activeCount,
    };
  }, [allStaffData]);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    Alert.alert('Success', 'Staff member has been created successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <CMSText type="title" style={styles.title}>
                Staff Management
              </CMSText>
              <CMSText type="body" style={styles.subtitle}>
                Manage your team members and their permissions
              </CMSText>
            </View>
            <CMSButton
              title="+ Add Staff Member"
              onPress={() => setShowCreateModal(true)}
              style={styles.addButton}
            />
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: theme.colors.primaryLight },
                ]}
              >
                <CMSText
                  type="title"
                  style={[styles.statNumber, { color: theme.colors.primary }]}
                >
                  {stats.total}
                </CMSText>
              </View>
              <CMSText type="caption" style={styles.statLabel}>
                Total Staff
              </CMSText>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FFF4E6' }]}>
                <CMSText
                  type="title"
                  style={[styles.statNumber, { color: '#E58A3B' }]}
                >
                  {stats.admins}
                </CMSText>
              </View>
              <CMSText type="caption" style={styles.statLabel}>
                Admins
              </CMSText>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E8F5E8' }]}>
                <CMSText
                  type="title"
                  style={[styles.statNumber, { color: theme.colors.success }]}
                >
                  {stats.managers}
                </CMSText>
              </View>
              <CMSText type="caption" style={styles.statLabel}>
                Managers
              </CMSText>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                <CMSText
                  type="title"
                  style={[styles.statNumber, { color: theme.colors.accent }]}
                >
                  {stats.active}
                </CMSText>
              </View>
              <CMSText type="caption" style={styles.statLabel}>
                Active
              </CMSText>
            </View>
          </View>
        </View>

        {/* Staff Management Container */}
        <View style={styles.contentContainer}>
          <StaffManagement
            searchQuery={searchQuery}
            selectedRole={selectedRole}
            onSearchChange={setSearchQuery}
            onRoleFilterChange={setSelectedRole}
          />
        </View>
      </ScrollView>

      {/* Create Staff Modal */}
      <StaffFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      backgroundColor: theme.colors.background,
      padding: 16,
      marginBottom: 2,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    headerText: {
      flex: 1,
      marginRight: 16,
    },
    title: {
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    subtitle: {
      color: theme.colors.textSecondary,
    },
    addButton: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '600',
    },
    statLabel: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    contentContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 16,
    },
  });
