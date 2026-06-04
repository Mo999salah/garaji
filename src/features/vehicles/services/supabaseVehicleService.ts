import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { DbVehicleRow } from '@/shared/types/database';
import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';
import type { Vehicle } from '@/features/vehicles/types';

const vehicleSelect =
  'id, owner_id, make, model, year, plate_number, color, mileage, created_at, updated_at';

export class VehicleServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VehicleServiceError';
  }
}

function getClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new VehicleServiceError('Service is not configured.');
  }

  return supabase;
}

function mapVehicle(row: DbVehicleRow): Vehicle {
  return {
    id: row.id,
    ownerId: row.owner_id,
    make: row.make,
    model: row.model,
    year: row.year,
    plateNumber: row.plate_number,
    color: row.color ?? undefined,
    mileage: row.mileage ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}


export async function fetchCustomerVehicles(ownerId: string): Promise<Vehicle[]> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicles')
    .select(vehicleSelect)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new VehicleServiceError('تعذّر تحميل المركبات.');
  }

  return ((data ?? []) as DbVehicleRow[]).map(mapVehicle);
}

export async function fetchAllVehicles(): Promise<Vehicle[]> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicles')
    .select(vehicleSelect)
    .order('created_at', { ascending: false });

  if (error) {
    throw new VehicleServiceError('تعذّر تحميل المركبات.');
  }

  return ((data ?? []) as DbVehicleRow[]).map(mapVehicle);
}

export async function insertVehicle(ownerId: string, values: VehicleFormValues): Promise<Vehicle> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicles')
    .insert({
      owner_id: ownerId,
      make: values.make.trim(),
      model: values.model.trim(),
      year: values.year,
      plate_number: values.plateNumber.trim(),
      color: values.color?.trim() || null,
      mileage: values.mileage ?? null,
    })
    .select(vehicleSelect)
    .single<DbVehicleRow>();

  if (error || !data) {
    throw new VehicleServiceError('تعذّر إضافة المركبة.');
  }

  return mapVehicle(data);
}

export async function updateVehicleRecord(
  vehicleId: string,
  ownerId: string,
  values: VehicleFormValues,
): Promise<Vehicle | null> {
  const client = getClient();
  const { data, error } = await client
    .from('vehicles')
    .update({
      make: values.make.trim(),
      model: values.model.trim(),
      year: values.year,
      plate_number: values.plateNumber.trim(),
      color: values.color?.trim() || null,
      mileage: values.mileage ?? null,
    })
    .eq('id', vehicleId)
    .eq('owner_id', ownerId)
    .select(vehicleSelect)
    .maybeSingle<DbVehicleRow>();

  if (error) {
    throw new VehicleServiceError('تعذّر تحديث بيانات المركبة.');
  }

  return data ? mapVehicle(data) : null;
}

export async function deleteVehicleRecord(vehicleId: string, ownerId: string): Promise<void> {
  const client = getClient();
  const { error } = await client
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)
    .eq('owner_id', ownerId);

  if (error) {
    throw new VehicleServiceError('تعذّر حذف المركبة.');
  }
}
