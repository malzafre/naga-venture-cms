// filepath: hooks/features/business/useMapLocationViewer.ts

import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface UseMapLocationViewerProps {
  location: LocationData;
  apiKey?: string;
}

export interface UseMapLocationViewerReturn {
  mapRef: MutableRefObject<HTMLDivElement | null>;
  isLoaded: boolean;
  isError: boolean;
  error: string | null;
}

/**
 * Hook for managing a read-only Google Maps viewer that displays a business location
 *
 * @param location - The location data with coordinates and address
 * @param apiKey - Optional Google Maps API key (defaults to environment)
 * @returns Map ref and state management for read-only map display
 */
export const useMapLocationViewer = ({
  location,
  apiKey,
}: UseMapLocationViewerProps): UseMapLocationViewerReturn => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean up Google Maps instances
  const cleanup = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    mapInstanceRef.current = null;
  }, []);

  // Initialize Google Maps
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google?.maps) {
      console.warn(
        '🗺️ [useMapLocationViewer] Map container or Google Maps API not available'
      );
      return;
    }

    try {
      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: location.latitude, lng: location.longitude },
        zoom: 15,
        disableDefaultUI: false,
        gestureHandling: 'cooperative',
        clickableIcons: false,
        disableDoubleClickZoom: false,
        scrollwheel: true,
        draggable: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Create marker for the business location
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: location.address,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new google.maps.Size(32, 32),
        },
      });

      markerRef.current = marker;

      // Create info window with business details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
              Business Location
            </h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.4;">
              ${location.address}
            </p>
          </div>
        `,
      });

      // Show info window on marker click
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      setIsLoaded(true);
      setIsError(false);
      setError(null);
      console.log('🗺️ [useMapLocationViewer] Map initialized successfully');
    } catch (err) {
      console.error('🗺️ [useMapLocationViewer] Failed to initialize map:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }
  }, [location.latitude, location.longitude, location.address]);

  // Load Google Maps API and initialize
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) {
      console.warn('🗺️ [useMapLocationViewer] Invalid location data provided');
      setIsError(true);
      setError('Invalid location data');
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        initializeMap();
        return;
      }

      // Check if script is already loading
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        console.log(
          '🗺️ [useMapLocationViewer] Google Maps script already loading'
        );
        return;
      }

      const script = document.createElement('script');
      const key = apiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (!key) {
        console.error(
          '🗺️ [useMapLocationViewer] Google Maps API key not found'
        );
        setIsError(true);
        setError('Google Maps API key not configured');
        return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('🗺️ [useMapLocationViewer] Google Maps API loaded');
        initializeMap();
      };

      script.onerror = () => {
        console.error(
          '🗺️ [useMapLocationViewer] Failed to load Google Maps API'
        );
        setIsError(true);
        setError('Failed to load Google Maps API');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();

    // Cleanup on unmount
    return cleanup;
  }, [initializeMap, cleanup, location?.latitude, location?.longitude, apiKey]);

  // Update map center and marker when location changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && isLoaded) {
      const newPosition = { lat: location.latitude, lng: location.longitude };

      // Update map center
      mapInstanceRef.current.setCenter(newPosition);

      // Update marker position
      markerRef.current.setPosition(newPosition);
      markerRef.current.setTitle(location.address);

      console.log('🗺️ [useMapLocationViewer] Map updated with new location');
    }
  }, [location, isLoaded]);

  return {
    mapRef,
    isLoaded,
    isError,
    error,
  };
};
