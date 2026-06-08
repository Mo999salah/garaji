import { queryClient } from '@/shared/lib/queryClient';

export function invalidateRequestQueries() {
  return queryClient.invalidateQueries({ queryKey: ['requests'] });
}

export function invalidateVehicleQueries(ownerId?: string) {
  if (ownerId) {
    return queryClient.invalidateQueries({ queryKey: ['vehicles', 'customer', ownerId] });
  }

  return queryClient.invalidateQueries({ queryKey: ['vehicles'] });
}

export function invalidateBranchQueries() {
  return queryClient.invalidateQueries({ queryKey: ['branches'] });
}

export function invalidateServiceQueries() {
  return queryClient.invalidateQueries({ queryKey: ['services'] });
}

export function invalidateTechnicianQueries() {
  return queryClient.invalidateQueries({ queryKey: ['technicians'] });
}

export function invalidateMaintenancePlanQueries() {
  return queryClient.invalidateQueries({ queryKey: ['maintenance-plans'] });
}
