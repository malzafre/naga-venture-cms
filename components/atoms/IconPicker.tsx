import {
  Barbell,
  Bathtub,
  BellSimple,
  BookOpen,
  Buildings,
  Cake,
  Camera,
  Car,
  Cigarette,
  Coffee,
  CreditCard,
  Elevator,
  Fire,
  FirstAid,
  ForkKnife,
  GameController,
  Gear,
  Globe,
  Hamburger,
  Heart,
  House,
  Lightning,
  Martini,
  MusicNote,
  PawPrint,
  Phone,
  Pizza,
  Plus,
  ShieldCheck,
  Snowflake,
  Star,
  Television,
  Users,
  Waves,
  WifiHigh,
  WifiX,
  Wine,
  XCircle,
} from 'phosphor-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CMSText from './CMSText';

/**
 * IconPicker Atom Component
 *
 * A modal-based icon picker for selecting Phosphor icons for amenities.
 * Features categorized icons with search functionality.
 *
 * Following atomic design principles and project coding guidelines.
 */

// Available icons organized by category for better UX
const ICON_CATEGORIES = {
  'Basic Amenities': {
    'ph:wifi-high': WifiHigh,
    'ph:wifi-x': WifiX,
    'ph:car': Car,
    'ph:elevator': Elevator,
    'ph:phone': Phone,
    'ph:television': Television,
    'ph:snowflake': Snowflake,
  },
  'Dining & Food': {
    'ph:fork-knife': ForkKnife,
    'ph:coffee': Coffee,
    'ph:pizza': Pizza,
    'ph:hamburger': Hamburger,
    'ph:wine': Wine,
    'ph:martini': Martini,
    'ph:cake': Cake,
  },
  'Recreation & Leisure': {
    'ph:waves': Waves,
    'ph:barbell': Barbell,
    'ph:game-controller': GameController,
    'ph:music-note': MusicNote,
    'ph:camera': Camera,
    'ph:book-open': BookOpen,
  },
  'Services & Facilities': {
    'ph:credit-card': CreditCard,
    'ph:first-aid': FirstAid,
    'ph:shield-check': ShieldCheck,
    'ph:bathtub': Bathtub,
    'ph:users': Users,
    'ph:buildings': Buildings,
  },
  'Comfort & Convenience': {
    'ph:house': House,
    'ph:bell-simple': BellSimple,
    'ph:gear': Gear,
    'ph:lightning': Lightning,
    'ph:fire': Fire,
    'ph:globe': Globe,
  },
  'Special Features': {
    'ph:paw-print': PawPrint,
    'ph:cigarette': Cigarette,
    'ph:star': Star,
    'ph:heart': Heart,
  },
} as const;

// Flatten all icons for search
const ALL_ICONS = Object.entries(ICON_CATEGORIES).reduce(
  (acc, [category, icons]) => {
    Object.entries(icons).forEach(([key, icon]) => {
      acc[key] = { icon, category };
    });
    return acc;
  },
  {} as Record<string, { icon: React.ComponentType<any>; category: string }>
);

interface IconPickerProps {
  selectedIcon?: string | null;
  onIconSelect: (iconKey: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onIconSelect,
  placeholder = 'Select an icon',
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<string>('Basic Amenities');

  // Filter icons based on search query
  const filteredIcons = React.useMemo(() => {
    if (!searchQuery) {
      return (
        ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES] || {}
      );
    }

    return Object.entries(ALL_ICONS)
      .filter(
        ([key, { category }]) =>
          key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .reduce(
        (acc, [key, { icon }]) => {
          acc[key] = icon;
          return acc;
        },
        {} as Record<string, React.ComponentType<any>>
      );
  }, [searchQuery, selectedCategory]);

  const handleIconSelect = (iconKey: string) => {
    onIconSelect(iconKey);
    setIsModalVisible(false);
    setSearchQuery('');
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSearchQuery('');
  };

  // Get the selected icon component
  const SelectedIconComponent = selectedIcon
    ? ALL_ICONS[selectedIcon]?.icon
    : null;

  return (
    <>
      {/* Icon Picker Button */}
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.disabledButton]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.pickerContent}>
          {SelectedIconComponent ? (
            <SelectedIconComponent size={24} color="#666" />
          ) : (
            <Plus size={24} color="#999" />
          )}
          <CMSText style={styles.pickerText}>
            {selectedIcon ? 'Change Icon' : placeholder}
          </CMSText>
        </View>
      </TouchableOpacity>

      {/* Icon Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <CMSText style={styles.modalTitle}>Select Icon</CMSText>
            <TouchableOpacity
              onPress={handleModalClose}
              style={styles.closeButton}
            >
              <XCircle size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search icons..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Category Tabs (only show when not searching) */}
          {!searchQuery && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabs}
            >
              {Object.keys(ICON_CATEGORIES).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category && styles.activeCategoryTab,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <CMSText
                    style={[
                      styles.categoryTabText,
                      selectedCategory === category &&
                        styles.activeCategoryTabText,
                    ]}
                  >
                    {category}
                  </CMSText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Icons Grid */}
          <ScrollView
            style={styles.iconsContainer}
            contentContainerStyle={styles.iconsGrid}
          >
            {Object.entries(filteredIcons).map(([iconKey, IconComponent]) => (
              <TouchableOpacity
                key={iconKey}
                style={[
                  styles.iconItem,
                  selectedIcon === iconKey && styles.selectedIconItem,
                ]}
                onPress={() => handleIconSelect(iconKey)}
              >
                <IconComponent
                  size={32}
                  color={selectedIcon === iconKey ? '#007AFF' : '#666'}
                />
                <CMSText style={styles.iconLabel}>
                  {iconKey.replace('ph:', '').replace(/-/g, ' ')}
                </CMSText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* No Results */}
          {Object.keys(filteredIcons).length === 0 && (
            <View style={styles.noResultsContainer}>
              <CMSText style={styles.noResultsText}>No icons found</CMSText>
              <CMSText style={styles.noResultsSubtext}>
                Try a different search term or browse categories
              </CMSText>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  categoryTabs: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeCategoryTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  iconsContainer: {
    flex: 1,
  },
  iconsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconItem: {
    width: '23%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedIconItem: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  iconLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
