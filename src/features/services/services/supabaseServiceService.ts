import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { DbServiceRow, DbServiceType } from '@/shared/types/database';
import type { ServiceFormValues } from '@/features/services/schemas/serviceSchema';
import type { Service, ServiceType } from '@/features/services/types';

const serviceSelect =
  'id, name, description, service_type, estimated_price, duration_minutes, is_active, sort_order, created_at, updated_at';

export class ServiceItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceItemError';
  }
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new ServiceItemError('Service is not configured.');
  }

  return supabase;
}

function mapService(row: DbServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    serviceType: row.service_type as ServiceType,
    estimatedPrice: row.estimated_price ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


export async function fetchActiveServices(): Promise<Service[]> {
  const client = getClient();
  const { data, error } = await client
    .from('services')
    .select(serviceSelect)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new ServiceItemError('تعذّر تحميل الخدمات.');
  }

  return ((data ?? []) as DbServiceRow[]).map(mapService);
}

export async function fetchAllServices(): Promise<Service[]> {
  const client = getClient();
  const { data, error } = await client
    .from('services')
    .select(serviceSelect)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new ServiceItemError('تعذّر تحميل الخدمات.');
  }

  return ((data ?? []) as DbServiceRow[]).map(mapService);
}

export async function insertService(values: ServiceFormValues): Promise<Service> {
  const client = getClient();
  const { data, error } = await client
    .from('services')
    .insert({
      name: values.name.trim(),
      description: values.description?.trim() || null,
      service_type: values.serviceType as DbServiceType,
      estimated_price: values.estimatedPrice ?? null,
      duration_minutes: values.durationMinutes ?? null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    })
    .select(serviceSelect)
    .single<DbServiceRow>();

  if (error || !data) {
    throw new ServiceItemError('تعذّر إضافة الخدمة.');
  }

  return mapService(data);
}

export async function updateServiceRecord(
  serviceId: string,
  values: ServiceFormValues,
): Promise<Service | null> {
  const client = getClient();
  const { data, error } = await client
    .from('services')
    .update({
      name: values.name.trim(),
      description: values.description?.trim() || null,
      service_type: values.serviceType as DbServiceType,
      estimated_price: values.estimatedPrice ?? null,
      duration_minutes: values.durationMinutes ?? null,
      is_active: values.isActive,
      sort_order: values.sortOrder,
    })
    .eq('id', serviceId)
    .select(serviceSelect)
    .maybeSingle<DbServiceRow>();

  if (error) {
    throw new ServiceItemError('تعذّر تحديث بيانات الخدمة.');
  }

  return data ? mapService(data) : null;
}
