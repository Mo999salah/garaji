import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ScrollView, View } from 'react-native';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAllBranchesQuery } from '@/features/branches/hooks/useBranchesQuery';
import { RequestOperationsPanel } from '@/features/operations/components/RequestOperationsPanel';
import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import { RequestTimeline } from '@/features/requests/components/RequestTimeline';
import { useRequestByIdQuery } from '@/features/requests/hooks/useRequestsQuery';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import {
  getNextStatuses,
  isTerminal,
  STATUS_LABELS,
} from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import type { ServiceRequestStatus } from '@/features/requests/types';
import { useAllServicesQuery } from '@/features/services/hooks/useServicesQuery';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { SectionHeader } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

import { AppText as Text } from '@/shared/components/AppText';

function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const requestId = typeof id === 'string' ? id : undefined;
  const user = useAuthStore((s) => s.user);
  const isMerchant = user?.role === 'merchant';
  const queryClient = useQueryClient();
  const changeRequestStatus = useRequestStore((s) => s.changeRequestStatus);

  const { data: request, isLoading: isRequestLoading } = useRequestByIdQuery(requestId);
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useCustomerVehiclesQuery(
    request?.customerId,
  );
  const { data: services = [], isLoading: isServicesLoading } = useAllServicesQuery();
  const { data: branches = [], isLoading: isBranchesLoading } = useAllBranchesQuery();

  useRequestRealtimeListener({ requestId });

  const statusMutation = useMutation({
    mutationFn: (newStatus: ServiceRequestStatus) => {
      if (!requestId) {
        throw new Error('Missing request id.');
      }
      return changeRequestStatus(requestId, newStatus);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });

  if (isRequestLoading && !request) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingSpinner label="جارٍ تحميل تفاصيل الطلب..." />
      </ScreenContainer>
    );
  }

  if (!request) {
    return (
      <ScreenContainer>
        <EmptyState message="تعذّر إيجاد هذا الطلب." title="الطلب غير موجود" />
        <View className="mt-4">
          <AppButton onPress={() => router.back()}>رجوع</AppButton>
        </View>
      </ScreenContainer>
    );
  }

  const vehicle = vehicles.find((item) => item.id === request.vehicleId);
  const service = services.find((item) => item.id === request.serviceId);
  const branch = branches.find((item) => item.id === request.branchId);

  const vehicleName = vehicle
    ? `${vehicle.make} ${vehicle.model} ${vehicle.year}`
    : isVehiclesLoading
      ? 'جارٍ تحميل بيانات السيارة...'
      : undefined;
  const serviceName =
    service?.name ?? (isServicesLoading ? 'جارٍ تحميل بيانات الخدمة...' : undefined);
  const branchName =
    branch?.name ?? (isBranchesLoading ? 'جارٍ تحميل بيانات الفرع...' : undefined);

  const typeLabel =
    request.requestType === 'branch_appointment' ? 'حجز فرع' : 'خدمة بالموقع';
  const scheduledDate = new Date(request.scheduledAt).toLocaleString('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const priceLabel =
    request.finalPrice !== undefined || request.estimatedPrice !== undefined
      ? `${request.finalPrice ?? request.estimatedPrice} ر.س`
      : 'غير محدد';

  const nextStatuses = getNextStatuses(request.status);

  const handleStatusChange = (newStatus: ServiceRequestStatus) => {
    const label = STATUS_LABELS[newStatus];
    Alert.alert('تأكيد تغيير الحالة', `هل تريد تغيير حالة الطلب إلى "${label}"؟`, [
      { style: 'cancel', text: 'إلغاء' },
      {
        style: 'default',
        text: 'تأكيد',
        onPress: async () => {
          try {
            await statusMutation.mutateAsync(newStatus);
          } catch {
            Alert.alert('خطأ', 'تعذّر تغيير حالة الطلب. يرجى المحاولة مجدداً.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        <View className="rounded-2xl border border-line bg-card p-5 dark:border-dark-line dark:bg-dark-card">
          <View className="flex-row-reverse items-start justify-between gap-3">
            <View className="flex-1 items-end gap-1">
              <Text className="font-sans text-right text-2xl font-black text-ink dark:text-dark-ink">
                {typeLabel}
              </Text>
              <Text className="font-sans text-right text-xs font-medium text-muted dark:text-dark-muted">
                رقم الطلب {request.id.slice(0, 8)}
              </Text>
            </View>
            <RequestStatusBadge status={request.status} />
          </View>

          <View className="mt-5 flex-row-reverse gap-3">
            <View className="flex-1 rounded-lg border border-line bg-surface-soft p-3 dark:border-dark-line dark:bg-dark-surface">
              <Text className="font-sans text-right text-xs font-bold text-muted dark:text-dark-muted">
                الموعد
              </Text>
              <Text className="font-sans mt-1 text-right text-sm font-bold text-ink dark:text-dark-ink">
                {scheduledDate}
              </Text>
            </View>
            <View className="flex-1 rounded-lg border border-line bg-surface-soft p-3 dark:border-dark-line dark:bg-dark-surface">
              <Text className="font-sans text-right text-xs font-bold text-muted dark:text-dark-muted">
                القيمة
              </Text>
              <Text className="font-sans mt-1 text-right text-sm font-bold text-gold-600 dark:text-dark-gold-500">
                {priceLabel}
              </Text>
            </View>
          </View>
        </View>

        {isMerchant && !isTerminal(request.status) && nextStatuses.length > 0 ? (
          <AppCard tone="elevated">
            <SectionHeader subtitle="اختر الخطوة التالية للطلب." title="الإجراء المطلوب" />
            <View className="mt-4 gap-2">
              {nextStatuses.map((status) => (
                <AppButton
                  key={status}
                  loading={statusMutation.isPending}
                  onPress={() => handleStatusChange(status)}
                  variant={status === 'cancelled' ? 'ghost' : 'primary'}
                >
                  {STATUS_LABELS[status]}
                </AppButton>
              ))}
            </View>
          </AppCard>
        ) : null}

        <AppCard tone="quiet">
          <SectionHeader
            subtitle={
              isMerchant
                ? 'كل البيانات اللازمة للتواصل والتنفيذ.'
                : 'المعلومات الأساسية لتنفيذ الخدمة.'
            }
            title="تفاصيل الطلب"
          />
          <View className="mt-4 gap-3">
            <DetailRow label="موعد الخدمة" value={scheduledDate} />
            {vehicleName ? <DetailRow label="السيارة" value={vehicleName} /> : null}
            {serviceName ? <DetailRow label="الخدمة" value={serviceName} /> : null}
            {request.requestType === 'branch_appointment' && branchName ? (
              <DetailRow label="الفرع" value={branchName} />
            ) : null}
            {request.locationCity ? (
              <DetailRow
                label="الموقع"
                value={`${request.locationCity}${request.locationAddress ? ` — ${request.locationAddress}` : ''}`}
              />
            ) : null}
            {request.notes ? <DetailRow label="ملاحظات" value={request.notes} /> : null}
            {request.estimatedPrice !== undefined ? (
              <DetailRow label="السعر التقديري" value={`${request.estimatedPrice} ر.س`} />
            ) : null}
            {request.finalPrice !== undefined ? (
              <DetailRow label="السعر النهائي" value={`${request.finalPrice} ر.س`} />
            ) : null}
          </View>
        </AppCard>

        {request.events && request.events.length > 0 ? (
          <View className="gap-2">
            <SectionHeader title="سجل الحالات" />
            <RequestTimeline currentStatus={request.status} events={request.events} />
          </View>
        ) : null}

        <RequestOperationsPanel mode={isMerchant ? 'merchant' : 'customer'} request={request} />

        <AppButton onPress={() => router.back()} variant="secondary">
          رجوع
        </AppButton>
      </ScrollView>
    </ScreenContainer>
  );
}

export default function OrderDetailsRoute() {
  return (
    <RoleGate role="authenticated">
      <OrderDetailsScreen />
    </RoleGate>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-2">
      <Text className="font-sans text-sm text-muted dark:text-dark-muted">{label}</Text>
      <Text className="font-sans flex-1 text-right text-sm font-medium text-ink dark:text-dark-ink">
        {value}
      </Text>
    </View>
  );
}
