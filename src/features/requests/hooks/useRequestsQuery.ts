import { useQuery } from '@tanstack/react-query';

import {
  fetchAllRequests,
  fetchCustomerRequests,
  fetchRequestById,
  isRequestBackendReady,
} from '@/features/requests/services/supabaseRequestService';
import { mockRequests } from '@/features/requests/data/mockRequests';

export function useCustomerRequestsQuery(customerId?: string) {
  return useQuery({
    queryKey: ['requests', 'customer', customerId],
    enabled: Boolean(customerId),
    queryFn: isRequestBackendReady()
      ? () => fetchCustomerRequests(customerId as string)
      : () => Promise.resolve(mockRequests),
  });
}

export function useAllRequestsQuery() {
  return useQuery({
    queryKey: ['requests', 'all'],
    queryFn: isRequestBackendReady() ? fetchAllRequests : () => Promise.resolve(mockRequests),
  });
}

export function useRequestByIdQuery(requestId?: string) {
  return useQuery({
    queryKey: ['requests', 'detail', requestId],
    enabled: Boolean(requestId),
    queryFn: isRequestBackendReady()
      ? () => fetchRequestById(requestId as string)
      : () => Promise.resolve(mockRequests.find((r) => r.id === requestId) ?? null),
  });
}
