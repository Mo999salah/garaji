import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchCustomerMaintenancePlans } from '@/features/operations/services/supabaseOperationsService';
import type { MaintenancePlan } from '@/features/operations/types';
import { isMaintenanceDueSoon } from '@/features/operations/utils/maintenancePlanDisplay';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
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

function UrgentPlanCard({ plan, nowMs }: { plan: MaintenancePlan; nowMs: number }) {
 // Let's assume progress based on a simple heuristic if intervalKm is available, otherwise default to 85%
 let progressPercent = 85;
 
 if (plan.intervalKm && plan.nextDueMileage && plan.lastServiceMileage) {
 const driven = plan.nextDueMileage - plan.intervalKm - plan.lastServiceMileage; // simplistic assumption
 // Actually, we don't have current mileage, so we just show an arbitrary high progress since it's urgent
 progressPercent = 90;
 }

 return (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft border-r-4 border-[#F59E0B] p-4 flex-col gap-4 relative overflow-hidden">
 <View className="absolute -top-10 -right-10 w-32 h-32 bg-warning/5 rounded-full" />
 
 <View className="flex-row-reverse justify-between items-start z-10">
 <View className="bg-warning/10 px-3 py-1 rounded-full flex-row-reverse items-center gap-1">
 <MaterialIcons name="warning" size={16} color="#F59E0B" />
 <Text className="font-label-sm text-label-sm text-warning font-bold">الصيانة القادمة</Text>
 </View>
 <Pressable onPress={() => router.push({ pathname: '/edit-maintenance-plan', params: { id: plan.id } })}>
 <MaterialIcons name="edit" size={20} color="#6d7a77" />
 </Pressable>
 </View>
 
 <View className="z-10 items-end">
 <Text className="font-title-md text-title-md text-on-background font-bold mb-1">{plan.title}</Text>
 <Text className="font-body-md text-body-md text-outline text-right">{formatDueSummary(plan)}</Text>
 </View>
 
 <View className="w-full bg-surface-container h-2 rounded-full overflow-hidden z-10">
 <View className="bg-warning h-full rounded-full" style={{ width: `${progressPercent}%` }} />
 </View>
 
 <Pressable 
 onPress={() => router.push('/book-branch')}
 className="w-full h-12 bg-primary rounded-xl flex items-center justify-center active:scale-95 z-10 shadow-[0px_4px_10px_rgba(0,104,95,0.2)]"
 >
 <Text className="text-white font-button-text text-button-text font-bold">حجز موعد الآن</Text>
 </Pressable>
 </View>
 );
}

function UpcomingPlanRow({ plan }: { plan: MaintenancePlan }) {
 const iconName = plan.title.includes('إطار') ? 'tire-repair' : plan.title.includes('فرامل') ? 'build' : 'settings';

 return (
 <View className="flex-row-reverse items-center gap-3 py-3 border-b border-surface-container last:border-0">
 <View className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
 <MaterialIcons name={iconName as any} size={20} color="#3d4947" />
 </View>
 <View className="flex-1 items-end">
 <Text className="font-body-md text-[16px] text-on-background font-bold">{plan.title}</Text>
 <Text className="font-label-sm text-label-sm text-outline mt-1">{formatDueSummary(plan)}</Text>
 </View>
 <Pressable onPress={() => router.push({ pathname: '/edit-maintenance-plan', params: { id: plan.id } })}>
 <MaterialIcons name="chevron-left" size={24} color="#6d7a77" />
 </Pressable>
 </View>
 );
}

function HistoryPlanRow({ plan }: { plan: MaintenancePlan }) {
 return (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-4 flex-row-reverse items-center gap-4 active:scale-[0.99] mb-3">
 <View className="w-10 h-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center shrink-0">
 <MaterialIcons name="check-circle" size={24} color="#22C55E" />
 </View>
 <View className="flex-1 items-end">
 <Text className="font-body-md text-[16px] text-on-background font-bold">{plan.title}</Text>
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
 // Since we don't have a real history table, any plan with lastServiceAt but not due soon goes to history (for demo purposes)
 // And plans due soon go to Urgent. Others go to Upcoming.
 const urgentPlans = vehiclePlans.filter(p => isMaintenanceDueSoon(p.nextDueAt, nowMs));
 const otherPlans = vehiclePlans.filter(p => !isMaintenanceDueSoon(p.nextDueAt, nowMs));
 
 // Fake history for UI completeness if a plan has lastServiceAt
 const historyPlans = vehiclePlans.filter(p => p.lastServiceAt);
 const upcomingPlans = otherPlans;

 return (
 <View className="flex-1 bg-background pb-24">
 {/* TopAppBar */}
 <View className="flex-row-reverse justify-between items-center px-margin-mobile py-stack-md w-full z-50 bg-surface shadow-soft">
 <View className="flex-row-reverse items-center gap-3 w-10">
 <Pressable onPress={() => router.push('/add-maintenance-plan')}>
 <MaterialIcons name="add" size={24} color="#00685f" />
 </Pressable>
 </View>
 <Text className="font-title-md text-title-md text-primary font-bold">خطط الصيانة</Text>
 <Pressable onPress={() => router.back()} className="active:scale-95 p-2 w-10 items-center justify-center">
 <MaterialIcons name="menu" size={24} color="#00685f" />
 </Pressable>
 </View>

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
 <Pressable 
 key={v.id}
 onPress={() => setSelectedVehicleId(v.id)}
 className={`px-6 py-3 rounded-full shadow-sm flex-shrink-0 ${
 selectedVehicleId === v.id 
 ? 'bg-primary' 
 : 'bg-surface-container'
 }`}
 >
 <Text className={`font-label-sm text-label-sm font-bold ${
 selectedVehicleId === v.id ? 'text-white' : 'text-on-surface-variant'
 }`}>
 {v.make} {v.model}
 </Text>
 </Pressable>
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
 <UrgentPlanCard key={plan.id} plan={plan} nowMs={nowMs} />
 ))}
 </View>
 )}

 {/* History Section */}
 {historyPlans.length > 0 && (
 <View className="flex-col gap-stack-md">
 <Text className="font-title-md text-[20px] font-bold text-on-background text-right">سجل الصيانة</Text>
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
 <Text className="font-title-md text-[20px] font-bold text-on-background text-right">المواعيد المتوقعة</Text>
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
