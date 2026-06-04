import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { DbBranchRow } from '@/shared/types/database';
import type { BranchFormValues } from '@/features/branches/schemas/branchSchema';
import type { Branch } from '@/features/branches/types';

const branchSelect =
  'id, name, city, address, lat, lng, phone, working_hours, is_active, created_at, updated_at';

export class BranchServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BranchServiceError';
  }
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new BranchServiceError('Service is not configured.');
  }

  return supabase;
}

function mapBranch(row: DbBranchRow): Branch {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    address: row.address,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    phone: row.phone ?? undefined,
    workingHours: row.working_hours ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


export async function fetchActiveBranches(): Promise<Branch[]> {
  const client = getClient();
  const { data, error } = await client
    .from('branches')
    .select(branchSelect)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new BranchServiceError('تعذّر تحميل الفروع.');
  }

  return ((data ?? []) as DbBranchRow[]).map(mapBranch);
}

export async function fetchAllBranches(): Promise<Branch[]> {
  const client = getClient();
  const { data, error } = await client
    .from('branches')
    .select(branchSelect)
    .order('name', { ascending: true });

  if (error) {
    throw new BranchServiceError('تعذّر تحميل الفروع.');
  }

  return ((data ?? []) as DbBranchRow[]).map(mapBranch);
}

export async function insertBranch(values: BranchFormValues): Promise<Branch> {
  const client = getClient();
  const { data, error } = await client
    .from('branches')
    .insert({
      name: values.name.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      phone: values.phone?.trim() || null,
      working_hours: values.workingHours?.trim() || null,
      is_active: values.isActive,
    })
    .select(branchSelect)
    .single<DbBranchRow>();

  if (error || !data) {
    throw new BranchServiceError('تعذّر إضافة الفرع.');
  }

  return mapBranch(data);
}

export async function updateBranchRecord(
  branchId: string,
  values: BranchFormValues,
): Promise<Branch | null> {
  const client = getClient();
  const { data, error } = await client
    .from('branches')
    .update({
      name: values.name.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      phone: values.phone?.trim() || null,
      working_hours: values.workingHours?.trim() || null,
      is_active: values.isActive,
    })
    .eq('id', branchId)
    .select(branchSelect)
    .maybeSingle<DbBranchRow>();

  if (error) {
    throw new BranchServiceError('تعذّر تحديث بيانات الفرع.');
  }

  return data ? mapBranch(data) : null;
}
