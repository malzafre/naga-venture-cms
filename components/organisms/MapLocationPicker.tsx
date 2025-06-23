// filepath: components/organisms/MapLocationPickerNew.tsx
/**
 * Dumb Component: Map Location Picker
 *
 * Pure UI component that renders map interface.
 * All logic is handled by the useMapLocationPicker hook.
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

interface MapLocationPickerProps {
  // State from hook
  isMapVisible: boolean;
  selectedLocation: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  searchError: string | null;
  isMapReady: boolean;

  // Refs from hook
  mapRef: React.RefObject<HTMLDivElement | null>;
  searchInputContainerRef: React.RefObject<HTMLDivElement | null>;

  // Actions from hook
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isMapVisible,
  selectedLocation,
  isLoading,
  searchError,
  isMapReady,
  mapRef,
  searchInputContainerRef,
  handleConfirm,
  handleCancel,
}) => {
  if (!isMapVisible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Location</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        {searchError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{searchError}</Text>
          </View>
        )}

        <View style={styles.searchContainer}>
          <Text style={styles.searchLabel}>Search Location</Text>
          <View
            ref={searchInputContainerRef as any}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.mapContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>
                {!isMapReady ? 'Loading map...' : 'Updating location...'}
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
            📍 Search or tap to place pin • 🎯 Drag pin to adjust position
          </Text>
          {selectedLocation && (
            <Text style={styles.selectedLocationText}>
              📌 {selectedLocation.latitude.toFixed(6)},{' '}
              {selectedLocation.longitude.toFixed(6)}
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
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
