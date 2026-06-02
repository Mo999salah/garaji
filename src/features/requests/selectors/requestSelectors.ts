import type { ServiceRequest, ServiceRequestStatus } from '@/features/requests/types';

export const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  in_progress: 'جارٍ التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغى',
};

export const TERMINAL_STATUSES: ServiceRequestStatus[] = ['completed', 'cancelled'];

export const ALLOWED_TRANSITIONS: Record<ServiceRequestStatus, ServiceRequestStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
};

export function isTerminal(status: ServiceRequestStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function canTransitionTo(
  from: ServiceRequestStatus,
  to: ServiceRequestStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getNextStatuses(current: ServiceRequestStatus): ServiceRequestStatus[] {
  return ALLOWED_TRANSITIONS[current] ?? [];
}

export function selectActiveRequests(requests: ServiceRequest[]): ServiceRequest[] {
  return requests.filter((r) => !isTerminal(r.status));
}

export function selectCompletedRequests(requests: ServiceRequest[]): ServiceRequest[] {
  return requests.filter((r) => r.status === 'completed');
}

export function selectCancelledRequests(requests: ServiceRequest[]): ServiceRequest[] {
  return requests.filter((r) => r.status === 'cancelled');
}

export function selectByStatus(
  requests: ServiceRequest[],
  status: ServiceRequestStatus,
): ServiceRequest[] {
  return requests.filter((r) => r.status === status);
}
