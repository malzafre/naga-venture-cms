/**
 * Staff Grid Container Component
 *
 * Manages the display of staff members in a grid layout with pagination.
 * Part of the atomic design refactoring following the smart hook/dumb component pattern.
 */

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CMSButton, CMSText } from '@/components/atoms';
import ModernStaffCard from '@/components/organisms/ModernStaffCard';
import { useTheme } from '@/hooks/useTheme';
import { type Profile, type UserRole } from '@/schemas';

interface StaffGridProps {
  staffMembers: Profile[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  editingUserId: string | null;
  searchQuery: string;
  selectedRole: UserRole | '';
  isUpdating: boolean;
  isDeleting: boolean;
  currentUserId?: string;
  onEdit: (userId: string) => void;
  onCancelEdit: () => void;
  onRoleUpdate: (userId: string, newRole: UserRole) => void;
  onDelete: (staff: Profile) => void;
  onPageChange: (page: number) => void;
}

export default function StaffGrid({
  staffMembers,
  totalCount,
  currentPage,
  totalPages,
  editingUserId,
  searchQuery,
  selectedRole,
  isUpdating,
  isDeleting,
  currentUserId,
  onEdit,
  onCancelEdit,
  onRoleUpdate,
  onDelete,
  onPageChange,
}: StaffGridProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  const ROLE_LABELS: Record<UserRole, string> = {
    tourism_admin: 'Tourism Admin',
    business_listing_manager: 'Business Manager',
    tourism_content_manager: 'Content Manager',
    business_registration_manager: 'Registration Manager',
    business_owner: 'Business Owner',
    tourist: 'Tourist',
  };

  if (staffMembers.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        selectedRole={selectedRole}
        roleLabels={ROLE_LABELS}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StaffHeader
        totalCount={totalCount}
        selectedRole={selectedRole}
        roleLabels={ROLE_LABELS}
      />
      <ScrollView style={styles.staffGrid}>
        <View style={styles.gridContainer}>
          {staffMembers.map((staff) => (
            <View key={staff.id} style={styles.gridItem}>
              <ModernStaffCard
                staff={staff}
                isEditing={editingUserId === staff.id}
                onCancelEdit={onCancelEdit}
                onRoleUpdate={(newRole) => onRoleUpdate(staff.id, newRole)}
                onDelete={() => onDelete(staff)}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                currentUserId={currentUserId}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </View>
  );
}

// Sub-components following atomic design principles

interface EmptyStateProps {
  searchQuery: string;
  selectedRole: UserRole | '';
  roleLabels: Record<UserRole, string>;
}

function EmptyState({ searchQuery, selectedRole }: EmptyStateProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.emptyState}>
      <CMSText type="body" style={styles.emptyText}>
        {searchQuery || selectedRole
          ? 'No staff members match your search criteria'
          : 'No staff members found'}
      </CMSText>
    </View>
  );
}

interface StaffHeaderProps {
  totalCount: number;
  selectedRole: UserRole | '';
  roleLabels: Record<UserRole, string>;
}

function StaffHeader({
  totalCount,
  selectedRole,
  roleLabels,
}: StaffHeaderProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.headerSection}>
      <CMSText type="subtitle" style={styles.headerText}>
        {totalCount} Staff Member{totalCount !== 1 ? 's' : ''}
      </CMSText>
      {selectedRole && (
        <CMSText type="caption" style={styles.filterInfo}>
          Filtered by: {roleLabels[selectedRole]}
        </CMSText>
      )}
    </View>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.pagination}>
      <CMSButton
        title="Previous"
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        variant="secondary"
        style={styles.paginationButton}
      />
      <CMSText type="body" style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </CMSText>
      <CMSButton
        title="Next"
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        variant="secondary"
        style={styles.paginationButton}
      />
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerSection: {
      marginBottom: 16,
    },
    headerText: {
      color: colors.text,
    },
    filterInfo: {
      marginTop: 4,
      color: colors.textSecondary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textSecondary,
    },
    staffGrid: {
      flex: 1,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: 16,
    },
    gridItem: {
      width: '31%', // Approximately 1/3 minus gaps
      minWidth: 280, // Minimum width for readability
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    paginationButton: {
      minWidth: 80,
    },
    pageInfo: {
      color: colors.textSecondary,
    },
  });
