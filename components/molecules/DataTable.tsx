import { FlashList } from '@shopify/flash-list';
import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

/**
 * DataTable - Molecule Component
 *
 * A generic, reusable table component that displays data in rows and columns.
 * Optimized for web and mobile platforms with responsive design.
 * Following atomic design principles as a molecule.
 */

export interface DataTableColumn<T = any> {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowPress?: (item: T, index: number) => void;
  showRowIndex?: boolean;
  maxHeight?: number;
  style?: any;
  fixedHeight?: boolean; // New prop to disable scrolling and use fixed height
  expectedRowCount?: number; // Number of rows to reserve space for (useful for pagination)
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowPress,
  showRowIndex = false,
  maxHeight,
  style,
  fixedHeight = false,
  expectedRowCount = 10,
}: DataTableProps<T>) => {
  // Get screen dimensions for responsive calculations
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  // Calculate responsive row count based on screen size
  const responsiveRowCount = useMemo(() => {
    if (!fixedHeight) return expectedRowCount;

    // Base calculations (compact sizing)
    const headerHeight = 40; // Reduced header height
    const rowHeight = 44; // Reduced row height
    const reservedHeight = 200; // Space for filters, pagination, etc.

    // Available height for the table
    const availableHeight = screenHeight - reservedHeight;
    const maxTableHeight = availableHeight - headerHeight;

    // Calculate how many rows can fit
    const maxPossibleRows = Math.floor(maxTableHeight / rowHeight);

    // Responsive breakpoints (optimized for compact design)
    let optimalRows;
    if (screenHeight >= 1080) {
      // Large screens (desktop/large tablets) - take advantage of compact design
      optimalRows = Math.min(18, maxPossibleRows);
    } else if (screenHeight >= 800) {
      // Medium screens (tablets/small laptops) - more rows due to compact design
      optimalRows = Math.min(15, maxPossibleRows);
    } else if (screenHeight >= 600) {
      // Small screens (large phones in landscape) - still more rows
      optimalRows = Math.min(10, maxPossibleRows);
    } else {
      // Very small screens - minimal but still more than before
      optimalRows = Math.min(7, maxPossibleRows);
    }

    // Ensure we don't go below minimum viable rows
    const finalRowCount = Math.max(5, Math.min(optimalRows, expectedRowCount));

    if (__DEV__) {
      console.log('📱 [DataTable] Responsive calculation:', {
        screenHeight,
        screenWidth,
        availableHeight,
        maxPossibleRows,
        optimalRows,
        finalRowCount,
        expectedRowCount,
      });
    }

    return finalRowCount;
  }, [screenHeight, screenWidth, fixedHeight, expectedRowCount]);

  // Debug logging to understand the data being passed
  if (__DEV__) {
    console.log('📊 [DataTable] Props:', {
      dataLength: data.length,
      expectedRowCount,
      responsiveRowCount,
      fixedHeight,
      isLoading,
      itemIds: data.map((item, idx) => ({
        index: idx,
        id: item.id || `no-id-${idx}`,
      })),
    });
  }
  const renderItem = ({ item, index }: { item: T; index: number }) => {
    const RowComponent = onRowPress ? TouchableOpacity : View;

    return (
      <RowComponent
        style={[
          styles.dataRow,
          index % 2 === 1 && styles.alternateRow,
          onRowPress && styles.pressableRow,
        ]}
        onPress={onRowPress ? () => onRowPress(item, index) : undefined}
        disabled={!onRowPress}
        activeOpacity={onRowPress ? 0.7 : 1}
      >
        {showRowIndex && (
          <View style={[styles.dataCell, styles.indexCell]}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
        )}
        {columns.map((column, colIndex) => (
          <View
            key={column.key}
            style={[
              styles.dataCell,
              {
                width: column.width,
                minWidth: column.minWidth || 100,
                alignItems:
                  column.align === 'center'
                    ? 'center'
                    : column.align === 'right'
                      ? 'flex-end'
                      : 'flex-start',
              },
              colIndex === columns.length - 1 && styles.lastColumn,
            ]}
          >
            {column.render ? (
              <View style={styles.cellContent}>
                {column.render(item[column.key], item, index)}
              </View>
            ) : (
              <View style={styles.cellContent}>
                <Text
                  style={[
                    styles.cellText,
                    { textAlign: column.align || 'left' },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {item[column.key]?.toString() || '-'}
                </Text>
              </View>
            )}
          </View>
        ))}
      </RowComponent>
    );
  };
  const renderHeader = () => (
    <View style={styles.headerRow}>
      {showRowIndex && (
        <View style={[styles.headerCell, styles.indexCell]}>
          <Text style={styles.headerText}>#</Text>
        </View>
      )}
      {columns.map((column, index) => (
        <View
          key={column.key}
          style={[
            styles.headerCell,
            {
              width: column.width,
              minWidth: column.minWidth || 100,
              alignItems:
                column.align === 'center'
                  ? 'center'
                  : column.align === 'right'
                    ? 'flex-end'
                    : 'flex-start',
            },
            index === columns.length - 1 && styles.lastColumn,
          ]}
        >
          <Text style={styles.headerText} numberOfLines={2}>
            {column.title}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0A1B47" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      {fixedHeight ? (
        <View
          style={[
            styles.fixedContainer,
            {
              // Use responsive row count for height calculation (compact)
              height: responsiveRowCount * 44, // 44px per row (compact)
            },
          ]}
        >
          {isLoading ? (
            renderLoadingState()
          ) : data.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <FlashList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${item.id || index}`}
                estimatedItemSize={44} // Updated for compact size
                // Enable minimal scrolling when we have exactly the expected count
                // This helps FlashList render all items properly
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                style={styles.flashListContainer}
                getItemType={() => 'row'}
                removeClippedSubviews={false}
                // Force render all items for pagination
                onEndReachedThreshold={0.1}
              />
              {/* Fill remaining space if needed to maintain layout */}
              {data.length < responsiveRowCount && (
                <View
                  style={{
                    height: (responsiveRowCount - data.length) * 44, // Updated for compact size
                    backgroundColor: '#FAFAFA',
                    borderTopWidth: data.length > 0 ? 1 : 0,
                    borderTopColor: '#F3F4F6',
                  }}
                />
              )}
            </>
          )}
        </View>
      ) : (
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id || index}`}
          estimatedItemSize={56}
          showsVerticalScrollIndicator={true}
          style={[styles.scrollContainer, maxHeight ? { maxHeight } : null]}
          ListEmptyComponent={data.length === 0 ? renderEmptyState : undefined}
          ListHeaderComponent={isLoading ? renderLoadingState : undefined}
        />
      )}
    </View>
  );
};

// Export as memoized component for performance
export default memo(DataTable) as typeof DataTable;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow:
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  },
  // Header styles
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 40, // Reduced from 48
  },
  headerCell: {
    flex: 1,
    paddingHorizontal: 8, // Reduced from 12
    paddingVertical: 8, // Reduced from 12
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 11, // Reduced from 12
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Data row styles
  scrollContainer: {
    flex: 1,
  },
  fixedContainer: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    // Add responsive properties
    ...Platform.select({
      web: {
        overflow: 'hidden',
      },
    }),
  },
  flashListContainer: {
    flex: 1,
    // Responsive FlashList styling
    backgroundColor: 'transparent',
  },
  dataRow: {
    flexDirection: 'row',
    minHeight: 44, // Reduced from 56
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  alternateRow: {
    backgroundColor: '#FAFAFA',
  },
  pressableRow: {
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dataCell: {
    flex: 1,
    paddingHorizontal: 8, // Reduced from 12
    paddingVertical: 8, // Reduced from 12
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  cellContent: {
    flex: 1,
  },
  cellText: {
    fontSize: 13, // Reduced from 14
    color: '#374151',
    lineHeight: 18, // Reduced from 20
  },
  // Index column styles
  indexCell: {
    flex: 0,
    width: 42, // Reduced from 50
    minWidth: 42, // Reduced from 50
    alignItems: 'center',
  },
  indexText: {
    fontSize: 11, // Reduced from 12
    color: '#6B7280',
    fontWeight: '500',
  },

  // Remove border from last column
  lastColumn: {
    borderRightWidth: 0,
  },

  // State styles
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});
