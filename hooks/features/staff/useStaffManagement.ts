/**
 * Smart Hook: Staff Management
 *
 * Comprehensive staff management with both listing and editing capabilities:
 * - Data fetching and caching
 * - Role updates and permissions
 * - Delete operations with confirmation
 * - Search and filtering state
 * - Individual staff editing with form validation
 *
 * Consolidates functionality from useStaffEdit for better organization.
 * Following "Smart Hook, Dumb Component" pattern
 */

import { useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/hooks/features/auth/useAuth';
import {
  useQuickDeleteUser,
  useStaffListings,
  useUpdateStaffPermissions,
  useUpdateStaffRole,
  useUpdateUserProfile,
} from '@/hooks/features/user/useUserManagement';
import {
  type Profile,
  type ProfileUpdate,
  ProfileUpdateSchema,
  type StaffPermissions,
  StaffPermissionsUpdateSchema,
  type UserRole,
  UserRoleSchema,
} from '@/schemas';

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

// Staff editing interfaces
interface UseStaffEditProps {
  staff: Profile | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface StaffEditForm {
  first_name: string;
  last_name: string;
  phone_number: string;
  role: UserRole;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role?: string;
  general?: string;
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

/**
 * Staff Edit Hook - Consolidated within Staff Management
 *
 * Handles individual staff member editing with form validation.
 * Previously was in a separate useStaffEdit.ts file.
 */
export function useStaffEdit({ staff, onSuccess, onError }: UseStaffEditProps) {
  // ============================================================================
  // STATE
  // ============================================================================
  const [formData, setFormData] = useState<StaffEditForm>(() => ({
    first_name: staff?.first_name || '',
    last_name: staff?.last_name || '',
    phone_number: staff?.phone_number || '',
    role: staff?.role || 'tourist',
  }));

  const [permissions, setPermissions] = useState<Partial<StaffPermissions>>({
    can_manage_users: false,
    can_manage_businesses: false,
    can_manage_tourist_spots: false,
    can_manage_events: false,
    can_approve_content: false,
    can_manage_categories: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // MUTATIONS
  // ============================================================================
  const updateProfileMutation = useUpdateUserProfile();
  const updateRoleMutation = useUpdateStaffRole();
  const updatePermissionsMutation = useUpdateStaffPermissions();

  // ============================================================================
  // VALIDATION
  // ============================================================================
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}; // Validate profile fields
    try {
      ProfileUpdateSchema.parse({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      });
    } catch (validationError: any) {
      validationError.errors?.forEach((err: any) => {
        newErrors[err.path[0] as keyof FormErrors] = err.message;
      });
    }

    // Validate role
    try {
      UserRoleSchema.parse(formData.role);
    } catch {
      newErrors.role = 'Invalid role selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleFieldChange = (field: keyof StaffEditForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({ ...prev, role }));

    // Set default permissions based on role
    const defaultPermissions: Record<UserRole, Partial<StaffPermissions>> = {
      tourism_admin: {
        can_manage_users: true,
        can_manage_businesses: true,
        can_manage_tourist_spots: true,
        can_manage_events: true,
        can_approve_content: true,
        can_manage_categories: true,
      },
      business_listing_manager: {
        can_manage_users: false,
        can_manage_businesses: true,
        can_manage_tourist_spots: false,
        can_manage_events: false,
        can_approve_content: true,
        can_manage_categories: false,
      },
      tourism_content_manager: {
        can_manage_users: false,
        can_manage_businesses: false,
        can_manage_tourist_spots: true,
        can_manage_events: true,
        can_approve_content: true,
        can_manage_categories: true,
      },
      business_registration_manager: {
        can_manage_users: false,
        can_manage_businesses: true,
        can_manage_tourist_spots: false,
        can_manage_events: false,
        can_approve_content: true,
        can_manage_categories: false,
      },
      business_owner: {
        can_manage_users: false,
        can_manage_businesses: false,
        can_manage_tourist_spots: false,
        can_manage_events: false,
        can_approve_content: false,
        can_manage_categories: false,
      },
      tourist: {
        can_manage_users: false,
        can_manage_businesses: false,
        can_manage_tourist_spots: false,
        can_manage_events: false,
        can_approve_content: false,
        can_manage_categories: false,
      },
    };

    setPermissions(defaultPermissions[role]);
  };

  const handlePermissionToggle = (permission: keyof StaffPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleSubmit = async () => {
    if (!staff?.id) {
      Alert.alert('Error', 'No staff member selected for editing');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Update profile information
      if (
        formData.first_name !== staff.first_name ||
        formData.last_name !== staff.last_name ||
        formData.phone_number !== staff.phone_number
      ) {
        const profileUpdate: ProfileUpdate = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
        };
        await updateProfileMutation.mutateAsync({
          userId: staff.id,
          updateData: profileUpdate,
        });
      }

      // Update role if changed
      if (formData.role !== staff.role) {
        await updateRoleMutation.mutateAsync({
          userId: staff.id,
          newRole: formData.role,
        });
      }

      // Update permissions if staff role supports them
      if (
        [
          'tourism_admin',
          'business_listing_manager',
          'tourism_content_manager',
          'business_registration_manager',
        ].includes(formData.role)
      ) {
        try {
          const validatedPermissions =
            StaffPermissionsUpdateSchema.parse(permissions);
          await updatePermissionsMutation.mutateAsync({
            userId: staff.id,
            permissions: validatedPermissions,
          });
        } catch (permError) {
          console.log('Permissions validation error:', permError);
          // Continue without updating permissions if validation fails
        }
      }

      onSuccess?.();
      Alert.alert('Success', 'Staff member updated successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update staff member';
      setErrors({ general: errorMessage });
      onError?.(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    if (staff) {
      setFormData({
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        phone_number: staff.phone_number || '',
        role: staff.role,
      });
    }
    setErrors({});
    setIsSubmitting(false);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  const hasUnsavedChanges = staff
    ? formData.first_name !== (staff.first_name || '') ||
      formData.last_name !== (staff.last_name || '') ||
      formData.phone_number !== (staff.phone_number || '') ||
      formData.role !== staff.role
    : false;

  const isLoading =
    updateProfileMutation.isPending ||
    updateRoleMutation.isPending ||
    updatePermissionsMutation.isPending ||
    isSubmitting;

  // ============================================================================
  // RETURN
  // ============================================================================
  return {
    // Form state
    formData,
    permissions,
    errors,
    isSubmitting: isLoading,
    hasUnsavedChanges,

    // Handlers
    handleFieldChange,
    handleRoleChange,
    handlePermissionToggle,
    handleSubmit,
    resetForm,

    // Computed
    canSubmit:
      !isLoading && hasUnsavedChanges && Object.keys(errors).length === 0,
  };
}
