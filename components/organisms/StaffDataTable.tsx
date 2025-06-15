'use client';

import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { CMSButton, CMSInput, CMSText } from '@/components/atoms';
import {
  useStaffListings,
  useUpdateStaffPermissions,
  useUpdateStaffRole,
} from '@/hooks/useUserManagement';
import { type Profile, type StaffPermissions, type UserRole } from '@/schemas';

interface StaffDataTableProps {
  searchQuery?: string;
  selectedRole?: UserRole | '';
  onSearchChange?: (query: string) => void;
  onRoleFilterChange?: (role: UserRole | '') => void;
}

const STAFF_ROLES: UserRole[] = [
  'tourism_admin',
  'business_listing_manager',
  'tourism_content_manager',
  'business_registration_manager',
];

const ROLE_LABELS: Record<UserRole, string> = {
  tourism_admin: 'Tourism Admin',
  business_listing_manager: 'Business Manager',
  tourism_content_manager: 'Content Manager',
  business_registration_manager: 'Registration Manager',
  business_owner: 'Business Owner',
  tourist: 'Tourist',
};

/**
 * Staff Data Table Component
 *
 * Displays staff members in a table format with inline editing capabilities
 * for roles and permissions management.
 */
export default function StaffDataTable({
  searchQuery = '',
  selectedRole = '',
  onSearchChange,
  onRoleFilterChange,
}: StaffDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Data fetching
  const {
    data: staffData,
    isLoading,
    isError,
    error,
    refetch,
  } = useStaffListings({
    searchQuery: searchQuery.trim() || undefined,
    role: selectedRole || undefined,
    page: currentPage,
    limit: 10,
  });

  // Mutations
  const updateRoleMutation = useUpdateStaffRole();
  const updatePermissionsMutation = useUpdateStaffPermissions();

  // Handle role update
  const handleRoleUpdate = (userId: string, newRole: UserRole) => {
    if (!STAFF_ROLES.includes(newRole)) {
      Alert.alert('Error', 'Invalid staff role selected');
      return;
    }

    updateRoleMutation.mutate(
      { userId, newRole },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Staff role updated successfully');
          setEditingUserId(null);
        },
        onError: (error) => {
          Alert.alert('Error', `Failed to update role: ${error.message}`);
        },
      }
    );
  };

  // Handle permission toggle
  const handlePermissionToggle = (
    userId: string,
    permissionKey: keyof StaffPermissions,
    currentValue: boolean
  ) => {
    const newPermissions = {
      [permissionKey]: !currentValue,
    };

    updatePermissionsMutation.mutate(
      { userId, permissions: newPermissions },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Permission updated successfully');
        },
        onError: (error) => {
          Alert.alert('Error', `Failed to update permission: ${error.message}`);
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <CMSText type="body">Loading staff members...</CMSText>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.container}>
        <CMSText type="body" style={styles.errorText}>
          Error loading staff: {error?.message}
        </CMSText>
        <CMSButton
          title="Retry"
          onPress={() => refetch()}
          variant="outline"
          style={styles.retryButton}
        />
      </View>
    );
  }

  const staffMembers = staffData?.data || [];
  const totalCount = staffData?.count || 0;
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <CMSInput
          label="Search Staff"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChangeText={onSearchChange}
          style={styles.searchInput}
        />

        <View style={styles.roleFilter}>
          <CMSText type="caption" style={styles.filterLabel}>
            Filter by Role:
          </CMSText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.roleChip,
                selectedRole === '' && styles.roleChipActive,
              ]}
              onPress={() => onRoleFilterChange?.('')}
            >
              <CMSText
                type="caption"
                style={
                  selectedRole === ''
                    ? styles.roleChipTextActive
                    : styles.roleChipText
                }
              >
                All Roles
              </CMSText>
            </TouchableOpacity>
            {STAFF_ROLES.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleChip,
                  selectedRole === role && styles.roleChipActive,
                ]}
                onPress={() => onRoleFilterChange?.(role)}
              >
                <CMSText
                  type="caption"
                  style={
                    selectedRole === role
                      ? styles.roleChipTextActive
                      : styles.roleChipText
                  }
                >
                  {ROLE_LABELS[role]}
                </CMSText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Staff Count */}
      <View style={styles.headerSection}>
        <CMSText type="subtitle">
          {totalCount} Staff Member{totalCount !== 1 ? 's' : ''}
        </CMSText>
        {selectedRole && (
          <CMSText type="caption" style={styles.filterInfo}>
            Filtered by: {ROLE_LABELS[selectedRole]}
          </CMSText>
        )}
      </View>

      {/* Staff List */}
      {staffMembers.length === 0 ? (
        <View style={styles.emptyState}>
          <CMSText type="body" style={styles.emptyText}>
            {searchQuery || selectedRole
              ? 'No staff members match your search criteria'
              : 'No staff members found'}
          </CMSText>
        </View>
      ) : (
        <ScrollView style={styles.staffList}>
          {staffMembers.map((staff) => (
            <StaffMemberCard
              key={staff.id}
              staff={staff}
              isEditing={editingUserId === staff.id}
              onEdit={() => setEditingUserId(staff.id)}
              onCancelEdit={() => setEditingUserId(null)}
              onRoleUpdate={(newRole) => handleRoleUpdate(staff.id, newRole)}
              onPermissionToggle={(permissionKey, currentValue) =>
                handlePermissionToggle(staff.id, permissionKey, currentValue)
              }
              isUpdating={
                updateRoleMutation.isPending ||
                updatePermissionsMutation.isPending
              }
            />
          ))}
        </ScrollView>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <CMSButton
            title="Previous"
            onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
            style={styles.paginationButton}
          />

          <CMSText type="body" style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </CMSText>

          <CMSButton
            title="Next"
            onPress={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            variant="outline"
            style={styles.paginationButton}
          />
        </View>
      )}
    </View>
  );
}

// Staff Member Card Component
interface StaffMemberCardProps {
  staff: Profile;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onRoleUpdate: (newRole: UserRole) => void;
  onPermissionToggle: (
    permissionKey: keyof StaffPermissions,
    currentValue: boolean
  ) => void;
  isUpdating: boolean;
}

function StaffMemberCard({
  staff,
  isEditing,
  onEdit,
  onCancelEdit,
  onRoleUpdate,
  onPermissionToggle,
  isUpdating,
}: StaffMemberCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(staff.role);

  const displayName =
    staff.first_name && staff.last_name
      ? `${staff.first_name} ${staff.last_name}`
      : staff.email;

  const handleSaveRole = () => {
    if (selectedRole !== staff.role) {
      onRoleUpdate(selectedRole);
    } else {
      onCancelEdit();
    }
  };

  return (
    <View style={styles.staffCard}>
      {/* Basic Info */}
      <View style={styles.staffInfo}>
        <CMSText type="subtitle" style={styles.staffName}>
          {displayName}
        </CMSText>
        <CMSText type="caption" style={styles.staffEmail}>
          {staff.email}
        </CMSText>
        <View style={styles.staffMeta}>
          <CMSText type="caption" style={styles.roleText}>
            {ROLE_LABELS[staff.role]}
          </CMSText>
          <CMSText
            type="caption"
            style={[
              styles.statusText,
              staff.is_verified && styles.verifiedText,
            ]}
          >
            {staff.is_verified ? 'Verified' : 'Unverified'}
          </CMSText>
        </View>
      </View>

      {/* Role Management */}
      <View style={styles.roleSection}>
        {isEditing ? (
          <View style={styles.roleEditSection}>
            <CMSText type="caption" style={styles.sectionLabel}>
              Change Role:
            </CMSText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {STAFF_ROLES.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    selectedRole === role && styles.roleOptionSelected,
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <CMSText
                    type="caption"
                    style={
                      selectedRole === role
                        ? styles.roleOptionTextSelected
                        : styles.roleOptionText
                    }
                  >
                    {ROLE_LABELS[role]}
                  </CMSText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.editActions}>
              <CMSButton
                title="Save"
                onPress={handleSaveRole}
                disabled={isUpdating}
                style={styles.saveButton}
              />
              <CMSButton
                title="Cancel"
                onPress={onCancelEdit}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        ) : (
          <CMSButton
            title="Edit Role"
            onPress={onEdit}
            variant="outline"
            style={styles.editButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  filtersSection: {
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  roleFilter: {
    marginBottom: 8,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  roleChipActive: {
    backgroundColor: '#007AFF',
  },
  roleChipText: {
    color: '#666',
  },
  roleChipTextActive: {
    color: '#fff',
  },
  headerSection: {
    marginBottom: 16,
  },
  filterInfo: {
    marginTop: 4,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    alignSelf: 'center',
  },
  staffList: {
    flex: 1,
  },
  staffCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  staffInfo: {
    marginBottom: 12,
  },
  staffName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  staffEmail: {
    color: '#666',
    marginBottom: 8,
  },
  staffMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  statusText: {
    color: '#ff9500',
  },
  verifiedText: {
    color: '#34c759',
  },
  roleSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  roleEditSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  roleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  roleOptionSelected: {
    backgroundColor: '#007AFF',
  },
  roleOptionText: {
    color: '#666',
  },
  roleOptionTextSelected: {
    color: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paginationButton: {
    minWidth: 80,
  },
  pageInfo: {
    color: '#666',
  },
});
