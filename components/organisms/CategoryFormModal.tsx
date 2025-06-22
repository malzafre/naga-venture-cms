// filepath: components/organisms/CategoryFormModal.tsx
/**
 * Category Form Modal Component
 *
 * A floating modal for creating and editing main and sub-categories.
 * Uses React Hook Form with Zod validation for robust form handling.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useCreateMainCategory,
  useCreateSubCategory,
  useUpdateMainCategory,
  useUpdateSubCategory,
} from '@/hooks/features/categories/useCategoryManagement';
import { type MainCategory, type SubCategory } from '@/schemas';
import {
  MainCategoryCreateSchema as MainCategoryCreateFormSchema,
  MainCategoryUpdateSchema as MainCategoryUpdateFormSchema,
  SubCategoryCreateSchema as SubCategoryCreateFormSchema,
  SubCategoryUpdateSchema as SubCategoryUpdateFormSchema,
} from '@/schemas/content/category.schemas';

// ============================================================================
// TYPES
// ============================================================================

interface CategoryFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'main' | 'sub';
  mode: 'create' | 'edit';
  category?: MainCategory | SubCategory;
  parentCategoryId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isVisible,
  onClose,
  type,
  mode,
  category,
  parentCategoryId,
}) => {
  // Destructure the specific mutation hooks
  const createMainCategoryMutation = useCreateMainCategory();
  const updateMainCategoryMutation = useUpdateMainCategory();
  const createSubCategoryMutation = useCreateSubCategory();
  const updateSubCategoryMutation = useUpdateSubCategory();

  // Form setup based on type and mode
  const schema = React.useMemo(() => {
    if (type === 'main') {
      return mode === 'create'
        ? MainCategoryCreateFormSchema
        : MainCategoryUpdateFormSchema;
    } else {
      return mode === 'create'
        ? SubCategoryCreateFormSchema.omit({ main_category_id: true })
        : SubCategoryUpdateFormSchema.omit({ main_category_id: true });
    }
  }, [type, mode]);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
      display_order: 0,
    },
  });
  // Check if any mutation is in progress
  const isMutationInProgress =
    createMainCategoryMutation.isPending ||
    updateMainCategoryMutation.isPending ||
    createSubCategoryMutation.isPending ||
    updateSubCategoryMutation.isPending;

  // Reset form when modal opens with category data
  useEffect(() => {
    if (isVisible) {
      if (mode === 'edit' && category) {
        reset({
          name: category.name,
          description: category.description || '',
          is_active: category.is_active,
          display_order: category.display_order,
        });
      } else {
        reset({
          name: '',
          description: '',
          is_active: true,
          display_order: 0,
        });
      }
    }
  }, [isVisible, mode, category, reset]);

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      let successMessage = '';

      // Helper function to properly transform description for API
      const transformDescription = (
        desc: string | undefined
      ): string | null => {
        return desc && desc.trim() !== '' ? desc.trim() : null;
      };

      if (type === 'main') {
        if (mode === 'create') {
          // For create operations, prepare data with correct types
          const createData: any = {
            name: data.name,
            is_active: data.is_active ?? true,
            display_order: data.display_order ?? 0,
          };

          // Only include description if it has content
          const description = transformDescription(data.description);
          if (description !== null) {
            createData.description = description;
          }

          await createMainCategoryMutation.mutateAsync(createData);
          successMessage = 'Main category created successfully';
        } else if (mode === 'edit' && category) {
          // For update operations, only include defined fields
          const updateData: any = {
            name: data.name,
            is_active: data.is_active,
            display_order: data.display_order,
          };

          // Only include description if it has a meaningful value
          const description = transformDescription(data.description);
          if (description !== null) {
            updateData.description = description;
          }

          await updateMainCategoryMutation.mutateAsync({
            id: category.id,
            updates: updateData,
          });
          successMessage = 'Main category updated successfully';
        }
      } else {
        if (mode === 'create' && parentCategoryId) {
          // For create operations, prepare data with correct types
          const createData: any = {
            main_category_id: parentCategoryId,
            name: data.name,
            is_active: data.is_active ?? true,
            display_order: data.display_order ?? 0,
          };

          // Only include description if it has content
          const description = transformDescription(data.description);
          if (description !== null) {
            createData.description = description;
          }

          await createSubCategoryMutation.mutateAsync(createData);
          successMessage = 'Sub-category created successfully';
        } else if (mode === 'edit' && category) {
          // For update operations, only include defined fields
          const updateData: any = {
            name: data.name,
            is_active: data.is_active,
            display_order: data.display_order,
          };

          // Only include description if it has a meaningful value
          const description = transformDescription(data.description);
          if (description !== null) {
            updateData.description = description;
          }

          await updateSubCategoryMutation.mutateAsync({
            id: category.id,
            updates: updateData,
          });
          successMessage = 'Sub-category updated successfully';
        }
      }

      // Success: reset form, close modal, and show success message
      reset();
      onClose();

      // Show success message after a small delay to ensure modal is closed
      setTimeout(() => {
        Alert.alert('Success', successMessage);
      }, 100);
    } catch (error) {
      // Error handling - show alert but keep modal open
      console.error('Form submission error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An error occurred'
      );
    }
  };

  const getModalTitle = () => {
    const action = mode === 'create' ? 'Create' : 'Edit';
    const categoryType = type === 'main' ? 'Main Category' : 'Sub-Category';
    return `${action} ${categoryType}`;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Name *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.name && styles.textInputError,
                    ]}
                    placeholder="Enter category name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}
            </View>

            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textAreaInput,
                      errors.description && styles.textInputError,
                    ]}
                    placeholder="Enter category description (optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.description && (
                <Text style={styles.errorText}>
                  {errors.description.message}
                </Text>
              )}
            </View>

            {/* Display Order Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Display Order</Text>
              <Controller
                control={control}
                name="display_order"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.display_order && styles.textInputError,
                    ]}
                    placeholder="0"
                    value={value?.toString() || '0'}
                    onChangeText={(text) => onChange(parseInt(text) || 0)}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
              {errors.display_order && (
                <Text style={styles.errorText}>
                  {errors.display_order.message}
                </Text>
              )}
            </View>

            {/* Active Status */}
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="is_active"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => onChange(!value)}
                  >
                    <View
                      style={[styles.checkbox, value && styles.checkboxChecked]}
                    >
                      {value && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Active</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (isSubmitting || isMutationInProgress) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || isMutationInProgress}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting || isMutationInProgress
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create'
                    : 'Update'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textAreaInput: {
    height: 80,
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
});

export default CategoryFormModal;
