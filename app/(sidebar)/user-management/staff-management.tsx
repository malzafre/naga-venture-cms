'use client';

import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { StaffFormModal } from '@/components/molecules';
import { StaffManagement } from '@/components/organisms';
import { useTheme } from '@/hooks/useTheme';
import { type UserRole } from '@/schemas';

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
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    Alert.alert('Success', 'Staff member has been created successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Staff Data Table */}
        <View style={styles.contentContainer}>
          <StaffManagement
            searchQuery={searchQuery}
            selectedRole={selectedRole}
            onSearchChange={setSearchQuery}
            onRoleFilterChange={setSelectedRole}
            onAddStaff={() => setShowCreateModal(true)}
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
    contentContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 8,
    },
  });
