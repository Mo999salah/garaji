import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, View } from 'react-native';

import { MaintenancePlanForm } from '@/features/operations/components/MaintenancePlanForm';
import type { MaintenancePlanFormValues } from '@/features/operations/schemas/maintenancePlanSchema';
import {
 toMaintenancePlanFormValues,
 toMaintenancePlanUpdateValues,
} from '@/features/operations/schemas/maintenancePlanSchema';
import {
 deactivateMaintenancePlan,
 fetchMaintenancePlanById,
 updateMaintenancePlan,
} from '@/features/operations/services/supabaseOperationsService';
import { fetchAllVehicles } from '@/features/vehicles/services/supabaseVehicleService';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { invalidateMaintenancePlanQueries } from '@/shared/lib/invalidateQueries';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export default function AdminMaintenancePlanEditScreen() {
 const { id } = useLocalSearchParams<{ id: string }>();

 const planQuery = useQuery({
 queryKey: ['maintenance-plans', 'detail', id],
 enabled: Boolean(id) && isSupabaseConfigured,
 queryFn: () => fetchMaintenancePlanById(id!),
 });

 const vehiclesQuery = useQuery({
 queryKey: ['vehicles', 'admin-all'],
 enabled: isSupabaseConfigured,
 queryFn: fetchAllVehicles,
 staleTime: 5 * 60_000,
 });

 const updateMutation = useMutation({
 mutationFn: (values: MaintenancePlanFormValues) =>
 updateMaintenancePlan(id!, toMaintenancePlanUpdateValues(values)),
 onSuccess: async () => {
 await invalidateMaintenancePlanQueries();
 router.back();
 },
 });

 const deactivateMutation = useMutation({
 mutationFn: () => deactivateMaintenancePlan(id!),
 onSuccess: async () => {
 await invalidateMaintenancePlanQueries();
 router.back();
 },
 });

 const plan = planQuery.data;
 const vehicles = vehiclesQuery.data ?? [];
 const isLoading = planQuery.isLoading || vehiclesQuery.isLoading;

 if (isLoading) {
 return (
 <ScreenContainer>
 <LoadingSpinner label="جارٍ تحميل الخطة..." />
 </ScreenContainer>
 );
 }

 if (!plan) {
 return (
 <ScreenContainer>
 <EmptyState message="لم يتم العثور على خطة الصيانة." title="غير موجودة" />
 <AppButton className="mt-4" onPress={() => router.back()}>
 رجوع
 </AppButton>
 </ScreenContainer>
 );
 }

 const planVehicles = vehicles.filter((vehicle) => vehicle.id === plan.vehicleId);

 const handleSubmit = async (values: MaintenancePlanFormValues) => {
 try {
 await updateMutation.mutateAsync(values);
 } catch {
 Alert.alert('خطأ', 'تعذّر تحديث خطة الصيانة. يرجى المحاولة مجدداً.');
 }
 };

 const handleDeactivate = () => {
 Alert.alert('إيقاف الخطة', 'هل تريد إيقاف خطة الصيانة؟', [
 { text: 'إلغاء', style: 'cancel' },
 {
 text: 'إيقاف',
 style: 'destructive',
 onPress: async () => {
 try {
 await deactivateMutation.mutateAsync();
 } catch {
 Alert.alert('خطأ', 'تعذّر إيقاف الخطة. يرجى المحاولة مجدداً.');
 }
 },
 },
 ]);
 };

 return (
 <ScreenContainer scroll={false}>
 <CommandHeader
 eyebrow="خطط الصيانة"
 subtitle="عدّل خطة الصيانة أو أوقفها."
 title="تعديل الخطة"
 />
 <MaintenancePlanForm
 getVehicleLabel={(vehicle) =>
 `${vehicle.make} ${vehicle.model} · ${vehicle.plateNumber}`
 }
 initialValues={toMaintenancePlanFormValues(plan)}
 isLoading={updateMutation.isPending}
 lockVehicle
 onSubmit={handleSubmit}
 submitLabel="حفظ التعديلات"
 vehicles={planVehicles.length ? planVehicles : vehicles}
 />
 <View className="px-4 pb-4">
 <AppButton
 loading={deactivateMutation.isPending}
 onPress={handleDeactivate}
 variant="secondary"
 >
 إيقاف الخطة
 </AppButton>
 </View>
 </ScreenContainer>
 );
}
