/**
 * Smart Hook: Staff Management
 *
 * Handles all business logic for staff management:
 * - Data fetching and caching
 * - Role updates and permissions
 * - Delete operations with confirmation
 * - Search and filtering state
 *
 * Following "Smart Hook, Dumb Component" pattern
 */

import { useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/hooks/useAuthModern';
import {
  useQuickDeleteUser,
  useStaffListings,
  useUpdateStaffPermissions,
  useUpdateStaffRole,
} from '@/hooks/useUserManagement';
import { type Profile, type UserRole } from '@/schemas';

interface UseStaffManagementProps {
  searchQuery?: string;
  selectedRole?: UserRole | '';
  page?: number;
  limit?: number;
}

interface DeleteConfirmation {
  visible: boolean;
  staff: Profile | null;
}

export function useStaffManagement({
  searchQuery,
  selectedRole,
  page = 1,
  limit = 10,
}: UseStaffManagementProps = {}) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] =
    useState<DeleteConfirmation>({
      visible: false,
      staff: null,
    });

  // ============================================================================
  // HOOKS
  // ============================================================================
  const { user: currentUser, userProfile } = useAuth();

  // Data fetching
  const {
    data: staffData,
    isLoading,
    isError,
    error,
    refetch,
  } = useStaffListings({
    searchQuery: searchQuery?.trim() || undefined,
    role: selectedRole || undefined,
    page,
    limit,
  });

  // Mutations
  const updateRoleMutation = useUpdateStaffRole();
  const updatePermissionsMutation = useUpdateStaffPermissions();
  const { deleteByEmail, isDeleting } = useQuickDeleteUser();

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const staffMembers = staffData?.data || [];
  const totalCount = staffData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Statistics calculations
  const statistics = {
    total: totalCount,
    admins: staffMembers.filter((s) => s.role === 'tourism_admin').length,
    editors: staffMembers.filter(
      (s) => s.role.includes('content') || s.role.includes('listing')
    ).length,
    active: staffMembers.filter((s) => s.is_verified).length,
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handle role update for a staff member
   */
  const handleRoleUpdate = (userId: string, newRole: UserRole) => {
    const STAFF_ROLES: UserRole[] = [
      'tourism_admin',
      'business_listing_manager',
      'tourism_content_manager',
      'business_registration_manager',
    ];

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

  /**
   * Start editing a staff member's role
   */
  const startEditing = (userId: string) => {
    setEditingUserId(userId);
  };

  /**
   * Cancel editing
   */
  const cancelEditing = () => {
    setEditingUserId(null);
  };

  /**
   * Show delete confirmation modal
   */
  const showDeleteConfirmation = (staff: Profile) => {
    console.log('🔥 DELETE BUTTON CLICKED!');
    console.log('Staff to delete:', staff);
    console.log('Current user:', currentUser);

    // Prevent self-deletion
    if (currentUser?.email === staff.email) {
      console.log('❌ Self-deletion prevented');
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }

    // Only Tourism Admins can delete users
    if (userProfile?.role !== 'tourism_admin') {
      console.log('❌ Permission denied - not tourism admin');
      console.log('Current user role:', userProfile?.role);
      Alert.alert('Error', 'Only Tourism Admins can delete staff members');
      return;
    }

    console.log(
      '✅ About to show confirmation dialog for:',
      staff.first_name,
      staff.last_name
    );

    setConfirmDeleteModal({
      visible: true,
      staff,
    });
  };

  /**
   * Confirm and execute deletion
   */
  const confirmDelete = () => {
    if (confirmDeleteModal.staff) {
      console.log('✅ Deletion confirmed, calling deleteByEmail');
      deleteByEmail(confirmDeleteModal.staff.email);
      setConfirmDeleteModal({ visible: false, staff: null });
    }
  };

  /**
   * Cancel deletion
   */
  const cancelDelete = () => {
    console.log('❌ Deletion cancelled');
    setConfirmDeleteModal({ visible: false, staff: null });
  };

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Data
    staffMembers,
    totalCount,
    totalPages,
    statistics,

    // Loading states
    isLoading,
    isError,
    error,
    isDeleting,

    // Edit state
    editingUserId,

    // Mutation states
    isUpdating:
      updateRoleMutation.isPending || updatePermissionsMutation.isPending,

    // Current user
    currentUser,
    userProfile,

    // Delete confirmation
    confirmDeleteModal,

    // Actions
    handleRoleUpdate,
    startEditing,
    cancelEditing,
    showDeleteConfirmation,
    confirmDelete,
    cancelDelete,
    refetch,
  };
}
