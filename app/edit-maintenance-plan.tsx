import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, View } from 'react-native';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
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
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { invalidateMaintenancePlanQueries } from '@/shared/lib/invalidateQueries';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

function EditMaintenancePlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useCustomerVehiclesQuery(user?.id);

  const planQuery = useQuery({
    queryKey: ['maintenance-plans', 'detail', id],
    enabled: Boolean(id) && isSupabaseConfigured,
    queryFn: () => fetchMaintenancePlanById(id!),
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
  const isLoading = planQuery.isLoading || (isVehiclesLoading && vehicles.length === 0);

  if (isLoading) {
    return (
      <ScreenContainer>
        <LoadingSpinner label="جارٍ تحميل الخطة..." />
      </ScreenContainer>
    );
  }

  if (!plan || plan.customerId !== user?.id) {
    return (
      <ScreenContainer>
        <EmptyState message="لم يتم العثور على خطة الصيانة." title="غير موجودة" />
      </ScreenContainer>
    );
  }

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
        subtitle="عدّل التكرار أو الموعد القادم."
        title="تعديل الخطة"
      />
      <MaintenancePlanForm
        initialValues={toMaintenancePlanFormValues(plan)}
        isLoading={updateMutation.isPending}
        lockVehicle
        onSubmit={handleSubmit}
        submitLabel="حفظ التعديلات"
        vehicles={vehicles}
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

export default function EditMaintenancePlanRoute() {
  return (
    <RoleGate role="customer">
      <EditMaintenancePlanScreen />
    </RoleGate>
  );
}
