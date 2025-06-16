/**
 * Staff Filter Controls Component
 *
 * Provides search and role filtering controls for staff management.
 * Part of the atomic design refactoring following the smart hook/dumb component pattern.
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { CMSInput, CMSText } from '@/components/atoms';
import { useTheme } from '@/constants/useTheme';
import { type UserRole } from '@/schemas';

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

interface StaffFilterControlsProps {
  searchQuery: string;
  selectedRole: UserRole | '';
  onSearchChange: (query: string) => void;
  onRoleFilterChange: (role: UserRole | '') => void;
}

export default function StaffFilterControls({
  searchQuery,
  selectedRole,
  onSearchChange,
  onRoleFilterChange,
}: StaffFilterControlsProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.filtersSection}>
      <CMSInput
        label="Search Staff"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChangeText={onSearchChange}
      />

      <View style={styles.roleFilter}>
        <CMSText type="caption" style={styles.filterLabel}>
          Filter by Role:
        </CMSText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <RoleChip
            label="All Roles"
            isSelected={selectedRole === ''}
            onPress={() => onRoleFilterChange('')}
          />
          {STAFF_ROLES.map((role) => (
            <RoleChip
              key={role}
              label={ROLE_LABELS[role]}
              isSelected={selectedRole === role}
              onPress={() => onRoleFilterChange(role)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

interface RoleChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function RoleChip({ label, isSelected, onPress }: RoleChipProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[
        styles.roleChip,
        isSelected && { backgroundColor: colors.primary },
      ]}
      onPress={onPress}
    >
      <CMSText
        type="caption"
        style={[
          styles.roleChipText,
          isSelected && { color: colors.background },
        ]}
      >
        {label}
      </CMSText>
    </TouchableOpacity>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
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
      color: colors.text,
    },
    roleChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 16,
    },
    roleChipText: {
      color: colors.textSecondary,
      fontWeight: '500',
    },
  });
