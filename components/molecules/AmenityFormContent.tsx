import { useTheme } from '@/constants/useTheme';
import {
  useCreateAmenity,
  useUpdateAmenity,
} from '@/hooks/useAmenitiesManagement';
import { AmenityComplete, AmenityInsert } from '@/schemas/amenitiesSchemas';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * AmenityFormContent - Molecule Component
 *
 * Form content for creating and editing amenities in the web CMS.
 * Designed to work inside a FloatingModal with desktop-optimized layout.
 * Features larger touch targets, proper spacing, and web-appropriate styling.
 */

interface AmenityFormContentProps {
  isVisible: boolean;
  mode: 'create' | 'edit';
  amenity?: AmenityComplete;
  onClose: () => void;
  onSuccess: () => void;
}

export const AmenityFormContent: React.FC<AmenityFormContentProps> = ({
  isVisible,
  mode,
  amenity,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const createAmenity = useCreateAmenity();
  const updateAmenity = useUpdateAmenity();

  // Helper function to convert icon URL to MaterialIcons name
  const getIconFromUrl = useCallback((iconUrl?: string) => {
    if (!iconUrl) return 'category';
    // Extract icon name from phosphor URL format
    const iconName = iconUrl
      .replace('ph:', '')
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return iconName as keyof typeof MaterialIcons.glyphMap;
  }, []);
  // Form state
  const [formData, setFormData] = useState({
    name: amenity?.name || '',
    icon_url: amenity?.icon_url || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showIconPicker, setShowIconPicker] = useState(false);
  // Update form data when amenity prop changes (for edit mode)
  useEffect(() => {
    if (amenity) {
      setFormData({
        name: amenity.name || '',
        icon_url: amenity.icon_url || '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        icon_url: '',
      });
    }
    // Clear any existing errors when switching modes/amenities
    setErrors({});
  }, [amenity]);

  // Comprehensive icon options organized by category
  const iconCategories = {
    'Basic Amenities': [
      { key: 'wifi', name: 'WiFi' },
      { key: 'car', name: 'Parking' },
      { key: 'elevator', name: 'Elevator' },
      { key: 'phone', name: 'Phone' },
      { key: 'tv', name: 'Television' },
      { key: 'ac-unit', name: 'Air Conditioning' },
      { key: 'power', name: 'Power' },
      { key: 'key', name: 'Key Card' },
    ],
    'Dining & Food': [
      { key: 'restaurant', name: 'Restaurant' },
      { key: 'local-cafe', name: 'Cafe' },
      { key: 'local-bar', name: 'Bar' },
      { key: 'room-service', name: 'Room Service' },
      { key: 'kitchen', name: 'Kitchen' },
      { key: 'local-pizza', name: 'Pizza' },
      { key: 'wine-bar', name: 'Wine Bar' },
      { key: 'bakery-dining', name: 'Bakery' },
    ],
    'Recreation & Sports': [
      { key: 'pool', name: 'Swimming Pool' },
      { key: 'fitness-center', name: 'Fitness Center' },
      { key: 'sports-tennis', name: 'Tennis' },
      { key: 'sports-golf', name: 'Golf' },
      { key: 'spa', name: 'Spa' },
      { key: 'beach-access', name: 'Beach Access' },
      { key: 'casino', name: 'Casino' },
      { key: 'sports-basketball', name: 'Basketball' },
    ],
    'Services & Facilities': [
      { key: 'business-center', name: 'Business Center' },
      { key: 'meeting-room', name: 'Meeting Room' },
      { key: 'local-laundry-service', name: 'Laundry' },
      { key: 'luggage', name: 'Luggage Service' },
      { key: 'concierge-bell', name: 'Concierge' },
      { key: 'security', name: 'Security' },
      { key: 'medical-services', name: 'Medical Services' },
      { key: 'local-atm', name: 'ATM' },
    ],
    Transportation: [
      { key: 'airport-shuttle', name: 'Airport Shuttle' },
      { key: 'local-taxi', name: 'Taxi Service' },
      { key: 'train', name: 'Train Access' },
      { key: 'directions-bus', name: 'Bus Access' },
      { key: 'ev-station', name: 'EV Charging' },
      { key: 'local-shipping', name: 'Shipping' },
      { key: 'bike-scooter', name: 'Bike Rental' },
      { key: 'local-gas-station', name: 'Gas Station' },
    ],
    'Comfort & Convenience': [
      { key: 'hot-tub', name: 'Hot Tub' },
      { key: 'fireplace', name: 'Fireplace' },
      { key: 'balcony', name: 'Balcony' },
      { key: 'view-quilt', name: 'City View' },
      { key: 'nightlife', name: 'Nightlife' },
      { key: 'shopping-cart', name: 'Shopping' },
      { key: 'local-grocery-store', name: 'Grocery Store' },
      { key: 'pharmacy', name: 'Pharmacy' },
    ],
    'Special Features': [
      { key: 'pets', name: 'Pet Friendly' },
      { key: 'smoking-rooms', name: 'Smoking Allowed' },
      { key: 'no-smoking', name: 'Non-Smoking' },
      { key: 'accessible', name: 'Accessible' },
      { key: 'family-restroom', name: 'Family Friendly' },
      { key: 'star', name: 'Premium' },
      { key: 'eco', name: 'Eco Friendly' },
      { key: 'celebration', name: 'Event Venue' },
    ],
  };

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Amenity name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Amenity name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Amenity name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (mode === 'create') {
        const createData: AmenityInsert = {
          name: formData.name.trim(),
          icon_url: formData.icon_url.trim() || null,
        };
        await createAmenity.mutateAsync(createData);
      } else if (amenity) {
        const updateData = {
          id: amenity.id,
          data: {
            name: formData.name.trim(),
            icon_url: formData.icon_url.trim() || null,
          },
        };
        await updateAmenity.mutateAsync(updateData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving amenity:', error);
      Alert.alert('Error', `Failed to ${mode} amenity. Please try again.`, [
        { text: 'OK' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [
    mode,
    formData,
    amenity,
    validateForm,
    createAmenity,
    updateAmenity,
    onSuccess,
  ]); // Handle input changes
  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    },
    [errors]
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.modal, { backgroundColor: colors.backgroundCard }]}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {mode === 'create' ? 'Add New Amenity' : 'Edit Amenity'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={onClose}
                disabled={isLoading}
              >
                <MaterialIcons
                  name="close"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {/* Form Content */}
            <View style={styles.formContent}>
              <View style={styles.form}>
                {/* Amenity Name */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Amenity Name *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: errors.name ? colors.error : colors.border,
                        color: colors.text,
                      },
                    ]}
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Enter amenity name"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="words"
                    maxLength={50}
                    editable={!isLoading}
                  />
                  {errors.name && (
                    <Text style={[styles.errorText, { color: colors.error }]}>
                      {errors.name}
                    </Text>
                  )}
                </View>{' '}
                {/* Icon Selection */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Icon (Optional)
                  </Text>

                  {/* Current Selection Display */}
                  <TouchableOpacity
                    style={[
                      styles.iconSelector,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setShowIconPicker(true)}
                    disabled={isLoading}
                  >
                    <View style={styles.iconDisplay}>
                      {formData.icon_url ? (
                        <>
                          <MaterialIcons
                            name={getIconFromUrl(formData.icon_url)}
                            size={24}
                            color={colors.primary}
                          />
                          <Text
                            style={[styles.iconText, { color: colors.text }]}
                          >
                            {formData.icon_url}
                          </Text>
                        </>
                      ) : (
                        <>
                          <MaterialIcons
                            name="add"
                            size={24}
                            color={colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.iconText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Select an icon
                          </Text>
                        </>
                      )}
                    </View>
                    <MaterialIcons
                      name="expand-more"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  <Text
                    style={[styles.helpText, { color: colors.textSecondary }]}
                  >
                    Click to choose from available icons
                  </Text>
                </View>
                {/* Icon Picker Modal */}
                {showIconPicker && (
                  <Modal
                    visible={showIconPicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowIconPicker(false)}
                  >
                    <View style={styles.iconModalOverlay}>
                      <View
                        style={[
                          styles.iconModal,
                          { backgroundColor: colors.backgroundCard },
                        ]}
                      >
                        {/* Modal Header */}
                        <View style={styles.iconModalHeader}>
                          <Text
                            style={[
                              styles.iconModalTitle,
                              { color: colors.text },
                            ]}
                          >
                            Select Icon
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowIconPicker(false)}
                            style={[
                              styles.iconModalClose,
                              { backgroundColor: colors.backgroundSecondary },
                            ]}
                          >
                            <MaterialIcons
                              name="close"
                              size={20}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                        </View>{' '}
                        {/* Icon Categories */}
                        <ScrollView
                          style={styles.iconModalContent}
                          showsVerticalScrollIndicator={false}
                        >
                          {Object.entries(iconCategories).map(
                            ([category, icons]) => (
                              <View key={category} style={styles.iconCategory}>
                                <Text
                                  style={[
                                    styles.iconCategoryTitle,
                                    { color: colors.text },
                                  ]}
                                >
                                  {category}
                                </Text>
                                <View style={styles.iconGrid}>
                                  {icons.map((icon) => (
                                    <TouchableOpacity
                                      key={icon.key}
                                      style={[
                                        styles.iconOption,
                                        {
                                          backgroundColor:
                                            colors.backgroundSecondary,
                                          borderColor:
                                            formData.icon_url === icon.key
                                              ? colors.primary
                                              : colors.border,
                                        },
                                      ]}
                                      onPress={() => {
                                        handleInputChange('icon_url', icon.key);
                                        setShowIconPicker(false);
                                      }}
                                    >
                                      <MaterialIcons
                                        name={
                                          icon.key as keyof typeof MaterialIcons.glyphMap
                                        }
                                        size={24}
                                        color={
                                          formData.icon_url === icon.key
                                            ? colors.primary
                                            : colors.textSecondary
                                        }
                                      />
                                      <Text
                                        style={[
                                          styles.iconOptionText,
                                          {
                                            color:
                                              formData.icon_url === icon.key
                                                ? colors.primary
                                                : colors.textSecondary,
                                          },
                                        ]}
                                        numberOfLines={2}
                                      >
                                        {icon.name}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              </View>
                            )
                          )}
                        </ScrollView>
                        {/* Clear Selection Option */}
                        <View style={styles.iconModalFooter}>
                          <TouchableOpacity
                            style={[
                              styles.iconClearButton,
                              {
                                backgroundColor: colors.error + '15',
                                borderColor: colors.error,
                              },
                            ]}
                            onPress={() => {
                              handleInputChange('icon_url', '');
                              setShowIconPicker(false);
                            }}
                          >
                            <MaterialIcons
                              name="clear"
                              size={20}
                              color={colors.error}
                            />
                            <Text
                              style={[
                                styles.iconClearText,
                                { color: colors.error },
                              ]}
                            >
                              Clear Selection
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}{' '}
              </View>
            </View>{' '}
            {/* Action Buttons */}
            <View style={[styles.actions, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    backgroundColor: 'transparent',
                    borderColor: colors.border,
                  },
                ]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: isLoading
                      ? colors.textSecondary
                      : colors.primary,
                  },
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === 'create' ? 'Create Amenity' : 'Update Amenity'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 600,
  },
  container: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContent: {
    flex: 1,
    paddingVertical: 8,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
  helpText: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  selectedIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedIconText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  removeIconButton: {
    padding: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  iconOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
    maxWidth: '31%', // Roughly 3 columns with gaps
  },
  iconLabel: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    minWidth: 100,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    minWidth: 100,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  // Icon Picker Styles
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  iconDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconText: {
    fontSize: 14,
    fontWeight: '400',
  },
  iconModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconModal: {
    width: '100%',
    maxWidth: 800,
    height: '80%',
    maxHeight: 600,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  iconModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iconModalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconModalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconCategory: {
    marginBottom: 24,
  },
  iconCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconOptionText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  iconModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  iconClearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  iconClearText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
