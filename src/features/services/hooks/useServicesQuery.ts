import { useQuery } from '@tanstack/react-query';

import { fetchActiveServices, fetchAllServices } from '@/features/services/services/supabaseServiceService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';
import { mockServices } from '@/features/services/data/mockServices';

export function useActiveServicesQuery() {
  return useQuery({
    queryKey: ['services', 'active'],
    queryFn: isSupabaseConfigured
      ? fetchActiveServices
      : () => Promise.resolve(mockServices.filter((s) => s.isActive)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllServicesQuery() {
  return useQuery({
    queryKey: ['services', 'all'],
    queryFn: isSupabaseConfigured ? fetchAllServices : () => Promise.resolve(mockServices),
    staleTime: 5 * 60 * 1000,
  });
}
