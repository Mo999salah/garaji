import create from 'zustand';

import { mockVehicles } from '@/features/vehicles/data/mockVehicles';
import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';
import {
  deleteVehicleRecord,
  fetchCustomerVehicles,
  insertVehicle,
  isVehicleBackendReady,
  updateVehicleRecord,
} from '@/features/vehicles/services/supabaseVehicleService';
import type { Vehicle } from '@/features/vehicles/types';
import { createClientId } from '@/shared/lib/id';

interface VehicleState {
  vehicles: Vehicle[];
  isLoading: boolean;
  errorMessage: string | null;
  loadVehicles: (ownerId: string) => Promise<void>;
  addVehicle: (ownerId: string, values: VehicleFormValues) => Promise<Vehicle>;
  updateVehicle: (vehicleId: string, ownerId: string, values: VehicleFormValues) => Promise<Vehicle | null>;
  deleteVehicle: (vehicleId: string, ownerId: string) => Promise<void>;
  reset: () => void;
}

function createMockVehicle(ownerId: string, values: VehicleFormValues): Vehicle {
  const now = new Date().toISOString();
  return {
    id: createClientId('vehicle'),
    ownerId,
    make: values.make.trim(),
    model: values.model.trim(),
    year: values.year,
    plateNumber: values.plateNumber.trim(),
    color: values.color?.trim() || undefined,
    mileage: values.mileage,
    createdAt: now,
    updatedAt: now,
  };
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: isVehicleBackendReady() ? [] : mockVehicles,
  isLoading: false,
  errorMessage: null,

  loadVehicles: async (ownerId) => {
    if (!isVehicleBackendReady()) {
      set({
        vehicles: mockVehicles.filter((v) => v.ownerId === ownerId || v.ownerId === 'customer-demo'),
        errorMessage: null,
      });
      return;
    }

    set({ isLoading: true, errorMessage: null });

    try {
      const vehicles = await fetchCustomerVehicles(ownerId);
      set({ vehicles, isLoading: false, errorMessage: null });
    } catch (error) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تحميل المركبات.',
      });
    }
  },

  addVehicle: async (ownerId, values) => {
    if (isVehicleBackendReady()) {
      const vehicle = await insertVehicle(ownerId, values);
      set((state) => ({ vehicles: [vehicle, ...state.vehicles] }));
      return vehicle;
    }

    const vehicle = createMockVehicle(ownerId, values);
    set((state) => ({ vehicles: [vehicle, ...state.vehicles] }));
    return vehicle;
  },

  updateVehicle: async (vehicleId, ownerId, values) => {
    if (isVehicleBackendReady()) {
      const updated = await updateVehicleRecord(vehicleId, ownerId, values);

      if (!updated) {
        return null;
      }

      set((state) => ({
        vehicles: state.vehicles.map((v) => (v.id === vehicleId ? updated : v)),
      }));

      return updated;
    }

    const existing = get().vehicles.find((v) => v.id === vehicleId && v.ownerId === ownerId);

    if (!existing) {
      return null;
    }

    const updated: Vehicle = {
      ...existing,
      make: values.make.trim(),
      model: values.model.trim(),
      year: values.year,
      plateNumber: values.plateNumber.trim(),
      color: values.color?.trim() || undefined,
      mileage: values.mileage,
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === vehicleId ? updated : v)),
    }));

    return updated;
  },

  deleteVehicle: async (vehicleId, ownerId) => {
    if (isVehicleBackendReady()) {
      await deleteVehicleRecord(vehicleId, ownerId);
    }

    set((state) => ({
      vehicles: state.vehicles.filter((v) => !(v.id === vehicleId && v.ownerId === ownerId)),
    }));
  },

  reset: () => {
    set({
      vehicles: isVehicleBackendReady() ? [] : mockVehicles,
      isLoading: false,
      errorMessage: null,
    });
  },
}));
