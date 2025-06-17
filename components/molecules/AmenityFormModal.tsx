import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Modal, ScrollView, StyleSheet, View } from 'react-native';

import { CMSButton, CMSInput, CMSText, IconPicker } from '@/components/atoms';
import {
  useCreateAmenity,
  useUpdateAmenity,
  useValidateAmenityName,
} from '@/hooks/useAmenitiesManagement';
import type { Amenity } from '@/schemas/amenitiesSchemas';
import { AmenityFormData, AmenityFormSchema } from '@/schemas/amenitiesSchemas';

/**
 * AmenityFormModal - Molecule Component
 *
 * A reusable modal form for creating and editing amenities.
 * Handles validation, submission, and error states.
 *
 * Following the "Smart Hook, Dumb Component" pattern with comprehensive validation.
 */

interface AmenityFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  amenity?: Amenity | null;
  onSuccess?: () => void;
}

export const AmenityFormModal: React.FC<AmenityFormModalProps> = ({
  isVisible,
  onClose,
  mode,
  amenity,
  onSuccess,
}) => {
  // Form management with Zod validation
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid, isDirty },
  } = useForm<AmenityFormData>({
    resolver: zodResolver(AmenityFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      icon_url: null,
    },
  });

  // Watch name field for real-time validation
  const watchedName = watch('name');

  // Mutations
  const createAmenityMutation = useCreateAmenity();
  const updateAmenityMutation = useUpdateAmenity();
  const validateNameMutation = useValidateAmenityName();

  // Reset form when modal opens/closes or amenity changes
  useEffect(() => {
    if (isVisible) {
      if (mode === 'edit' && amenity) {
        reset({
          name: amenity.name,
          icon_url: amenity.icon_url,
        });
      } else {
        reset({
          name: '',
          icon_url: null,
        });
      }
    }
  }, [isVisible, mode, amenity, reset]);

  // Real-time name validation
  useEffect(() => {
    if (watchedName && watchedName.length >= 2) {
      const timeoutId = setTimeout(() => {
        validateNameMutation.mutate(
          {
            name: watchedName,
            excludeId: mode === 'edit' ? amenity?.id : undefined,
          },
          {
            onSuccess: (isAvailable) => {
              if (!isAvailable) {
                setError('name', {
                  type: 'manual',
                  message: 'An amenity with this name already exists',
                });
              } else {
                clearErrors('name');
              }
            },
          }
        );
      }, 500); // Debounce validation

      return () => clearTimeout(timeoutId);
    }
  }, [
    watchedName,
    validateNameMutation,
    setError,
    clearErrors,
    mode,
    amenity?.id,
  ]);

  // Form submission
  const onSubmit = async (data: AmenityFormData) => {
    try {
      if (mode === 'create') {
        await createAmenityMutation.mutateAsync(data);
        Alert.alert('Success', 'Amenity created successfully');
      } else if (mode === 'edit' && amenity) {
        await updateAmenityMutation.mutateAsync({
          id: amenity.id,
          data,
        });
        Alert.alert('Success', 'Amenity updated successfully');
      }

      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      Alert.alert('Error', 'Failed to save amenity. Please try again.');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading =
    createAmenityMutation.isPending || updateAmenityMutation.isPending;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <CMSText style={styles.title}>
            {mode === 'create' ? 'Create New Amenity' : 'Edit Amenity'}
          </CMSText>{' '}
          <CMSButton
            title="✕"
            variant="secondary"
            size="small"
            onPress={handleClose}
            style={styles.closeButton}
          />
        </View>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Amenity Name Field */}
            <View style={styles.fieldContainer}>
              <CMSText style={styles.fieldLabel}>Amenity Name *</CMSText>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CMSInput
                    placeholder="Enter amenity name (e.g., Free WiFi, Pool, Parking)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message || ''}
                    maxLength={50}
                    autoFocus={mode === 'create'}
                  />
                )}
              />
              {validateNameMutation.isPending && (
                <CMSText style={styles.validatingText}>
                  Checking availability...
                </CMSText>
              )}
            </View>

            {/* Icon Picker Field */}
            <View style={styles.fieldContainer}>
              <CMSText style={styles.fieldLabel}>Icon (Optional)</CMSText>
              <Controller
                control={control}
                name="icon_url"
                render={({ field: { onChange, value } }) => (
                  <IconPicker
                    selectedIcon={value}
                    onIconSelect={onChange}
                    placeholder="Choose an icon for this amenity"
                    disabled={isLoading}
                  />
                )}
              />
              <CMSText style={styles.fieldHint}>
                Select an icon to help users identify this amenity quickly
              </CMSText>
            </View>

            {/* Preview Section */}
            {watchedName && (
              <View style={styles.previewContainer}>
                <CMSText style={styles.previewLabel}>Preview:</CMSText>
                <View style={styles.previewCard}>
                  <Controller
                    control={control}
                    name="icon_url"
                    render={({ field: { value } }) => {
                      // Simple icon preview (we'll need to import the component dynamically)
                      return (
                        <View style={styles.previewIcon}>
                          <CMSText style={styles.previewIconText}>
                            {value ? '🏷️' : '📋'}
                          </CMSText>
                        </View>
                      );
                    }}
                  />
                  <CMSText style={styles.previewText}>{watchedName}</CMSText>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {' '}
          <CMSButton
            title="Cancel"
            variant="secondary"
            onPress={handleClose}
            disabled={isLoading}
            style={styles.footerButton}
          />
          <CMSButton
            title={mode === 'create' ? 'Create Amenity' : 'Update Amenity'}
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || !isDirty || isLoading}
            loading={isLoading}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  validatingText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  previewContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  previewIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewIconText: {
    fontSize: 20,
  },
  previewText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
