import { useQuery } from '@tanstack/react-query';

import { fetchActiveServices, fetchAllServices } from '@/features/services/services/supabaseServiceService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export function useActiveServicesQuery() {
  return useQuery({
    queryKey: ['services', 'active'],
    enabled: isSupabaseConfigured,
    queryFn: fetchActiveServices,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllServicesQuery() {
  return useQuery({
    queryKey: ['services', 'all'],
    enabled: isSupabaseConfigured,
    queryFn: fetchAllServices,
    staleTime: 5 * 60 * 1000,
  });
}
