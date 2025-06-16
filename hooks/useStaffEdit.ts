/**
 * Smart Hook: Staff Edit Management
 *
 * Handles all business logic for editing staff members:
 * - Profile updates (name, email, phone)
 * - Role updates
 * - Permissions management
 * - Form validation using schemas
 *
 * Following "Smart Hook, Dumb Component" pattern
 */

import { useState } from 'react';
import { Alert } from 'react-native';

import {
  useUpdateStaffPermissions,
  useUpdateStaffRole,
  useUpdateUserProfile,
} from '@/hooks/useUserManagement';
import {
  type Profile,
  type ProfileUpdateForm,
  ProfileUpdateFormSchema,
  type StaffPermissions,
  StaffPermissionsUpdateSchema,
  type UserRole,
  UserRoleSchema,
} from '@/schemas';

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
    const newErrors: FormErrors = {};

    // Validate profile fields
    try {
      ProfileUpdateFormSchema.parse({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      });
    } catch (validationError: any) {
      validationError.errors?.forEach((err: any) => {
        newErrors[err.path[0] as keyof FormErrors] = err.message;
      });
    } // Validate role
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
        const profileUpdate: ProfileUpdateForm = {
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
          const validatedPermissions = StaffPermissionsUpdateSchema.parse(permissions);
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
    canSubmit: !isLoading && hasUnsavedChanges && Object.keys(errors).length === 0,
  };
}
