import create from 'zustand';

import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';
import {
 deleteVehicleRecord,
 fetchCustomerVehicles,
 insertVehicle,
 updateVehicleRecord,
} from '@/features/vehicles/services/supabaseVehicleService';
import type { Vehicle } from '@/features/vehicles/types';
import { invalidateVehicleQueries } from '@/shared/lib/invalidateQueries';

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

export const useVehicleStore = create<VehicleState>((set) => ({
 vehicles: [],
 isLoading: false,
 errorMessage: null,

 loadVehicles: async (ownerId) => {
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
 const vehicle = await insertVehicle(ownerId, values);
 set((state) => ({ vehicles: [vehicle, ...state.vehicles] }));
 await invalidateVehicleQueries(ownerId);
 return vehicle;
 },

 updateVehicle: async (vehicleId, ownerId, values) => {
 const updated = await updateVehicleRecord(vehicleId, ownerId, values);

 if (!updated) {
 return null;
 }

 set((state) => ({
 vehicles: state.vehicles.map((v) => (v.id === vehicleId ? updated : v)),
 }));

 await invalidateVehicleQueries(ownerId);
 return updated;
 },

 deleteVehicle: async (vehicleId, ownerId) => {
 await deleteVehicleRecord(vehicleId, ownerId);

 set((state) => ({
 vehicles: state.vehicles.filter((v) => !(v.id === vehicleId && v.ownerId === ownerId)),
 }));

 await invalidateVehicleQueries(ownerId);
 },

 reset: () => {
 set({
 vehicles: [],
 isLoading: false,
 errorMessage: null,
 });
 },
}));
