'use client';

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { CMSButton, CMSText } from '@/components/atoms';
import { StaffFormModal } from '@/components/molecules';
import { StaffDataTable } from '@/components/organisms';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get initial data to show count
  const { data: staffData, isLoading } = useStaffListings({
    searchQuery: searchQuery.trim() || undefined,
    role: selectedRole || undefined,
    page: 1,
    limit: 10,
  });

  const totalStaff = staffData?.count || 0;

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    Alert.alert('Success', 'Staff member has been created successfully!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header Section */}
        <View style={{ padding: 16, backgroundColor: '#fff', marginBottom: 2 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <CMSText type="title" style={{ fontWeight: '600' }}>
              Staff Management
            </CMSText>
            <CMSButton
              title="Add Staff"
              onPress={() => setShowCreateModal(true)}
              style={{ minWidth: 100 }}
            />
          </View>

          <CMSText type="body" style={{ color: '#666' }}>
            {isLoading
              ? 'Loading staff members...'
              : `Manage ${totalStaff} staff member${totalStaff !== 1 ? 's' : ''} and their permissions`}
          </CMSText>
        </View>

        {/* Staff Data Table */}
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <StaffDataTable
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
