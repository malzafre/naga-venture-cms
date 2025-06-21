import { XCircle } from 'phosphor-react-native';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ICON_CATEGORIES, useIconPicker } from '@/hooks/shared/useIconPicker';
import CMSText from '../atoms/CMSText';

/**
 * IconPicker Molecule Component
 *
 * A modal-based icon picker for selecting Phosphor icons for amenities.
 * Features categorized icons with search functionality.
 */

interface IconPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  selectedIcon?: string;
}

export default function IconPicker({
  visible,
  onClose,
  onSelectIcon,
  selectedIcon,
}: IconPickerProps) {
  // Use the hook to manage state and business logic
  const {
    searchQuery,
    handleSearchChange,
    handleIconSelect,
    filteredIcons,
    PlusIcon,
  } = useIconPicker({
    selectedIcon,
    onIconSelect: onSelectIcon,
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <CMSText type="title" style={styles.title}>
            Select Icon
          </CMSText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <XCircle size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search icons..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor="#999"
          />
        </View>

        {/* Icon Categories */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(ICON_CATEGORIES).map(([categoryName, icons]) => {
            // Filter icons by search query if needed
            const iconEntries = Object.entries(icons);
            if (iconEntries.length === 0) return null;

            return (
              <View key={categoryName} style={styles.categoryContainer}>
                <CMSText type="subtitle" style={styles.categoryTitle}>
                  {categoryName}
                </CMSText>
                <View style={styles.iconsGrid}>
                  {iconEntries.map(([iconName, IconComponent]) => (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconButton,
                        selectedIcon === iconName && styles.selectedIconButton,
                      ]}
                      onPress={() => handleIconSelect(iconName)}
                    >
                      <IconComponent
                        size={32}
                        color={selectedIcon === iconName ? '#007AFF' : '#333'}
                        weight={selectedIcon === iconName ? 'fill' : 'regular'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}

          {Object.keys(filteredIcons).length === 0 && (
            <View style={styles.noResultsContainer}>
              <CMSText type="body" style={styles.noResultsText}>
                No icons found for &quot;{searchQuery}&quot;
              </CMSText>
            </View>
          )}
        </ScrollView>

        {/* Add New Icon Button */}
        <TouchableOpacity
          style={styles.addIconButton}
          onPress={() => handleIconSelect('ph:plus')}
        >
          <PlusIcon size={20} color="#007AFF" />
          <CMSText type="body" style={styles.addIconText}>
            Use Default Icon
          </CMSText>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedIconButton: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    color: '#666',
    textAlign: 'center',
  },
  addIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  addIconText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '500',
  },
});
