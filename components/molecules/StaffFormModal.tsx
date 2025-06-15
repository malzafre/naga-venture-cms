'use client';

import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { CMSInput, CMSText } from '@/components/atoms';
import { useCreateStaff } from '@/hooks/useUserManagement';
import { type StaffPermissions, type UserRole } from '@/schemas';

interface StaffFormModalProps {
  visible: boolean;
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

const PERMISSION_LABELS: Record<string, string> = {
  can_manage_users: 'Manage Users & Staff',
  can_manage_businesses: 'Manage Businesses',
  can_manage_tourist_spots: 'Manage Tourist Spots',
  can_manage_events: 'Manage Events',
  can_approve_content: 'Approve Content',
  can_manage_categories: 'Manage Categories',
};

/**
 * Staff Form Modal Component - Floating Modal Design
 *
 * A modern floating modal for creating new staff members with:
 * - Touch outside to dismiss
 * - Smooth fade animations
 * - Professional card-like appearance
 * - Responsive design for different screen sizes
 */
export default function StaffFormModal({
  visible,
  onClose,
  onSuccess,
}: StaffFormModalProps) {
  const createStaffMutation = useCreateStaff();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'business_listing_manager' as UserRole,
  });

  // Permissions state
  const [permissions, setPermissions] = useState<Partial<StaffPermissions>>({
    can_manage_users: false,
    can_manage_businesses: true,
    can_manage_tourist_spots: false,
    can_manage_events: false,
    can_approve_content: false,
    can_manage_categories: false,
  });

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!STAFF_ROLES.includes(formData.role)) {
      newErrors.role = 'Please select a valid staff role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    createStaffMutation.mutate(
      {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role,
        permissions,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Staff member created successfully');
          handleClose();
          onSuccess?.();
        },
        onError: (error) => {
          Alert.alert(
            'Error',
            `Failed to create staff member: ${error.message}`
          );
        },
      }
    );
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      role: 'business_listing_manager',
    });
    setPermissions({
      can_manage_users: false,
      can_manage_businesses: true,
      can_manage_tourist_spots: false,
      can_manage_events: false,
      can_approve_content: false,
      can_manage_categories: false,
    });
    setErrors({});
    onClose();
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission: keyof StaffPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  // Handle role change and set default permissions
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
        can_manage_categories: true,
      },
      tourism_content_manager: {
        can_manage_users: false,
        can_manage_businesses: false,
        can_manage_tourist_spots: true,
        can_manage_events: true,
        can_approve_content: true,
        can_manage_categories: false,
      },
      business_registration_manager: {
        can_manage_users: false,
        can_manage_businesses: true,
        can_manage_tourist_spots: false,
        can_manage_events: false,
        can_approve_content: false,
        can_manage_categories: false,
      },
      business_owner: {},
      tourist: {},
    };

    setPermissions(defaultPermissions[role] || {});
  };

  const descriptions: Record<UserRole, string> = {
    tourism_admin: 'Full system access with all permissions',
    business_listing_manager: 'Manages business listings and approvals',
    tourism_content_manager: 'Manages tourist spots and events',
    business_registration_manager: 'Handles business registrations',
    business_owner: 'Owns and manages businesses',
    tourist: 'Regular platform user',
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <CMSText type="body" style={styles.closeText}>
                  Cancel
                </CMSText>
              </TouchableOpacity>

              <CMSText type="title" style={styles.title}>
                Create Staff Member
              </CMSText>

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.saveButton}
                disabled={createStaffMutation.isPending}
              >
                <CMSText
                  type="body"
                  style={[
                    styles.saveText,
                    createStaffMutation.isPending && styles.saveTextDisabled,
                  ]}
                >
                  {createStaffMutation.isPending ? 'Creating...' : 'Create'}
                </CMSText>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Basic Information */}
              <View style={styles.section}>
                <CMSText type="subtitle" style={styles.sectionTitle}>
                  Basic Information
                </CMSText>

                <View style={styles.inputContainer}>
                  <CMSInput
                    label="Email Address *"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, email: text }))
                    }
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <CMSInput
                    label="First Name *"
                    placeholder="John"
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, firstName: text }))
                    }
                    error={errors.firstName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <CMSInput
                    label="Last Name *"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, lastName: text }))
                    }
                    error={errors.lastName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <CMSInput
                    label="Phone Number"
                    placeholder="+63 912 345 6789"
                    value={formData.phoneNumber}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: text }))
                    }
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Role Selection */}
              <View style={styles.section}>
                <CMSText type="subtitle" style={styles.sectionTitle}>
                  Role Assignment
                </CMSText>

                {errors.role && (
                  <CMSText type="body" style={styles.errorText}>
                    {errors.role}
                  </CMSText>
                )}

                {STAFF_ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={styles.roleOption}
                    onPress={() => handleRoleChange(role)}
                  >
                    <View style={styles.roleContent}>
                      <View
                        style={[
                          styles.roleRadio,
                          formData.role === role && styles.roleRadioSelected,
                        ]}
                      >
                        {formData.role === role && (
                          <View style={styles.roleRadioInner} />
                        )}
                      </View>
                      <View style={styles.roleInfo}>
                        <CMSText type="body" style={styles.roleTitle}>
                          {ROLE_LABELS[role]}
                        </CMSText>
                        <CMSText type="body" style={styles.roleDescription}>
                          {descriptions[role]}
                        </CMSText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Permissions */}
              <View style={styles.section}>
                <CMSText type="subtitle" style={styles.sectionTitle}>
                  Permissions
                </CMSText>

                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.permissionOption}
                    onPress={() =>
                      handlePermissionToggle(key as keyof StaffPermissions)
                    }
                  >
                    <View style={styles.permissionContent}>
                      <View
                        style={[
                          styles.permissionCheckbox,
                          permissions[key as keyof StaffPermissions] &&
                            styles.permissionCheckboxSelected,
                        ]}
                      >
                        {permissions[key as keyof StaffPermissions] && (
                          <CMSText type="body" style={styles.checkmark}>
                            ✓
                          </CMSText>
                        )}
                      </View>
                      <CMSText type="body" style={styles.permissionLabel}>
                        {label}
                      </CMSText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#666',
  },
  title: {
    fontWeight: '600',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  saveTextDisabled: {
    color: '#ccc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  roleOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  roleDescription: {
    color: '#666',
    lineHeight: 16,
  },
  permissionOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  permissionCheckboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  permissionLabel: {
    flex: 1,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 8,
  },
});
