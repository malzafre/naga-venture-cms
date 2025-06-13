// filepath: app/TourismCMS/(admin)/business-management/business-listings/all-businesses/index.tsx
import { Picker } from '@react-native-picker/picker';
import {
  Eye,
  Funnel,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from 'phosphor-react-native';
import React, { useMemo, useState } from 'react';
// Hooks and types
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { CMSButton } from '@/components/atoms';
import {
  DataTable,
  StatusBadge,
  type DataTableColumn,
} from '@/components/molecules';
import { ConfirmationModal } from '@/components/molecules/ConfirmationModal';
import { NavigationService } from '@/constants/NavigationService';
import { useBusinessFilterManagement } from '@/hooks/useBusinessFilterManagement';
import {
  useBusinessListings,
  useDeleteBusiness,
} from '@/hooks/useBusinessManagement';
import { useBusinessSubscription } from '@/hooks/useSupabaseSubscription';
import { Business } from '@/types/supabase';

const { width: screenWidth } = Dimensions.get('window');

/**
 * All Businesses Page
 *
 * Comprehensive view and management of all business listings in the platform.
 */
export default function AllBusinessesScreen() {
  // === ZUSTAND INTEGRATION ===
  // Replaced useState filter management with centralized Zustand store
  const {
    filters,
    searchQuery,
    showFilters,
    setFilter,
    setSearchQuery,
    toggleShowFilters,
  } = useBusinessFilterManagement();
  // ============================

  // State for delete confirmation modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(
    null
  );
  // Data fetching with real-time updates
  const {
    data: businessData,
    isLoading,
    isError,
    error,
    refetch,
  } = useBusinessListings(filters);
  const deleteBusinessMutation = useDeleteBusiness();
  // Real-time subscription for live updates
  useBusinessSubscription(true);

  // Handle delete business
  const handleDeleteBusiness = React.useCallback((business: Business) => {
    setBusinessToDelete(business);
    setDeleteModalVisible(true);
  }, []);
  // Confirm delete business
  const confirmDeleteBusiness = React.useCallback(async () => {
    if (!businessToDelete) return;

    if (__DEV__) {
      console.log(
        '🗑️ [AllBusinesses] Confirming delete for:',
        businessToDelete.business_name
      );
    }
    setDeleteModalVisible(false);

    try {
      await deleteBusinessMutation.mutateAsync(businessToDelete.id);
      if (__DEV__) {
        console.log('✅ [AllBusinesses] Business deleted successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ [AllBusinesses] Delete error:', error);
      }
    } finally {
      setBusinessToDelete(null);
    }
  }, [businessToDelete, deleteBusinessMutation]);
  // Cancel delete business
  const cancelDeleteBusiness = React.useCallback(() => {
    if (__DEV__) {
      console.log('🚫 [AllBusinesses] Delete cancelled');
    }
    setDeleteModalVisible(false);
    setBusinessToDelete(null);
  }, []);

  // Define table columns
  const columns: DataTableColumn<Business>[] = useMemo(
    () => [
      {
        key: 'business_name',
        title: 'Business Name',
        width: 180,
        minWidth: 180,
        render: (value, business) => (
          <View style={styles.businessNameContainer}>
            <Text
              style={styles.businessName}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {business.business_name}
            </Text>
            <Text
              style={styles.businessType}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {business.business_type?.replaceAll('_', ' ').toUpperCase()}
            </Text>
          </View>
        ),
      },
      {
        key: 'description',
        title: 'Description',
        width: 220,
        minWidth: 200,
        render: (value) => (
          <Text style={styles.description} numberOfLines={3}>
            {value || 'No description'}
          </Text>
        ),
      },
      {
        key: 'owner_email',
        title: 'Owner',
        width: 180,
        minWidth: 150,
        render: (value, business: any) => {
          const owner = business.profiles;
          const ownerName = owner
            ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim()
            : 'N/A';
          const ownerEmail = owner?.email || business.email || 'N/A';

          return (
            <View>
              <Text style={styles.ownerName} numberOfLines={1}>
                {ownerName}
              </Text>
              <Text style={styles.ownerEmail} numberOfLines={1}>
                {ownerEmail}
              </Text>
            </View>
          );
        },
      },
      {
        key: 'status',
        title: 'Status',
        width: 120,
        minWidth: 100,
        align: 'center',
        render: (value) => <StatusBadge status={value} size="small" />,
      },
      {
        key: 'created_at',
        title: 'Created',
        width: 120,
        minWidth: 100,
        render: (value) => (
          <Text style={styles.dateText}>
            {new Date(value).toLocaleDateString()}
          </Text>
        ),
      },
      {
        key: 'actions',
        title: 'Actions',
        width: 120,
        minWidth: 100,
        align: 'center',
        render: (_, business) => (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                NavigationService.toViewBusiness(business.id);
              }}
            >
              <Eye size={16} color="#0A1B47" weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                NavigationService.toEditBusiness(business.id);
              }}
            >
              <PencilSimple size={16} color="#0A1B47" weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteBusiness(business)}
              disabled={deleteBusinessMutation.isPending}
            >
              <Trash size={16} color="#DC3545" weight="bold" />
            </TouchableOpacity>
          </View>
        ),
      },
    ],
    [deleteBusinessMutation.isPending, handleDeleteBusiness]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>All Business Listings</Text>
        <Text style={styles.pageSubtitle}>
          Manage and monitor all business listings in the platform
        </Text>
      </View>
      <CMSButton
        title="Create New Business"
        icon="plus"
        onPress={() => NavigationService.toCreateBusiness()}
        variant="primary"
      />
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MagnifyingGlass size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      {/* Filter Toggle */}{' '}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => toggleShowFilters()}
      >
        <Funnel size={20} color="#6B7280" />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>
      {/* Expandable Filters */}
      {showFilters && (
        <View style={styles.expandedFilters}>
          <View style={styles.filterRow}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.pickerContainer}>
                {' '}
                <Picker
                  selectedValue={filters.status || ''}
                  onValueChange={(value) =>
                    setFilter('status', (value || undefined) as any)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="All Statuses" value="" />
                  <Picker.Item label="Approved" value="approved" />
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="Rejected" value="rejected" />
                  <Picker.Item label="Inactive" value="inactive" />
                </Picker>
              </View>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Business Type</Text>
              <View style={styles.pickerContainer}>
                {' '}
                <Picker
                  selectedValue={filters.business_type || ''}
                  onValueChange={(value) =>
                    setFilter('business_type', (value || undefined) as any)
                  }
                  style={styles.picker}
                >
                  <Picker.Item label="All Types" value="" />
                  <Picker.Item label="Accommodation" value="accommodation" />
                  <Picker.Item label="Shop" value="shop" />
                  <Picker.Item label="Service" value="service" />
                </Picker>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderDataTable = () => {
    // Enhanced error handling
    if (isError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load businesses
            {__DEV__ && error ? `: ${error.message}` : ''}
          </Text>
          <CMSButton
            title="Retry"
            onPress={() => refetch()}
            variant="secondary"
          />
        </View>
      );
    }

    // Enhanced loading state
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading businesses...</Text>
          {__DEV__ && (
            <Text style={styles.debugText}>Fetching data from Supabase...</Text>
          )}
        </View>
      );
    }

    // Enhanced empty state
    if (!businessData?.data || businessData.data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No businesses found. Create your first business listing to get
            started.
          </Text>
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>
                Debug Info:{' '}
                {JSON.stringify(
                  {
                    hasBusinessData: !!businessData,
                    dataLength: businessData?.data?.length,
                    totalCount: businessData?.count,
                    currentFilters: filters,
                  },
                  null,
                  2
                )}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <DataTable
        columns={columns}
        data={businessData.data as any[]}
        isLoading={isLoading}
        emptyMessage="No businesses found. Create your first business listing to get started."
        showRowIndex
        maxHeight={Platform.OS === 'web' ? screenWidth * 0.6 : 500}
        style={styles.dataTable}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      {renderDataTable()}

      {/* Statistics Summary */}
      {businessData && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Showing {businessData.data.length} of {businessData.count || 0}
            businesses
          </Text>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={deleteModalVisible}
        title="Delete Business"
        message={
          businessToDelete
            ? `Are you sure you want to delete "${businessToDelete.business_name}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="destructive"
        onConfirm={confirmDeleteBusiness}
        onCancel={cancelDeleteBusiness}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 16,
  },
  titleSection: {
    flex: 1,
    minWidth: 200,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Filters styles
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    ...Platform.select({
      web: {
        outlineStyle: 'none', // Changed from outline: 'none'
      } as any,
    }),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  expandedFilters: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  filterGroup: {
    flex: 1,
    minWidth: 200,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 40,
    ...Platform.select({
      android: {
        color: '#374151',
      },
    }),
  },

  // Data table styles
  dataTable: {
    flex: 1,
    marginBottom: 16,
  }, // Table cell content styles
  businessNameContainer: {
    flex: 1,
    paddingRight: 8, // Ensure padding for text
  },
  businessName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 3,
    lineHeight: 16,
  },
  businessType: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  ownerName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  ownerEmail: {
    fontSize: 11,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Actions styles
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Debug styles
  debugContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    maxWidth: 400,
  },
  debugText: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },

  // Stats styles
  statsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
