/**
 * Staff Edit Modal Component - Presentation Layer
 *
 * Handles the UI for editing staff member details including:
 * - Basic information (name, phone)
 * - Role assignment with icons
 * - Permissions management
 * - Form validation display
 *
 * Following "Smart Hook, Dumb Component" pattern - all business logic is in useStaffEdit hook
 */

import { Buildings, Check, Compass, Crown, FileText, User, Users, X } from 'phosphor-react-native';
import React, { useEffect, useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CMSInput, CMSText } from '@/components/atoms';
import { useTheme } from '@/constants/useTheme';
import { useStaffEdit } from '@/hooks/useStaffEdit';
import { type Profile, type StaffPermissions, type UserRole } from '@/schemas';

interface StaffEditModalProps {
  visible: boolean;
  staff: Profile | null;
  onClose: () => void;
  onSuccess?: () => void;
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

const ROLE_ICONS: Record<UserRole, React.ComponentType<any>> = {
  tourism_admin: Crown,
  business_listing_manager: Buildings,
  tourism_content_manager: Compass,
  business_registration_manager: FileText,
  business_owner: User,
  tourist: Users,
};

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  tourism_admin: 'Full system access with all permissions',
  business_listing_manager: 'Manages business listings and approvals',
  tourism_content_manager: 'Manages tourist spots and events',
  business_registration_manager: 'Handles business registrations',
  business_owner: 'Owns and manages businesses',
  tourist: 'Regular platform user',
};

const PERMISSION_LABELS: Record<keyof StaffPermissions, string> = {
  id: 'ID',
  profile_id: 'Profile ID',
  can_manage_users: 'Manage Users & Staff',
  can_manage_businesses: 'Manage Businesses',
  can_manage_tourist_spots: 'Manage Tourist Spots',
  can_manage_events: 'Manage Events',
  can_approve_content: 'Approve Content',
  can_manage_categories: 'Manage Categories',
  created_at: 'Created At',
  updated_at: 'Updated At',
};

export default function StaffEditModal({
  visible,
  staff,
  onClose,
  onSuccess,
}: StaffEditModalProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  // ============================================================================
  // SMART HOOK - All business logic handled here
  // ============================================================================
  const {
    formData,
    permissions,
    errors,
    isSubmitting,
    hasUnsavedChanges,
    canSubmit,
    handleFieldChange,
    handleRoleChange,
    handlePermissionToggle,
    handleSubmit,
    resetForm,
  } = useStaffEdit({
    staff,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (visible && staff) {
      resetForm();
    }
  }, [visible, staff, resetForm]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const handleClose = () => {
    if (hasUnsavedChanges) {
      // Could add confirmation dialog here
    }
    resetForm();
    onClose();
  };

  if (!staff) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={handleClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose}>
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={20} color="#666" />
                <CMSText type="body" style={styles.closeText}>
                  Cancel
                </CMSText>
              </TouchableOpacity>

              <CMSText type="title" style={styles.title}>
                Edit Staff Member
              </CMSText>

              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
                disabled={!canSubmit}
              >
                <Check size={20} color={canSubmit ? '#007AFF' : '#999'} />
                <CMSText
                  type="body"
                  style={[styles.saveText, !canSubmit && styles.saveTextDisabled]}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </CMSText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Staff Info Header */}
              <View style={styles.staffInfoHeader}>
                <CMSText type="subtitle" style={styles.staffEmail}>
                  {staff.email}
                </CMSText>
                <CMSText type="caption" style={styles.staffId}>
                  ID: {staff.id}
                </CMSText>
              </View>

              {/* General Error */}
              {errors.general && (
                <View style={styles.errorContainer}>
                  <CMSText type="body" style={styles.errorText}>
                    {errors.general}
                  </CMSText>
                </View>
              )}

              {/* Basic Information */}
              <View style={styles.section}>
                <CMSText type="subtitle" style={styles.sectionTitle}>
                  Basic Information
                </CMSText>

                <View style={styles.inputContainer}>
                  <CMSInput
                    label="First Name *"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChangeText={(text) => handleFieldChange('first_name', text)}
                    error={errors.first_name}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <CMSInput
                    label="Last Name *"
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChangeText={(text) => handleFieldChange('last_name', text)}
                    error={errors.last_name}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <CMSInput
                    label="Phone Number"
                    placeholder="+63 912 345 6789"
                    value={formData.phone_number}
                    onChangeText={(text) => handleFieldChange('phone_number', text)}
                    error={errors.phone_number}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Role Assignment */}
              <View style={styles.section}>
                <CMSText type="subtitle" style={styles.sectionTitle}>
                  Role Assignment
                </CMSText>

                {errors.role && (
                  <CMSText type="body" style={styles.errorText}>
                    {errors.role}
                  </CMSText>
                )}

                {STAFF_ROLES.map((role) => {
                  const IconComponent = ROLE_ICONS[role];
                  const isSelected = formData.role === role;

                  return (
                    <TouchableOpacity
                      key={role}
                      style={[styles.roleOption, isSelected && styles.roleOptionSelected]}
                      onPress={() => handleRoleChange(role)}
                    >
                      <View style={styles.roleContent}>
                        <View style={[styles.roleRadio, isSelected && styles.roleRadioSelected]}>
                          {isSelected && <View style={styles.roleRadioInner} />}
                        </View>

                        <View style={styles.roleIconContainer}>
                          <IconComponent size={24} color={isSelected ? '#007AFF' : '#666'} />
                        </View>

                        <View style={styles.roleInfo}>
                          <CMSText
                            type="body"
                            style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}
                          >
                            {ROLE_LABELS[role]}
                          </CMSText>
                          <CMSText type="caption" style={styles.roleDescription}>
                            {ROLE_DESCRIPTIONS[role]}
                          </CMSText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Permissions - Only show for staff roles */}
              {[
                'tourism_admin',
                'business_listing_manager',
                'tourism_content_manager',
                'business_registration_manager',
              ].includes(formData.role) && (
                <View style={styles.section}>
                  <CMSText type="subtitle" style={styles.sectionTitle}>
                    Permissions
                  </CMSText>

                  <CMSText type="caption" style={styles.permissionsNote}>
                    Permissions are set automatically based on role. You can customize them below.
                  </CMSText>

                  {Object.entries(PERMISSION_LABELS)
                    .filter(([key]) => key.startsWith('can_'))
                    .map(([permission, label]) => (
                      <TouchableOpacity
                        key={permission}
                        style={styles.permissionOption}
                        onPress={() => handlePermissionToggle(permission as keyof StaffPermissions)}
                      >
                        <View style={styles.permissionContent}>
                          <View
                            style={[
                              styles.permissionCheckbox,
                              permissions[permission as keyof StaffPermissions] &&
                                styles.permissionCheckboxChecked,
                            ]}
                          >
                            {permissions[permission as keyof StaffPermissions] && (
                              <Check size={16} color="#fff" />
                            )}
                          </View>
                          <CMSText type="body" style={styles.permissionLabel}>
                            {label}
                          </CMSText>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      width: '100%',
      maxWidth: 600,
      maxHeight: '90%',
      backgroundColor: colors.background,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      gap: 4,
    },
    closeText: {
      color: '#666',
    },
    title: {
      fontWeight: '600',
      color: colors.text,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      gap: 4,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveText: {
      color: '#007AFF',
      fontWeight: '600',
    },
    saveTextDisabled: {
      color: '#999',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    staffInfoHeader: {
      marginBottom: 24,
      padding: 16,
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    staffEmail: {
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    staffId: {
      color: colors.textSecondary,
    },
    errorContainer: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: '#fef2f2',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#fecaca',
    },
    errorText: {
      color: '#dc2626',
      fontSize: 14,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontWeight: '600',
      marginBottom: 16,
      color: colors.text,
    },
    inputContainer: {
      marginBottom: 16,
    },
    roleOption: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    roleOptionSelected: {
      borderColor: '#007AFF',
      backgroundColor: '#f0f8ff',
    },
    roleContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    roleRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#ccc',
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    roleRadioSelected: {
      borderColor: '#007AFF',
    },
    roleRadioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#007AFF',
    },
    roleIconContainer: {
      marginRight: 12,
      marginTop: 2,
    },
    roleInfo: {
      flex: 1,
    },
    roleTitle: {
      fontWeight: '500',
      marginBottom: 4,
      color: colors.text,
    },
    roleTitleSelected: {
      color: '#007AFF',
    },
    roleDescription: {
      color: colors.textSecondary,
      lineHeight: 16,
    },
    permissionsNote: {
      color: colors.textSecondary,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    permissionOption: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    permissionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    permissionCheckbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#ccc',
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    permissionCheckboxChecked: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    permissionLabel: {
      flex: 1,
      color: colors.text,
    },
  });
