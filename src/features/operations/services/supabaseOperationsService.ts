import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type {
  DbMaintenancePlanRow,
  DbRequestInspectionRow,
  DbRequestInvoiceItemRow,
  DbRequestMessageRow,
  DbRequestReviewRow,
  DbServiceReminderRow,
  DbTechnicianRow,
} from '@/shared/types/database';
import type {
  AvailabilitySlot,
  InspectionChecklistItem,
  InvoiceItem,
  MaintenancePlan,
  MaintenancePlanValues,
  RequestInspection,
  RequestMessage,
  RequestOperations,
  RequestReview,
  ServiceReminder,
  Technician,
} from '@/features/operations/types';

export class OperationsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperationsServiceError';
  }
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new OperationsServiceError('Service is not configured.');
  }

  return supabase;
}

function mapTechnician(row: DbTechnicianRow): Technician {
  return {
    id: row.id,
    profileId: row.profile_id ?? undefined,
    fullName: row.full_name,
    phone: row.phone ?? undefined,
    specialties: row.specialties ?? [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: DbRequestMessageRow): RequestMessage {
  return {
    id: row.id,
    requestId: row.request_id,
    senderId: row.sender_id,
    body: row.body,
    attachmentUrl: row.attachment_url ?? undefined,
    createdAt: row.created_at,
  };
}

function normalizeChecklist(value: unknown): InspectionChecklistItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const record = item as Record<string, unknown>;
      const label = typeof record.label === 'string' ? record.label : '';
      const status = record.status;

      if (!label) return null;
      if (status !== 'ok' && status !== 'attention' && status !== 'fixed') return null;

      return { label, status };
    })
    .filter(Boolean) as InspectionChecklistItem[];
}

function mapInspection(row: DbRequestInspectionRow): RequestInspection {
  return {
    id: row.id,
    requestId: row.request_id,
    checklist: normalizeChecklist(row.checklist),
    diagnosis: row.diagnosis ?? undefined,
    beforeImageUrl: row.before_image_url ?? undefined,
    afterImageUrl: row.after_image_url ?? undefined,
    customerVisible: row.customer_visible,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInvoiceItem(row: DbRequestInvoiceItemRow): InvoiceItem {
  return {
    id: row.id,
    requestId: row.request_id,
    description: row.description,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    createdAt: row.created_at,
  };
}

function mapReview(row: DbRequestReviewRow): RequestReview {
  return {
    id: row.id,
    requestId: row.request_id,
    customerId: row.customer_id,
    rating: row.rating,
    comment: row.comment ?? undefined,
    createdAt: row.created_at,
  };
}

function mapReminder(row: DbServiceReminderRow): ServiceReminder {
  return {
    id: row.id,
    requestId: row.request_id ?? undefined,
    profileId: row.profile_id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    remindAt: row.remind_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMaintenancePlan(row: DbMaintenancePlanRow): MaintenancePlan {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    customerId: row.customer_id,
    title: row.title,
    intervalKm: row.interval_km ?? undefined,
    intervalMonths: row.interval_months ?? undefined,
    lastServiceMileage: row.last_service_mileage ?? undefined,
    lastServiceAt: row.last_service_at ?? undefined,
    nextDueMileage: row.next_due_mileage ?? undefined,
    nextDueAt: row.next_due_at ?? undefined,
    notes: row.notes ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchTechnicians(activeOnly = false): Promise<Technician[]> {
  const client = getClient();
  let query = client.from('technicians').select('*').order('full_name', { ascending: true });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new OperationsServiceError('تعذّر تحميل الفنيين.');
  }

  return ((data ?? []) as DbTechnicianRow[]).map(mapTechnician);
}

export async function createTechnician(values: {
  fullName: string;
  phone?: string;
  specialties?: string[];
}): Promise<Technician> {
  const client = getClient();
  const { data, error } = await client
    .from('technicians')
    .insert({
      full_name: values.fullName.trim(),
      phone: values.phone?.trim() || null,
      specialties: values.specialties ?? [],
      is_active: true,
    })
    .select('*')
    .single<DbTechnicianRow>();

  if (error || !data) {
    throw new OperationsServiceError('تعذّر إضافة الفني.');
  }

  return mapTechnician(data);
}

export async function fetchTechnicianById(technicianId: string): Promise<Technician | null> {
  const client = getClient();
  const { data, error } = await client
    .from('technicians')
    .select('*')
    .eq('id', technicianId)
    .maybeSingle<DbTechnicianRow>();

  if (error) {
    throw new OperationsServiceError('تعذّر تحميل بيانات الفني.');
  }

  return data ? mapTechnician(data) : null;
}

export async function updateTechnician(
  technicianId: string,
  values: {
    fullName: string;
    phone?: string;
    specialties?: string[];
    isActive?: boolean;
  },
): Promise<Technician> {
  const client = getClient();
  const { data, error } = await client
    .from('technicians')
    .update({
      full_name: values.fullName.trim(),
      phone: values.phone?.trim() || null,
      specialties: values.specialties ?? [],
      is_active: values.isActive ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', technicianId)
    .select('*')
    .single<DbTechnicianRow>();

  if (error || !data) {
    throw new OperationsServiceError('تعذّر تحديث بيانات الفني.');
  }

  return mapTechnician(data);
}

export async function assignTechnician(requestId: string, technicianId: string): Promise<void> {
  const client = getClient();
  const { error } = await (client.rpc as Function)('assign_service_request_staff', {
    p_request_id: requestId,
    p_staff_id: technicianId,
  });

  if (error) {
    throw new OperationsServiceError(error.message ?? 'تعذّر تعيين الفني.');
  }
}

export async function fetchAvailableBranchSlots(
  branchId: string,
  serviceId: string,
  date: string,
): Promise<AvailabilitySlot[]> {
  const client = getClient();
  const { data, error } = await (client.rpc as Function)('get_available_branch_slots', {
    p_branch_id: branchId,
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) {
    throw new OperationsServiceError('تعذّر تحميل المواعيد المتاحة.');
  }

  return ((data ?? []) as { slot_time: string; remaining_capacity: number }[]).map((slot) => ({
    slotTime: slot.slot_time,
    remainingCapacity: slot.remaining_capacity,
  }));
}

export async function fetchRequestOperations(requestId: string): Promise<RequestOperations> {
  const client = getClient();
  const [messages, inspection, invoiceItems, review, reminders] = await Promise.all([
    client
      .from('service_request_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true }),
    client
      .from('service_request_inspections')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle<DbRequestInspectionRow>(),
    client
      .from('service_request_invoice_items')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true }),
    client
      .from('service_request_reviews')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle<DbRequestReviewRow>(),
    client
      .from('service_reminders')
      .select('*')
      .eq('request_id', requestId)
      .order('remind_at', { ascending: true }),
  ]);

  if (messages.error || invoiceItems.error || inspection.error || review.error || reminders.error) {
    throw new OperationsServiceError('تعذّر تحميل تفاصيل التشغيل.');
  }

  return {
    messages: ((messages.data ?? []) as DbRequestMessageRow[]).map(mapMessage),
    inspection: inspection.data ? mapInspection(inspection.data) : null,
    invoiceItems: ((invoiceItems.data ?? []) as DbRequestInvoiceItemRow[]).map(mapInvoiceItem),
    review: review.data ? mapReview(review.data) : null,
    reminders: ((reminders.data ?? []) as DbServiceReminderRow[]).map(mapReminder),
  };
}

export async function sendRequestMessage(
  requestId: string,
  body: string,
  attachmentUrl?: string,
): Promise<void> {
  const client = getClient();
  const { error } = await (client.rpc as Function)('send_service_request_message', {
    p_request_id: requestId,
    p_body: body,
    p_attachment_url: attachmentUrl ?? null,
  });

  if (error) {
    throw new OperationsServiceError(error.message ?? 'تعذّر إرسال الرسالة.');
  }
}

export async function saveInspection(values: {
  requestId: string;
  checklist: InspectionChecklistItem[];
  diagnosis?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  customerVisible?: boolean;
}): Promise<void> {
  const client = getClient();
  const { error } = await (client.rpc as Function)('upsert_service_request_inspection', {
    p_request_id: values.requestId,
    p_checklist: values.checklist,
    p_diagnosis: values.diagnosis ?? null,
    p_before_image_url: values.beforeImageUrl ?? null,
    p_after_image_url: values.afterImageUrl ?? null,
    p_customer_visible: values.customerVisible ?? true,
  });

  if (error) {
    throw new OperationsServiceError(error.message ?? 'تعذّر حفظ تقرير الفحص.');
  }
}

export async function addInvoiceItem(values: {
  requestId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}): Promise<void> {
  const client = getClient();
  const { error } = await (client.rpc as Function)('add_service_request_invoice_item', {
    p_request_id: values.requestId,
    p_description: values.description,
    p_quantity: values.quantity,
    p_unit_price: values.unitPrice,
  });

  if (error) {
    throw new OperationsServiceError(error.message ?? 'تعذّر إضافة بند الفاتورة.');
  }
}

export async function createRequestReview(values: {
  requestId: string;
  customerId: string;
  rating: number;
  comment?: string;
}): Promise<void> {
  const client = getClient();
  const { error } = await client.from('service_request_reviews').insert({
    request_id: values.requestId,
    customer_id: values.customerId,
    rating: values.rating,
    comment: values.comment?.trim() || null,
  });

  if (error) {
    throw new OperationsServiceError('تعذّر حفظ التقييم.');
  }
}

export async function scheduleRequestReminder(values: {
  requestId?: string;
  profileId: string;
  kind: ServiceReminder['kind'];
  title: string;
  body: string;
  remindAt: string;
}): Promise<void> {
  const client = getClient();
  const { error } = await (client.rpc as Function)('schedule_service_reminder', {
    p_request_id: values.requestId ?? null,
    p_profile_id: values.profileId,
    p_kind: values.kind,
    p_title: values.title,
    p_body: values.body,
    p_remind_at: values.remindAt,
  });

  if (error) {
    throw new OperationsServiceError(error.message ?? 'تعذّر جدولة التذكير.');
  }
}

export async function fetchCustomerMaintenancePlans(customerId: string): Promise<MaintenancePlan[]> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicle_maintenance_plans')
    .select('*')
    .eq('customer_id', customerId)
    .order('next_due_at', { ascending: true, nullsFirst: false });

  if (error) {
    throw new OperationsServiceError('تعذّر تحميل خطط الصيانة.');
  }

  return ((data ?? []) as DbMaintenancePlanRow[]).map(mapMaintenancePlan);
}

export async function fetchAllMaintenancePlans(): Promise<MaintenancePlan[]> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicle_maintenance_plans')
    .select('*')
    .order('next_due_at', { ascending: true, nullsFirst: false });

  if (error) {
    throw new OperationsServiceError('تعذّر تحميل خطط الصيانة.');
  }

  return ((data ?? []) as DbMaintenancePlanRow[]).map(mapMaintenancePlan);
}

export async function createMaintenancePlan(values: MaintenancePlanValues): Promise<MaintenancePlan> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicle_maintenance_plans')
    .insert({
      vehicle_id: values.vehicleId,
      customer_id: values.customerId,
      title: values.title.trim(),
      interval_km: values.intervalKm ?? null,
      interval_months: values.intervalMonths ?? null,
      last_service_mileage: values.lastServiceMileage ?? null,
      last_service_at: values.lastServiceAt ?? null,
      next_due_mileage: values.nextDueMileage ?? null,
      next_due_at: values.nextDueAt ?? null,
      notes: values.notes?.trim() || null,
      is_active: true,
    })
    .select('*')
    .single<DbMaintenancePlanRow>();

  if (error || !data) {
    throw new OperationsServiceError('تعذّر إنشاء خطة الصيانة.');
  }

  return mapMaintenancePlan(data);
}

export async function fetchMaintenancePlanById(planId: string): Promise<MaintenancePlan | null> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicle_maintenance_plans')
    .select('*')
    .eq('id', planId)
    .maybeSingle<DbMaintenancePlanRow>();

  if (error) {
    throw new OperationsServiceError('تعذّر تحميل خطة الصيانة.');
  }

  return data ? mapMaintenancePlan(data) : null;
}

export async function updateMaintenancePlan(
  planId: string,
  values: {
    title: string;
    intervalKm?: number;
    intervalMonths?: number;
    lastServiceMileage?: number;
    lastServiceAt?: string;
    nextDueMileage?: number;
    nextDueAt?: string;
    notes?: string;
  },
): Promise<MaintenancePlan> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicle_maintenance_plans')
    .update({
      title: values.title.trim(),
      interval_km: values.intervalKm ?? null,
      interval_months: values.intervalMonths ?? null,
      last_service_mileage: values.lastServiceMileage ?? null,
      last_service_at: values.lastServiceAt ?? null,
      next_due_mileage: values.nextDueMileage ?? null,
      next_due_at: values.nextDueAt ?? null,
      notes: values.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId)
    .select('*')
    .single<DbMaintenancePlanRow>();

  if (error || !data) {
    throw new OperationsServiceError('تعذّر تحديث خطة الصيانة.');
  }

  return mapMaintenancePlan(data);
}

export async function deactivateMaintenancePlan(planId: string): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from('vehicle_maintenance_plans')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', planId);

  if (error) {
    throw new OperationsServiceError('تعذّر إيقاف خطة الصيانة.');
  }
}
