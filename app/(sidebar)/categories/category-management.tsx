/**
 * Category Management Page
 *
 * Smart component that handles all logic and passes data to dumb UI component
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import CategoryFormModal from '@/components/organisms/CategoryFormModal';
import CategoryTreeInterface from '@/components/organisms/CategoryTreeInterface';
import {
  useDeleteMainCategory,
  useDeleteSubCategory,
  useMainCategories,
} from '@/hooks/features/categories/useCategoryManagement';
import { MainCategoryWithSubCategories, SubCategory } from '@/schemas';

interface ModalState {
  isVisible: boolean;
  type: 'main' | 'sub';
  mode: 'create' | 'edit';
  category?: MainCategoryWithSubCategories | SubCategory;
  parentCategoryId?: string;
}

type SelectedItem = {
  type: 'main' | 'sub';
  data: MainCategoryWithSubCategories | SubCategory;
  parentId?: string;
};

const CategoryManagementPage = () => {
  // UI State
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isVisible: false,
    type: 'main',
    mode: 'create',
  });

  // Data fetching using existing hook
  const {
    data: mainCategoriesData,
    isLoading,
    isError,
    error,
  } = useMainCategories({
    search: '',
    page: 1,
    limit: 100, // Fetch enough to likely cover all for UI simplicity here
    sortBy: 'display_order',
    sortOrder: 'asc',
  });

  const mainCategories = useMemo(
    () => mainCategoriesData?.data || [],
    [mainCategoriesData]
  );

  // Effect to refresh selectedItem data when mainCategories changes
  useEffect(() => {
    if (!selectedItem || mainCategories.length === 0) return;

    if (selectedItem.type === 'main') {
      const newMainCategoryData = mainCategories.find(
        (mc) => mc.id === selectedItem.data.id
      );
      if (newMainCategoryData) {
        const currentMainCategoryData =
          selectedItem.data as MainCategoryWithSubCategories;

        const oldSubCategories = currentMainCategoryData.sub_categories;
        const oldSubCount = oldSubCategories?.length ?? -1;

        const newSubCategories = newMainCategoryData.sub_categories;
        const newSubCount = newSubCategories?.length ?? -1;

        const nameChanged =
          currentMainCategoryData.name !== newMainCategoryData.name;
        const statusChanged =
          currentMainCategoryData.is_active !== newMainCategoryData.is_active;

        // Update if the main category object reference is different,
        // or if the sub_categories array reference or length has changed,
        // or if other relevant properties like name or status have changed.
        if (
          currentMainCategoryData !== newMainCategoryData ||
          oldSubCategories !== newSubCategories ||
          oldSubCount !== newSubCount ||
          nameChanged ||
          statusChanged
        ) {
          setSelectedItem({ type: 'main', data: newMainCategoryData });
        }
      } else {
        setSelectedItem(null); // Main category was deleted or not found
      }
    } else if (selectedItem.type === 'sub' && selectedItem.parentId) {
      const parentCategory = mainCategories.find(
        (mc) => mc.id === selectedItem.parentId
      );
      if (parentCategory?.sub_categories) {
        const newSubCategoryData = parentCategory.sub_categories.find(
          (sc) => sc.id === selectedItem.data.id
        );
        if (newSubCategoryData) {
          if (selectedItem.data !== newSubCategoryData) {
            setSelectedItem({
              type: 'sub',
              data: newSubCategoryData,
              parentId: selectedItem.parentId,
            });
          }
        } else {
          setSelectedItem(null); // Sub-category was deleted or not found
        }
      } else {
        setSelectedItem(null); // Parent category or its sub_categories not found
      }
    }
  }, [mainCategories, selectedItem]); // Rerun when mainCategories or selectedItem reference changes

  // Mutations
  const deleteMainCategoryMutation = useDeleteMainCategory();
  const deleteSubCategoryMutation = useDeleteSubCategory();

  // Statistics
  const stats = useMemo(() => {
    const totalMainCategories = mainCategories.length;
    const totalSubCategories = mainCategories.reduce(
      (total, category) => total + (category.sub_categories?.length || 0),
      0
    );
    const totalShowing = expandedCategories.size;

    return { totalMainCategories, totalSubCategories, totalShowing };
  }, [mainCategories, expandedCategories]);

  // Event handlers
  const handleToggleExpansion = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);
  const handleSelectCategory = useCallback(
    (
      type: 'main' | 'sub',
      data: MainCategoryWithSubCategories | SubCategory,
      parentId?: string
    ) => {
      setSelectedItem({ type, data, parentId });

      // Auto-expand parent main category when a subcategory is selected
      if (type === 'sub' && parentId) {
        setExpandedCategories((prev) => {
          const newSet = new Set(prev);
          if (!newSet.has(parentId)) {
            newSet.add(parentId);
          }
          return newSet;
        });
      }
    },
    []
  );

  const handleOpenModal = useCallback(
    (
      type: 'main' | 'sub',
      mode: 'create' | 'edit',
      category?: MainCategoryWithSubCategories | SubCategory,
      parentCategoryId?: string
    ) => {
      setModalState({
        isVisible: true,
        type,
        mode,
        category,
        parentCategoryId,
      });
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setModalState({
      isVisible: false,
      type: 'main',
      mode: 'create',
    });
  }, []);
  const handleDeleteMainCategory = useCallback(
    (category: MainCategoryWithSubCategories) => {
      Alert.alert(
        'Delete Main Category',
        `Are you sure you want to delete "${category.name}"? This will also delete all associated sub-categories.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMainCategoryMutation.mutateAsync(category.id);

                // Clear selection if the deleted category was selected
                if (
                  selectedItem?.type === 'main' &&
                  selectedItem.data.id === category.id
                ) {
                  setSelectedItem(null);
                }

                // Show success message
                Alert.alert('Success', 'Main category deleted successfully');
              } catch (error) {
                console.error('Delete main category error:', error);

                Alert.alert(
                  'Delete Failed',
                  error instanceof Error
                    ? error.message
                    : 'Failed to delete main category'
                );
              }
            },
          },
        ]
      );
    },
    [deleteMainCategoryMutation, selectedItem]
  );
  const handleDeleteSubCategory = useCallback(
    (category: SubCategory) => {
      Alert.alert(
        'Delete Sub-Category',
        `Are you sure you want to delete "${category.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteSubCategoryMutation.mutateAsync(category.id);

                // Clear selection if the deleted category was selected
                if (
                  selectedItem?.type === 'sub' &&
                  selectedItem.data.id === category.id
                ) {
                  setSelectedItem(null);
                }

                // Show success message
                Alert.alert('Success', 'Sub-category deleted successfully');
              } catch (error) {
                console.error('Delete sub-category error:', error);

                Alert.alert(
                  'Delete Failed',
                  error instanceof Error
                    ? error.message
                    : 'Failed to delete sub-category'
                );
              }
            },
          },
        ]
      );
    },
    [deleteSubCategoryMutation, selectedItem]
  );

  return (
    <>
      <CategoryTreeInterface
        mainCategories={mainCategories}
        isLoading={isLoading}
        isError={isError}
        error={error?.message}
        stats={stats}
        expandedCategories={expandedCategories}
        selectedItem={selectedItem}
        onToggleExpansion={handleToggleExpansion}
        onSelectCategory={handleSelectCategory}
        onOpenModal={handleOpenModal}
        onDeleteMainCategory={handleDeleteMainCategory}
        onDeleteSubCategory={handleDeleteSubCategory}
      />

      {modalState.isVisible && (
        <CategoryFormModal
          isVisible={modalState.isVisible}
          type={modalState.type}
          mode={modalState.mode}
          category={modalState.category}
          parentCategoryId={modalState.parentCategoryId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default CategoryManagementPage;
