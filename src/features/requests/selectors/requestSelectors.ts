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

/** Statuses where the owning customer may cancel via cancel_service_request RPC. */
export function canCustomerCancel(status: ServiceRequestStatus): boolean {
  return canTransitionTo(status, 'cancelled') && (status === 'pending' || status === 'confirmed');
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

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

const ANALYTICS_PERIOD_DAYS: Record<Exclude<AnalyticsPeriod, 'all'>, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isWithinLocalDay(iso: string, reference = new Date()): boolean {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return startOfLocalDay(parsed).getTime() === startOfLocalDay(reference).getTime();
}

export function selectCompletedToday(
  requests: ServiceRequest[],
  reference = new Date(),
): ServiceRequest[] {
  return requests.filter(
    (request) =>
      request.status === 'completed' && isWithinLocalDay(request.updatedAt, reference),
  );
}

export function filterRequestsByPeriod(
  requests: ServiceRequest[],
  period: AnalyticsPeriod,
  reference = new Date(),
): ServiceRequest[] {
  if (period === 'all') {
    return requests;
  }

  const cutoff = startOfLocalDay(reference);
  cutoff.setDate(cutoff.getDate() - ANALYTICS_PERIOD_DAYS[period]);

  return requests.filter((request) => {
    const createdAt = new Date(request.createdAt);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= cutoff;
  });
}
