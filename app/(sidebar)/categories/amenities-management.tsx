/**
 * Amenities Management Page - Presentation Layer
 *
 * Following "Smart Hook, Dumb Component" pattern
 * - All logic handled in useAmenitiesManagementPage hook
 * - This component is purely presentational
 * - Uses existing amenity-specific components from the codebase
 */
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React from 'react';
import {
  ActivityIndicator, // Added Text
  Alert,
  StyleSheet,
  Text, // Added Alert
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AmenityCard } from '@/components/molecules/AmenityCard';
import { AmenityFormModal } from '@/components/molecules/AmenityFormModal';
import { useTheme } from '@/constants/useTheme';
import { useAmenitiesManagementPage } from '@/hooks/useAmenitiesManagement';
import { AmenityComplete } from '@/schemas/amenitiesSchemas';

// ============================================================================
// INTERFACES
// ============================================================================

interface AmenityStatsCardProps {
  title: string;
  value: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress?: () => void;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showAnalytics: boolean;
  onToggleAnalytics: () => void;
  onUnusedPress: () => void;
  totalCount: number;
  filteredCount: number;
}

// ============================================================================
// STATS CARD COMPONENT
// ============================================================================

const AmenityStatsCard: React.FC<AmenityStatsCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <TouchableOpacity
      style={[styles.statsCard, { backgroundColor: colors.backgroundCard }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.statsIcon, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statsValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statsTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  showAnalytics,
  onToggleAnalytics,
  onUnusedPress,
  totalCount,
  filteredCount,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.filterBar, { backgroundColor: colors.background }]}>
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: colors.backgroundCard },
          ]}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search amenities..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      <View style={styles.filterActions}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: showAnalytics
                ? colors.primary
                : colors.backgroundCard,
            },
          ]}
          onPress={onToggleAnalytics}
        >
          <MaterialIcons
            name="analytics"
            size={18}
            color={showAnalytics ? colors.backgroundCard : colors.textSecondary}
          />
        </TouchableOpacity>{' '}
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: colors.backgroundCard },
          ]}
          onPress={onUnusedPress}
        >
          <MaterialIcons
            name="filter-list"
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
        {filteredCount === totalCount
          ? `${totalCount} amenities`
          : `${filteredCount} of ${totalCount} amenities`}
      </Text>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AmenitiesManagementPage: React.FC = () => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const {
    amenities,
    stats,
    analyticsData,
    isLoading,
    isError,
    error,
    isAnalyticsLoading, // Assuming this comes from the hook for analytics section
    filterState,
    modalState,
    showAnalytics,
    // responsivePageSize, // Not used in current template, consider if needed
    handleSearch,
    // handleFilterChange, // Not directly used by FilterBar, consider if needed for other filters
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleDeleteAmenity, // This likely opens the delete confirmation modal
    handleRowPress,
    handleToggleAnalytics,
    handleUnusedPress,
  } = useAmenitiesManagementPage();

  // Early return for loading and error states should use theme.colors directly or ensure `colors` is from `theme`
  if (isLoading && !amenities?.length) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: colors.background }, // Use destructured colors
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading amenities...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          styles.errorContainer,
          { backgroundColor: colors.background }, // Use destructured colors
        ]}
      >
        <MaterialIcons name="error" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error?.message || 'Failed to load amenities'}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Alert.alert(
              'Retry',
              'Refetch logic needs to be implemented in the hook or via queryClient.'
            );
          }}
        >
          <Text
            style={[styles.retryButtonText, { color: colors.backgroundCard }]}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAnalytics = () => {
    if (!showAnalytics) return null;
    if (isAnalyticsLoading) {
      return (
        <View style={styles.analyticsSectionLoading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
            Loading analytics...
          </Text>
        </View>
      );
    }
    if (!analyticsData) return null;

    return (
      <View
        style={[
          styles.analyticsSection,
          { backgroundColor: colors.background }, // Use destructured colors
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Analytics Overview
        </Text>
        <View style={styles.statsGrid}>
          <AmenityStatsCard
            title="Total Amenities"
            value={analyticsData.total_amenities}
            icon="category"
            color={colors.primary}
          />
          <AmenityStatsCard
            title="In Use"
            value={analyticsData.used_amenities}
            icon="check-circle"
            color={colors.success}
          />
          <AmenityStatsCard
            title="Unused"
            value={analyticsData.unused_amenities}
            icon="warning"
            color={colors.warning}
            onPress={handleUnusedPress}
          />
          <AmenityStatsCard
            title="Business Usage"
            value={analyticsData.usage_by_type.business_amenities}
            icon="business"
            color={colors.info}
          />
          <AmenityStatsCard
            title="Room Usage"
            value={analyticsData.usage_by_type.room_amenities}
            icon="hotel"
            color={colors.info}
          />
        </View>
      </View>
    );
  };

  const renderAmenityItem = ({ item }: { item: AmenityComplete }) => (
    <AmenityCard
      amenity={item}
      onPress={() => handleRowPress(item)}
      onEdit={() => handleOpenEditModal(item)}
      onDelete={() => handleDeleteAmenity(item.id)}
      showUsageStats={true}
      showAuditInfo={false}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundCard }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Amenities Management
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={handleOpenCreateModal}
        >
          <MaterialIcons name="add" size={24} color={colors.backgroundCard} />
          <Text
            style={[styles.addButtonText, { color: colors.backgroundCard }]}
          >
            Add Amenity
          </Text>
        </TouchableOpacity>
      </View>{' '}
      <FilterBar
        searchQuery={filterState.searchQuery || ''}
        onSearchChange={handleSearch}
        showAnalytics={showAnalytics}
        onToggleAnalytics={handleToggleAnalytics}
        onUnusedPress={handleUnusedPress}
        totalCount={stats?.total || amenities?.length || 0}
        filteredCount={amenities?.length || 0}
      />
      {renderAnalytics()}
      <View style={styles.listContainer}>
        {isLoading && amenities?.length > 0 && (
          <ActivityIndicator
            style={styles.listLoadingIndicator}
            color={colors.primary}
          />
        )}
        {amenities && amenities.length > 0 ? (
          <FlashList
            data={amenities}
            renderItem={renderAmenityItem}
            estimatedItemSize={100}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: spacing.md }}
            ItemSeparatorComponent={() => (
              <View style={{ height: spacing.sm }} />
            )}
          />
        ) : (
          !isLoading && (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="category"
                size={64}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.emptyStateText, { color: colors.textSecondary }]}
              >
                No amenities found
              </Text>
              <Text
                style={[
                  styles.emptyStateSubtext,
                  { color: colors.textSecondary },
                ]}
              >
                {filterState.searchQuery
                  ? 'Try adjusting your search or filters.'
                  : 'Add your first amenity to get started.'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: colors.primary, marginTop: spacing.lg },
                ]}
                onPress={handleOpenCreateModal}
              >
                <MaterialIcons
                  name="add"
                  size={20}
                  color={colors.backgroundCard}
                />
                <Text
                  style={[
                    styles.addButtonText,
                    { color: colors.backgroundCard, marginLeft: spacing.xs },
                  ]}
                >
                  Add Amenity
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}
      </View>{' '}
      {/* Modals */}
      <AmenityFormModal
        isVisible={modalState.isVisible}
        mode={modalState.mode}
        amenity={modalState.amenity}
        onClose={handleCloseModal}
        onSuccess={() => {
          handleCloseModal();
        }}
      />
    </View>
  );
};

// ============================================================================\
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0', // Use theme color - will be applied by theme.colors.border or similar
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterBar: {
    padding: 16,
    borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0', // Use theme color
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInputContainer: {
    // Added style definition
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    // Added style definition
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4, // Added for spacing
  },
  resultCount: {
    fontSize: 12,
    textAlign: 'center',
  },
  analyticsSection: {
    padding: 16,
  },
  analyticsSectionLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    minHeight: 150, // So it doesn't jump too much
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Or 'space-between'
  },
  statsCard: {
    width: '45%', // Adjust for desired number of cards per row
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    // Add shadow/elevation if needed
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
  },
  listContainer: {
    flex: 1,
  },
  listLoadingIndicator: {
    paddingVertical: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '80%',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    // Add shadow/elevation
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
    // borderColor will be set by theme.colors.border
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Or 'space-around'
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
});

export default AmenitiesManagementPage;
