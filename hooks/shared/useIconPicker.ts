// filepath: hooks/shared/useIconPicker.ts
/**
 * useIconPicker Hook
 *
 * Smart hook that handles icon picker modal state, search functionality,
 * and icon selection logic. Extracts business logic from IconPicker component.
 */

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
} from 'phosphor-react-native';
import { useCallback, useMemo, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface IconCategory {
  icon: React.ComponentType<any>;
  category: string;
}

interface UseIconPickerProps {
  selectedIcon?: string | null;
  onIconSelect: (iconKey: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Available icons organized by category for better UX (same as original component)
export const ICON_CATEGORIES = {
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

// Flatten all icons for search (same as original component)
export const ALL_ICONS = Object.entries(ICON_CATEGORIES).reduce(
  (acc, [category, icons]) => {
    Object.entries(icons).forEach(([key, icon]) => {
      acc[key] = { icon, category };
    });
    return acc;
  },
  {} as Record<string, { icon: React.ComponentType<any>; category: string }>
);

// ============================================================================
// HOOK
// ============================================================================

export function useIconPicker({
  selectedIcon,
  onIconSelect,
}: UseIconPickerProps) {
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<string>('Basic Amenities');

  // Filter icons based on search query (same logic as original component)
  const filteredIcons = useMemo(() => {
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

  // Get the selected icon component
  const selectedIconComponent = selectedIcon
    ? ALL_ICONS[selectedIcon]?.icon
    : null;

  // Handlers
  const openModal = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setSearchQuery('');
  }, []);

  const handleIconSelect = useCallback(
    (iconKey: string) => {
      onIconSelect(iconKey);
      setIsModalVisible(false);
      setSearchQuery('');
    },
    [onIconSelect]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return {
    // Modal state
    isModalVisible,
    openModal,
    closeModal,

    // Search state
    searchQuery,
    handleSearchChange,

    // Category state
    selectedCategory,
    handleCategoryChange,

    // Filtered data
    filteredIcons,

    // Actions
    handleIconSelect,

    // Selected state
    selectedIcon,
    selectedIconComponent,

    // Icon data
    iconCategories: ICON_CATEGORIES,
    allIcons: ALL_ICONS,

    // Components for easy access
    PlusIcon: Plus,
  };
}
