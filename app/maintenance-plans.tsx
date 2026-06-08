import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { fetchCustomerMaintenancePlans } from '@/features/operations/services/supabaseOperationsService';
import type { MaintenancePlan } from '@/features/operations/types';
import { isMaintenanceDueSoon } from '@/features/operations/utils/maintenancePlanDisplay';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

function MaintenancePlanCard({
  nowMs,
  plan,
  vehicleLabel,
}: {
  nowMs: number;
  plan: MaintenancePlan;
  vehicleLabel: string;
}) {
  const isDueSoon = isMaintenanceDueSoon(plan.nextDueAt, nowMs);

  return (
    <AppCard tone={isDueSoon ? 'elevated' : 'default'}>
      <View className="items-end gap-2">
        <View className="flex-row-reverse items-center gap-2">
          {isDueSoon ? (
            <View className="rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-950/40">
              <Text className="font-sans text-xs font-semibold text-amber-700 dark:text-amber-300">
                قريباً
              </Text>
            </View>
          ) : null}
          <Text className="font-sans text-xs text-muted dark:text-dark-muted">{vehicleLabel}</Text>
        </View>
        <Text className="font-sans text-right text-lg font-bold text-ink dark:text-dark-ink">
          {plan.title}
        </Text>
        <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
          {formatDueSummary(plan)}
        </Text>
        {plan.intervalKm || plan.intervalMonths ? (
          <Text className="font-sans text-right text-xs text-muted dark:text-dark-muted">
            {plan.intervalKm ? `كل ${plan.intervalKm.toLocaleString('ar-SA')} كم` : ''}
            {plan.intervalKm && plan.intervalMonths ? ' · ' : ''}
            {plan.intervalMonths ? `كل ${plan.intervalMonths} شهر` : ''}
          </Text>
        ) : null}
        {plan.notes ? (
          <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
            {plan.notes}
          </Text>
        ) : null}
        <View className="mt-2 w-full gap-2">
          <AppButton onPress={() => router.push('/book-branch')} variant="secondary">
            حجز موعد
          </AppButton>
          <AppButton
            onPress={() =>
              router.push({
                pathname: '/edit-maintenance-plan',
                params: { id: plan.id },
              })
            }
            variant="secondary"
          >
            تعديل الخطة
          </AppButton>
        </View>
      </View>
    </AppCard>
  );
}

function MaintenancePlansScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: vehicles = [] } = useCustomerVehiclesQuery(user?.id);

  const vehicleById = useMemo(
    () => new Map(vehicles.map((vehicle) => [vehicle.id, vehicle])),
    [vehicles],
  );

  const {
    data: plans = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ['maintenance-plans', user?.id],
    enabled: Boolean(user?.id) && isSupabaseConfigured,
    queryFn: () => fetchCustomerMaintenancePlans(user!.id),
    staleTime: 60_000,
  });

  const activePlans = plans.filter((plan) => plan.isActive);
  // Snapshot once per mount for «due soon» badges (not live clock).
  const nowMs = useMemo(() => Date.now(), []); // eslint-disable-line react-hooks/purity

  return (
    <ScreenContainer>
      <View className="gap-5">
        <CommandHeader
          eyebrow="الصيانة الوقائية"
          subtitle="تابع مواعيد الخدمة الدورية لكل مركبة."
          title="خطط الصيانة"
        >
          <AppButton onPress={() => router.push('/add-maintenance-plan')}>
            + خطة جديدة
          </AppButton>
        </CommandHeader>

        {!isSupabaseConfigured ? (
          <EmptyState
            message="أضف إعدادات Supabase لتفعيل خطط الصيانة."
            title="الخدمة غير متاحة"
          />
        ) : isLoading ? (
          <LoadingSpinner label="جارٍ تحميل الخطط..." />
        ) : error ? (
          <EmptyState
            message={error instanceof Error ? error.message : 'تعذّر تحميل خطط الصيانة.'}
            title="خطأ في التحميل"
          />
        ) : activePlans.length === 0 ? (
          <EmptyState
            message="ستظهر هنا خطط الصيانة الدورية عند إضافتها من مركز الخدمة."
            title="لا توجد خطط"
          />
        ) : (
          <View className="gap-3">
            {activePlans.map((plan) => {
              const vehicle = vehicleById.get(plan.vehicleId);
              const vehicleLabel = vehicle
                ? `${vehicle.make} ${vehicle.model}`
                : 'مركبة غير معروفة';
              return (
                <MaintenancePlanCard
                  key={plan.id}
                  nowMs={nowMs}
                  plan={plan}
                  vehicleLabel={vehicleLabel}
                />
              );
            })}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

export default function MaintenancePlansRoute() {
  return (
    <RoleGate role="customer">
      <MaintenancePlansScreen />
    </RoleGate>
  );
}
