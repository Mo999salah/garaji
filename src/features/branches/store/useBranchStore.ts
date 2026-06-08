import create from 'zustand';

import {
  fetchActiveBranches,
  fetchAllBranches,
  insertBranch,
  updateBranchRecord,
} from '@/features/branches/services/supabaseBranchService';
import type { BranchFormValues } from '@/features/branches/schemas/branchSchema';
import type { Branch } from '@/features/branches/types';
import { invalidateBranchQueries } from '@/shared/lib/invalidateQueries';

interface BranchState {
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadActiveBranches: () => Promise<void>;
  loadAllBranches: () => Promise<void>;
  addBranch: (values: BranchFormValues) => Promise<void>;
  editBranch: (branchId: string, values: BranchFormValues) => Promise<void>;
  reset: () => void;
}

const STALE_MS = 5 * 60 * 1000;

export const useBranchStore = create<BranchState>((set, get) => ({
  branches: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  loadActiveBranches: async () => {
    const { lastFetchedAt } = get();
    if (lastFetchedAt && Date.now() - lastFetchedAt < STALE_MS) return;

    set({ isLoading: true, error: null });
    try {
      const branches = await fetchActiveBranches();
      set({ branches });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  loadAllBranches: async () => {
    const { lastFetchedAt } = get();
    if (lastFetchedAt && Date.now() - lastFetchedAt < STALE_MS) return;

    set({ isLoading: true, error: null });
    try {
      const branches = await fetchAllBranches();
      set({ branches });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  addBranch: async (values) => {
    set({ isLoading: true, error: null });
    try {
      const newBranch = await insertBranch(values);
      set((s) => ({ branches: [...s.branches, newBranch] }));
      await invalidateBranchQueries();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  editBranch: async (branchId, values) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateBranchRecord(branchId, values);
      if (updated) {
        set((s) => ({
          branches: s.branches.map((b) => (b.id === branchId ? updated : b)),
        }));
        await invalidateBranchQueries();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ branches: [], isLoading: false, error: null, lastFetchedAt: null }),
}));
