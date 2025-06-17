// filepath: hooks/useAmenitiesManagement.ts
/**
 * Amenities Management Hooks - Phase 2 Implementation
 *
 * Production-grade smart hooks for amenities management operations with comprehensive features:
 * - Complete CRUD operations with Zod validation
 * - Usage analytics and statistics tracking
 * - Search and filtering capabilities
 * - Audit trail support with creator/updater tracking
 * - Optimistic updates and error handling
 * - Type-safe operations following coding guidelines
 *
 * Following established patterns from useCategoryManagement.ts
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import { z } from 'zod';

import { DOMAIN_CACHE_CONFIG } from '@/constants/CacheConstants';
import { useAuth } from '@/hooks/features/auth/useAuth';
import { useDebounce } from '@/hooks/shared/useDebounce';
import queryKeys from '@/lib/queryKeys';
import { supabase } from '@/lib/supabaseClient';
import {
  AmenitiesUsageSummarySchema,
  AmenityCompleteSchema,
  AmenityFiltersSchema,
  AmenityFormSchema,
  AmenityInsertSchema,
  AmenitySchema,
  AmenityUpdateSchema,
  AmenityUsageStatsSchema,
  type AmenitiesUsageSummary,
  type Amenity,
  type AmenityComplete,
  type AmenityFilters,
  type AmenityFormData,
  type AmenityInsert,
  type AmenityUpdate,
  type AmenityUsageStats,
} from '@/schemas/amenitiesSchemas';

// ============================================================================
// ERROR HANDLING
// ============================================================================

class AmenityError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AmenityError';
  }
}

const handleAmenityError = (
  error: unknown,
  operation: string
): AmenityError => {
  console.error(`Amenity ${operation} error:`, error);

  if (error instanceof z.ZodError) {
    return new AmenityError(
      `Validation failed: ${error.issues.map((i) => i.message).join(', ')}`,
      'VALIDATION_ERROR',
      { issues: error.issues }
    );
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as {
      code: string;
      message: string;
      details?: string;
    };

    switch (supabaseError.code) {
      case '23505': // Unique constraint violation
        return new AmenityError(
          'An amenity with this name already exists',
          'DUPLICATE_NAME',
          { originalError: supabaseError }
        );
      case '23503': // Foreign key constraint violation
        return new AmenityError(
          'Cannot perform operation due to existing relationships',
          'CONSTRAINT_VIOLATION',
          { originalError: supabaseError }
        );
      case 'PGRST116': // No rows found
        return new AmenityError('Amenity not found', 'NOT_FOUND', {
          originalError: supabaseError,
        });
      default:
        return new AmenityError(
          supabaseError.message || 'Database operation failed',
          supabaseError.code,
          { originalError: supabaseError }
        );
    }
  }

  return new AmenityError(
    error instanceof Error ? error.message : 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    { originalError: error }
  );
};

// ============================================================================
// FETCH AMENITIES WITH FILTERS
// ============================================================================

/**
 * Hook to fetch amenities with comprehensive filtering, search, and pagination
 * Includes usage statistics and audit information when requested
 */
export const useAmenities = (filters: Partial<AmenityFilters> = {}) => {
  // Validate filters
  const validatedFilters = AmenityFiltersSchema.parse(filters);

  return useQuery({
    queryKey: queryKeys.amenities.list(validatedFilters),
    queryFn: async (): Promise<AmenityComplete[]> => {
      try {
        let query = supabase.from('amenities').select(`
            id,
            name,
            icon_url,
            created_at,
            updated_at,
            created_by,
            updated_by,
            ${
              validatedFilters.include_audit
                ? `
              created_by_profile:profiles!amenities_created_by_fkey(
                id,
                first_name,
                last_name,
                email
              ),
              updated_by_profile:profiles!amenities_updated_by_fkey(
                id,
                first_name,
                last_name,
                email
              ),
            `
                : ''
            }
            ${
              validatedFilters.include_usage
                ? `
              business_amenities!business_amenities_amenity_id_fkey(count),
              room_amenities!room_amenities_amenity_id_fkey(count)
            `
                : ''
            }
          `);

        // Apply search filter
        if (validatedFilters.search) {
          query = query.ilike('name', `%${validatedFilters.search}%`);
        }

        // Apply creator filter
        if (validatedFilters.created_by) {
          query = query.eq('created_by', validatedFilters.created_by);
        }

        // Apply updater filter
        if (validatedFilters.updated_by) {
          query = query.eq('updated_by', validatedFilters.updated_by);
        }

        // Apply sorting
        const sortColumn = validatedFilters.sortBy;
        const sortOrder = validatedFilters.sortOrder;

        if (sortColumn === 'total_usage' && validatedFilters.include_usage) {
          // For usage-based sorting, we'll sort client-side after processing
          query = query.order('name', { ascending: sortOrder === 'asc' });
        } else {
          query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
        }

        // Apply pagination
        const from = (validatedFilters.page - 1) * validatedFilters.limit;
        const to = from + validatedFilters.limit - 1;
        query = query.range(from, to);

        const { data, error } = await query;

        if (error) {
          throw handleAmenityError(error, 'fetch');
        }

        // Process and validate the data
        const processedData = (data || []).map((amenity: any) => {
          const businessCount = amenity.business_amenities?.length || 0;
          const roomCount = amenity.room_amenities?.length || 0;

          const baseAmenity = {
            id: amenity.id,
            name: amenity.name,
            icon_url: amenity.icon_url,
            created_at: amenity.created_at,
            updated_at: amenity.updated_at,
            created_by: amenity.created_by,
            updated_by: amenity.updated_by,
            business_count: validatedFilters.include_usage ? businessCount : 0,
            room_count: validatedFilters.include_usage ? roomCount : 0,
            total_usage: validatedFilters.include_usage
              ? businessCount + roomCount
              : 0,
          };

          // Add audit information if requested
          if (validatedFilters.include_audit) {
            Object.assign(baseAmenity, {
              created_by_profile: amenity.created_by_profile || null,
              updated_by_profile: amenity.updated_by_profile || null,
            });
          }

          return baseAmenity;
        });

        // Apply usage-based filtering
        let filteredData = processedData;

        if (validatedFilters.has_usage !== undefined) {
          filteredData = processedData.filter((amenity) =>
            validatedFilters.has_usage
              ? amenity.total_usage > 0
              : amenity.total_usage === 0
          );
        }

        if (validatedFilters.min_usage_count !== undefined) {
          filteredData = filteredData.filter(
            (amenity) =>
              amenity.total_usage >= validatedFilters.min_usage_count!
          );
        }

        // Sort by usage if requested
        if (validatedFilters.sortBy === 'total_usage') {
          filteredData.sort((a, b) => {
            const aUsage = a.total_usage;
            const bUsage = b.total_usage;
            return validatedFilters.sortOrder === 'asc'
              ? aUsage - bUsage
              : bUsage - aUsage;
          });
        }

        return AmenityCompleteSchema.array().parse(filteredData);
      } catch (error) {
        throw handleAmenityError(error, 'fetch');
      }
    },
    placeholderData: keepPreviousData,
    staleTime: DOMAIN_CACHE_CONFIG.amenities.staleTime || 5 * 60 * 1000,
    gcTime: DOMAIN_CACHE_CONFIG.amenities.gcTime || 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};

// ============================================================================
// FETCH SINGLE AMENITY
// ============================================================================

/**
 * Hook to fetch a single amenity by ID with complete details
 */
export const useAmenity = (amenityId?: string) => {
  return useQuery({
    queryKey: queryKeys.amenities.detail(amenityId!),
    queryFn: async (): Promise<AmenityComplete> => {
      try {
        const { data, error } = await supabase
          .from('amenities')
          .select(
            `
            id,
            name,
            icon_url,
            created_at,
            updated_at,
            created_by,
            updated_by,
            created_by_profile:profiles!amenities_created_by_fkey(
              id,
              first_name,
              last_name,
              email
            ),
            updated_by_profile:profiles!amenities_updated_by_fkey(
              id,
              first_name,
              last_name,
              email
            ),
            business_amenities!business_amenities_amenity_id_fkey(count),
            room_amenities!room_amenities_amenity_id_fkey(count)
          `
          )
          .eq('id', amenityId!)
          .single();

        if (error) {
          throw handleAmenityError(error, 'fetch single');
        }

        if (!data) {
          throw new AmenityError('Amenity not found', 'NOT_FOUND');
        }

        // Process the data
        const businessCount = data.business_amenities?.length || 0;
        const roomCount = data.room_amenities?.length || 0;

        const processedData = {
          ...data,
          business_count: businessCount,
          room_count: roomCount,
          total_usage: businessCount + roomCount,
        };

        return AmenityCompleteSchema.parse(processedData);
      } catch (error) {
        throw handleAmenityError(error, 'fetch single');
      }
    },
    enabled: !!amenityId,
    staleTime: DOMAIN_CACHE_CONFIG.amenities.staleTime || 5 * 60 * 1000,
    gcTime: DOMAIN_CACHE_CONFIG.amenities.gcTime || 10 * 60 * 1000,
  });
};

// ============================================================================
// CREATE AMENITY
// ============================================================================

/**
 * Hook to create a new amenity with validation and optimistic updates
 */
export const useCreateAmenity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (amenityData: AmenityFormData): Promise<Amenity> => {
      try {
        // Validate the input data
        const validatedData = AmenityFormSchema.parse(amenityData);

        // Check for duplicate names
        const { data: existingAmenity } = await supabase
          .from('amenities')
          .select('id')
          .ilike('name', validatedData.name.trim())
          .single();

        if (existingAmenity) {
          throw new AmenityError(
            'An amenity with this name already exists',
            'DUPLICATE_NAME'
          );
        } // Prepare insert data
        const insertData: AmenityInsert = {
          name: validatedData.name.trim(),
          icon_url: validatedData.icon_url || null,
          created_by: user?.id || null,
        };

        // Validate insert data
        const validatedInsert = AmenityInsertSchema.parse(insertData);

        // Insert the amenity
        const { data, error } = await supabase
          .from('amenities')
          .insert(validatedInsert)
          .select()
          .single();

        if (error) {
          throw handleAmenityError(error, 'create');
        }

        if (!data) {
          throw new AmenityError('Failed to create amenity', 'CREATE_FAILED');
        }

        return AmenitySchema.parse(data);
      } catch (error) {
        throw handleAmenityError(error, 'create');
      }
    },
    onSuccess: (newAmenity) => {
      // Invalidate all amenity lists to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.amenities.lists(),
      });

      // Update any existing detail cache
      queryClient.setQueryData(queryKeys.amenities.detail(newAmenity.id), {
        ...newAmenity,
        business_count: 0,
        room_count: 0,
        total_usage: 0,
        created_by_profile: null,
        updated_by_profile: null,
      });
    },
  });
};

// ============================================================================
// UPDATE AMENITY
// ============================================================================

/**
 * Hook to update an existing amenity with validation
 */
export const useUpdateAmenity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      data: AmenityFormData;
    }): Promise<Amenity> => {
      try {
        const { id, data: amenityData } = params;

        // Validate the input data
        const validatedData = AmenityFormSchema.parse(amenityData);

        // Check for duplicate names (excluding current amenity)
        const { data: existingAmenity } = await supabase
          .from('amenities')
          .select('id')
          .ilike('name', validatedData.name.trim())
          .neq('id', id)
          .single();

        if (existingAmenity) {
          throw new AmenityError(
            'An amenity with this name already exists',
            'DUPLICATE_NAME'
          );
        } // Prepare update data
        const updateData: AmenityUpdate = {
          name: validatedData.name.trim(),
          icon_url: validatedData.icon_url || null,
          updated_by: user?.id || null,
        };

        // Validate update data
        const validatedUpdate = AmenityUpdateSchema.parse(updateData);

        // Update the amenity
        const { data, error } = await supabase
          .from('amenities')
          .update(validatedUpdate)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          throw handleAmenityError(error, 'update');
        }

        if (!data) {
          throw new AmenityError('Amenity not found', 'NOT_FOUND');
        }

        return AmenitySchema.parse(data);
      } catch (error) {
        throw handleAmenityError(error, 'update');
      }
    },
    onSuccess: (updatedAmenity) => {
      // Invalidate all amenity lists to refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.amenities.lists(),
      });

      // Update the specific amenity detail cache
      queryClient.invalidateQueries({
        queryKey: queryKeys.amenities.detail(updatedAmenity.id),
      });
    },
  });
};

// ============================================================================
// DELETE AMENITY
// ============================================================================

/**
 * Hook to delete an amenity with constraint checking
 */
export const useDeleteAmenity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amenityId: string): Promise<void> => {
      try {
        // Check if amenity is in use before deletion
        const { data: businessUsage } = await supabase
          .from('business_amenities')
          .select('id')
          .eq('amenity_id', amenityId)
          .limit(1);

        const { data: roomUsage } = await supabase
          .from('room_amenities')
          .select('id')
          .eq('amenity_id', amenityId)
          .limit(1);

        if ((businessUsage?.length || 0) > 0 || (roomUsage?.length || 0) > 0) {
          throw new AmenityError(
            'Cannot delete amenity that is currently in use by businesses or rooms',
            'IN_USE'
          );
        }

        // Delete the amenity
        const { error } = await supabase
          .from('amenities')
          .delete()
          .eq('id', amenityId);

        if (error) {
          throw handleAmenityError(error, 'delete');
        }
      } catch (error) {
        throw handleAmenityError(error, 'delete');
      }
    },
    onSuccess: (_, amenityId) => {
      // Invalidate all amenity lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.amenities.lists(),
      });

      // Remove the specific amenity from cache
      queryClient.removeQueries({
        queryKey: queryKeys.amenities.detail(amenityId),
      });
    },
  });
};

// ============================================================================
// USAGE ANALYTICS
// ============================================================================

/**
 * Hook to fetch comprehensive usage analytics for amenities
 */
export const useAmenityUsageAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.amenities.usageSummary(),
    queryFn: async (): Promise<AmenitiesUsageSummary> => {
      try {
        // Get amenities with their usage counts
        const { data: amenitiesData, error: amenitiesError } =
          await supabase.from('amenities').select(`
            id,
            name,
            icon_url,
            created_at,
            business_amenities!business_amenities_amenity_id_fkey(count),
            room_amenities!room_amenities_amenity_id_fkey(count)
          `);

        if (amenitiesError) {
          throw handleAmenityError(amenitiesError, 'fetch usage analytics');
        }

        // Process the data
        const amenitiesWithUsage = (amenitiesData || []).map((amenity) => {
          const businessCount = amenity.business_amenities?.length || 0;
          const roomCount = amenity.room_amenities?.length || 0;
          const totalUsage = businessCount + roomCount;

          return {
            id: amenity.id,
            name: amenity.name,
            icon_url: amenity.icon_url,
            business_count: businessCount,
            room_count: roomCount,
            total_usage: totalUsage,
          };
        });

        // Calculate summary statistics
        const totalAmenities = amenitiesWithUsage.length;
        const usedAmenities = amenitiesWithUsage.filter(
          (a) => a.total_usage > 0
        );
        const unusedAmenities = amenitiesWithUsage.filter(
          (a) => a.total_usage === 0
        ); // Sort for most/least used
        const sortedByUsage = [...amenitiesWithUsage].sort(
          (a, b) => b.total_usage - a.total_usage
        );
        const mostUsed = sortedByUsage.slice(0, 10).map((a) => ({
          id: a.id,
          name: a.name,
          icon_url: a.icon_url,
          usage_count: a.total_usage,
        }));
        const leastUsed = sortedByUsage
          .slice(-10)
          .reverse()
          .map((a) => ({
            id: a.id,
            name: a.name,
            icon_url: a.icon_url,
            usage_count: a.total_usage,
          }));

        const summary: AmenitiesUsageSummary = {
          total_amenities: totalAmenities,
          used_amenities: usedAmenities.length,
          unused_amenities: unusedAmenities.length,
          most_used_amenities: mostUsed,
          least_used_amenities: leastUsed,
          usage_by_type: {
            business_amenities: usedAmenities.reduce(
              (sum, a) => sum + a.business_count,
              0
            ),
            room_amenities: usedAmenities.reduce(
              (sum, a) => sum + a.room_count,
              0
            ),
          },
        };

        return AmenitiesUsageSummarySchema.parse(summary);
      } catch (error) {
        throw handleAmenityError(error, 'fetch usage analytics');
      }
    },
    staleTime: DOMAIN_CACHE_CONFIG.amenities.staleTime || 5 * 60 * 1000,
    gcTime: DOMAIN_CACHE_CONFIG.amenities.gcTime || 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch detailed usage statistics for a specific amenity
 */
export const useAmenityUsageStats = (amenityId?: string) => {
  return useQuery({
    queryKey: queryKeys.amenities.usageStats(amenityId!),
    queryFn: async (): Promise<AmenityUsageStats> => {
      try {
        // Get businesses using this amenity
        const { data: businessData, error: businessError } = await supabase
          .from('business_amenities')
          .select(
            `
            business_id,
            businesses!business_amenities_business_id_fkey(
              id,
              business_name,
              business_type,
              status
            )
          `
          )
          .eq('amenity_id', amenityId!);

        if (businessError) {
          throw handleAmenityError(businessError, 'fetch business usage');
        }

        // Get rooms using this amenity
        const { data: roomData, error: roomError } = await supabase
          .from('room_amenities')
          .select(
            `
            room_type_id,
            room_types!room_amenities_room_type_id_fkey(
              id,
              name,
              business_id,
              businesses!room_types_business_id_fkey(
                id,
                business_name
              )
            )
          `
          )
          .eq('amenity_id', amenityId!);

        if (roomError) {
          throw handleAmenityError(roomError, 'fetch room usage');
        }
        const businessUsage = (businessData || []).map((item) => ({
          id: (item as any).businesses.id,
          business_name: (item as any).businesses.business_name,
          business_type: (item as any).businesses.business_type,
        }));

        const roomUsage = (roomData || []).map((item) => ({
          id: (item as any).room_types.id,
          name: (item as any).room_types.name,
          business_name: (item as any).room_types.businesses.business_name,
          business_id: (item as any).room_types.business_id,
        }));

        const stats: AmenityUsageStats = {
          amenity_id: amenityId!,
          amenity_name: '', // We'll need to fetch this separately
          total_usage: businessUsage.length + roomUsage.length,
          business_usage: {
            count: businessUsage.length,
            businesses: businessUsage,
          },
          room_usage: {
            count: roomUsage.length,
            rooms: roomUsage,
          },
        };

        return AmenityUsageStatsSchema.parse(stats);
      } catch (error) {
        throw handleAmenityError(error, 'fetch amenity usage stats');
      }
    },
    enabled: !!amenityId,
    staleTime: DOMAIN_CACHE_CONFIG.amenities.staleTime || 5 * 60 * 1000,
    gcTime: DOMAIN_CACHE_CONFIG.amenities.gcTime || 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Hook to validate amenity name uniqueness
 */
export const useValidateAmenityName = () => {
  return useMutation({
    mutationFn: async (params: {
      name: string;
      excludeId?: string;
    }): Promise<boolean> => {
      try {
        const { name, excludeId } = params;

        let query = supabase
          .from('amenities')
          .select('id')
          .ilike('name', name.trim());

        if (excludeId) {
          query = query.neq('id', excludeId);
        }

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') {
          throw handleAmenityError(error, 'validate name');
        }

        // Return true if name is available (no existing record found)
        return !data;
      } catch (error) {
        if (error instanceof AmenityError && error.code === 'NOT_FOUND') {
          return true; // Name is available
        }
        throw handleAmenityError(error, 'validate name');
      }
    },
  });
};

// ============================================================================
// SMART HOOK FOR AMENITIES MANAGEMENT PAGE
// ============================================================================

/**
 * Smart hook for amenities management page
 * Encapsulates all business logic following "Smart Hook, Dumb Component" pattern
 */
export const useAmenitiesManagementPage = () => {
  // === STATE MANAGEMENT ===
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const [filterState, setFilterState] = useState<{
    sortBy: 'name' | 'created_at' | 'total_usage';
    sortOrder: 'asc' | 'desc';
  }>({
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [modalState, setModalState] = useState<{
    isVisible: boolean;
    mode: 'create' | 'edit';
    amenity?: any;
  }>({
    isVisible: false,
    mode: 'create',
  });
  const [deleteModalState, setDeleteModalState] = useState<{
    isVisible: boolean;
    amenity?: any;
  }>({
    isVisible: false,
  });

  // === RESPONSIVE DESIGN ===
  const { height: screenHeight } = useWindowDimensions();

  const responsivePageSize = useMemo(() => {
    const headerHeight = 40;
    const rowHeight = 56;
    const reservedHeight = 300; // Analytics, filters, margins, etc.

    const availableHeight = screenHeight - reservedHeight;
    const maxTableHeight = availableHeight - headerHeight;
    const maxPossibleRows = Math.floor(maxTableHeight / rowHeight);

    let calculatedSize;
    if (screenHeight >= 1080) {
      calculatedSize = Math.min(12, maxPossibleRows);
    } else if (screenHeight >= 800) {
      calculatedSize = Math.min(9, maxPossibleRows);
    } else if (screenHeight >= 600) {
      calculatedSize = Math.min(7, maxPossibleRows);
    } else {
      calculatedSize = Math.min(5, maxPossibleRows);
    }

    return Math.max(5, calculatedSize);
  }, [screenHeight]); // === DATA FETCHING ===
  const amenityFilters: AmenityFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      sortBy: filterState.sortBy,
      sortOrder: filterState.sortOrder,
      page: 1,
      limit: responsivePageSize,
      include_usage: true,
      include_audit: false,
    }),
    [debouncedSearch, filterState, responsivePageSize]
  );
  const {
    data: amenitiesData,
    isLoading,
    isError,
    error,
  } = useAmenities(amenityFilters);

  const amenities = useMemo(() => amenitiesData || [], [amenitiesData]);
  // === MUTATIONS ===
  const deleteAmenityMutation = useDeleteAmenity();

  // === EVENT HANDLERS ===
  const handleSearch = useCallback((query: string) => {
    setSearchInput(query);
  }, []);

  const handleSortChange = useCallback((sortKey: string) => {
    const [sortBy, sortOrder] = sortKey.split('_') as [
      'name' | 'created_at' | 'total_usage',
      'asc' | 'desc',
    ];
    setFilterState((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  const handleFilterChange = useCallback((field: string, value: any) => {
    setFilterState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setModalState({
      isVisible: true,
      mode: 'create',
    });
  }, []);

  const handleOpenEditModal = useCallback((amenity: any) => {
    setModalState({
      isVisible: true,
      mode: 'edit',
      amenity,
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({
      isVisible: false,
      mode: 'create',
    });
  }, []);

  const handleDeleteAmenity = useCallback((amenity: any) => {
    setDeleteModalState({
      isVisible: true,
      amenity,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const { amenity } = deleteModalState;
    if (!amenity) return;

    try {
      await deleteAmenityMutation.mutateAsync(amenity.id);

      setDeleteModalState({ isVisible: false });

      Alert.alert('Success', 'Amenity deleted successfully');
    } catch (error) {
      console.error('Delete amenity error:', error);
      Alert.alert(
        'Delete Failed',
        error instanceof Error ? error.message : 'Failed to delete amenity'
      );
    }
  }, [deleteModalState, deleteAmenityMutation]);

  const handleRowPress = useCallback(
    (amenity: any) => {
      handleOpenEditModal(amenity);
    },
    [handleOpenEditModal]
  );

  // === RETURN INTERFACE ===
  return {
    // Data
    amenities,

    // Loading states
    isLoading,
    isError,
    error,

    // UI State
    searchInput,
    filterState,
    modalState,
    deleteModalState,
    responsivePageSize,

    // Event handlers
    handleSearch,
    handleSortChange,
    handleFilterChange,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleDeleteAmenity,
    handleConfirmDelete,
    handleRowPress,
  };
};

export type { AmenityError };
