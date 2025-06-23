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
  businessName?: string;
  businessImage?: string;
}

export interface UseMapLocationViewerProps {
  location: LocationData;
  apiKey?: string;
  showCustomInfoWindow?: boolean;
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
 * @param location - The location data with coordinates, address, and optional business details
 * @param apiKey - Optional Google Maps API key (defaults to environment)
 * @param showCustomInfoWindow - Whether to show enhanced info window with business details
 * @returns Map ref and state management for read-only map display
 */
export const useMapLocationViewer = ({
  location,
  apiKey,
  showCustomInfoWindow = false,
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

      mapInstanceRef.current = map; // Create marker for the business location with custom icon
      const markerIcon =
        showCustomInfoWindow && location.businessName
          ? {
              url:
                'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(`
          <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
              </filter>
            </defs>
            <path d="M16 0C7.163 0 0 7.163 0 16c0 8.836 16 24 16 24s16-15.164 16-24C32 7.163 24.837 0 16 0zm0 22c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" 
                  fill="url(#gradient)" 
                  filter="url(#shadow)"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
            <text x="16" y="19" text-anchor="middle" fill="#1D4ED8" font-family="Arial, sans-serif" font-size="8" font-weight="bold">🏢</text>
          </svg>
        `),
              scaledSize: new google.maps.Size(32, 40),
              anchor: new google.maps.Point(16, 40),
            }
          : {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new google.maps.Size(32, 32),
            };

      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: map,
        title: location.businessName || location.address,
        icon: markerIcon,
        animation: google.maps.Animation.DROP,
      });

      markerRef.current = marker; // Create enhanced info window with business details
      const createInfoWindowContent = () => {
        if (showCustomInfoWindow && location.businessName) {
          const hasBusinessImage =
            location.businessImage && location.businessImage.trim().length > 0;

          return `
            <div style="
              padding: 16px; 
              min-width: 280px; 
              max-width: 320px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              border-radius: 8px;
              background: white;
            ">
              ${
                hasBusinessImage
                  ? `
                <div style="
                  width: 100%; 
                  height: 120px; 
                  background-image: url('${location.businessImage}');
                  background-size: cover;
                  background-position: center;
                  background-color: #F3F4F6;
                  border-radius: 6px;
                  margin-bottom: 12px;
                  position: relative;
                  overflow: hidden;
                ">
                  <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.7));
                    padding: 8px;
                    border-radius: 0 0 6px 6px;
                  ">
                    <div style="
                      color: white;
                      font-size: 11px;
                      font-weight: 500;
                      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
                    ">📸 Business Photo</div>
                  </div>
                </div>
              `
                  : `
                <div style="
                  width: 100%; 
                  height: 80px; 
                  background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
                  border-radius: 6px;
                  margin-bottom: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  position: relative;
                ">
                  <div style="
                    color: white;
                    font-size: 24px;
                    font-weight: 600;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                  ">🏢</div>
                  <div style="
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    color: white;
                    font-size: 11px;
                    font-weight: 500;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                  ">No photo available</div>
                </div>
              `
              }
              <div style="margin-bottom: 8px;">
                <h3 style="
                  margin: 0 0 6px 0; 
                  font-size: 16px; 
                  font-weight: 600; 
                  color: #111827;
                  line-height: 1.3;
                  word-break: break-word;
                ">${location.businessName}</h3>
                <div style="
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 8px;
                  gap: 6px;
                ">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#6B7280" style="margin-top: 2px; flex-shrink: 0;">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span style="
                    font-size: 13px; 
                    color: #6B7280; 
                    line-height: 1.4;
                    word-break: break-word;
                    flex: 1;
                  ">${location.address}</span>
                </div>
              </div>
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 10px 16px;
                background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
                border: 1px solid #E2E8F0;
                border-radius: 6px;
                margin-top: 8px;
              ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#3B82F6" style="margin-right: 8px;">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span style="
                  font-size: 13px;
                  font-weight: 600;
                  color: #3B82F6;
                ">🗺️ Business Location</span>
              </div>
            </div>
          `;
        } else {
          // Fallback to simple info window
          return `
            <div style="
              padding: 12px; 
              min-width: 200px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
              <h3 style="
                margin: 0 0 8px 0; 
                font-size: 14px; 
                font-weight: 600; 
                color: #1f2937;
              ">📍 Business Location</h3>
              <p style="
                margin: 0; 
                font-size: 12px; 
                color: #6b7280; 
                line-height: 1.4;
                word-break: break-word;
              ">${location.address}</p>
            </div>
          `;
        }
      };
      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(),
        maxWidth: 340,
        pixelOffset: new google.maps.Size(0, -10),
      });

      // Show info window on marker click
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Add hover effects for enhanced UX
      marker.addListener('mouseover', () => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // Stop animation after a short time
        setTimeout(() => {
          if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
          }
        }, 700);
      });

      // Auto-open info window if showing custom content (for better UX)
      if (showCustomInfoWindow && location.businessName) {
        // Small delay to ensure map is fully loaded
        setTimeout(() => {
          infoWindow.open(map, marker);
        }, 1000);
      }

      setIsLoaded(true);
      setIsError(false);
      setError(null);
      console.log('🗺️ [useMapLocationViewer] Map initialized successfully');
    } catch (err) {
      console.error('🗺️ [useMapLocationViewer] Failed to initialize map:', err);
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }
  }, [
    location.latitude,
    location.longitude,
    location.address,
    location.businessName,
    location.businessImage,
    showCustomInfoWindow,
  ]);

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

    // Cleanup on unmount    return cleanup;
  }, [
    initializeMap,
    cleanup,
    location?.latitude,
    location?.longitude,
    location?.businessName,
    location?.businessImage,
    apiKey,
    showCustomInfoWindow,
  ]);

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
