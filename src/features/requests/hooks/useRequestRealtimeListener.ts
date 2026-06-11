import { useEffect, useId } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';

interface UseRequestRealtimeListenerOptions {
  customerId?: string;
  requestId?: string;
  enabled?: boolean;
}

function buildRealtimeFilter({
  customerId,
  requestId,
}: Pick<UseRequestRealtimeListenerOptions, 'customerId' | 'requestId'>): string | undefined {
  if (requestId) {
    return `id=eq.${requestId}`;
  }

  if (customerId) {
    return `customer_id=eq.${customerId}`;
  }

  return undefined;
}

export function useRequestRealtimeListener({
  customerId,
  requestId,
  enabled = true,
}: UseRequestRealtimeListenerOptions = {}) {
  const queryClient = useQueryClient();
  const hookId = useId();

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !supabase) {
      return;
    }

    const client = supabase;
    let isMounted = true;
    let channel: ReturnType<typeof client.channel> | null = null;

    const subscribeToRequestChanges = async () => {
      const { data, error } = await client.auth.getSession();

      if (!isMounted || error || !data.session) {
        return;
      }

      const filter = buildRealtimeFilter({ customerId, requestId });
      const channelName = [
        'service-requests',
        'realtime',
        requestId ? `request-${requestId}` : null,
        !requestId && customerId ? `customer-${customerId}` : null,
        !requestId && !customerId ? 'all' : null,
        hookId, // Add unique hook ID to prevent channel collisions
      ]
        .filter(Boolean)
        .join(':');

      const invalidateRequestQueries = () => {
        void queryClient.invalidateQueries({ queryKey: ['requests'] });
      };

      const postgresChangesConfig = {
        schema: 'public',
        table: 'service_requests',
        ...(filter ? { filter } : {}),
      } as const;

      channel = client
        .channel(channelName)
        .on(
          'postgres_changes',
          { ...postgresChangesConfig, event: 'INSERT' },
          invalidateRequestQueries,
        )
        .on(
          'postgres_changes',
          { ...postgresChangesConfig, event: 'UPDATE' },
          invalidateRequestQueries,
        );

      channel.subscribe();
    };

    void subscribeToRequestChanges();

    return () => {
      isMounted = false;

      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [customerId, enabled, queryClient, requestId]);
}
