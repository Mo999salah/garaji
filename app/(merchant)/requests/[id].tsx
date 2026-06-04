import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import { RequestTimeline } from '@/features/requests/components/RequestTimeline';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { AppText as Text } from '@/shared/components/AppText';
import {
  getNextStatuses,
  isTerminal,
  STATUS_LABELS,
} from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequestStatus } from '@/features/requests/types';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { SectionHeader } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedRequest, loadRequestById, changeRequestStatus, isLoading } = useRequestStore();

  const vehicles = useVehicleStore((s) => s.vehicles);
  const services = useServiceStore((s) => s.services);
  const branches = useBranchStore((s) => s.branches);

  useEffect(() => {
    if (id) void loadRequestById(id);
  }, [id, loadRequestById]);

  if (isLoading && !selectedRequest) return <LoadingSpinner />;

  if (!selectedRequest) {
    return (
      <ScreenContainer>
        <EmptyState message="تعذّر إيجاد هذا الطلب." title="الطلب غير موجود" />
        <View className="mt-4">
          <AppButton onPress={() => router.back()}>رجوع</AppButton>
        </View>
      </ScreenContainer>
    );
  }

  const r = selectedRequest;

  const vehicle = vehicles.find((v) => v.id === r.vehicleId);
  const service = services.find((sv) => sv.id === r.serviceId);
  const branch = branches.find((b) => b.id === r.branchId);

  const vehicleName = vehicle
    ? `${vehicle.make} ${vehicle.model} ${vehicle.year}`
    : undefined;
  const serviceName = service?.name;
  const branchName = branch?.name;

  const typeLabel = r.requestType === 'branch_appointment' ? 'حجز فرع' : 'خدمة بالموقع';
  const scheduledDate = new Date(r.scheduledAt).toLocaleString('ar-SA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const priceLabel =
    r.finalPrice !== undefined || r.estimatedPrice !== undefined
      ? `${r.finalPrice ?? r.estimatedPrice} ر.س`
      : 'غير محدد';

  const nextStatuses = getNextStatuses(r.status);

  const handleStatusChange = (newStatus: ServiceRequestStatus) => {
    const label = STATUS_LABELS[newStatus];
    Alert.alert(
      'تأكيد تغيير الحالة',
      `هل تريد تغيير حالة الطلب إلى "${label}"؟`,
      [
        { style: 'cancel', text: 'إلغاء' },
        {
          style: 'default',
          text: 'تأكيد',
          onPress: async () => {
            try {
              await changeRequestStatus(r.id, newStatus);
            } catch {
              Alert.alert('خطأ', 'تعذّر تغيير حالة الطلب. يرجى المحاولة مجدداً.');
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        <View className="rounded-lg border border-line bg-card p-5 dark:border-dark-line dark:bg-dark-card">
          <View className="flex-row-reverse items-start justify-between gap-3">
            <View className="flex-1 items-end gap-1">
              <Text className="font-sans text-right text-2xl font-black text-ink dark:text-dark-ink">{typeLabel}</Text>
              <Text className="font-sans text-right text-xs font-medium text-muted dark:text-dark-muted">رقم الطلب {r.id.slice(0, 8)}</Text>
            </View>
            <RequestStatusBadge status={r.status} />
          </View>

          <View className="mt-5 flex-row-reverse gap-3">
            <View className="flex-1 rounded-lg border border-line bg-surface-soft p-3 dark:border-dark-line dark:bg-dark-surface">
              <Text className="font-sans text-right text-xs font-bold text-muted dark:text-dark-muted">الموعد</Text>
              <Text className="font-sans mt-1 text-right text-sm font-bold text-ink dark:text-dark-ink">{scheduledDate}</Text>
            </View>
            <View className="flex-1 rounded-lg border border-line bg-surface-soft p-3 dark:border-dark-line dark:bg-dark-surface">
              <Text className="font-sans text-right text-xs font-bold text-muted dark:text-dark-muted">القيمة</Text>
              <Text className="font-sans mt-1 text-right text-sm font-bold text-gold-600 dark:text-dark-gold-500">
                {priceLabel}
              </Text>
            </View>
          </View>
        </View>

        {!isTerminal(r.status) && nextStatuses.length > 0 ? (
          <AppCard tone="elevated">
            <SectionHeader
              subtitle="اختر الخطوة التالية للطلب."
              title="الإجراء المطلوب"
            />
            <View className="mt-4 gap-2">
              {nextStatuses.map((status) => (
                <AppButton
                  key={status}
                  loading={isLoading}
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
          <SectionHeader subtitle="كل البيانات اللازمة للتواصل والتنفيذ." title="تفاصيل الطلب" />
          <View className="mt-4 gap-3">
            <DetailRow label="موعد الخدمة" value={scheduledDate} />
            {vehicleName ? <DetailRow label="السيارة" value={vehicleName} /> : null}
            {serviceName ? <DetailRow label="الخدمة" value={serviceName} /> : null}
            {branchName ? <DetailRow label="الفرع" value={branchName} /> : null}
            {r.locationCity ? (
              <DetailRow
                label="الموقع"
                value={`${r.locationCity}${r.locationAddress ? ' — ' + r.locationAddress : ''}`}
              />
            ) : null}
            {r.notes ? <DetailRow label="ملاحظات العميل" value={r.notes} /> : null}
            {r.estimatedPrice !== undefined ? (
              <DetailRow label="السعر التقديري" value={`${r.estimatedPrice} ر.س`} />
            ) : null}
            {r.finalPrice !== undefined ? (
              <DetailRow label="السعر النهائي" value={`${r.finalPrice} ر.س`} />
            ) : null}
          </View>
        </AppCard>

        {r.events && r.events.length > 0 ? (
          <View className="gap-2">
            <SectionHeader title="سجل الحالات" />
            <RequestTimeline currentStatus={r.status} events={r.events} />
          </View>
        ) : null}

        <AppButton onPress={() => router.back()} variant="secondary">
          رجوع
        </AppButton>
      </ScrollView>
    </ScreenContainer>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-2">
      <Text className="font-sans text-sm text-muted">{label}</Text>
      <Text className="font-sans flex-1 text-right text-sm font-medium text-ink">{value}</Text>
    </View>
  );
}
