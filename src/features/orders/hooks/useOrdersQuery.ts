import { useQuery } from '@tanstack/react-query';

import {
  fetchCustomerOrders,
  fetchMerchantOrders,
} from '@/features/orders/services/supabaseOrderService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export function useCustomerOrdersQuery(customerId?: string) {
  return useQuery({
    queryKey: ['orders', 'customer', customerId],
    enabled: Boolean(customerId) && isSupabaseConfigured,
    queryFn: () => fetchCustomerOrders(customerId as string),
  });
}

export function useMerchantOrdersQuery(merchantId?: string) {
  return useQuery({
    queryKey: ['orders', 'merchant', merchantId],
    enabled: Boolean(merchantId) && isSupabaseConfigured,
    queryFn: () => fetchMerchantOrders(merchantId as string),
  });
}
