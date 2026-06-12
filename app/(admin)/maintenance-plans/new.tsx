import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { MaintenancePlanForm } from '@/features/operations/components/MaintenancePlanForm';
import type { MaintenancePlanFormValues } from '@/features/operations/schemas/maintenancePlanSchema';
import { toMaintenancePlanValues } from '@/features/operations/schemas/maintenancePlanSchema';
import { createMaintenancePlan } from '@/features/operations/services/supabaseOperationsService';
import { fetchAllVehicles } from '@/features/vehicles/services/supabaseVehicleService';
import type { Vehicle } from '@/features/vehicles/types';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { invalidateMaintenancePlanQueries } from '@/shared/lib/invalidateQueries';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

function adminVehicleLabel(vehicle: Vehicle): string {
 const plate = vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : '';
 return `${vehicle.make} ${vehicle.model}${plate}`;
}

export default function AdminMaintenancePlanNewScreen() {
 const { data: vehicles = [], isLoading } = useQuery({
 queryKey: ['vehicles', 'admin-all'],
 enabled: isSupabaseConfigured,
 queryFn: fetchAllVehicles,
 staleTime: 5 * 60_000,
 });

 const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

 const createMutation = useMutation({
 mutationFn: async (values: MaintenancePlanFormValues) => {
 const vehicle = vehicleById.get(values.vehicleId);
 if (!vehicle) {
 throw new Error('المركبة غير موجودة.');
 }
 return createMaintenancePlan(toMaintenancePlanValues(vehicle.ownerId, values));
 },
 onSuccess: async () => {
 await invalidateMaintenancePlanQueries();
 router.back();
 },
 });

 const handleSubmit = async (values: MaintenancePlanFormValues) => {
 try {
 await createMutation.mutateAsync(values);
 } catch {
 Alert.alert('خطأ', 'تعذّر إنشاء خطة الصيانة. يرجى المحاولة مجدداً.');
 }
 };

 if (!isSupabaseConfigured) {
 return (
 <ScreenContainer>
 <EmptyState
 message="أضف إعدادات Supabase لتفعيل خطط الصيانة."
 title="الخدمة غير متاحة"
 />
 </ScreenContainer>
 );
 }

 if (isLoading) {
 return (
 <ScreenContainer>
 <LoadingSpinner label="جارٍ تحميل المركبات..." />
 </ScreenContainer>
 );
 }

 if (vehicles.length === 0) {
 return (
 <ScreenContainer>
 <EmptyState
 message="لا توجد مركبات مسجلة بعد. أضف مركبات العملاء أولاً."
 title="لا توجد مركبات"
 />
 </ScreenContainer>
 );
 }

 return (
 <ScreenContainer scroll={false}>
 <CommandHeader
 eyebrow="خطط الصيانة"
 subtitle="أنشئ خطة صيانة دورية لمركبة عميل."
 title="خطة صيانة جديدة"
 />
 <MaintenancePlanForm
 getVehicleLabel={adminVehicleLabel}
 isLoading={createMutation.isPending}
 onSubmit={handleSubmit}
 submitLabel="إنشاء الخطة"
 vehicles={vehicles}
 />
 </ScreenContainer>
 );
}
