import { useQuery } from '@tanstack/react-query';

import { fetchTechnicians } from '@/features/operations/services/supabaseOperationsService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export function useAdminTechniciansQuery() {
  return useQuery({
    queryKey: ['technicians', 'admin'],
    enabled: isSupabaseConfigured,
    queryFn: () => fetchTechnicians(false),
    staleTime: 60_000,
  });
}

export function useActiveTechniciansQuery() {
  return useTechniciansQuery(true);
}

export function useTechniciansQuery(activeOnly: boolean) {
  return useQuery({
    queryKey: ['technicians', activeOnly ? 'active' : 'all'],
    enabled: isSupabaseConfigured,
    queryFn: () => fetchTechnicians(activeOnly),
    staleTime: 60_000,
  });
}
