import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';

export function resetSessionStores() {
 useVehicleStore.getState().reset();
 useRequestStore.getState().reset();
 useServiceStore.getState().reset();
 useBranchStore.getState().reset();
}
