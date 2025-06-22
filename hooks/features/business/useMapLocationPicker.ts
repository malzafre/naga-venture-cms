// filepath: hooks/features/business/useMapLocationPicker.ts
/**
 * Map Location Picker Hook
 *
 * Custom hook for managing map location picker state and business location updates.
 */
import { useCallback, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationDetails {
  coordinates: Location;
  address: string;
  placeId?: string;
  city?: string;
  province?: string;
}

interface UseMapLocationPickerReturn {
  isMapVisible: boolean;
  selectedLocation: LocationDetails | null;
  showMap: () => void;
  hideMap: () => void;
  handleLocationSelect: (location: LocationDetails) => void;
  clearLocation: () => void;
  formatLocationForDatabase: () => {
    location: string;
    address: string;
    city: string;
    province: string;
    google_maps_place_id: string | null;
  } | null;
}

// ============================================================================
// HOOK
// ============================================================================

export const useMapLocationPicker = (): UseMapLocationPickerReturn => {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDetails | null>(null);

  const showMap = useCallback(() => {
    setIsMapVisible(true);
  }, []);

  const hideMap = useCallback(() => {
    setIsMapVisible(false);
  }, []);

  const handleLocationSelect = useCallback((location: LocationDetails) => {
    setSelectedLocation(location);
    setIsMapVisible(false);
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  const formatLocationForDatabase = useCallback(() => {
    if (!selectedLocation) return null;

    const { coordinates, address, city, province, placeId } = selectedLocation;

    return {
      location: `POINT(${coordinates.longitude} ${coordinates.latitude})`,
      address: address,
      city: city || 'Naga City',
      province: province || 'Camarines Sur',
      google_maps_place_id: placeId || null,
    };
  }, [selectedLocation]);

  return {
    isMapVisible,
    selectedLocation,
    showMap,
    hideMap,
    handleLocationSelect,
    clearLocation,
    formatLocationForDatabase,
  };
};
