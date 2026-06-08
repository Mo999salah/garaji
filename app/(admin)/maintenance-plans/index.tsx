import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { fetchAllMaintenancePlans } from '@/features/operations/services/supabaseOperationsService';
import type { MaintenancePlan } from '@/features/operations/types';
import { fetchAllVehicles } from '@/features/vehicles/services/supabaseVehicleService';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function AdminMaintenancePlanCard({
  plan,
  vehicleLabel,
}: {
  plan: MaintenancePlan;
  vehicleLabel: string;
}) {
  return (
    <AppCard tone="quiet">
      <View className="items-end gap-2">
        <Text className="font-sans text-xs text-muted dark:text-dark-muted">{vehicleLabel}</Text>
        <Text className="font-sans text-right text-lg font-bold text-ink dark:text-dark-ink">
          {plan.title}
        </Text>
        <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
          العميل: {plan.customerId.slice(0, 8)}
        </Text>
        {plan.nextDueAt ? (
          <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
            الموعد القادم: {formatDate(plan.nextDueAt)}
          </Text>
        ) : null}
        {plan.nextDueMileage != null ? (
          <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
            العداد القادم: {plan.nextDueMileage.toLocaleString('ar-SA')} كم
          </Text>
        ) : null}
        <Text
          className={`font-sans text-right text-xs font-bold ${plan.isActive ? 'text-action-600' : 'text-muted'}`}
        >
          {plan.isActive ? 'نشطة' : 'موقوفة'}
        </Text>
      </View>
    </AppCard>
  );
}

export default function AdminMaintenancePlansScreen() {
  const plansQuery = useQuery({
    queryKey: ['maintenance-plans', 'admin'],
    enabled: isSupabaseConfigured,
    queryFn: fetchAllMaintenancePlans,
    staleTime: 60_000,
  });

  const vehiclesQuery = useQuery({
    queryKey: ['vehicles', 'admin-all'],
    enabled: isSupabaseConfigured,
    queryFn: fetchAllVehicles,
    staleTime: 5 * 60_000,
  });

  const {
    data: plans = [],
    error,
    isLoading: isPlansLoading,
  } = plansQuery;
  const { data: vehicles = [], isLoading: isVehiclesLoading } = vehiclesQuery;
  const refreshControl = useScreenRefresh(plansQuery.refetch, vehiclesQuery.refetch);

  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const isLoading = isPlansLoading || isVehiclesLoading;
  const activePlans = plans.filter((plan) => plan.isActive);

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="الصيانة الوقائية"
          subtitle="عرض وإنشاء خطط الصيانة الدورية لمركبات العملاء."
          title="خطط الصيانة"
        >
          <AppButton onPress={() => router.push('/(admin)/maintenance-plans/new')}>
            + خطة جديدة
          </AppButton>
        </CommandHeader>
      </View>

      {!isSupabaseConfigured ? (
        <View className="px-5">
          <EmptyState
            message="أضف إعدادات Supabase لتفعيل خطط الصيانة."
            title="الخدمة غير متاحة"
          />
        </View>
      ) : isLoading ? (
        <LoadingSpinner label="جارٍ تحميل الخطط..." />
      ) : error ? (
        <View className="px-5">
          <EmptyState
            message={error instanceof Error ? error.message : 'تعذّر تحميل خطط الصيانة.'}
            title="خطأ في التحميل"
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-5 pb-5" refreshControl={refreshControl}>
          {activePlans.length === 0 ? (
            <EmptyState
              message="ستظهر هنا خطط الصيانة عندما ينشئها العملاء."
              title="لا توجد خطط"
            />
          ) : (
            activePlans.map((plan) => {
              const vehicle = vehicleById.get(plan.vehicleId);
              const vehicleLabel = vehicle
                ? `${vehicle.make} ${vehicle.model}`
                : 'مركبة غير معروفة';
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(admin)/maintenance-plans/[id]/edit',
                      params: { id: plan.id },
                    })
                  }
                >
                  <AdminMaintenancePlanCard plan={plan} vehicleLabel={vehicleLabel} />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
