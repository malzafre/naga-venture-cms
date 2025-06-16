/**
 * Category Tree Interface Component (DUMB UI)
 *
 * Pure UI component that receives all data and handlers as props
 * Following the "Smart Ho          <ScrollView 
            style={styles.treeContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >umb Component" pattern
 */
import {
  CaretDown,
  CaretRight,
  Folder,
  Plus,
  Tag,
} from 'phosphor-react-native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MainCategoryWithSubCategories, SubCategory } from '@/schemas';

// ============================================================================
// TYPES
// ============================================================================

type SelectedItem = {
  type: 'main' | 'sub';
  data: MainCategoryWithSubCategories | SubCategory;
  parentId?: string;
};

interface CategoryTreeInterfaceProps {
  mainCategories: MainCategoryWithSubCategories[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  stats: {
    totalMainCategories: number;
    totalSubCategories: number;
    totalShowing: number;
  };
  expandedCategories: Set<string>;
  selectedItem: SelectedItem | null;
  onToggleExpansion: (categoryId: string) => void;
  onSelectCategory: (
    type: 'main' | 'sub',
    data: MainCategoryWithSubCategories | SubCategory,
    parentId?: string
  ) => void;
  onOpenModal: (
    type: 'main' | 'sub',
    mode: 'create' | 'edit',
    category?: MainCategoryWithSubCategories | SubCategory,
    parentCategoryId?: string
  ) => void;
  onDeleteMainCategory: (category: MainCategoryWithSubCategories) => void;
  onDeleteSubCategory: (category: SubCategory) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const CategoryTreeInterface: React.FC<CategoryTreeInterfaceProps> = ({
  mainCategories,
  isLoading,
  isError,
  error,
  stats,
  expandedCategories,
  selectedItem,
  onToggleExpansion,
  onSelectCategory,
  onOpenModal,
  onDeleteMainCategory,
  onDeleteSubCategory,
}) => {
  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading categories: {error || 'Unknown error'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Category Management</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.statText}>
                {stats.totalMainCategories} Main Categories
              </Text>
            </View>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.statText}>
                {stats.totalSubCategories} Subcategories
              </Text>
            </View>
            <View style={styles.statBadge}>
              <View style={[styles.statDot, { backgroundColor: '#9ca3af' }]} />
              <Text style={styles.statText}>{stats.totalShowing} Showing</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onOpenModal('main', 'create')}
            activeOpacity={0.85}
          >
            <View style={styles.addButtonContent}>
              <Plus size={18} color="#ffffff" weight="bold" />
              <Text style={styles.addButtonText}>Add Main Category</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Category Tree Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Category Tree</Text>
          <ScrollView
            style={styles.treeContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {mainCategories.map((category) => (
              <View key={category.id} style={styles.categoryGroup}>
                {/* Main Category */}
                <TouchableOpacity
                  style={[
                    styles.mainCategoryItem,
                    selectedItem?.type === 'main' &&
                      selectedItem.data.id === category.id &&
                      styles.selectedItem,
                  ]}
                  onPress={() => onSelectCategory('main', category)}
                >
                  <View style={styles.categoryIcon}>
                    <Folder size={16} color="#3b82f6" />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <TouchableOpacity
                    style={styles.expandButton}
                    onPress={() => onToggleExpansion(category.id)}
                  >
                    {expandedCategories.has(category.id) ? (
                      <CaretDown size={12} color="#64748b" weight="bold" />
                    ) : (
                      <CaretRight size={12} color="#64748b" weight="bold" />
                    )}
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.statusDot,
                      category.is_active
                        ? styles.activeDot
                        : styles.inactiveDot,
                    ]}
                  />
                </TouchableOpacity>
                {/* Sub Categories */}
                {expandedCategories.has(category.id) &&
                  category.sub_categories && (
                    <View style={styles.subCategoriesContainer}>
                      {category.sub_categories.map((subCategory) => (
                        <TouchableOpacity
                          key={subCategory.id}
                          style={[
                            styles.subCategoryItem,
                            selectedItem?.type === 'sub' &&
                              selectedItem.data.id === subCategory.id &&
                              styles.selectedItem,
                          ]}
                          onPress={() =>
                            onSelectCategory('sub', subCategory, category.id)
                          }
                        >
                          <View style={styles.subCategoryIcon}>
                            <Tag size={14} color="#64748b" />
                          </View>
                          <Text style={styles.subCategoryName}>
                            {subCategory.name}
                          </Text>
                          <View
                            style={[
                              styles.statusDot,
                              subCategory.is_active
                                ? styles.activeDot
                                : styles.inactiveDot,
                            ]}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Detail Panel */}
        <View style={styles.detailPanel}>
          {selectedItem ? (
            <CategoryDetailPanel
              selectedItem={selectedItem}
              onEdit={(type, category, parentId) =>
                onOpenModal(type, 'edit', category, parentId)
              }
              onDelete={
                selectedItem.type === 'main'
                  ? onDeleteMainCategory
                  : onDeleteSubCategory
              }
              onAddSubcategory={(parentId) =>
                onOpenModal('sub', 'create', undefined, parentId)
              }
              onSelectCategory={onSelectCategory}
            />
          ) : (
            <View style={styles.emptySelection}>
              <Text style={styles.emptyTitle}>Select a category</Text>
              <Text style={styles.emptySubtitle}>
                Choose a category from the tree to view details and manage
                subcategories
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// CATEGORY DETAIL PANEL (MOLECULE)
// ============================================================================

interface CategoryDetailPanelProps {
  selectedItem: SelectedItem;
  onEdit: (type: 'main' | 'sub', category: any, parentId?: string) => void;
  onDelete: (category: any) => void;
  onAddSubcategory: (parentId: string) => void;
  onSelectCategory: (
    type: 'main' | 'sub',
    data: MainCategoryWithSubCategories | SubCategory,
    parentId?: string
  ) => void;
}

const CategoryDetailPanel: React.FC<CategoryDetailPanelProps> = ({
  selectedItem,
  onEdit,
  onDelete,
  onAddSubcategory,
  onSelectCategory,
}) => {
  const { type, data } = selectedItem;
  const isMainCategory = type === 'main';
  const mainCategory = data as MainCategoryWithSubCategories;

  return (
    <View style={styles.detailContent}>
      {/* Category Header */}
      <View style={styles.detailHeader}>
        <View style={styles.detailTitle}>
          <Text style={styles.categoryTitle}>{data.name}</Text>
          <View style={styles.categoryBadges}>
            <View style={[styles.badge, styles.statusBadge]}>
              <Text style={styles.badgeText}>
                {data.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <View style={[styles.badge, styles.typeBadge]}>
              <Text style={styles.badgeText}>
                {isMainCategory ? 'Main Category' : 'Subcategory'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.detailActions}>
          {isMainCategory && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.addSubBtn]}
              onPress={() => onAddSubcategory(data.id)}
            >
              <Text style={styles.actionBtnText}>Add Subcategory</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => onEdit(type, data, selectedItem.parentId)}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => onDelete(data)}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Details */}
      <View style={styles.detailSection}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category ID</Text>
          <Text style={styles.detailValue}>{data.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>
            {isMainCategory ? 'Main Category' : 'Subcategory'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={styles.detailValue}>
            {data.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Subcategories Section (for main categories) */}
      {isMainCategory && mainCategory.sub_categories && (
        <View style={styles.subcategoriesSection}>
          <Text style={styles.sectionTitle}>
            Subcategories ({mainCategory.sub_categories.length})
          </Text>
          <ScrollView
            style={styles.subcategoriesList}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {mainCategory.sub_categories.map((sub) => (
              <View key={sub.id} style={styles.subcategoryCard}>
                <View style={styles.subcategoryInfo}>
                  <Text style={styles.subcategoryCardName}>{sub.name}</Text>
                  <Text style={styles.subcategoryCardDesc}>
                    {sub.description || 'No description provided'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() =>
                    onSelectCategory('sub', sub, selectedItem.data.id)
                  }
                >
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  addButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    boxShadow: '0px 4px 8px rgba(59, 130, 246, 0.3)',
    elevation: 8,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Main Content
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },

  // Sidebar
  sidebar: {
    width: 350,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    padding: 20,
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  treeContainer: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: 4,
  },

  // Category Items
  mainCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  selectedItem: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryIconText: {
    fontSize: 16,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
    borderRadius: 4,
  },
  expandIcon: {
    fontSize: 10,
    color: '#64748b',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#10b981',
  },
  inactiveDot: {
    backgroundColor: '#ef4444',
  },

  // Sub Categories
  subCategoriesContainer: {
    marginLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
    paddingLeft: 16,
  },
  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginBottom: 1,
  },
  subCategoryIcon: {
    marginRight: 8,
  },
  subCategoryIconText: {
    fontSize: 14,
  },
  subCategoryName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },

  // Detail Panel
  detailPanel: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  emptySelection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 300,
  },

  // Detail Content
  detailContent: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  detailTitle: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  categoryBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
  },
  typeBadge: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addSubBtn: {
    backgroundColor: '#3b82f6',
  },
  editBtn: {
    backgroundColor: '#64748b',
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Detail Sections
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '400',
  },

  // Subcategories Section
  subcategoriesSection: {
    flex: 1,
  },
  subcategoriesList: {
    flex: 1,
  },
  subcategoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  subcategoryInfo: {
    flex: 1,
  },
  subcategoryCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  subcategoryCardDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  viewBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CategoryTreeInterface;
