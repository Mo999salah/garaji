import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type {
  DbServiceRequestRow,
  DbServiceRequestEventRow,
  DbServiceRequestStatus,
  DbServiceRequestType,
} from '@/shared/types/database';
import type { BranchBookingValues, MobileBookingValues } from '@/features/requests/schemas/requestSchema';
import type {
  ServiceRequest,
  ServiceRequestEvent,
  ServiceRequestStatus,
  ServiceRequestType,
} from '@/features/requests/types';

export class RequestServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestServiceError';
  }
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new RequestServiceError('Service is not configured.');
  }

  return supabase;
}

function mapEvent(row: DbServiceRequestEventRow): ServiceRequestEvent {
  return {
    id: row.id,
    requestId: row.request_id,
    status: row.status as ServiceRequestStatus,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

function mapRequest(
  row: DbServiceRequestRow & { service_request_events?: DbServiceRequestEventRow[] },
): ServiceRequest {
  return {
    id: row.id,
    customerId: row.customer_id,
    vehicleId: row.vehicle_id,
    serviceId: row.service_id,
    requestType: row.request_type as ServiceRequestType,
    branchId: row.branch_id ?? undefined,
    locationCity: row.location_city ?? undefined,
    locationAddress: row.location_address ?? undefined,
    locationLat: row.location_lat ?? undefined,
    locationLng: row.location_lng ?? undefined,
    scheduledAt: row.scheduled_at,
    status: row.status as ServiceRequestStatus,
    assignedStaffId: row.assigned_staff_id ?? undefined,
    notes: row.notes ?? undefined,
    estimatedPrice: row.estimated_price ?? undefined,
    finalPrice: row.final_price ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    events: row.service_request_events?.map(mapEvent),
  };
}

const requestSelect = `
  id, customer_id, vehicle_id, service_id, request_type,
  branch_id, location_city, location_address, location_lat, location_lng,
  scheduled_at, status, assigned_staff_id, notes,
  estimated_price, final_price, created_at, updated_at,
  service_request_events (id, request_id, status, note, created_at)
`;


export async function fetchCustomerRequests(customerId: string): Promise<ServiceRequest[]> {
  const client = getClient();
  const { data, error } = await client
    .from('service_requests')
    .select(requestSelect)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new RequestServiceError('تعذّر تحميل الطلبات.');
  }

  return ((data ?? []) as unknown as (DbServiceRequestRow & {
    service_request_events: DbServiceRequestEventRow[];
  })[]).map(mapRequest);
}

export async function fetchAllRequests(): Promise<ServiceRequest[]> {
  const client = getClient();
  const { data, error } = await client
    .from('service_requests')
    .select(requestSelect)
    .order('created_at', { ascending: false });

  if (error) {
    throw new RequestServiceError('تعذّر تحميل الطلبات.');
  }

  return ((data ?? []) as unknown as (DbServiceRequestRow & {
    service_request_events: DbServiceRequestEventRow[];
  })[]).map(mapRequest);
}

export async function fetchRequestById(requestId: string): Promise<ServiceRequest | null> {
  const client = getClient();
  const { data, error } = await client
    .from('service_requests')
    .select(requestSelect)
    .eq('id', requestId)
    .maybeSingle();

  if (error) {
    throw new RequestServiceError('تعذّر تحميل الطلب.');
  }

  if (!data) return null;

  return mapRequest(
    data as unknown as DbServiceRequestRow & {
      service_request_events: DbServiceRequestEventRow[];
    },
  );
}

export async function createBranchRequest(values: BranchBookingValues): Promise<ServiceRequest> {
  const client = getClient();
  const { data, error } = await (client.rpc as Function)('create_service_request', {
    p_vehicle_id: values.vehicleId,
    p_service_id: values.serviceId,
    p_request_type: 'branch_appointment' as DbServiceRequestType,
    p_branch_id: values.branchId,
    p_location_city: null,
    p_location_address: null,
    p_scheduled_at: values.scheduledAt,
    p_notes: values.notes ?? null,
  });

  if (error) {
    throw new RequestServiceError(error.message ?? 'تعذّر إنشاء الطلب.');
  }

  const requestId = data as string;
  const created = await fetchRequestById(requestId);
  if (!created) throw new RequestServiceError('تعذّر تحميل الطلب بعد إنشائه.');

  return created;
}

export async function createMobileRequest(values: MobileBookingValues): Promise<ServiceRequest> {
  const client = getClient();
  const { data, error } = await (client.rpc as Function)('create_service_request', {
    p_vehicle_id: values.vehicleId,
    p_service_id: values.serviceId,
    p_request_type: 'mobile_service' as DbServiceRequestType,
    p_branch_id: null,
    p_location_city: values.locationCity,
    p_location_address: values.locationAddress,
    p_scheduled_at: values.scheduledAt,
    p_notes: values.notes ?? null,
  });

  if (error) {
    throw new RequestServiceError(error.message ?? 'تعذّر إنشاء الطلب.');
  }

  const requestId = data as string;
  const created = await fetchRequestById(requestId);
  if (!created) throw new RequestServiceError('تعذّر تحميل الطلب بعد إنشائه.');

  return created;
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: ServiceRequestStatus,
  note?: string,
): Promise<ServiceRequest | null> {
  const client = getClient();
  const { error } = await (client.rpc as Function)('update_service_request_status', {
    p_request_id: requestId,
    p_next_status: newStatus as DbServiceRequestStatus,
    p_note: note ?? null,
  });

  if (error) {
    throw new RequestServiceError(error.message ?? 'تعذّر تحديث حالة الطلب.');
  }

  return fetchRequestById(requestId);
}
