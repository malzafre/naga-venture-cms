/**
 * Category Management Page
 *
 * Smart component that handles all logic and passes data to dumb UI component
 */
import React, { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import CategoryFormModal from '@/components/organisms/CategoryFormModal';
import CategoryTreeInterface from '@/components/organisms/CategoryTreeInterface';
import {
  useDeleteMainCategory,
  useDeleteSubCategory,
  useMainCategories,
} from '@/hooks/useCategoryManagement';
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
    limit: 100,
    sortBy: 'display_order',
    sortOrder: 'asc',
  });

  const mainCategories = useMemo(
    () => mainCategoriesData?.data || [],
    [mainCategoriesData]
  );

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
            onPress: () => {
              deleteMainCategoryMutation.mutate(category.id);
              if (
                selectedItem?.type === 'main' &&
                selectedItem.data.id === category.id
              ) {
                setSelectedItem(null);
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
            onPress: () => {
              deleteSubCategoryMutation.mutate(category.id);
              if (
                selectedItem?.type === 'sub' &&
                selectedItem.data.id === category.id
              ) {
                setSelectedItem(null);
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
