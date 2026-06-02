import { useQuery } from '@tanstack/react-query';

import { fetchActiveBranches, fetchAllBranches } from '@/features/branches/services/supabaseBranchService';
import { isSupabaseConfigured } from '@/shared/lib/supabase';
import { mockBranches } from '@/features/branches/data/mockBranches';

export function useActiveBranchesQuery() {
  return useQuery({
    queryKey: ['branches', 'active'],
    queryFn: isSupabaseConfigured
      ? fetchActiveBranches
      : () => Promise.resolve(mockBranches.filter((b) => b.isActive)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllBranchesQuery() {
  return useQuery({
    queryKey: ['branches', 'all'],
    queryFn: isSupabaseConfigured ? fetchAllBranches : () => Promise.resolve(mockBranches),
    staleTime: 5 * 60 * 1000,
  });
}
