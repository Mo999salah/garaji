import { useQuery } from '@tanstack/react-query';

import { fetchActiveBranches, fetchAllBranches } from '@/features/branches/services/supabaseBranchService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export function useActiveBranchesQuery() {
 return useQuery({
 queryKey: ['branches', 'active'],
 enabled: isSupabaseConfigured,
 queryFn: fetchActiveBranches,
 staleTime: 5 * 60 * 1000,
 });
}

export function useAllBranchesQuery() {
 return useQuery({
 queryKey: ['branches', 'all'],
 enabled: isSupabaseConfigured,
 queryFn: fetchAllBranches,
 staleTime: 5 * 60 * 1000,
 });
}
