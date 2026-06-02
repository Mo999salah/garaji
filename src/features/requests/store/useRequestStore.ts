import create from 'zustand';

import {
  createBranchRequest,
  createMobileRequest,
  fetchAllRequests,
  fetchCustomerRequests,
  fetchRequestById,
  isRequestBackendReady,
  updateRequestStatus,
} from '@/features/requests/services/supabaseRequestService';
import { mockRequests } from '@/features/requests/data/mockRequests';
import type { BranchBookingValues, MobileBookingValues } from '@/features/requests/schemas/requestSchema';
import type { ServiceRequest, ServiceRequestStatus } from '@/features/requests/types';

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
  reset: () => void;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  selectedRequest: null,
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  loadCustomerRequests: async (customerId) => {
    set({ isLoading: true, error: null });
    try {
      if (!isRequestBackendReady() || !customerId) {
        set({ requests: mockRequests });
        return;
      }

      const requests = await fetchCustomerRequests(customerId);
      set({ requests });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message, requests: mockRequests });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  loadRequestById: async (requestId) => {
    // First try to find in existing requests to avoid an extra network call
    const existing = get().requests.find((r) => r.id === requestId);
    if (existing) {
      set({ selectedRequest: existing });
    }

    set({ isLoading: true, error: null });
    try {
      if (!isRequestBackendReady()) {
        const mock = mockRequests.find((r) => r.id === requestId) ?? null;
        set({ selectedRequest: mock });
        return;
      }

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
      if (!isRequestBackendReady()) {
        set({ requests: mockRequests });
        return;
      }

      const requests = await fetchAllRequests();
      set({ requests });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      set({ error: message, requests: mockRequests });
    } finally {
      set({ isLoading: false, lastFetchedAt: Date.now() });
    }
  },

  bookBranchAppointment: async (values) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await createBranchRequest(values);
      set((s) => ({ requests: [newRequest, ...s.requests] }));
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

  reset: () =>
    set({ requests: [], selectedRequest: null, isLoading: false, error: null, lastFetchedAt: null }),
}));
