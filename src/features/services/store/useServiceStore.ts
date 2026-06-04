import create from 'zustand';

import {
  fetchActiveServices,
  fetchAllServices,
  insertService,
  updateServiceRecord,
} from '@/features/services/services/supabaseServiceService';
import type { ServiceFormValues } from '@/features/services/schemas/serviceSchema';
import type { Service } from '@/features/services/types';

interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadActiveServices: () => Promise<void>;
  loadAllServices: () => Promise<void>;
  addService: (values: ServiceFormValues) => Promise<void>;
  editService: (serviceId: string, values: ServiceFormValues) => Promise<void>;
  reset: () => void;
}

const STALE_MS = 5 * 60 * 1000;

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  loadActiveServices: async () => {
    const { lastFetchedAt } = get();
    if (lastFetchedAt && Date.now() - lastFetchedAt < STALE_MS) return;

    set({ isLoading: true, error: null });
    try {
      const services = await fetchActiveServices();
      set({ services });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  loadAllServices: async () => {
    const { lastFetchedAt } = get();
    if (lastFetchedAt && Date.now() - lastFetchedAt < STALE_MS) return;

    set({ isLoading: true, error: null });
    try {
      const services = await fetchAllServices();
      set({ services });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  addService: async (values) => {
    set({ isLoading: true, error: null });
    try {
      const newService = await insertService(values);
      set((s) => ({
        services: [...s.services, newService].sort((a, b) => a.sortOrder - b.sortOrder),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  editService: async (serviceId, values) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateServiceRecord(serviceId, values);
      if (updated) {
        set((s) => ({
          services: s.services
            .map((sv) => (sv.id === serviceId ? updated : sv))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ services: [], isLoading: false, error: null, lastFetchedAt: null }),
}));
