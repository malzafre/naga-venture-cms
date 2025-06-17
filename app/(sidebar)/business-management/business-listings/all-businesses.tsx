// filepath: app/TourismCMS/(admin)/business-management/business-listings/all-businesses/index.tsx
import { Picker } from '@react-native-picker/picker';
import {
  Eye,
  MagnifyingGlass,
  PencilSimple,
  Trash,
} from 'phosphor-react-native';
import React, { useMemo, useState } from 'react';
// Hooks and types
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
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
import { useTheme } from '@/constants/useTheme';
import { useBusinessFilters } from '@/hooks/features/business/useBusinessFilters';
import {
  useBusinessListings,
  useDeleteBusiness,
} from '@/hooks/features/business/useBusinessManagement';
import { useBusinessSubscription } from '@/hooks/shared/useSupabaseSubscription';
import { Business } from '@/types/supabase';

/**
 * All Businesses Page
 *
 * Comprehensive view and management of all business listings in the platform.
 */
export default function AllBusinessesScreen() {
  // === THEME INTEGRATION ===
  const { theme } = useTheme();

  // Create themed styles
  const styles = useMemo(() => getStyles(theme), [theme]);

  // === ZUSTAND INTEGRATION ===  // Replaced useState filter management with centralized Zustand store
  const { filters, searchQuery, setFilter, setSearchQuery } =
    useBusinessFilters();

  // Get screen dimensions for responsive pagination
  const { height: screenHeight } = useWindowDimensions();
  // Calculate responsive page size based on screen height
  const responsivePageSize = useMemo(() => {
    const headerHeight = 40; // Compact table header
    const rowHeight = 44; // Compact row height
    const reservedHeight = 200; // Filters, pagination, margins, etc.

    const availableHeight = screenHeight - reservedHeight;
    const maxTableHeight = availableHeight - headerHeight;
    const maxPossibleRows = Math.floor(maxTableHeight / rowHeight);

    // Responsive breakpoints for page size (optimized for compact design!)
    let calculatedSize;
    if (screenHeight >= 1080) {
      calculatedSize = Math.min(15, maxPossibleRows); // Large screens - even more rows
    } else if (screenHeight >= 800) {
      calculatedSize = Math.min(11, maxPossibleRows); // Medium screens - more rows
    } else if (screenHeight >= 600) {
      calculatedSize = Math.min(8, maxPossibleRows); // Small screens - more rows
    } else {
      calculatedSize = Math.min(6, maxPossibleRows); // Very small screens - still improved
    }

    // Ensure minimum of 5 rows
    const finalSize = Math.max(5, calculatedSize);

    if (__DEV__) {
      console.log('📱 [AllBusinesses] Responsive page size:', {
        screenHeight,
        availableHeight,
        maxPossibleRows,
        calculatedSize,
        finalSize,
      });
    }

    return finalSize;
  }, [screenHeight]);
  // Pagination state - using responsive page size
  const [currentPage, setCurrentPage] = useState(1);
  // Use the responsive page size directly instead of state
  const pageSize = responsivePageSize;

  // Calculate responsive icon size based on screen size
  const responsiveIconSize = useMemo(() => {
    if (screenHeight >= 1080) {
      return 18; // Large screens - bigger icons
    } else if (screenHeight >= 800) {
      return 16; // Medium screens - default size
    } else if (screenHeight >= 600) {
      return 14; // Small screens - smaller icons
    } else {
      return 12; // Very small screens - compact icons
    }
  }, [screenHeight]);

  // State for delete confirmation modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(
    null
  );

  // Data fetching with real-time updates and pagination
  const paginatedFilters = useMemo(
    () => ({
      ...filters,
      page: currentPage,
      limit: pageSize,
    }),
    [filters, currentPage, pageSize]
  );

  const {
    data: businessData,
    isLoading,
    isError,
    error,
    refetch,
  } = useBusinessListings(paginatedFilters);
  const deleteBusinessMutation = useDeleteBusiness();

  // Real-time subscription for live updates - useMemo prevents unnecessary resubscription
  const isScreenActive = true; // This could be tied to screen focus in the future if needed
  useBusinessSubscription(isScreenActive);

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
        title: 'BUSINESS',
        width: 250,
        minWidth: 220,
        render: (value, business) => (
          <View style={styles.businessNameContainer}>
            <View style={styles.businessHeaderRow}>
              <Text
                style={styles.businessName}
                numberOfLines={2} // Allow wrapping to two lines
                ellipsizeMode="tail"
              >
                {business.business_name}
              </Text>
              {business.is_claimed && (
                <Text style={styles.verifiedBadge}>✓</Text>
              )}
            </View>
            <Text
              style={styles.businessType}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {business.business_type?.replaceAll('_', ' ')}
            </Text>
          </View>
        ),
      },
      {
        key: 'owner',
        title: 'OWNER',
        width: 140,
        minWidth: 120,
        render: (value, business: any) => {
          const owner = business.profiles;
          const ownerName = owner
            ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim()
            : 'N/A';

          return (
            <Text style={styles.ownerName} numberOfLines={1}>
              {ownerName}
            </Text>
          );
        },
      },
      {
        key: 'category',
        title: 'CATEGORY',
        width: 120,
        minWidth: 100,
        render: (value, business: any) => {
          const category =
            business.business_categories?.[0]?.sub_categories?.name ||
            'Uncategorized';
          return (
            <Text style={styles.categoryText} numberOfLines={1}>
              {category}
            </Text>
          );
        },
      },
      {
        key: 'contact',
        title: 'CONTACT',
        width: 180,
        minWidth: 160,
        render: (value, business: any) => {
          const owner = business.profiles;
          const email = owner?.email || business.email || '';
          const phone = business.phone || '';

          return (
            <View style={styles.contactContainer}>
              {email ? (
                <Text style={styles.contactEmail} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
              {phone ? (
                <Text style={styles.contactPhone} numberOfLines={1}>
                  {phone}
                </Text>
              ) : null}
            </View>
          );
        },
      },
      {
        key: 'status',
        title: 'STATUS',
        width: 90,
        minWidth: 80,
        align: 'center',
        render: (value) => <StatusBadge status={value} size="small" />,
      },
      {
        key: 'rating',
        title: 'RATING',
        width: 80,
        minWidth: 70,
        align: 'center',
        render: (value, business) => (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              {business.average_rating
                ? business.average_rating.toFixed(1)
                : '--'}
            </Text>
            <Text style={styles.ratingIcon}>★</Text>
            <Text style={styles.ratingCount}>
              ({business.review_count || 0})
            </Text>
          </View>
        ),
      },
      {
        key: 'created_at',
        title: 'CREATED',
        width: 90,
        minWidth: 80,
        render: (value) => (
          <Text style={styles.dateText}>
            {new Date(value).toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        ),
      },
      {
        key: 'actions',
        title: '',
        width: responsiveIconSize >= 16 ? 100 : 80,
        minWidth: responsiveIconSize >= 16 ? 90 : 70,
        align: 'center',
        render: (_, business) => (
          <View
            style={[
              styles.actionsContainer,
              {
                gap: responsiveIconSize >= 16 ? 6 : 4,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  padding: responsiveIconSize >= 16 ? 8 : 6,
                  borderRadius: responsiveIconSize >= 16 ? 8 : 6,
                },
              ]}
              onPress={() => {
                NavigationService.toViewBusiness(business.id);
              }}
            >
              <Eye size={responsiveIconSize} color="#6B7280" weight="regular" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  padding: responsiveIconSize >= 16 ? 8 : 6,
                  borderRadius: responsiveIconSize >= 16 ? 8 : 6,
                },
              ]}
              onPress={() => {
                NavigationService.toEditBusiness(business.id);
              }}
            >
              <PencilSimple
                size={responsiveIconSize}
                color="#6B7280"
                weight="regular"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.deleteButton,
                {
                  padding: responsiveIconSize >= 16 ? 8 : 6,
                  borderRadius: responsiveIconSize >= 16 ? 8 : 6,
                },
              ]}
              onPress={() => handleDeleteBusiness(business)}
              disabled={deleteBusinessMutation.isPending}
            >
              <Trash
                size={responsiveIconSize}
                color="#EF4444"
                weight="regular"
              />
            </TouchableOpacity>
          </View>
        ),
      },
    ],
    [
      deleteBusinessMutation.isPending,
      handleDeleteBusiness,
      responsiveIconSize,
      styles,
    ]
  );

  const renderHeader = () => {
    const stats = businessData?.data || [];
    const totalCount = stats.length;
    const activeCount = stats.filter((b) => b.status === 'approved').length;
    const pendingCount = stats.filter((b) => b.status === 'pending').length;
    const suspendedCount = stats.filter((b) => b.status === 'rejected').length;
    const featuredCount = stats.filter((b) => b.is_featured).length;
    const verifiedCount = stats.filter((b) => b.is_claimed).length;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Business Management</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#64748B' }]} />
              <Text style={styles.statText}>{totalCount} Total</Text>
            </View>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#059669' }]} />
              <Text style={styles.statText}>{activeCount} Active</Text>
            </View>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#D97706' }]} />
              <Text style={styles.statText}>{pendingCount} Pending</Text>
            </View>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.statText}>{suspendedCount} Suspended</Text>
            </View>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#7C3AED' }]} />
              <Text style={styles.statText}>{featuredCount} Featured</Text>
            </View>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.statText}>{verifiedCount} Verified</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <CMSButton
            title="Add Business"
            icon="plus"
            onPress={() => NavigationService.toCreateBusiness()}
            variant="primary"
          />
        </View>
      </View>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIconContainer}>
          <MagnifyingGlass size={18} color="#6B7280" weight="regular" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Compact Filter Row */}
      <View style={styles.filtersRow}>
        {/* Status Filter */}
        <View style={styles.filterGroupInline}>
          <Text style={styles.filterLabelInline}>Status:</Text>
          <View style={styles.filterDropdownInline}>
            <Picker
              selectedValue={filters.status || ''}
              onValueChange={(value) =>
                setFilter('status', (value || undefined) as any)
              }
              style={styles.filterPickerInline}
              itemStyle={styles.pickerItemStyle} // Added for iOS text styling
            >
              <Picker.Item label="All Status" value="" />
              <Picker.Item label="✓ Approved" value="approved" />
              <Picker.Item label="⏳ Pending" value="pending" />
              <Picker.Item label="✗ Rejected" value="rejected" />
              <Picker.Item label="⏸ Inactive" value="inactive" />
            </Picker>
          </View>
        </View>
        {/* Type Filter */}
        <View style={styles.filterGroupInline}>
          <Text style={styles.filterLabelInline}>Type:</Text>
          <View style={styles.filterDropdownInline}>
            <Picker
              selectedValue={filters.business_type || ''}
              onValueChange={(value) =>
                setFilter('business_type', (value || undefined) as any)
              }
              style={styles.filterPickerInline}
              itemStyle={styles.pickerItemStyle} // Added for iOS text styling
            >
              <Picker.Item label="All Types" value="" />
              <Picker.Item label="🏨 Accommodation" value="accommodation" />
              <Picker.Item label="🛍️ Shop" value="shop" />
              <Picker.Item label="⚙️ Service" value="service" />
            </Picker>
          </View>
        </View>
        {/* Featured Filter */}
        <View style={styles.filterGroupInline}>
          <Text style={styles.filterLabelInline}>Featured:</Text>
          <View style={styles.filterDropdownInline}>
            <Picker
              selectedValue={filters.is_featured?.toString() || ''}
              onValueChange={(value) =>
                setFilter(
                  'is_featured',
                  value === 'true'
                    ? true
                    : value === 'false'
                      ? false
                      : undefined
                )
              }
              style={styles.filterPickerInline}
              itemStyle={styles.pickerItemStyle} // Added for iOS text styling
            >
              <Picker.Item label="All" value="" />
              <Picker.Item label="⭐ Featured" value="true" />
              <Picker.Item label="Regular" value="false" />
            </Picker>
          </View>
        </View>
        {/* Verified Filter */}
        <View style={styles.filterGroupInline}>
          <Text style={styles.filterLabelInline}>Verified:</Text>
          <View style={styles.filterDropdownInline}>
            <Picker
              selectedValue={filters.is_claimed?.toString() || ''}
              onValueChange={(value) =>
                setFilter(
                  'is_claimed',
                  value === 'true'
                    ? true
                    : value === 'false'
                      ? false
                      : undefined
                )
              }
              style={styles.filterPickerInline}
              itemStyle={styles.pickerItemStyle} // Added for iOS text styling
            >
              <Picker.Item label="All" value="" />
              <Picker.Item label="✓ Verified" value="true" />
              <Picker.Item label="Unverified" value="false" />
            </Picker>
          </View>
        </View>
      </View>
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
                Debug Info:
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
        style={styles.dataTable}
        fixedHeight={true}
        expectedRowCount={pageSize}
      />
    );
  };
  // Modern Pagination component
  const renderPagination = () => {
    if (!businessData || businessData.data.length === 0) return null;

    const totalItems = businessData.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++)
            pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <View style={styles.paginationContainer}>
        <View style={styles.paginationInfoSection}>
          <Text style={styles.paginationInfo}>
            Showing <Text style={styles.paginationHighlight}>{startItem}</Text>
            to <Text style={styles.paginationHighlight}>{endItem}</Text> of
            <Text style={styles.paginationHighlight}>{totalItems}</Text>
            businesses
          </Text>
        </View>

        <View style={styles.paginationControls}>
          {/* First button */}
          <TouchableOpacity
            style={[
              styles.paginationButton,
              styles.paginationNavButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 1 && styles.paginationButtonTextDisabled,
              ]}
            >
              First
            </Text>
          </TouchableOpacity>

          {/* Previous button */}
          <TouchableOpacity
            style={[
              styles.paginationButton,
              styles.paginationNavButton,
              currentPage === 1 && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 1 && styles.paginationButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationButton,
                styles.paginationNumberButton,
                page === currentPage && styles.paginationButtonActive,
                typeof page !== 'number' && styles.paginationEllipsis,
              ]}
              onPress={() => typeof page === 'number' && setCurrentPage(page)}
              disabled={typeof page !== 'number'}
            >
              <Text
                style={[
                  styles.paginationButtonText,
                  page === currentPage && styles.paginationButtonTextActive,
                  typeof page !== 'number' && styles.paginationEllipsisText,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Next button */}
          <TouchableOpacity
            style={[
              styles.paginationButton,
              styles.paginationNavButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === totalPages &&
                  styles.paginationButtonTextDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>

          {/* Last button */}
          <TouchableOpacity
            style={[
              styles.paginationButton,
              styles.paginationNavButton,
              currentPage === totalPages && styles.paginationButtonDisabled,
            ]}
            onPress={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === totalPages &&
                  styles.paginationButtonTextDisabled,
              ]}
            >
              Last
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={getStyles(theme).container}>
      {renderHeader()}
      {renderFilters()}

      <View style={getStyles(theme).contentContainer}>
        {renderDataTable()}
        {renderPagination()}
      </View>

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

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1, // Ensure container takes available space
      backgroundColor: '#F8FAFC',
    },
    // Content wrapper
    contentContainer: {
      flex: 1, // Takes remaining vertical space
      paddingHorizontal: Platform.OS === 'web' ? 24 : 8,
      paddingTop: 4, // Add top padding for spacing between filters and table
      paddingBottom: 20, // Add bottom padding for breathing room
      flexDirection: 'column', // Explicitly define column direction for children (DataTable, Pagination)
    },
    // Header styles - Modern and clean
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    titleSection: {
      flex: 1,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 10,
    },
    statBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statText: {
      fontSize: 12,
      color: '#4B5563',
      fontWeight: '500',
    },
    headerActions: {
      // marginLeft: 16, // Removed to allow titleSection to take more space if needed
    },

    // Updated Filter Styles
    filtersContainer: {
      paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
      paddingVertical: 12,
      backgroundColor: '#F9FAFB', // Light background for the filter area
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#D1D5DB',
      paddingHorizontal: 12,
      height: 40,
      marginBottom: 12, // Space between search and filter dropdowns
    },
    searchIconContainer: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      fontSize: 14,
      color: '#1F2937',
    },
    clearSearchButton: {
      paddingLeft: 8,
    },
    clearSearchText: {
      fontSize: 18,
      color: '#9CA3AF',
      fontWeight: 'bold',
    },
    filtersRow: {
      flexDirection: 'row',
      flexWrap: 'wrap', // Allow filters to wrap on smaller screens
      alignItems: 'center',
      // gap: 8, // Use marginRight/marginBottom on filterGroup for better control if gap is not supported
    },
    filterGroupInline: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12, // Spacing between filter groups
      marginBottom: 8, // Spacing for wrapped items
    },
    filterLabelInline: {
      fontSize: 13,
      color: '#4B5563', // Slightly darker for better readability
      marginRight: 6,
      fontWeight: '500',
    },
    filterDropdownInline: {
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#D1D5DB',
      height: 38, // Consistent height for dropdowns
      justifyContent: 'center',
      minWidth: Platform.OS === 'web' ? 160 : 150, // Ensure dropdowns have enough width
      paddingHorizontal: Platform.OS === 'android' ? 8 : 0, // Android needs padding for text
    },
    filterPickerInline: {
      height: '100%',
      width: '100%',
      color: '#1F2937',
      backgroundColor: 'transparent', // Important for container styling to show
      borderWidth: 0, // Remove default picker border if any
      fontSize: 13,
      ...(Platform.OS === 'ios' &&
        {
          // Specific iOS adjustments if needed, often handled by itemStyle
        }),
      ...(Platform.OS === 'android' &&
        {
          // Android specific picker style adjustments
          // marginRight: -8, // Example: Adjust if Android adds extra space
        }),
    },
    pickerItemStyle: {
      // For iOS Picker item text styling
      fontSize: 13,
      height: '100%', // Ensure items take full height for better touch targets
      color: '#1F2937',
    },

    // Data table styles
    dataTable: {
      flex: 1, // DataTable should grow/shrink within contentContainer
      backgroundColor: '#FFFFFF',
      borderRadius: Platform.OS === 'web' ? 12 : 16, // Slightly smaller radius for web consistency
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)', // Softer shadow
      elevation: 3, // Adjusted elevation
      overflow: 'hidden', // Keep this to respect borderRadius
    },

    // Table cell content styles - Optimized
    businessNameContainer: {
      flex: 1, // Allow container to take available width in cell
      paddingRight: 8, // Keep some padding
      justifyContent: 'center', // Vertically center content if it wraps
      minHeight: 36, // Ensure a minimum height for cells with potentially wrapped text
    },
    businessHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    businessName: {
      fontSize: 13,
      fontWeight: '600',
      color: '#0F172A',
      marginBottom: 3,
      lineHeight: 16,
    },
    verifiedBadge: {
      fontSize: 12,
      color: '#059669',
      fontWeight: 'bold',
    },
    businessType: {
      fontSize: 10,
      color: '#64748B',
      lineHeight: 12,
      textTransform: 'capitalize',
      fontWeight: '500',
    },
    description: {
      fontSize: 13,
      color: '#475569',
      lineHeight: 18,
    },
    ownerName: {
      fontSize: 13,
      color: '#334155',
      fontWeight: '500',
    },
    categoryText: {
      fontSize: 13,
      color: '#334155',
      fontWeight: '500',
    },
    contactContainer: {
      gap: 2,
    },
    contactEmail: {
      fontSize: 12,
      color: '#2563EB',
      fontWeight: '500',
    },
    contactPhone: {
      fontSize: 12,
      color: '#64748B',
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#334155',
    },
    ratingIcon: {
      fontSize: 12,
      color: '#F59E0B',
    },
    ratingCount: {
      fontSize: 11,
      color: '#64748B',
    },
    dateText: {
      fontSize: 12,
      color: '#64748B',
      fontWeight: '500',
    },

    // Modern Actions styles
    actionsContainer: {
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
    },
    deleteButton: {
      backgroundColor: '#FEF2F2',
      borderColor: '#FECACA',
    },
    // Error state - Enhanced
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
    },
    errorText: {
      fontSize: 16,
      color: '#DC2626',
      marginBottom: 16,
      textAlign: 'center',
      fontWeight: '500',
    },
    // Loading state - Enhanced
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
    },
    loadingText: {
      fontSize: 16,
      color: '#64748B',
      marginBottom: 8,
      textAlign: 'center',
      fontWeight: '500',
    },
    // Empty state - Enhanced
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
    },
    emptyText: {
      fontSize: 16,
      color: '#64748B',
      marginBottom: 16,
      textAlign: 'center',
      fontWeight: '500',
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
    // Modern Compact Pagination styles
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12, // More compact padding
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      borderBottomLeftRadius: theme.borderRadius.lg,
      borderBottomRightRadius: theme.borderRadius.lg,
    },
    paginationInfoSection: {
      flex: 1,
    },
    paginationInfo: {
      fontSize: 13, // Slightly smaller for compactness
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeights.medium,
    },
    paginationHighlight: {
      fontWeight: theme.fontWeights.bold,
      color: theme.colors.text,
    },
    paginationControls: {
      flexDirection: 'row',
      gap: 6, // Reduced gap for compactness
    },
    paginationButton: {
      paddingVertical: 8, // More compact padding
      paddingHorizontal: 12, // More compact padding
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    paginationNavButton: {
      minWidth: 60, // Reduced width for compactness
    },
    paginationNumberButton: {
      minWidth: 32, // More compact number buttons
      alignItems: 'center',
    },
    paginationButtonDisabled: {
      backgroundColor: theme.colors.neutral100,
      borderColor: theme.colors.neutral200,
    },
    paginationButtonText: {
      fontSize: 13, // Slightly smaller text
      color: theme.colors.text,
      fontWeight: theme.fontWeights.semibold,
      textAlign: 'center',
    },
    paginationButtonTextDisabled: {
      color: theme.colors.disabled,
    },
    paginationButtonActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
      ...theme.shadows.md,
    },
    paginationButtonTextActive: {
      color: theme.colors.background,
      fontWeight: theme.fontWeights.bold,
    },
    paginationEllipsis: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      shadowOpacity: 0,
      elevation: 0,
    },
    paginationEllipsisText: {
      color: theme.colors.textMuted,
      fontWeight: theme.fontWeights.normal,
    },
  });
