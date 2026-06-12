import { isSupabaseConfigured, supabase } from '@/shared/lib/supabase';
import type { DbVehicleRow } from '@/shared/types/database';
import type { VehicleFormValues } from '@/features/vehicles/schemas/vehicleSchema';
import type { Vehicle } from '@/features/vehicles/types';

const VEHICLE_DOCUMENTS_BUCKET = 'vehicle-documents';

const vehicleSelect =
 'id, owner_id, make, model, year, plate_number, color, mileage, document_url, created_at, updated_at';

interface VehicleDocumentUpload {
 uri: string;
 fileName?: string | null;
 mimeType?: string | null;
}

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
 documentUrl: row.document_url ?? undefined,
 createdAt: row.created_at,
 updatedAt: row.updated_at,
 };
}

function getFileExtension(fileName?: string | null, mimeType?: string | null): string {
 const extensionFromName = fileName?.includes('.')
 ? fileName.split('.').pop()?.toLowerCase()
 : undefined;

 if (extensionFromName) {
 return extensionFromName;
 }

 if (mimeType?.includes('png')) return 'png';
 if (mimeType?.includes('webp')) return 'webp';
 if (mimeType?.includes('heic')) return 'heic';
 if (mimeType?.includes('heif')) return 'heif';

 return 'jpg';
}

function sanitizeFileName(value: string): string {
 return value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
}

export async function uploadVehicleDocument({
 fileName,
 mimeType,
 uri,
}: VehicleDocumentUpload): Promise<string> {
 const client = getClient();
 const { data: userData, error: userError } = await client.auth.getUser();

 if (userError || !userData.user) {
 throw new VehicleServiceError('يجب تسجيل الدخول قبل رفع الصورة.');
 }

 const response = await fetch(uri);

 if (!response.ok) {
 throw new VehicleServiceError('تعذّر قراءة الصورة المختارة.');
 }

 const blob = await response.blob();
 const extension = getFileExtension(fileName, mimeType);
 const hasExtension = Boolean(fileName?.toLowerCase().endsWith(`.${extension}`));
 const safeFileName = sanitizeFileName(
 fileName
 ? `${fileName}${hasExtension ? '' : `.${extension}`}`
 : `vehicle-document-${Date.now()}.${extension}`,
 );
 const storagePath = `${userData.user.id}/${Date.now()}-${safeFileName}`;

 const { error: uploadError } = await client.storage
 .from(VEHICLE_DOCUMENTS_BUCKET)
 .upload(storagePath, blob, {
 cacheControl: '3600',
 contentType: mimeType || blob.type || `image/${extension}`,
 upsert: false,
 });

 if (uploadError) {
 throw new VehicleServiceError(uploadError.message || 'تعذّر رفع الصورة.');
 }

 const { data } = client.storage
 .from(VEHICLE_DOCUMENTS_BUCKET)
 .getPublicUrl(storagePath);

 if (!data.publicUrl) {
 throw new VehicleServiceError('تعذّر إنشاء رابط الصورة.');
 }

 return data.publicUrl;
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
 document_url: values.documentUrl?.trim() || null,
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
 document_url: values.documentUrl?.trim() || null,
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
