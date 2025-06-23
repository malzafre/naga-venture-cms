// filepath: components/molecules/BusinessLocationViewer.tsx

import {
  LocationData,
  useMapLocationViewer,
  UseMapLocationViewerReturn,
} from '@/hooks/features/business/useMapLocationViewer';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export interface BusinessLocationViewerProps {
  location: LocationData;
  height?: number;
  style?: any;
  apiKey?: string;
}

/**
 * BusinessLocationViewer - A read-only Google Maps component for displaying business locations
 *
 * Displays a business location on Google Maps with a marker and info window.
 * This is a "dumb component" that receives all state and functionality from useMapLocationViewer hook.
 */
export const BusinessLocationViewer: React.FC<BusinessLocationViewerProps> = ({
  location,
  height = 300,
  style,
  apiKey,
}) => {
  const { mapRef, isLoaded, isError, error }: UseMapLocationViewerReturn =
    useMapLocationViewer({
      location,
      apiKey,
    });

  if (isError) {
    return (
      <View style={[styles.container, { height }, style]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load map</Text>
          <Text style={styles.errorMessage}>
            {error || 'An error occurred while loading the map'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      {/* Loading overlay */}
      {!isLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      />

      {/* Location info overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Business Location</Text>
          <Text style={styles.infoAddress} numberOfLines={2}>
            {location.address}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FEF2F2',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#7F1D1D',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 5,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoAddress: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 14,
  },
});

export default BusinessLocationViewer;
