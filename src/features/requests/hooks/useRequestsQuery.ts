import { useQuery } from '@tanstack/react-query';

import {
  fetchAllRequests,
  fetchCustomerRequests,
  fetchRequestById,
} from '@/features/requests/services/supabaseRequestService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export function useCustomerRequestsQuery(customerId?: string) {
  return useQuery({
    queryKey: ['requests', 'customer', customerId],
    enabled: Boolean(customerId) && isSupabaseConfigured,
    queryFn: () => fetchCustomerRequests(customerId as string),
  });
}

export function useAllRequestsQuery() {
  return useQuery({
    queryKey: ['requests', 'all'],
    enabled: isSupabaseConfigured,
    queryFn: fetchAllRequests,
  });
}

export function useRequestByIdQuery(requestId?: string) {
  return useQuery({
    queryKey: ['requests', 'detail', requestId],
    enabled: Boolean(requestId) && isSupabaseConfigured,
    queryFn: () => fetchRequestById(requestId as string),
  });
}
