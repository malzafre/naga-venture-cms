// filepath: hooks/useSupabaseSubscription.ts
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { supabase } from '@/lib/supabaseClient';

export interface SupabaseSubscriptionConfig {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  invalidateQueries?: string[][];
  onData?: (payload: any) => void;
}

/**
 * Production-grade hook for managing Supabase real-time subscriptions
 *
 * Features:
 * - Prevents multiple subscription errors
 * - Automatic cleanup on unmount
 * - Unique channel names to avoid conflicts
 * - Comprehensive error handling
 * - TanStack Query integration
 *
 * @param config Subscription configuration
 * @param enabled Whether the subscription should be active
 */
export function useSupabaseSubscription(
  config: SupabaseSubscriptionConfig,
  enabled: boolean = true
) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const {
    table,
    schema = 'public',
    event = '*',
    filter,
    invalidateQueries = [],
    onData,
  } = config;

  const cleanup = useCallback(() => {
    try {
      if (channelRef.current) {
        console.log(
          `🧹 [useSupabaseSubscription] Cleaning up subscription for ${table}`
        );

        // Mark as unsubscribed
        isSubscribedRef.current = false;

        // Unsubscribe from the channel
        channelRef.current.unsubscribe();

        // Remove the channel completely
        supabase.removeChannel(channelRef.current);

        // Clear refs
        channelRef.current = null;
        subscriptionRef.current = null;

        console.log(
          `✅ [useSupabaseSubscription] Successfully cleaned up ${table} subscription`
        );
      }
    } catch (error) {
      console.error(
        `❌ [useSupabaseSubscription] Cleanup error for ${table}:`,
        error
      );
    }
  }, [table]);
  // Keep track of the last subscription attempt time
  const lastSubscriptionAttemptRef = useRef(0);

  const setupSubscription = useCallback(() => {
    // Don't setup if already subscribed or not enabled
    if (isSubscribedRef.current || !enabled) {
      return;
    }

    // Prevent rapid subscription attempts (debounce of 500ms)
    const now = Date.now();
    if (now - lastSubscriptionAttemptRef.current < 500) {
      console.log(
        `🔄 [useSupabaseSubscription] Throttling subscription request for ${table}`
      );
      return;
    }

    // Update last attempt time
    lastSubscriptionAttemptRef.current = now;

    try {
      // Create unique channel name to prevent conflicts
      const channelName = `${table}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      console.log(
        `📡 [useSupabaseSubscription] Setting up subscription for ${table} on channel: ${channelName}`
      );

      // Create the channel
      const channel = supabase.channel(channelName);
      channelRef.current = channel; // Configure the subscription
      const subscription = channel.on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          ...(filter && { filter }),
        },
        (payload: any) => {
          console.log(`📨 [useSupabaseSubscription] ${table} update:`, payload);

          // Call custom data handler if provided
          if (onData) {
            onData(payload);
          }

          // Invalidate specified queries
          invalidateQueries.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });
        }
      );

      subscriptionRef.current = subscription;

      // Subscribe with status callback
      subscription.subscribe((status, error) => {
        if (error) {
          console.error(
            `❌ [useSupabaseSubscription] ${table} subscription error:`,
            error
          );
          isSubscribedRef.current = false;
        } else {
          console.log(
            `📡 [useSupabaseSubscription] ${table} subscription status:`,
            status
          );
          isSubscribedRef.current = status === 'SUBSCRIBED';
        }
      });
    } catch (error) {
      console.error(
        `❌ [useSupabaseSubscription] Failed to setup ${table} subscription:`,
        error
      );
      isSubscribedRef.current = false;
    }
  }, [
    table,
    schema,
    event,
    filter,
    enabled,
    onData,
    invalidateQueries,
    queryClient,
  ]);

  // Create a ref to track the current effect instance to prevent cleanup race conditions
  const effectInstanceRef = useRef(0);

  // Setup subscription when enabled - with optimization to avoid thrashing
  useEffect(() => {
    // Generate unique ID for this effect instance
    const effectId = Date.now();
    effectInstanceRef.current = effectId;

    if (enabled) {
      // Only setup if not already subscribed
      if (!isSubscribedRef.current) {
        setupSubscription();
      }
    } else {
      cleanup();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      // Only run cleanup if this is still the current effect instance
      if (effectInstanceRef.current === effectId) {
        cleanup();
      }
    };
  }, [enabled, setupSubscription, cleanup]);

  // Return subscription status and manual control functions
  return {
    isSubscribed: isSubscribedRef.current,
    cleanup,
    reconnect: () => {
      cleanup();
      setTimeout(setupSubscription, 100); // Small delay to ensure cleanup completes
    },
  };
}

/**
 * Convenience hook for business table subscriptions with built-in memoization
 * to avoid creating multiple subscriptions
 */
export function useBusinessSubscription(enabled: boolean = true) {
  // Use useMemo to ensure the config object doesn't change on re-renders
  // This prevents unnecessary re-subscriptions
  const config = useMemo(
    () => ({
      table: 'businesses',
      invalidateQueries: [['businesses'], ['businesses', 'list']],
    }),
    []
  );

  return useSupabaseSubscription(config, enabled);
}

/**
 * Convenience hook for profiles table subscriptions with built-in memoization
 */
export function useProfilesSubscription(enabled: boolean = true) {
  // Use useMemo to ensure the config object doesn't change on re-renders
  const config = useMemo(
    () => ({
      table: 'profiles',
      invalidateQueries: [['profiles'], ['users']],
    }),
    []
  );

  return useSupabaseSubscription(config, enabled);
}
