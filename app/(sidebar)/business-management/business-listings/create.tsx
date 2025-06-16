// filepath: c:\Users\Hans Candor\Documents\capstone-NV\naga-venture\app\TourismCMS\(admin)\business-management\business-listings\create.tsx
// filepath: app/TourismCMS/(admin)/business-management/business-listings/create/index.tsx
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Hooks and types

// Services

// Components
import { ConfirmationModal } from '@/components/molecules/ConfirmationModal';
import { BusinessForm, CMSRouteGuard } from '@/components/organisms';
import { NavigationService } from '@/constants/NavigationService';
import { useBusinessImageManagement } from '@/hooks/useBusinessImageManagement';
import { useCreateBusiness } from '@/hooks/useBusinessManagement';
import { BusinessInsert } from '@/schemas';

/**
 * Create Business Page
 *
 * Form page for creating new business listings with multi-step workflow.
 */
export default function CreateBusinessScreen() {
  const createBusinessMutation = useCreateBusiness();
  const { uploadImages } = useBusinessImageManagement({
    onError: (error) => {
      console.error('Image upload error:', error);
      setErrorMessage(
        `Business created successfully, but failed to upload images: ${error}`
      );
      setErrorModalVisible(true);
    },
  });

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (formData: any) => {
    console.log('📝 Form data received:', formData);

    // Extract images and create clean business data object
    const { images, ...rawBusinessData } = formData;

    // Ensure required fields are not undefined
    if (
      !rawBusinessData.business_name ||
      !rawBusinessData.description ||
      !rawBusinessData.address
    ) {
      setErrorMessage(
        'Missing required fields. Please check the form and try again.'
      );
      setErrorModalVisible(true);
      return;
    }

    // Create clean BusinessInsert object with only required fields
    const businessInsertData: BusinessInsert = {
      business_name: String(rawBusinessData.business_name),
      business_type: rawBusinessData.business_type || 'shop',
      description: String(rawBusinessData.description),
      address: String(rawBusinessData.address),
      city: String(rawBusinessData.city || 'Naga City'),
      province: String(rawBusinessData.province || 'Camarines Sur'),
      location: String(rawBusinessData.location),
      postal_code: rawBusinessData.postal_code
        ? String(rawBusinessData.postal_code)
        : null,
      phone: rawBusinessData.phone ? String(rawBusinessData.phone) : null,
      email: rawBusinessData.email ? String(rawBusinessData.email) : null,
      website: rawBusinessData.website ? String(rawBusinessData.website) : null,
      facebook_url: rawBusinessData.facebook_url
        ? String(rawBusinessData.facebook_url)
        : null,
      instagram_url: rawBusinessData.instagram_url
        ? String(rawBusinessData.instagram_url)
        : null,
      twitter_url: rawBusinessData.twitter_url
        ? String(rawBusinessData.twitter_url)
        : null,
    };

    console.log('🏢 Business insert data:', businessInsertData);
    console.log('🖼️ Images to upload:', images);

    createBusinessMutation.mutate(businessInsertData, {
      onSuccess: async (newBusiness) => {
        console.log('✅ Business created successfully:', newBusiness);
        console.log('✅ Business ID:', newBusiness.id);

        try {
          // Upload images if any
          if (images && images.length > 0) {
            console.log(
              '📤 Starting image upload for business:',
              newBusiness.id
            );
            console.log(
              '📤 Images to upload:',
              images.map((img: any) => ({
                id: img.id,
                name: img.name,
                size: img.size,
              }))
            );

            // Upload images and wait for completion
            uploadImages(newBusiness.id as string, images);

            console.log(
              '📤 Image upload initiated for business:',
              newBusiness.id
            );
          } else {
            console.log('📤 No images to upload');
          }

          setSuccessMessage(
            `Business "${newBusiness.business_name}" has been created successfully${images && images.length > 0 ? ` with ${images.length} images` : ''}!`
          );
          setSuccessModalVisible(true);
        } catch (imageError) {
          console.error('❌ Image upload error:', imageError);
          setSuccessMessage(
            `Business "${newBusiness.business_name}" has been created successfully! However, some images failed to upload. You can add images later by editing the business.`
          );
          setSuccessModalVisible(true);
        }
      },
      onError: (error) => {
        console.error('❌ Create business error:', error);
        setErrorMessage(
          `Failed to create business listing. Please try again.\n\nError Details: ${error.message}`
        );
        setErrorModalVisible(true);
      },
    });
  };
  const handleCancel = () => {
    console.log('🔴 [CreateBusinessScreen] Cancel button clicked');
    console.log('🔴 [CreateBusinessScreen] About to show confirmation modal');
    setCancelModalVisible(true);
  };

  const confirmCancel = () => {
    console.log(
      '✅ [CreateBusinessScreen] User confirmed cancel - navigating back'
    );
    setCancelModalVisible(false);
    try {
      NavigationService.toAllBusinesses();
      console.log('✅ [CreateBusinessScreen] Navigation successful');
    } catch (error) {
      console.error('❌ [CreateBusinessScreen] Navigation error:', error);
    }
  };
  const cancelCancel = () => {
    console.log('⏸️ [CreateBusinessScreen] User chose to continue editing');
    setCancelModalVisible(false);
  };

  const handleSuccessOk = () => {
    setSuccessModalVisible(false);
    NavigationService.toAllBusinesses();
  };

  const handleErrorOk = () => {
    setErrorModalVisible(false);
  };
  return (
    <CMSRouteGuard routePath="/TourismCMS/(admin)/business-management/business-listings/create">
      <SafeAreaView style={styles.container}>
        {/*
          FIX: Add a static key. This ensures that the "Create" screen *always*
          has a different key than the "Edit" screen, forcing a full remount
          when navigating between them and destroying any old state.
        */}
        <BusinessForm
          key="create-business-form" // <-- THE FIX
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createBusinessMutation.isPending}
          isEdit={false}
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
});
