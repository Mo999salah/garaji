import create from 'zustand';

import {
  cancelCustomerRequest as cancelCustomerRequestRecord,
  createBranchRequest,
  createMobileRequest,
  fetchAllRequests,
  fetchCustomerRequests,
  fetchRequestById,
  updateRequestStatus,
} from '@/features/requests/services/supabaseRequestService';
import type { BranchBookingValues, MobileBookingValues } from '@/features/requests/schemas/requestSchema';
import type { ServiceRequest, ServiceRequestStatus } from '@/features/requests/types';
import { invalidateRequestQueries } from '@/shared/lib/invalidateQueries';

interface RequestState {
  requests: ServiceRequest[];
  selectedRequest: ServiceRequest | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadCustomerRequests: (customerId?: string) => Promise<void>;
  loadAllRequests: () => Promise<void>;
  loadRequestById: (requestId: string) => Promise<void>;
  bookBranchAppointment: (values: BranchBookingValues) => Promise<ServiceRequest>;
  bookMobileService: (values: MobileBookingValues) => Promise<ServiceRequest>;
  changeRequestStatus: (
    requestId: string,
    newStatus: ServiceRequestStatus,
    note?: string,
  ) => Promise<void>;
  cancelCustomerRequest: (requestId: string, note?: string) => Promise<void>;
  reset: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  loadCustomerRequests: async (customerId) => {
    if (!customerId) {
      set({ requests: [], error: null });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const requests = await fetchCustomerRequests(customerId);
      set({ requests });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  loadRequestById: async (requestId) => {
    const existing = get().requests.find((r) => r.id === requestId);
    if (existing) {
      set({ selectedRequest: existing });
    }

    set({ isLoading: true, error: null });
    try {
      const request = await fetchRequestById(requestId);
      set({ selectedRequest: request });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadAllRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await fetchAllRequests();
      set({ requests });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  bookBranchAppointment: async (values) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await createBranchRequest(values);
      set((s) => ({ requests: [newRequest, ...s.requests] }));
      await invalidateRequestQueries();
      return newRequest;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  bookMobileService: async (values) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await createMobileRequest(values);
      set((s) => ({ requests: [newRequest, ...s.requests] }));
      await invalidateRequestQueries();
      return newRequest;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  changeRequestStatus: async (requestId, newStatus, note) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateRequestStatus(requestId, newStatus, note);
      if (updated) {
        set((s) => ({
          requests: s.requests.map((r) => (r.id === requestId ? updated : r)),
          selectedRequest: s.selectedRequest?.id === requestId ? updated : s.selectedRequest,
        }));
        await invalidateRequestQueries();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelCustomerRequest: async (requestId, note) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await cancelCustomerRequestRecord(requestId, note);
      if (updated) {
        set((s) => ({
          requests: s.requests.map((r) => (r.id === requestId ? updated : r)),
          selectedRequest: s.selectedRequest?.id === requestId ? updated : s.selectedRequest,
        }));
        await invalidateRequestQueries();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () =>
    set({ requests: [], selectedRequest: null, isLoading: false, error: null, lastFetchedAt: null }),
}));
