import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { MaintenancePlanForm } from '@/features/operations/components/MaintenancePlanForm';
import { createMaintenancePlan } from '@/features/operations/services/supabaseOperationsService';
import type { MaintenancePlanFormValues } from '@/features/operations/schemas/maintenancePlanSchema';
import { toMaintenancePlanValues } from '@/features/operations/schemas/maintenancePlanSchema';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { invalidateMaintenancePlanQueries } from '@/shared/lib/invalidateQueries';

function AddMaintenancePlanScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useCustomerVehiclesQuery(user?.id);

  const createMutation = useMutation({
    mutationFn: async (values: MaintenancePlanFormValues) => {
      if (!user?.id) {
        throw new Error('يجب تسجيل الدخول أولاً.');
      }
      return createMaintenancePlan(toMaintenancePlanValues(user.id, values));
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

  if (isVehiclesLoading && vehicles.length === 0) {
    return (
      <ScreenContainer>
        <LoadingSpinner label="جارٍ تحميل مركباتك..." />
      </ScreenContainer>
    );
  }

  if (vehicles.length === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          message="أضف مركبة أولاً لتتمكن من إنشاء خطة صيانة."
          title="لا توجد مركبات"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <CommandHeader
        eyebrow="خطط الصيانة"
        subtitle="حدد التكرار والموعد القادم لتذكيرك بالصيانة الدورية."
        title="خطة صيانة جديدة"
      />
      <MaintenancePlanForm
        isLoading={createMutation.isPending}
        onSubmit={handleSubmit}
        submitLabel="إنشاء الخطة"
        vehicles={vehicles}
      />
    </ScreenContainer>
  );
}

export default function AddMaintenancePlanRoute() {
  return (
    <RoleGate role="customer">
      <AddMaintenancePlanScreen />
    </RoleGate>
  );
}
