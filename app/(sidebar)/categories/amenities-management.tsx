/**
 * Amenities Management Page - Compact Grid Layout
 * * Following "Smart Hook, Dumb Component" pattern
 * - All logic handled in useAmenitiesManagementPage hook
 * - Compact card-based grid layout (2-3 columns)
 * - AmenityFormContent modal for create/edit operations
 * - No analytics/statistics - focused on core CRUD operations
 */
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AmenityFormContent } from '@/components/molecules/AmenityFormContent';
import { CompactAmenityCard } from '@/components/molecules/CompactAmenityCard';
import { CompactAmenityCardSkeleton } from '@/components/molecules/CompactAmenityCardSkeleton';
import {
  SortDropdown,
  type SortOption,
} from '@/components/molecules/SortDropdown';
import { useTheme } from '@/constants/useTheme';
import { useAmenitiesManagementPage } from '@/hooks/features/amenities/useAmenitiesManagement';
import { AmenityComplete } from '@/schemas/amenitiesSchemas';

// ============================================================================
// INTERFACES
// ============================================================================

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortValue: string;
  onSortChange: (sortKey: string) => void;
  totalCount: number;
}

// ============================================================================
// FILTER BAR COMPONENT
// ============================================================================

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  sortValue,
  onSortChange,
  totalCount,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const sortOptions: SortOption[] = [
    { key: 'name_asc', label: 'Name (A-Z)', direction: 'asc' },
    { key: 'name_desc', label: 'Name (Z-A)', direction: 'desc' },
    { key: 'created_at_desc', label: 'Newest First', direction: 'desc' },
    { key: 'created_at_asc', label: 'Oldest First', direction: 'asc' },
    { key: 'total_usage_desc', label: 'Most Used', direction: 'desc' },
    { key: 'total_usage_asc', label: 'Least Used', direction: 'asc' },
  ];

  return (
    <View style={[styles.filterBar, { backgroundColor: colors.background }]}>
      {/* Search Input */}
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

      {/* Actions Row */}
      <View style={styles.actionsRow}>
        <SortDropdown
          options={sortOptions}
          selectedSort={sortValue}
          onSortChange={onSortChange}
        />

        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {totalCount} amenities
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AmenitiesManagementPage: React.FC = () => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const screenWidth = Dimensions.get('window').width;

  // Determine number of columns based on screen width
  const numColumns = screenWidth > 768 ? 3 : 2;
  const cardWidth =
    (screenWidth - spacing.md * 2 - spacing.sm * (numColumns - 1)) / numColumns;
  const {
    amenities,
    isLoading,
    isError,
    error,
    searchInput,
    filterState,
    modalState,
    handleSearch,
    handleSortChange,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleDeleteAmenity,
    handleRowPress,
  } = useAmenitiesManagementPage();

  // Render amenity card item (must be before early returns to follow Rules of Hooks)
  const renderAmenityItem = useCallback(
    ({ item }: { item: AmenityComplete }) => (
      <View style={[styles.cardWrapper, { width: cardWidth }]}>
        <CompactAmenityCard
          amenity={item}
          onPress={() => handleRowPress(item)}
          onEdit={() => handleOpenEditModal(item)}
          onDelete={() => handleDeleteAmenity(item.id)}
        />
      </View>
    ),
    [cardWidth, handleRowPress, handleOpenEditModal, handleDeleteAmenity]
  );

  // Early returns for loading and error states
  if (isLoading && !amenities?.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[styles.header, { backgroundColor: colors.backgroundCard }]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Amenities Management
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Manage amenities for your business listings
          </Text>
        </View>

        <View style={styles.skeletonGrid}>
          {Array(6)
            .fill(null)
            .map((_, index) => (
              <View
                key={index}
                style={[styles.skeletonCard, { width: cardWidth }]}
              >
                <CompactAmenityCardSkeleton />
              </View>
            ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.container,
          styles.errorContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <MaterialIcons name="error" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error?.message || 'Failed to load amenities'}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            Alert.alert('Retry', 'Please refresh the page to try again.');
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.backgroundCard }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Amenities Management
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Manage amenities for your business listings
          </Text>
        </View>
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
      </View>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchInput}
        onSearchChange={handleSearch}
        sortValue={`${filterState.sortBy}_${filterState.sortOrder}`}
        onSortChange={handleSortChange}
        totalCount={amenities?.length || 0}
      />

      {/* Content */}
      <View style={styles.content}>
        {isLoading && amenities?.length > 0 && (
          <ActivityIndicator
            style={styles.loadingIndicator}
            color={colors.primary}
          />
        )}
        {amenities && amenities.length > 0 ? (
          <FlashList
            data={amenities}
            renderItem={renderAmenityItem}
            numColumns={numColumns}
            estimatedItemSize={160}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
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
                {searchInput
                  ? 'Try adjusting your search.'
                  : 'Add your first amenity to get started.'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.emptyStateButton,
                  { backgroundColor: colors.primary },
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
                    styles.emptyStateButtonText,
                    { color: colors.backgroundCard },
                  ]}
                >
                  Add Amenity
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}{' '}
      </View>

      {/* Amenity Form Modal */}
      <AmenityFormContent
        isVisible={modalState.isVisible}
        mode={modalState.mode}
        amenity={modalState.amenity}
        onClose={handleCloseModal}
        onSuccess={handleCloseModal}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header Styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Filter Bar Styles
  filterBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Content Styles
  content: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  loadingIndicator: {
    paddingVertical: 20,
  },
  listContent: {
    padding: 16,
  },
  cardWrapper: {
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  // Skeleton Styles
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    marginBottom: 12,
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 22,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Error State Styles
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    maxWidth: '85%',
    lineHeight: 22,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AmenitiesManagementPage;
