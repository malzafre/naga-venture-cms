// filepath: c:\Users\Hans Candor\Documents\capstone-NV\naga-venture-cms\app\(sidebar)\business-management\business-listings\edit\[id].tsx
// app/(sidebar)/business-management/business-listings/edit/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks and types
import type { BusinessUpdate } from '@/schemas/business/business.schemas';

// Services
import {
  useBusiness,
  useUpdateBusiness,
} from '@/hooks/features/business/useBusinessManagement';
import { NavigationService } from '@/services/NavigationService';

// Components
import { CMSButton } from '@/components/atoms';
import { ConfirmationModal } from '@/components/molecules/ConfirmationModal';
import { BusinessForm, CMSRouteGuard } from '@/components/organisms';

/**
 * Edit Business Page
 *
 * Dynamic route page for editing existing business listings.
 * Loads business data and provides pre-filled form.
 */
export default function EditBusinessScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch business data
  const {
    data: business,
    isLoading: businessLoading,
    isError,
    error,
  } = useBusiness(id);

  const updateBusinessMutation = useUpdateBusiness();

  // Early guard - check if id exists
  if (!id) {
    return (
      <CMSRouteGuard routePath="/(sidebar)/business-management/business-listings/edit">
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Invalid Business ID</Text>
            <Text style={styles.errorMessage}>
              No business ID was provided. Please select a valid business to
              edit.
            </Text>
            <CMSButton
              title="Go Back"
              onPress={() => NavigationService.toAllBusinesses()}
              variant="primary"
              style={styles.backButton}
            />
          </View>
        </SafeAreaView>
      </CMSRouteGuard>
    );
  }

  const handleSubmit = (data: BusinessUpdate) => {
    if (!id || !business) return;

    const updateData: BusinessUpdate = {};

    // Compare each field and add it to updateData if it has changed
    if (data.business_name && data.business_name !== business.business_name) {
      updateData.business_name = data.business_name;
    }
    if (data.business_type && data.business_type !== business.business_type) {
      updateData.business_type = data.business_type;
    }
    if (data.description && data.description !== business.description) {
      updateData.description = data.description;
    }
    if (data.address && data.address !== business.address) {
      updateData.address = data.address;
    }
    if (data.city && data.city !== business.city) {
      updateData.city = data.city;
    }
    if (data.province && data.province !== business.province) {
      updateData.province = data.province;
    }
    if (data.postal_code && data.postal_code !== business.postal_code) {
      updateData.postal_code = data.postal_code;
    }
    if (data.phone && data.phone !== business.phone) {
      updateData.phone = data.phone;
    }
    if (data.email && data.email !== business.email) {
      updateData.email = data.email;
    }
    if (data.website && data.website !== business.website) {
      updateData.website = data.website;
    }
    if (data.facebook_url && data.facebook_url !== business.facebook_url) {
      updateData.facebook_url = data.facebook_url;
    }
    if (data.instagram_url && data.instagram_url !== business.instagram_url) {
      updateData.instagram_url = data.instagram_url;
    }
    if (data.twitter_url && data.twitter_url !== business.twitter_url) {
      updateData.twitter_url = data.twitter_url;
    }
    if (data.latitude !== undefined && data.longitude !== undefined) {
      const newLocation = `POINT(${data.longitude} ${data.latitude})`;
      if (newLocation !== business.location) {
        updateData.location = newLocation;
        updateData.latitude = data.latitude;
        updateData.longitude = data.longitude;
      }
    }

    // Only proceed if there are actual changes
    if (Object.keys(updateData).length === 0) {
      setSuccessMessage('No changes were made to the business listing.');
      setSuccessModalVisible(true);
      return;
    }

    updateBusinessMutation.mutate(
      { businessId: id, updateData },
      {
        onSuccess: (updatedBusiness) => {
          setSuccessMessage('Business listing has been updated successfully!');
          setSuccessModalVisible(true);
        },
        onError: (error) => {
          console.error('Update business error:', error);
          setErrorMessage(
            `Failed to update business listing. Please try again.\n\nError Details: ${error.message}`
          );
          setErrorModalVisible(true);
        },
      }
    );
  };
  const handleCancel = () => {
    console.log('🔴 [EditBusinessScreen] Cancel button clicked');
    console.log('🔴 [EditBusinessScreen] Business ID:', id);
    console.log('🔴 [EditBusinessScreen] About to show confirmation modal');
    setCancelModalVisible(true);
  };

  const confirmCancel = () => {
    console.log(
      '✅ [EditBusinessScreen] User confirmed cancel - navigating back'
    );
    setCancelModalVisible(false);
    try {
      NavigationService.toAllBusinesses();
      console.log('✅ [EditBusinessScreen] Navigation successful');
    } catch (error) {
      console.error('❌ [EditBusinessScreen] Navigation error:', error);
    }
  };
  const cancelCancel = () => {
    console.log('⏸️ [EditBusinessScreen] User chose to continue editing');
    setCancelModalVisible(false);
  };

  const handleSuccessOk = () => {
    setSuccessModalVisible(false);
    NavigationService.toAllBusinesses();
  };

  const handleErrorOk = () => {
    setErrorModalVisible(false);
  };

  // Loading state
  if (businessLoading) {
    return (
      <CMSRouteGuard routePath="/(sidebar)/business-management/business-listings/edit">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading business details...</Text>
          </View>
        </SafeAreaView>
      </CMSRouteGuard>
    );
  }

  // Error state
  if (isError || !business) {
    return (
      <CMSRouteGuard routePath="/(sidebar)/business-management/business-listings/edit">
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Business Not Found</Text>
            <Text style={styles.errorMessage}>
              {error?.message || 'The requested business could not be found.'}
            </Text>
            <CMSButton
              title="Go Back"
              onPress={() => NavigationService.toAllBusinesses()}
              variant="primary"
              style={styles.backButton}
            />
          </View>
        </SafeAreaView>
      </CMSRouteGuard>
    );
  }

  // Transform business data to match form expectations
  const transformedBusinessData = business
    ? ({
        ...business,
        // Convert Date objects to strings for form compatibility
        approved_at:
          business.approved_at && typeof business.approved_at === 'object'
            ? (business.approved_at as Date).toISOString()
            : business.approved_at,
        created_at:
          business.created_at && typeof business.created_at === 'object'
            ? (business.created_at as Date).toISOString()
            : business.created_at,
        updated_at:
          business.updated_at && typeof business.updated_at === 'object'
            ? (business.updated_at as Date).toISOString()
            : business.updated_at,
        // Ensure email is string | null (not undefined)
        email: business.email ?? null,
      } as any)
    : undefined;

  return (
    <CMSRouteGuard routePath="/(sidebar)/business-management/business-listings/edit">
      <SafeAreaView style={styles.container}>
        {/*
          FIX: Add a dynamic key based on the business ID.
          If you navigate from editing business '123' to editing business '456',
          the key will change, and the form will be completely reset with the new data.
          This also separates its state from the 'create' screen.
        */}
        <BusinessForm
          key={`edit-business-form-${id}`} // <-- THE FIX
          initialData={transformedBusinessData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={updateBusinessMutation.isPending}
          isEdit={true}
        />
        <ConfirmationModal
          visible={cancelModalVisible}
          title="Cancel Action"
          message="Are you sure you want to cancel? Any unsaved changes will be lost."
          confirmText="Cancel"
          cancelText="Continue Editing"
          confirmStyle="destructive"
          onConfirm={confirmCancel}
          onCancel={cancelCancel}
        />
        <ConfirmationModal
          visible={successModalVisible}
          title="Success"
          message={successMessage}
          confirmText="OK"
          cancelText=""
          onConfirm={handleSuccessOk}
          onCancel={handleSuccessOk}
        />
        <ConfirmationModal
          visible={errorModalVisible}
          title="Error"
          message={errorMessage}
          confirmText="OK"
          cancelText=""
          onConfirm={handleErrorOk}
          onCancel={handleErrorOk}
        />
      </SafeAreaView>
    </CMSRouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backButton: {
    minWidth: 120,
  },
});
