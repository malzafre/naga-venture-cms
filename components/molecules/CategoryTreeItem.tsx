/**
 * Category Tree Item - Molecule Component
 *
 * Individual category item with expand/collapse functionality
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MainCategoryWithSubCategories } from '@/schemas';

interface CategoryTreeItemProps {
  category: MainCategoryWithSubCategories;
  isExpanded: boolean;
  isSelected: boolean;
  onPress: () => void;
  onToggleExpand: () => void;
}

export const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  isExpanded,
  isSelected,
  onPress,
  onToggleExpand,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={onPress}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>📁</Text>
      </View>
      <Text style={styles.name}>{category.name}</Text>
      <TouchableOpacity style={styles.expandButton} onPress={onToggleExpand}>
        <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      <View
        style={[
          styles.statusDot,
          category.is_active ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  selected: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  icon: {
    marginRight: 8,
  },
  iconText: {
    fontSize: 16,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  expandButton: {
    padding: 4,
    marginRight: 8,
  },
  expandIcon: {
    fontSize: 10,
    color: '#64748b',
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
});

export default CategoryTreeItem;
