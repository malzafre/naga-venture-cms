import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { useTheme } from '@/constants/useTheme';

/**
 * SortDropdown - Molecule Component
 *
 * A dropdown component for sorting options with modern UI.
 * Provides smooth animations and accessible interaction patterns.
 */

export interface SortOption {
  key: string;
  label: string;
  direction: 'asc' | 'desc';
}

interface SortDropdownProps {
  options: SortOption[];
  selectedSort?: string;
  onSortChange: (sortKey: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  selectedSort,
  onSortChange,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [isVisible, setIsVisible] = useState(false);

  const selectedOption = options.find((option) => option.key === selectedSort);

  const handleSelect = (sortKey: string) => {
    onSortChange(sortKey);
    setIsVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.sortButton, { backgroundColor: colors.backgroundCard }]}
        onPress={() => setIsVisible(true)}
      >
        <MaterialIcons
          name="sort"
          size={18}
          color={colors.textSecondary}
          style={styles.sortIcon}
        />
        <Text style={[styles.sortText, { color: colors.textSecondary }]}>
          {selectedOption?.label || 'Sort by'}
        </Text>
        <MaterialIcons
          name="keyboard-arrow-down"
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownContainer,
                  { backgroundColor: colors.backgroundCard },
                ]}
              >
                <Text style={[styles.dropdownTitle, { color: colors.text }]}>
                  Sort by
                </Text>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.optionItem,
                      selectedSort === option.key && {
                        backgroundColor: colors.primary + '10',
                      },
                    ]}
                    onPress={() => handleSelect(option.key)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color:
                            selectedSort === option.key
                              ? colors.primary
                              : colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedSort === option.key && (
                      <MaterialIcons
                        name="check"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 120,
  },
  sortIcon: {
    marginRight: 6,
  },
  sortText: {
    fontSize: 14,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
});
