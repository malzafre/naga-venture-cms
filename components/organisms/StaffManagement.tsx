/**
 * Staff Management Container Component
 *
 * Main container for staff management using atomic design components.
 * Follows the smart hook/dumb component pattern.
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CMSButton, CMSText } from '@/components/atoms';
import { ConfirmationModal } from '@/components/molecules/ConfirmationModal';
import StaffFilterControls from '@/components/molecules/StaffFilterControls';
import StaffStatistics from '@/components/molecules/StaffStatistics';
import StaffGrid from '@/components/organisms/StaffGrid';
import { useAuth } from '@/hooks/useAuthModern';
import {
  useQuickDeleteUser,
  useStaffListings,
  useUpdateStaffRole,
} from '@/hooks/useUserManagement';
import { type Profile, type UserRole } from '@/schemas';

interface StaffManagementProps {
  searchQuery?: string;
  selectedRole?: UserRole | '';
  onSearchChange?: (query: string) => void;
  onRoleFilterChange?: (role: UserRole | '') => void;
}

/**
 * Staff Management Component - Refactored with Atomic Design
 *
 * Now uses smaller, reusable components following atomic design principles.
 * All business logic is handled by the smart hooks.
 */
export default function StaffManagement({
  searchQuery = '',
  selectedRole = '',
  onSearchChange,
  onRoleFilterChange,
}: StaffManagementProps) {
  // Local state for UI interactions
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    visible: boolean;
    staff: Profile | null;
  }>({ visible: false, staff: null });

  // Smart hooks for data and mutations
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

  const updateRoleMutation = useUpdateStaffRole();
  const { deleteByEmail, isDeleting } = useQuickDeleteUser();
  const { user: currentUser, userProfile } = useAuth();

  // Event handlers
  const handleRoleUpdate = (userId: string, newRole: UserRole) => {
    updateRoleMutation.mutate(
      { userId, newRole },
      {
        onSuccess: () => {
          setEditingUserId(null);
        },
      }
    );
  };

  const handleDeleteUser = (staff: Profile) => {
    // Security checks
    if (currentUser?.email === staff.email) {
      return;
    }

    if (userProfile?.role !== 'tourism_admin') {
      return;
    }

    setConfirmDeleteModal({
      visible: true,
      staff: staff,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteModal.staff) {
      deleteByEmail(confirmDeleteModal.staff.email);
      setConfirmDeleteModal({ visible: false, staff: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteModal({ visible: false, staff: null });
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
          variant="secondary"
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
      {/* Statistics Header */}
      <StaffStatistics staffMembers={staffMembers} totalCount={totalCount} />

      {/* Search and Filters */}
      <StaffFilterControls
        searchQuery={searchQuery}
        selectedRole={selectedRole}
        onSearchChange={onSearchChange || (() => {})}
        onRoleFilterChange={onRoleFilterChange || (() => {})}
      />

      {/* Staff Grid with Pagination */}
      <StaffGrid
        staffMembers={staffMembers}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        editingUserId={editingUserId}
        searchQuery={searchQuery}
        selectedRole={selectedRole}
        isUpdating={updateRoleMutation.isPending}
        isDeleting={isDeleting}
        currentUserId={currentUser?.id}
        onEdit={setEditingUserId}
        onCancelEdit={() => setEditingUserId(null)}
        onRoleUpdate={handleRoleUpdate}
        onDelete={handleDeleteUser}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={confirmDeleteModal.visible}
        title="Confirm Deletion"
        message={
          confirmDeleteModal.staff
            ? `Are you sure you want to delete ${
                confirmDeleteModal.staff.first_name && confirmDeleteModal.staff.last_name
                  ? `${confirmDeleteModal.staff.first_name} ${confirmDeleteModal.staff.last_name}`
                  : 'this staff member'
              }? This action cannot be undone and will permanently remove their access to the system.`
            : 'Are you sure you want to delete this staff member?'
        }
        confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete'}
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    alignSelf: 'center',
  },
});
