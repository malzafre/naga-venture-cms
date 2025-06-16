/**
 * Modern Staff Card Component
 *
 * Displays individual staff member information in a modern card layout.
 * Part of the atomic design refactoring following the smart hook/dumb component pattern.
 */

import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CMSButton, CMSText } from '@/components/atoms';
import { useTheme } from '@/constants/useTheme';
import { type Profile, type UserRole } from '@/schemas';

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

interface ModernStaffCardProps {
  staff: Profile;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onRoleUpdate: (newRole: UserRole) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
  currentUserId?: string;
}

export default function ModernStaffCard({
  staff,
  isEditing,
  onEdit,
  onCancelEdit,
  onRoleUpdate,
  onDelete,
  isUpdating,
  isDeleting,
  currentUserId,
}: ModernStaffCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(staff.role);
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  const displayName =
    staff.first_name && staff.last_name
      ? `${staff.first_name} ${staff.last_name}`
      : staff.email;

  const initials =
    staff.first_name && staff.last_name
      ? `${staff.first_name[0]}${staff.last_name[0]}`
      : staff.email[0].toUpperCase();

  const handleSaveRole = () => {
    if (selectedRole !== staff.role) {
      onRoleUpdate(selectedRole);
    } else {
      onCancelEdit();
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'tourism_admin':
        return colors.error;
      case 'business_listing_manager':
        return colors.warning;
      case 'tourism_content_manager':
        return colors.success;
      case 'business_registration_manager':
        return colors.info;
      default:
        return colors.text;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  };

  return (
    <View style={[styles.modernStaffCard, { borderColor: colors.border }]}>
      {/* Header with Avatar and Basic Info */}
      <View style={styles.cardHeader}>
        <StaffAvatar
          initials={initials}
          roleColor={getRoleColor(staff.role)}
          isVerified={staff.is_verified}
        />

        <View style={styles.staffDetails}>
          <CMSText type="subtitle" style={styles.staffName}>
            {displayName}
          </CMSText>
          <CMSText
            type="body"
            style={[styles.staffEmail, { color: colors.textSecondary }]}
          >
            {staff.email}
          </CMSText>

          <RoleBadge role={staff.role} roleColor={getRoleColor(staff.role)} />
        </View>

        <View style={styles.cardActions}>
          <ActionButton
            icon="✏️"
            color={colors.primary}
            onPress={onEdit}
            borderColor={colors.border}
          />

          <ActionButton
            icon="🗑️"
            color={colors.error}
            onPress={onDelete}
            borderColor={colors.error}
            disabled={isDeleting || staff.id === currentUserId}
          />
        </View>
      </View>

      {/* Role Editing Section */}
      {isEditing && (
        <RoleEditingSection
          currentRole={staff.role}
          selectedRole={selectedRole}
          onRoleSelect={setSelectedRole}
          onSave={handleSaveRole}
          onCancel={onCancelEdit}
          isUpdating={isUpdating}
          getRoleColor={getRoleColor}
        />
      )}

      {/* Footer with metadata */}
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <CMSText
          type="caption"
          style={[styles.footerText, { color: colors.textSecondary }]}
        >
          📅 Joined {formatDate(staff.created_at)}
        </CMSText>
      </View>
    </View>
  );
}

// Sub-components following atomic design principles

interface StaffAvatarProps {
  initials: string;
  roleColor: string;
  isVerified: boolean;
}

function StaffAvatar({ initials, roleColor, isVerified }: StaffAvatarProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.avatarContainer}>
      <View style={[styles.avatar, { backgroundColor: roleColor }]}>
        <CMSText style={styles.avatarText}>{initials}</CMSText>
      </View>
      {isVerified && (
        <View
          style={[styles.verifiedBadge, { backgroundColor: colors.success }]}
        >
          <CMSText style={styles.verifiedText}>✓</CMSText>
        </View>
      )}
    </View>
  );
}

interface RoleBadgeProps {
  role: UserRole;
  roleColor: string;
}

function RoleBadge({ role, roleColor }: RoleBadgeProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
      <CMSText style={[styles.roleBadgeText, { color: roleColor }]}>
        {ROLE_LABELS[role]}
      </CMSText>
    </View>
  );
}

interface ActionButtonProps {
  icon: string;
  color: string;
  onPress: () => void;
  borderColor: string;
  disabled?: boolean;
}

function ActionButton({
  icon,
  color,
  onPress,
  borderColor,
  disabled = false,
}: ActionButtonProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.actionButton, { borderColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      <CMSText style={[styles.actionButtonText, { color }]}>{icon}</CMSText>
    </TouchableOpacity>
  );
}

interface RoleEditingSectionProps {
  currentRole: UserRole;
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  onSave: () => void;
  onCancel: () => void;
  isUpdating: boolean;
  getRoleColor: (role: UserRole) => string;
}

function RoleEditingSection({
  selectedRole,
  onRoleSelect,
  onSave,
  onCancel,
  isUpdating,
  getRoleColor,
}: RoleEditingSectionProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={[styles.editSection, { borderTopColor: colors.border }]}>
      <CMSText type="caption" style={styles.editLabel}>
        Change Role:
      </CMSText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.roleOptions}
      >
        {STAFF_ROLES.map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.roleOptionChip,
              selectedRole === role && {
                backgroundColor: getRoleColor(role) + '20',
              },
              { borderColor: getRoleColor(role) },
            ]}
            onPress={() => onRoleSelect(role)}
          >
            <CMSText
              type="caption"
              style={[
                styles.roleOptionText,
                selectedRole === role && { color: getRoleColor(role) },
              ]}
            >
              {ROLE_LABELS[role]}
            </CMSText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.editActions}>
        <CMSButton
          title="Save"
          onPress={onSave}
          disabled={isUpdating}
          style={styles.saveButton}
        />
        <CMSButton
          title="Cancel"
          onPress={onCancel}
          variant="secondary"
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    modernStaffCard: {
      backgroundColor: colors.backgroundCard,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      elevation: 2,
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.backgroundCard,
    },
    verifiedText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    staffDetails: {
      flex: 1,
    },
    staffName: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 4,
      color: colors.text,
    },
    staffEmail: {
      fontSize: 14,
      marginBottom: 8,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    roleBadgeText: {
      fontSize: 12,
      fontWeight: '500',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundCard,
    },
    actionButtonText: {
      fontSize: 16,
    },
    editSection: {
      borderTopWidth: 1,
      paddingTop: 16,
      marginTop: 16,
    },
    editLabel: {
      fontWeight: '600',
      marginBottom: 12,
      color: colors.text,
    },
    roleOptions: {
      marginBottom: 16,
    },
    roleOptionChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.backgroundCard,
    },
    roleOptionText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    editActions: {
      flexDirection: 'row',
      gap: 12,
    },
    saveButton: {
      flex: 1,
    },
    cancelButton: {
      flex: 1,
    },
    cardFooter: {
      borderTopWidth: 1,
      paddingTop: 12,
      marginTop: 16,
    },
    footerText: {
      fontSize: 12,
    },
  });
