/**
 * Global Query Optimization Hooks - Phase 3 Implementation
 *
 * Centralized query management for TanStack Query optimization across all domains.
 * Provides reusable patterns for:
 * - Background refetching strategies
 * - Cache invalidation management
 * - Error boundary integration
 * - Performance monitoring
 * - Network-aware caching
 */

import { DOMAIN_CACHE_CONFIG } from '@/constants/CacheConstants';
import queryKeys from '@/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Global Cache Management Hook
 *
 * Provides intelligent cache invalidation and prefetching strategies.
 */
export function useCacheManagement() {
  const queryClient = useQueryClient();

  // Invalidate all business-related queries
  const invalidateBusinessQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.businesses.all });
  }, [queryClient]);

  // Invalidate user-related queries
  const invalidateUserQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  }, [queryClient]);

  // Invalidate category queries
  const invalidateCategoryQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  }, [queryClient]);

  // Invalidate all tourism content
  const invalidateTourismContent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.touristSpots.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.promotions.all });
  }, [queryClient]);

  // Smart invalidation based on data relationships
  const invalidateRelatedQueries = useCallback(
    (entityType: string, entityId: string) => {
      switch (entityType) {
        case 'business':
          // Invalidate business and related data
          queryClient.invalidateQueries({
            queryKey: queryKeys.businesses.detail(entityId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.businesses.lists(),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.reviews.byTarget('business', entityId),
          });
          break;

        case 'user':
          queryClient.invalidateQueries({
            queryKey: queryKeys.users.detail(entityId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.users.lists(),
          });
          break;

        case 'category':
          queryClient.invalidateQueries({
            queryKey: queryKeys.categories.detail(entityId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.categories.lists(),
          });
          // Invalidate businesses using this category
          queryClient.invalidateQueries({
            queryKey: queryKeys.businesses.byCategory(entityId),
          });
          break;

        default:
          console.warn(`Unknown entity type for invalidation: ${entityType}`);
      }
    },
    [queryClient]
  );
  // Prefetch commonly accessed data
  const prefetchCriticalData = useCallback(() => {
    // Prefetch categories for forms
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.lists(),
      queryFn: () => {
        // Implementation would fetch categories
        return Promise.resolve([]);
      },
      staleTime: DOMAIN_CACHE_CONFIG.businesses.staleTime,
    });

    // Prefetch featured businesses
    queryClient.prefetchQuery({
      queryKey: queryKeys.businesses.featured(),
      queryFn: () => {
        // Implementation would fetch featured businesses
        return Promise.resolve([]);
      },
      staleTime: DOMAIN_CACHE_CONFIG.businesses.staleTime,
    });
  }, [queryClient]);

  // Clear all caches (for logout or critical errors)
  const clearAllCaches = useCallback(() => {
    queryClient.clear();
    console.log('[useCacheManagement] All caches cleared');
  }, [queryClient]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      activeQueries: queries.filter((q) => q.state.status === 'success').length,
      errorQueries: queries.filter((q) => q.state.status === 'error').length,
      loadingQueries: queries.filter((q) => q.state.status === 'pending')
        .length,
      staleQueries: queries.filter((q) => q.isStale()).length,
    };
  }, [queryClient]);

  return {
    // Invalidation methods
    invalidateBusinessQueries,
    invalidateUserQueries,
    invalidateCategoryQueries,
    invalidateTourismContent,
    invalidateRelatedQueries,

    // Prefetching
    prefetchCriticalData,

    // Cache management
    clearAllCaches,
    getCacheStats,
  };
}

/**
 * Background Sync Hook
 *
 * Manages background synchronization with smart refetching strategies.
 */
export function useBackgroundSync() {
  const queryClient = useQueryClient();

  // Periodic background sync for critical data
  const startPeriodicSync = useCallback(
    (intervalMs: number = 30000) => {
      const interval = setInterval(() => {
        // Refetch pending items that need attention
        queryClient.refetchQueries({
          queryKey: queryKeys.businesses.pending(),
          type: 'active',
        });

        queryClient.refetchQueries({
          queryKey: queryKeys.system.health(),
          type: 'active',
        });
      }, intervalMs);

      return () => clearInterval(interval);
    },
    [queryClient]
  );

  return {
    startPeriodicSync,
  };
}

/**
 * Query Performance Monitor Hook
 *
 * Monitors query performance and provides optimization insights.
 */
export function useQueryPerformance() {
  const queryClient = useQueryClient();
  // Get slow queries
  const getSlowQueries = useCallback(
    (thresholdMs: number = 2000) => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      return queries
        .filter((query) => {
          // Simple heuristic for slow queries based on stale time
          return query.isStale() && query.state.status === 'success';
        })
        .map((query) => ({
          queryKey: query.queryKey,
          status: query.state.status,
          dataSize: JSON.stringify(query.state.data || {}).length,
          lastFetch: new Date(query.state.dataUpdatedAt || 0),
        }));
    },
    [queryClient]
  );

  // Get memory usage by query
  const getQueryMemoryUsage = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    return queries
      .map((query) => ({
        queryKey: query.queryKey,
        dataSize: JSON.stringify(query.state.data || {}).length,
        status: query.state.status,
      }))
      .sort((a, b) => b.dataSize - a.dataSize);
  }, [queryClient]);

  // Check for duplicate queries
  const getDuplicateQueries = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const queryGroups = new Map<string, any[]>();

    queries.forEach((query) => {
      const keyString = JSON.stringify(query.queryKey);
      if (!queryGroups.has(keyString)) {
        queryGroups.set(keyString, []);
      }
      queryGroups.get(keyString)!.push(query);
    });

    return Array.from(queryGroups.entries())
      .filter(([_, queries]) => queries.length > 1)
      .map(([keyString, queries]) => ({
        queryKey: keyString,
        count: queries.length,
        queries,
      }));
  }, [queryClient]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const slowQueries = getSlowQueries();
    const memoryHogs = getQueryMemoryUsage().slice(0, 10);
    const duplicates = getDuplicateQueries();

    const suggestions: string[] = [];

    if (slowQueries.length > 0) {
      suggestions.push(
        `${slowQueries.length} slow queries detected. Consider optimizing these queries or implementing pagination.`
      );
    }

    if (memoryHogs.some((q) => q.dataSize > 100000)) {
      suggestions.push(
        'Large data payloads detected. Consider implementing pagination or reducing select fields.'
      );
    }

    if (duplicates.length > 0) {
      suggestions.push(
        `${duplicates.length} duplicate query patterns found. Check for redundant data fetching.`
      );
    }

    const totalQueries = queryClient.getQueryCache().getAll().length;
    if (totalQueries > 100) {
      suggestions.push(
        'High number of cached queries. Consider implementing cache size limits.'
      );
    }

    return suggestions;
  }, [queryClient, getSlowQueries, getQueryMemoryUsage, getDuplicateQueries]);

  return {
    getSlowQueries,
    getQueryMemoryUsage,
    getDuplicateQueries,
    getOptimizationSuggestions,
  };
}

/**
 * Error Recovery Hook
 *
 * Provides intelligent error recovery and retry strategies.
 */
export function useQueryErrorRecovery() {
  const queryClient = useQueryClient();

  // Retry failed queries with exponential backoff
  const retryFailedQueries = useCallback(
    (maxRetries: number = 3) => {
      const cache = queryClient.getQueryCache();
      const failedQueries = cache
        .getAll()
        .filter((query) => query.state.status === 'error');

      failedQueries.forEach((query) => {
        const retryCount = query.state.errorUpdateCount || 0;
        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          setTimeout(() => {
            queryClient.refetchQueries({ queryKey: query.queryKey });
          }, delay);
        }
      });

      return failedQueries.length;
    },
    [queryClient]
  );

  // Reset error state for specific queries
  const resetQueryErrors = useCallback(
    (queryKeyPattern?: string[]) => {
      if (queryKeyPattern) {
        queryClient.resetQueries({ queryKey: queryKeyPattern });
      } else {
        const cache = queryClient.getQueryCache();
        const errorQueries = cache
          .getAll()
          .filter((query) => query.state.status === 'error');

        errorQueries.forEach((query) => {
          queryClient.resetQueries({ queryKey: query.queryKey });
        });
      }
    },
    [queryClient]
  );

  // Get error summary
  const getErrorSummary = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const errorQueries = cache
      .getAll()
      .filter((query) => query.state.status === 'error');

    const errorsByType = new Map<string, number>();

    errorQueries.forEach((query) => {
      const error = query.state.error as any;
      const errorType = error?.name || error?.message || 'Unknown Error';
      errorsByType.set(errorType, (errorsByType.get(errorType) || 0) + 1);
    });

    return {
      totalErrors: errorQueries.length,
      errorsByType: Object.fromEntries(errorsByType),
      errorQueries: errorQueries.map((query) => ({
        queryKey: query.queryKey,
        error: query.state.error,
        retryCount: query.state.errorUpdateCount,
        lastError: new Date(query.state.errorUpdatedAt),
      })),
    };
  }, [queryClient]);

  return {
    retryFailedQueries,
    resetQueryErrors,
    getErrorSummary,
  };
}
