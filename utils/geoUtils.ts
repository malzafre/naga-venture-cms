// filepath: utils/geoUtils.ts

/**
 * Utility functions for handling geographic data and PostGIS formats
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Extract coordinates from PostGIS GEOGRAPHY(POINT) format
 * Handles both text format (POINT(lng lat)) and binary WKB format
 */
export const extractCoordinatesFromPostGIS = (
  location: string | null
): Coordinates => {
  const nagaCityCenter: Coordinates = {
    latitude: 13.6218,
    longitude: 123.1948,
  };

  if (!location || typeof location !== 'string') {
    return nagaCityCenter;
  }
  // Handle text format: POINT(longitude latitude) or SRID=4326;POINT(longitude latitude)
  const textMatch = location.match(
    /(?:SRID=\d+;)?POINT\(([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\)/
  );
  if (textMatch && textMatch[1] && textMatch[2]) {
    return {
      longitude: parseFloat(textMatch[1]),
      latitude: parseFloat(textMatch[2]),
    };
  }
  // Handle binary WKB format
  if (location.startsWith('0101000020E6100000')) {
    try {
      // WKB format for POINT with SRID 4326 (WGS84)
      // 01 - byte order (little endian)
      // 01000020 - geometry type (point with SRID)
      // E6100000 - SRID 4326 in little endian
      // The coordinates start after the 18-character header
      const coordsHex = location.substring(18);

      if (coordsHex.length >= 32) {
        // Need 32 hex chars for 2 doubles (16 chars each)
        // Extract longitude (first 16 hex chars = 8 bytes)
        const lngHex = coordsHex.substring(0, 16);
        // Extract latitude (next 16 hex chars = 8 bytes)
        const latHex = coordsHex.substring(16, 32);

        // Convert hex to IEEE 754 double precision (little endian)
        const longitude = hexToDouble(lngHex);
        const latitude = hexToDouble(latHex);

        // Validate coordinates are reasonable for Philippines
        if (
          longitude >= 116 &&
          longitude <= 127 && // Philippines longitude range
          latitude >= 4 &&
          latitude <= 21 // Philippines latitude range
        ) {
          return { latitude, longitude };
        }
      }
    } catch (error) {
      console.warn('🗺️ [geoUtils] Failed to parse WKB location:', error);
    }
  }

  console.warn('🗺️ [geoUtils] Unrecognized location format:', location);
  return nagaCityCenter;
};

/**
 * Convert hex string to IEEE 754 double precision float
 * PostGIS stores coordinates as little-endian doubles
 */
function hexToDouble(hex: string): number {
  // Convert hex pairs to bytes in little endian order
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    const hexPair = hex.substring(i * 2, i * 2 + 2);
    bytes[i] = parseInt(hexPair, 16);
  }

  // Create DataView to read as double (little endian)
  const view = new DataView(bytes.buffer);
  return view.getFloat64(0, true); // true = little endian
}

/**
 * Format coordinates for display
 */
export const formatCoordinates = (coords: Coordinates): string => {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
};

/**
 * Create PostGIS POINT string from coordinates
 */
export const coordinatesToPostGISPoint = (coords: Coordinates): string => {
  return `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
};

/**
 * Validate if coordinates are within reasonable bounds for Philippines
 */
export const isValidPhilippinesCoordinates = (coords: Coordinates): boolean => {
  return (
    coords.longitude >= 116 &&
    coords.longitude <= 127 &&
    coords.latitude >= 4 &&
    coords.latitude <= 21
  );
};
