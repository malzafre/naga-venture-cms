// filepath: hooks/useBusinessForm.ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  BusinessCreateFormSchema,
  type BusinessCreateForm,
} from '@/schemas/business/businessSchemas';
import { Business } from '@/types/supabase';

// Use the new type alias for better consistency
export type BusinessFormData = BusinessCreateForm;

// Step field mappings for validation
const STEP_FIELDS = {
  1: ['business_name', 'business_type', 'description'] as const,
  2: [
    'address',
    'city',
    'province',
    'postal_code',
    'latitude',
    'longitude',
  ] as const,
  3: [
    'phone',
    'email',
    'website',
    'facebook_url',
    'instagram_url',
    'twitter_url',
  ] as const,
} as const;

interface UseBusinessFormOptions {
  initialData?: Business;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

/**
 * Smart Hook: useBusinessForm
 *
 * Manages multi-step business form state with proper validation and data handling.
 * Follows the "Smart Hook, Dumb Component" pattern.
 */
export function useBusinessForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: UseBusinessFormOptions) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const totalSteps = 3;

  // Extract coordinates from PostGIS GEOGRAPHY(POINT) format
  const extractCoordinates = useCallback(
    (location: string | null): { lat: number; lng: number } => {
      const nagaCityCenter = { lat: 13.6218, lng: 123.1948 };

      if (!location || typeof location !== 'string') {
        return nagaCityCenter;
      }

      const match = location.match(
        /POINT\(([-+]?\d*\.?\d+)\s+([-+]?\d*\.?\d+)\)/
      );
      if (match && match[1] && match[2]) {
        return {
          lng: parseFloat(match[1]),
          lat: parseFloat(match[2]),
        };
      }

      return nagaCityCenter;
    },
    []
  );

  // Get initial coordinates
  const initialCoords = extractCoordinates(
    (initialData?.location as string) || null
  );
  // Form setup with React Hook Form
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(BusinessCreateFormSchema),
    mode: 'onChange',
    defaultValues: {
      business_name: initialData?.business_name || '',
      business_type: initialData?.business_type || 'shop',
      description: initialData?.description || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      province: initialData?.province || '',
      postal_code: initialData?.postal_code || '',
      latitude: initialCoords.lat,
      longitude: initialCoords.lng,
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      website: initialData?.website || '',
      facebook_url: initialData?.facebook_url || '',
      instagram_url: initialData?.instagram_url || '',
      twitter_url: initialData?.twitter_url || '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    trigger,
    reset,
    watch,
  } = form; // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    console.log(
      '🔄 [useBusinessForm] Effect triggered - initialData/isEdit changed'
    );
    console.log('🔄 [useBusinessForm] isEdit:', isEdit);
    console.log(
      '🔄 [useBusinessForm] initialData:',
      initialData?.business_name || 'none'
    );

    if (initialData && isEdit) {
      console.log('📝 [useBusinessForm] Setting form to EDIT mode');
      const coords = extractCoordinates(initialData.location as string);
      const editData = {
        business_name: initialData.business_name || '',
        business_type: initialData.business_type || 'shop',
        description: initialData.description || '',
        address: initialData.address || '',
        city: initialData.city || '',
        province: initialData.province || '',
        postal_code: initialData.postal_code || '',
        latitude: coords.lat,
        longitude: coords.lng,
        phone: initialData.phone || '',
        email: initialData.email || '',
        website: initialData.website || '',
        facebook_url: initialData.facebook_url || '',
        instagram_url: initialData.instagram_url || '',
        twitter_url: initialData.twitter_url || '',
      };
      console.log('📝 [useBusinessForm] Edit data prepared:', editData);
      reset(editData);
    } else if (!isEdit) {
      console.log('🆕 [useBusinessForm] Setting form to CREATE mode');
      const createData = {
        business_name: '',
        business_type: 'shop' as const,
        description: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        latitude: 13.6218,
        longitude: 123.1948,
        phone: '',
        email: '',
        website: '',
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
      };
      console.log('🆕 [useBusinessForm] Create data prepared:', createData);
      reset(createData);
      setCurrentStep(1);
    }
  }, [initialData, isEdit, reset, extractCoordinates]);

  // Validate current step fields only
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    try {
      const fieldsToValidate =
        STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS];
      const result = await trigger(fieldsToValidate);
      return result;
    } catch (error) {
      console.error('Validation error in step', currentStep, ':', error);
      return false;
    }
  }, [currentStep, trigger]); // Step navigation handlers with debugging
  const nextStep = useCallback(async () => {
    console.log('➡️ [useBusinessForm] Next step requested');
    console.log('➡️ [useBusinessForm] Current step:', currentStep);
    console.log('➡️ [useBusinessForm] Is navigating:', isNavigating);

    if (isNavigating) {
      console.log(
        '⏸️ [useBusinessForm] Navigation blocked - already navigating'
      );
      return;
    }

    setIsNavigating(true);
    console.log('🔍 [useBusinessForm] Validating current step...');

    const isStepValid = await validateCurrentStep();
    console.log('🔍 [useBusinessForm] Step validation result:', isStepValid);

    if (isStepValid && currentStep < totalSteps) {
      console.log('✅ [useBusinessForm] Moving to next step');
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log(
        '❌ [useBusinessForm] Cannot move to next step - validation failed or last step'
      );
    }

    setIsNavigating(false);
  }, [currentStep, totalSteps, validateCurrentStep, isNavigating]);

  const prevStep = useCallback(() => {
    console.log('⬅️ [useBusinessForm] Previous step requested');
    console.log('⬅️ [useBusinessForm] Current step:', currentStep);
    console.log('⬅️ [useBusinessForm] Is navigating:', isNavigating);

    if (isNavigating) {
      console.log(
        '⏸️ [useBusinessForm] Navigation blocked - already navigating'
      );
      return;
    }

    if (currentStep > 1) {
      console.log('✅ [useBusinessForm] Moving to previous step');
      setCurrentStep((prev) => prev - 1);
    } else {
      console.log(
        '❌ [useBusinessForm] Cannot move to previous step - already at first step'
      );
    }
  }, [currentStep, isNavigating]);
  // Clear form data with debugging
  const clearForm = useCallback(() => {
    console.log('🧹 [useBusinessForm] Clearing form data');
    const defaultData = {
      business_name: '',
      business_type: 'shop' as const,
      description: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      latitude: 13.6218,
      longitude: 123.1948,
      phone: '',
      email: '',
      website: '',
      facebook_url: '',
      instagram_url: '',
      twitter_url: '',
    };
    console.log('🧹 [useBusinessForm] Default data:', defaultData);
    reset(defaultData);
    setCurrentStep(1);
    console.log('✅ [useBusinessForm] Form cleared and reset to step 1');
  }, [reset]);

  // Form submission handler
  const onFormSubmit = useCallback(
    (data: BusinessFormData) => {
      const businessData = {
        // Step 1 data
        business_name: data.business_name,
        business_type: data.business_type,
        description: data.description,

        // Step 2 data
        address: data.address,
        city: data.city,
        province: data.province,
        postal_code: data.postal_code || null,
        location: `POINT(${data.longitude} ${data.latitude})`,

        // Step 3 data
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        facebook_url: data.facebook_url || null,
        instagram_url: data.instagram_url || null,
        twitter_url: data.twitter_url || null,
      };

      onSubmit(businessData);
    },
    [onSubmit]
  );
  // Cancel handler with comprehensive debugging
  const handleCancel = useCallback(() => {
    console.log('🚨 [useBusinessForm] Cancel button clicked');
    console.log('🚨 [useBusinessForm] onCancel function:', typeof onCancel);
    console.log('🚨 [useBusinessForm] Current step:', currentStep);
    console.log(
      '🚨 [useBusinessForm] Form data before cancel:',
      form.getValues()
    );

    try {
      onCancel();
      console.log('✅ [useBusinessForm] Cancel function executed successfully');
    } catch (error) {
      console.error('❌ [useBusinessForm] Error in cancel function:', error);
    }
  }, [onCancel, currentStep, form]);

  // Get current step validation state using useMemo for derived value
  const isCurrentStepValid = useMemo(() => {
    const fieldsToCheck = STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS];
    return fieldsToCheck.every((field) => !errors[field]);
  }, [currentStep, errors]);
  return {
    // Form state
    form,
    control,
    errors,
    isValid,
    watch,

    // Step state
    currentStep,
    totalSteps,
    isNavigating,

    // Actions
    nextStep,
    prevStep,
    handleSubmit: handleSubmit(onFormSubmit),
    handleCancel,
    validateCurrentStep,
    clearForm,

    // Computed state
    isCurrentStepValid, // Now returning the memoized value directly
    canGoNext: currentStep < totalSteps,
    canGoPrev: currentStep > 1,
    isLastStep: currentStep === totalSteps,
  };
}
