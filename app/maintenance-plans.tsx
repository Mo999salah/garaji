import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchCustomerMaintenancePlans } from '@/features/operations/services/supabaseOperationsService';
import type { MaintenancePlan } from '@/features/operations/types';
import { isMaintenanceDueSoon } from '@/features/operations/utils/maintenancePlanDisplay';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { AppColors } from '@/shared/lib/colors';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

function formatDate(iso?: string): string {
 if (!iso) return '—';
 return new Date(iso).toLocaleDateString('ar-SA', {
 day: 'numeric',
 month: 'long',
 year: 'numeric'});
}

function formatDueSummary(plan: MaintenancePlan): string {
 const parts: string[] = [];
 if (plan.nextDueMileage != null) {
 parts.push(`بعد ${plan.nextDueMileage.toLocaleString('ar-SA')} كم`);
 }
 if (plan.nextDueAt) {
 parts.push(`أو ${formatDate(plan.nextDueAt)}`);
 }
 return parts.length ? parts.join(' · ') : 'لم يُحدد موعد بعد';
}

function UrgentPlanCard({ plan }: { plan: MaintenancePlan }) {
 return (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft border-r-4 border-warning p-4 flex-col gap-4 relative overflow-hidden">
 <View className="absolute -top-10 -right-10 w-32 h-32 bg-warning/5 rounded-full" />

 <View className="flex-row-reverse justify-between items-start z-10">
 <StatusBadge label="الصيانة القادمة" variant="warning" icon="warning" />
 <AnimatedPressable
            onPress={() => router.push({ pathname: '/edit-maintenance-plan', params: { id: plan.id } })}
            accessibilityLabel="تعديل الخطة"
            accessibilityRole="button"
          >
            <MaterialIcons name="edit" size={20} color={AppColors.outline} />
          </AnimatedPressable>
 </View>

 <View className="z-10 items-end">
 <Text className="text-title-md text-on-surface font-bold mb-1">{plan.title}</Text>
 <Text className="text-body-md text-outline text-right">{formatDueSummary(plan)}</Text>
 </View>

 <AppButton
          onPress={() => router.push('/book-branch')}
          label="حجز موعد الآن"
          accessibilityLabel="حجز موعد صيانة الآن"
          className="w-full z-10"
        />
 </View>
 );
}

function UpcomingPlanRow({ plan }: { plan: MaintenancePlan }) {
 const iconName = plan.title.includes('إطار') ? 'tire-repair' : plan.title.includes('فرامل') ? 'build' : 'settings';

 return (
 <View className="flex-row-reverse items-center gap-3 py-3 border-b border-surface-container last:border-0">
 <View className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
 <MaterialIcons name={iconName as any} size={20} color={AppColors.onSurfaceVariant} />
 </View>
 <View className="flex-1 items-end">
 <Text className="text-body-md text-on-surface font-bold">{plan.title}</Text>
 <Text className="font-label-sm text-label-sm text-outline mt-1">{formatDueSummary(plan)}</Text>
 </View>
 <AnimatedPressable
          onPress={() => router.push({ pathname: '/edit-maintenance-plan', params: { id: plan.id } })}
          accessibilityLabel="تعديل الخطة"
          accessibilityRole="button"
        >
          <MaterialIcons name="chevron-left" size={24} color={AppColors.outline} />
        </AnimatedPressable>
 </View>
 );
}

function HistoryPlanRow({ plan }: { plan: MaintenancePlan }) {
 return (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 flex-row-reverse items-center gap-4 mb-3">
 <View className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center shrink-0">
 <MaterialIcons name="check-circle" size={24} color={AppColors.success} />
 </View>
 <View className="flex-1 items-end">
 <Text className="text-body-md text-on-surface font-bold">{plan.title}</Text>
 <Text className="font-label-sm text-label-sm text-outline mt-1">
 آخر صيانة: {formatDate(plan.lastServiceAt ?? undefined)}
 </Text>
 </View>
 </View>
 );
}

function MaintenancePlansScreen() {
 const user = useAuthStore((s) => s.user);
 const { data: vehicles = [] } = useCustomerVehiclesQuery(user?.id);
 
 const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // Auto-select first vehicle if none selected
  useEffect(() => {
    if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0]!.id);
    }
  }, [vehicles, selectedVehicleId]);

 const {
 data: plans = [],
 error,
 isLoading} = useQuery({
 queryKey: ['maintenance-plans', user?.id],
 enabled: Boolean(user?.id) && isSupabaseConfigured,
 queryFn: () => fetchCustomerMaintenancePlans(user!.id),
 staleTime: 60_000});

  const activePlans = plans.filter((plan) => plan.isActive);
  const vehiclePlans = activePlans.filter((plan) => selectedVehicleId ? plan.vehicleId === selectedVehicleId : true);
  const [nowMs] = useState(() => Date.now());

  // Split plans into Urgent, Upcoming, and History based on dates and status
  const urgentPlans = vehiclePlans.filter(p => isMaintenanceDueSoon(p.nextDueAt, nowMs));
  const otherPlans = vehiclePlans.filter(p => !isMaintenanceDueSoon(p.nextDueAt, nowMs));
 
  const historyPlans = vehiclePlans.filter(p => p.lastServiceAt);
 const upcomingPlans = otherPlans;

 return (
  <View className="flex-1 bg-background pb-24">
      <AppHeader
        title="خطط الصيانة"
        showBack
        onBack={() => router.back()}
        trailing={
          <AnimatedPressable
            onPress={() => router.push('/add-maintenance-plan')}
            accessibilityLabel="إضافة خطة صيانة"
            accessibilityRole="button"
            className="w-10 h-10 flex items-center justify-center rounded-full"
          >
            <MaterialIcons name="add" size={24} color={AppColors.primary} />
          </AnimatedPressable>
        }
      />

  <ScrollView className="flex-1 pt-stack-md" showsVerticalScrollIndicator={false}>
 {!isSupabaseConfigured ? (
 <View className="px-margin-mobile">
 <EmptyState message="أضف إعدادات Supabase لتفعيل خطط الصيانة." title="الخدمة غير متاحة" />
 </View>
 ) : isLoading ? (
 <LoadingSpinner label="جارٍ تحميل الخطط..." />
 ) : error ? (
 <View className="px-margin-mobile">
 <EmptyState message={error instanceof Error ? error.message : 'تعذّر تحميل خطط الصيانة.'} title="خطأ في التحميل" />
 </View>
 ) : (
 <>
 {/* Vehicle Selector */}
 {vehicles.length > 0 && (
 <ScrollView 
 horizontal 
 showsHorizontalScrollIndicator={false} 
 className="mb-stack-lg"
 contentContainerClassName="px-margin-mobile gap-stack-sm flex-row-reverse"
 >
  {vehicles.map(v => (
  <AnimatedPressable
            key={v.id}
            onPress={() => setSelectedVehicleId(v.id)}
            accessibilityLabel={`${v.make} ${v.model}`}
            accessibilityState={{ selected: selectedVehicleId === v.id }}
            accessibilityRole="button"
            className={`px-6 py-3 rounded-full shadow-sm flex-shrink-0 ${
              selectedVehicleId === v.id
                ? 'bg-primary'
                : 'bg-surface-container'
            }`}
          >
            <Text className={`font-label-sm text-label-sm font-bold ${
              selectedVehicleId === v.id ? 'text-on-primary' : 'text-on-surface-variant'
            }`}>
              {v.make} {v.model}
            </Text>
          </AnimatedPressable>
  ))}
 </ScrollView>
 )}

 {vehiclePlans.length === 0 ? (
 <View className="px-margin-mobile">
 <EmptyState message="لا توجد خطط صيانة لهذه المركبة." title="لا توجد خطط" />
 </View>
 ) : (
 <View className="px-margin-mobile flex-col gap-stack-lg pb-10">
 {/* Urgent Plans */}
 {urgentPlans.length > 0 && (
 <View className="gap-3">
  {urgentPlans.map(plan => (
  <UrgentPlanCard key={plan.id} plan={plan} />
  ))}
 </View>
 )}

 {/* History Section */}
 {historyPlans.length > 0 && (
 <View className="flex-col gap-stack-md">
  <Text className="text-title-lg font-bold text-on-surface text-right">سجل الصيانة</Text>
 <View>
 {historyPlans.map(plan => (
 <HistoryPlanRow key={`history-${plan.id}`} plan={plan} />
 ))}
 </View>
 </View>
 )}

 {/* Upcoming List Section */}
 {upcomingPlans.length > 0 && (
 <View className="flex-col gap-stack-md">
  <Text className="text-title-lg font-bold text-on-surface text-right">المواعيد المتوقعة</Text>
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft px-4 py-2">
 {upcomingPlans.map(plan => (
 <UpcomingPlanRow key={plan.id} plan={plan} />
 ))}
 </View>
 </View>
 )}
 </View>
 )}
 </>
 )}
 </ScrollView>
 </View>
 );
}

export default function MaintenancePlansRoute() {
 return (
 <RoleGate role="customer">
 <MaintenancePlansScreen />
 </RoleGate>
 );
}
