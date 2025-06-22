// filepath: components/organisms/MapLocationPicker.tsx
/**
 * Robust Map Location Picker Component
 *
 * Uses traditional Google Maps JavaScript API for maximum compatibility
 * Fixes all the issues: importLibrary errors, autocomplete, form validation
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

interface MapLocationPickerProps {
  initialLocation?: Location;
  initialAddress?: string;
  onLocationSelect: (location: LocationDetails) => void;
  isVisible: boolean;
  onClose: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialLocation,
  initialAddress = '',
  onLocationSelect,
  isVisible,
  onClose,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const [searchAddress, setSearchAddress] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Default location: Naga City center
  const defaultLocation = React.useMemo(
    () => ({
      latitude: 13.6218,
      longitude: 123.1815,
    }),
    []
  );

  // Load Google Maps Script with traditional approach
  const loadGoogleMapsScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if ((window as any).google && (window as any).google.maps) {
        resolve();
        return;
      }

      // Remove any existing script to avoid conflicts
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      // Use traditional loading without importLibrary
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Set up callback
      (window as any).initGoogleMaps = () => {
        // Small delay to ensure everything is loaded
        setTimeout(() => {
          resolve();
        }, 100);
      };

      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  }, []);

  // Traditional reverse geocoding
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const google = (window as any).google;
    if (!google) return null;

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await new Promise((resolve, reject) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any, status: string) => {
            if (status === 'OK') {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      const results = response as any[];
      if (results && results.length > 0) {
        const result = results[0];
        const addressComponents = result.address_components;

        // Extract city and province from address components
        let city = '';
        let province = '';

        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            province = component.long_name;
          }
        }

        return {
          address: result.formatted_address,
          city,
          province,
          placeId: result.place_id,
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setSearchError('Unable to get address for this location');
    }
    return null;
  }, []);

  // Traditional map initialization
  const initializeMap = useCallback(async () => {
    if (!mapRef.current || !isVisible) return;

    try {
      setIsLoading(true);
      setSearchError(null);

      const google = (window as any).google;
      if (!google || !google.maps) {
        throw new Error('Google Maps not loaded');
      }

      const location = selectedLocation || initialLocation || defaultLocation;

      // Initialize map with traditional approach
      const map = new google.maps.Map(mapRef.current, {
        zoom: 15,
        center: { lat: location.latitude, lng: location.longitude },
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Create traditional marker
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        draggable: true,
        title: 'Selected Location',
        animation: google.maps.Animation.DROP,
      });

      markerRef.current = marker;

      // Handle marker drag
      marker.addListener('dragend', async () => {
        const position = marker.getPosition();
        if (position) {
          const newLocation = {
            latitude: position.lat(),
            longitude: position.lng(),
          };
          setSelectedLocation(newLocation);

          // Get address for new location
          const geocodeResult = await reverseGeocode(
            position.lat(),
            position.lng()
          );
          if (geocodeResult) {
            // Update search input
            setSearchAddress(geocodeResult.address);
          }
        }
      });

      // Handle map click
      map.addListener('click', async (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        const newLocation = { latitude: lat, longitude: lng };
        setSelectedLocation(newLocation);

        // Update marker position
        marker.setPosition({ lat, lng });

        // Get address for clicked location
        const geocodeResult = await reverseGeocode(lat, lng);
        if (geocodeResult) {
          setSearchAddress(geocodeResult.address);
        }
      });

      // Initialize autocomplete if search input exists
      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            componentRestrictions: { country: 'ph' },
            bounds: {
              north: 14.5,
              south: 12.5,
              east: 124.5,
              west: 122.5,
            },
            fields: [
              'place_id',
              'geometry',
              'name',
              'formatted_address',
              'address_components',
            ],
          }
        );

        autocompleteRef.current = autocomplete;

        // Listen for place selection
        autocomplete.addListener('place_changed', async () => {
          try {
            const place = autocomplete.getPlace();

            if (!place.geometry || !place.geometry.location) {
              setSearchError('No details available for this place');
              return;
            }

            const newLocation = {
              latitude: place.geometry.location.lat(),
              longitude: place.geometry.location.lng(),
            };

            setSelectedLocation(newLocation);
            setSearchAddress(place.formatted_address || '');

            // Update map and marker
            map.setCenter(place.geometry.location);
            map.setZoom(17);
            marker.setPosition(place.geometry.location); // Extract city and province from address components
            let city = '';
            let province = '';

            if (place.address_components) {
              for (const component of place.address_components) {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                  province = component.long_name;
                }
              }
            }

            // Trigger callback with location details
            const locationDetails = {
              coordinates: newLocation,
              address: place.formatted_address || '',
              placeId: place.place_id,
              city,
              province,
            };

            // Update local state and trigger callback
            setSelectedLocation(newLocation);
            onLocationSelect(locationDetails);

            setSearchError(null);
          } catch (error) {
            console.error('Place selection error:', error);
            setSearchError('Error selecting place. Please try again.');
          }
        });
      }

      setIsMapReady(true);
    } catch (error) {
      console.error('Map initialization error:', error);
      setSearchError(
        'Failed to load map. Please check your internet connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedLocation,
    initialLocation,
    defaultLocation,
    reverseGeocode,
    isVisible,
    onLocationSelect,
  ]);

  // Load map when component becomes visible
  useEffect(() => {
    if (isVisible) {
      loadGoogleMapsScript()
        .then(() => initializeMap())
        .catch((error) => {
          console.error('Failed to load Google Maps:', error);
          setSearchError(
            'Failed to load Google Maps. Please check your API key.'
          );
          setIsLoading(false);
        });
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current);
      }
    };
  }, [isVisible, loadGoogleMapsScript, initializeMap]);

  // Handle confirm selection
  const handleConfirm = useCallback(async () => {
    if (!selectedLocation) {
      Alert.alert(
        'No Location Selected',
        'Please select a location on the map first.'
      );
      return;
    }

    setIsLoading(true);

    // Get final address if not already available
    let finalAddress = searchAddress;
    let city = '';
    let province = '';
    let placeId = '';

    if (!finalAddress) {
      const geocodeResult = await reverseGeocode(
        selectedLocation.latitude,
        selectedLocation.longitude
      );

      if (geocodeResult) {
        finalAddress = geocodeResult.address;
        city = geocodeResult.city || '';
        province = geocodeResult.province || '';
        placeId = geocodeResult.placeId || '';
      } else {
        finalAddress = `${selectedLocation.latitude}, ${selectedLocation.longitude}`;
      }
    }

    // Call the parent callback with location details
    onLocationSelect({
      coordinates: selectedLocation,
      address: finalAddress,
      placeId,
      city,
      province,
    });

    setIsLoading(false);
    onClose();
  }, [
    selectedLocation,
    searchAddress,
    reverseGeocode,
    onLocationSelect,
    onClose,
  ]);

  // Handle address search input change
  const handleSearchChange = useCallback((text: string) => {
    setSearchAddress(text);
    setSearchError(null);
  }, []);

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Location</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {searchError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{searchError}</Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search for a place:</Text>
          <TextInput
            ref={searchInputRef as any}
            style={styles.searchInput}
            placeholder="Enter location or address"
            value={searchAddress}
            onChangeText={handleSearchChange}
            editable={!isLoading && isMapReady}
          />
        </View>

        <View style={styles.mapContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>
                {!isMapReady ? 'Loading map...' : 'Processing...'}
              </Text>
            </View>
          )}
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 8,
            }}
          />
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            📍 Tap on the map or search to select a location
          </Text>
          <Text style={styles.instructionText}>
            🔄 Drag the marker to fine-tune the position
          </Text>
          {selectedLocation && (
            <Text style={styles.selectedLocationText}>
              📌 Selected: {selectedLocation.latitude.toFixed(6)},{' '}
              {selectedLocation.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              (!selectedLocation || isLoading) && styles.confirmButtonDisabled,
            ]}
            disabled={!selectedLocation || isLoading}
          >
            <Text style={styles.confirmButtonText}>
              {isLoading
                ? 'Please wait...'
                : selectedLocation
                  ? 'Use This Location'
                  : 'Select Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxWidth: 800,
    height: '90%',
    maxHeight: 700,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    position: 'relative',
    minHeight: 300,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  instructions: {
    marginTop: 12,
    paddingVertical: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedLocationText: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  confirmButton: {
    flex: 2,
    marginLeft: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MapLocationPicker;
