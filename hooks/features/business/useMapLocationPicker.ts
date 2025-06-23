// filepath: hooks/features/business/useMapLocationPicker.ts
/**
 * Smart Hook: useMapLocationPicker
 *
 * Manages all Google Maps integration logic following "Smart Hook, Dumb Component" pattern.
 * Contains all state management, Google Maps API calls, and business logic.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================================
// UTILITIES
// ============================================================================

// Debounce utility for performance optimization
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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

interface PlaceAutocompleteElement extends HTMLElement {
  place: google.maps.places.PlaceResult | null;
}

interface ModernPlacesLibrary {
  PlaceAutocompleteElement: {
    new (): PlaceAutocompleteElement;
  };
}

interface UseMapLocationPickerOptions {
  onLocationSelect: (location: LocationDetails) => void;
  initialLocation?: Location;
  initialAddress?: string;
}

interface UseMapLocationPickerReturn {
  // State
  isMapVisible: boolean;
  selectedLocation: Location | null;
  searchAddress: string;
  isLoading: boolean;
  searchError: string | null;
  isMapReady: boolean;
  // Refs for component to attach
  mapRef: React.RefObject<HTMLDivElement | null>;
  searchInputContainerRef: React.RefObject<HTMLDivElement | null>;

  // Actions
  showMap: () => void;
  hideMap: () => void;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

export const useMapLocationPicker = (
  options: UseMapLocationPickerOptions
): UseMapLocationPickerReturn => {
  const { onLocationSelect, initialLocation, initialAddress = '' } = options;

  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputContainerRef = useRef<HTMLDivElement>(null);
  // Single context object for better management
  const mapContext = useRef({
    map: null as google.maps.Map | null,
    marker: null as google.maps.marker.AdvancedMarkerElement | null,
    autocomplete: null as PlaceAutocompleteElement | null,
    dragHandler: null as ((event: any) => void) | null,
    placeChangeHandler: null as (() => void) | null,
    // Store listener references for proper cleanup
    mapClickListener: null as google.maps.MapsEventListener | null,
    markerDragListener: null as google.maps.MapsEventListener | null,
  });

  // State
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [searchAddress, setSearchAddress] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Default location: Naga City center
  const defaultLocation = React.useMemo(
    () => ({
      latitude: 13.6218,
      longitude: 123.1815,
    }),
    []
  );

  // Load Google Maps Script with proper async loading pattern
  const loadGoogleMapsScript = useCallback(async () => {
    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) {
      return new Promise<void>((resolve) => {
        if ((window as any).google) {
          resolve();
        } else {
          const checkGoogle = () => {
            if ((window as any).google) {
              resolve();
            } else {
              setTimeout(checkGoogle, 100);
            }
          };
          checkGoogle();
        }
      });
    }

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      (window as any).initGoogleMaps = () => {
        resolve();
        delete (window as any).initGoogleMaps;
      };

      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  }, []);

  // Utility functions for better error handling
  const getGeocodeErrorMessage = useCallback((status: string) => {
    const errors: Record<string, string> = {
      ZERO_RESULTS: 'Address not found for this location',
      OVER_QUERY_LIMIT: 'Too many requests, please try again later',
      REQUEST_DENIED: 'Location service access denied',
      INVALID_REQUEST: 'Invalid location request',
      UNKNOWN_ERROR: 'Location service temporarily unavailable',
    };
    return errors[status] || 'Unable to get address for this location';
  }, []);

  // Dynamic zoom based on viewport
  const getDefaultZoom = useCallback(() => {
    const width = window.innerWidth;
    return width < 768 ? 14 : 16;
  }, []);

  // Create debounced reverse geocoding function
  const createDebouncedReverseGeocode = useCallback(() => {
    return debounce(async (lat: number, lng: number): Promise<void> => {
      if (!(window as any).google || !google.maps.Geocoder) {
        await google.maps.importLibrary('geocoding');
      }
      const geocoder = new google.maps.Geocoder();
      try {
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          // Use the formatted address directly for display
          setSearchAddress(result.formatted_address);
          return;
        }
      } catch (error: any) {
        console.error('Reverse geocoding error:', error);
        const errorMessage = error.code
          ? getGeocodeErrorMessage(error.code)
          : 'Unable to get address for this location';
        setSearchError(errorMessage);
      }
    }, 300);
  }, [getGeocodeErrorMessage]);

  const debouncedReverseGeocode = createDebouncedReverseGeocode();

  const initializeMap = useCallback(async () => {
    if (
      !mapRef.current ||
      !isMapVisible ||
      !(window as any).google ||
      isMapInitialized
    )
      return;

    try {
      setIsLoading(true);
      setSearchError(null);

      const { Map } = (await google.maps.importLibrary(
        'maps'
      )) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary(
        'marker'
      )) as google.maps.MarkerLibrary;

      const location = selectedLocation || initialLocation || defaultLocation;
      if (!mapContext.current.map) {
        const map = new Map(mapRef.current, {
          zoom: getDefaultZoom(),
          center: { lat: location.latitude, lng: location.longitude },
          mapId: 'NAGA_VENTURE_MAP',
          // Disable unnecessary controls for clean directory experience
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          // Performance optimizations
          gestureHandling: 'cooperative',
          // Complete POI removal - hide ALL business markers for clean directory map
          styles: [
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.park',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.school',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.government',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.attraction',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.place_of_worship',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.sports_complex',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'establishment',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'road',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'administrative.locality',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'administrative.neighborhood',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }],
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });
        mapContext.current.map = map;

        // Store the click listener reference for cleanup
        mapContext.current.mapClickListener = map.addListener(
          'click',
          async (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();

              // Update marker position without reloading map
              if (mapContext.current.marker) {
                mapContext.current.marker.position = { lat, lng };
              }

              setSelectedLocation({ latitude: lat, longitude: lng });
              debouncedReverseGeocode(lat, lng);
            }
          }
        );

        setIsMapInitialized(true);
      }

      // Create or update draggable marker
      if (mapContext.current.marker) {
        mapContext.current.marker.position = {
          lat: location.latitude,
          lng: location.longitude,
        };
      } else {
        mapContext.current.marker = new AdvancedMarkerElement({
          map: mapContext.current.map,
          position: { lat: location.latitude, lng: location.longitude },
          title: 'Drag to adjust location',
          gmpDraggable: true,
        });

        // Create debounced drag handler
        const handleDragEnd = async (event: any) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            setSelectedLocation({ latitude: lat, longitude: lng });
            debouncedReverseGeocode(lat, lng);
          }
        };
        mapContext.current.dragHandler = handleDragEnd;
        mapContext.current.markerDragListener =
          mapContext.current.marker.addListener('dragend', handleDragEnd);
      }

      // Initialize autocomplete only once
      if (searchInputContainerRef.current && !mapContext.current.autocomplete) {
        const placesLibrary = (await google.maps.importLibrary(
          'places'
        )) as unknown as ModernPlacesLibrary;

        const autocompleteElement =
          new placesLibrary.PlaceAutocompleteElement();
        const input = autocompleteElement.querySelector('input');
        if (input) {
          Object.assign(input.style, {
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: 'transparent',
            padding: '0',
            margin: '0',
            color: '#1F2937',
          });
          input.placeholder = 'Search street address or landmark...';
          // Add accessibility attributes
          input.setAttribute('aria-label', 'Search for locations');
          input.setAttribute('role', 'combobox');
          input.setAttribute('aria-expanded', 'false');
          input.setAttribute('aria-autocomplete', 'list');

          if (searchAddress) {
            input.value = searchAddress;
          }
        }

        searchInputContainerRef.current.innerHTML = '';
        searchInputContainerRef.current.appendChild(autocompleteElement);
        mapContext.current.autocomplete = autocompleteElement;

        const handlePlaceChange = async () => {
          const place = autocompleteElement.place;
          if (place && place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            setSelectedLocation({ latitude: lat, longitude: lng });

            // Update marker without reloading map
            if (mapContext.current.marker) {
              mapContext.current.marker.position = { lat, lng };
            }

            debouncedReverseGeocode(lat, lng);

            if (mapContext.current.map) {
              mapContext.current.map.setCenter({ lat, lng });
              mapContext.current.map.setZoom(getDefaultZoom() + 1);
            }
          } else if (place) {
            setSearchError('No details available for input: ' + place.name);
          }
        };

        mapContext.current.placeChangeHandler = handlePlaceChange;
        autocompleteElement.addEventListener(
          'gmp-placechange',
          handlePlaceChange
        );
      }

      setIsMapReady(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setSearchError('Failed to initialize map. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    isMapVisible,
    selectedLocation,
    initialLocation,
    defaultLocation,
    debouncedReverseGeocode,
    getDefaultZoom,
    searchAddress,
    isMapInitialized,
  ]);

  // Main effect: Load script and initialize map when visible
  useEffect(() => {
    if (isMapVisible && !isMapInitialized) {
      setIsLoading(true);
      loadGoogleMapsScript()
        .then(() => {
          initializeMap();
        })
        .catch((error) => {
          console.error('Failed to load Google Maps:', error);
          setSearchError(
            'Failed to load Google Maps. Please check your internet connection.'
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isMapVisible, isMapInitialized, loadGoogleMapsScript, initializeMap]);

  // Update map when location changes
  useEffect(() => {
    if (isMapVisible && mapContext.current.map && selectedLocation) {
      const newPosition = {
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude,
      };
      if (mapContext.current.marker) {
        mapContext.current.marker.position = newPosition;
      }
      mapContext.current.map.panTo(newPosition);
    }
  }, [selectedLocation, isMapVisible]);
  // Comprehensive cleanup function for all Google Maps resources
  useEffect(() => {
    const currentContext = mapContext.current;

    return () => {
      console.log(
        '🧹 [useMapLocationPicker] Cleaning up Google Maps resources'
      );

      // Clean up autocomplete listener
      if (currentContext.autocomplete && currentContext.placeChangeHandler) {
        currentContext.autocomplete.removeEventListener(
          'gmp-placechange',
          currentContext.placeChangeHandler
        );
        console.log('🧹 [useMapLocationPicker] Removed autocomplete listener');
      }

      // Clean up map click listener
      if (currentContext.mapClickListener) {
        google.maps.event.removeListener(currentContext.mapClickListener);
        currentContext.mapClickListener = null;
        console.log('🧹 [useMapLocationPicker] Removed map click listener');
      }

      // Clean up marker drag listener
      if (currentContext.markerDragListener) {
        google.maps.event.removeListener(currentContext.markerDragListener);
        currentContext.markerDragListener = null;
        console.log('🧹 [useMapLocationPicker] Removed marker drag listener');
      }

      // Clean up map instance listeners (comprehensive fallback)
      if (currentContext.map) {
        google.maps.event.clearInstanceListeners(currentContext.map);
        console.log(
          '🧹 [useMapLocationPicker] Cleared all map instance listeners'
        );
      }

      // Clean up marker instance listeners (comprehensive fallback)
      if (currentContext.marker) {
        // Note: AdvancedMarkerElement doesn't fully support the old clearInstanceListeners API
        // but we can try the standard approach for compatibility
        try {
          google.maps.event.clearInstanceListeners(currentContext.marker);
          console.log(
            '🧹 [useMapLocationPicker] Cleared all marker instance listeners'
          );
        } catch {
          console.log(
            '🧹 [useMapLocationPicker] Marker cleanup not needed (AdvancedMarkerElement)'
          );
        }
      }

      console.log('✅ [useMapLocationPicker] Google Maps cleanup completed');
    };
  }, []); // Empty dependency array - cleanup only on unmount

  // Create a non-debounced version for immediate confirmation
  const immediateReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!(window as any).google || !google.maps.Geocoder) {
        await google.maps.importLibrary('geocoding');
      }
      const geocoder = new google.maps.Geocoder();
      try {
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          const addressComponents = result.address_components;
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
            coordinates: { latitude: lat, longitude: lng },
            address: result.formatted_address,
            city,
            province,
            placeId: result.place_id,
          };
        }
      } catch (error: any) {
        console.error('Reverse geocoding error:', error);
        const errorMessage = error.code
          ? getGeocodeErrorMessage(error.code)
          : 'Unable to get address for this location';
        setSearchError(errorMessage);
      }
      return null;
    },
    [getGeocodeErrorMessage]
  );

  // Actions
  const showMap = useCallback(() => {
    setIsMapVisible(true);
  }, []);
  const hideMap = useCallback(() => {
    console.log(
      '🙈 [useMapLocationPicker] Hiding map and cleaning up resources'
    );

    // Clean up listeners when hiding map for better resource management
    const currentContext = mapContext.current;

    if (currentContext.mapClickListener) {
      google.maps.event.removeListener(currentContext.mapClickListener);
      currentContext.mapClickListener = null;
    }

    if (currentContext.markerDragListener) {
      google.maps.event.removeListener(currentContext.markerDragListener);
      currentContext.markerDragListener = null;
    }

    if (currentContext.autocomplete && currentContext.placeChangeHandler) {
      currentContext.autocomplete.removeEventListener(
        'gmp-placechange',
        currentContext.placeChangeHandler
      );
    }

    // Reset map state to prevent issues on next open
    setIsMapInitialized(false);
    setIsMapReady(false);
    setSearchError(null);
    setIsMapVisible(false);

    console.log(
      '✅ [useMapLocationPicker] Map hidden and resources cleaned up'
    );
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selectedLocation) {
      setIsLoading(true);
      const locationDetails = await immediateReverseGeocode(
        selectedLocation.latitude,
        selectedLocation.longitude
      );
      setIsLoading(false);

      if (locationDetails) {
        onLocationSelect(locationDetails);
        hideMap();
      } else {
        setSearchError('Could not get location details. Please try again.');
      }
    } else {
      setSearchError('Please select a location on the map.');
    }
  }, [selectedLocation, immediateReverseGeocode, onLocationSelect, hideMap]);

  const handleCancel = useCallback(() => {
    hideMap();
  }, [hideMap]);

  return {
    // State
    isMapVisible,
    selectedLocation,
    searchAddress,
    isLoading,
    searchError,
    isMapReady,

    // Refs for component to attach
    mapRef,
    searchInputContainerRef,

    // Actions
    showMap,
    hideMap,
    handleConfirm,
    handleCancel,
  };
};
