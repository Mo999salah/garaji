import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import { RequestTimeline } from '@/features/requests/components/RequestTimeline';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedRequest, loadRequestById, isLoading } = useRequestStore();

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

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerClassName="gap-4 p-4">
        {/* الرأس */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-1">
            <Text className="text-xl font-bold text-ink">{typeLabel}</Text>
            <Text className="text-xs text-muted">{r.id.slice(0, 8)}...</Text>
          </View>
          <RequestStatusBadge status={r.status} />
        </View>

        {/* التفاصيل */}
        <AppCard>
          <View className="gap-3 p-4">
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
            {r.notes ? <DetailRow label="ملاحظات" value={r.notes} /> : null}
            {r.estimatedPrice !== undefined ? (
              <DetailRow label="السعر التقديري" value={`${r.estimatedPrice} ر.س`} />
            ) : null}
            {r.finalPrice !== undefined ? (
              <DetailRow label="السعر النهائي" value={`${r.finalPrice} ر.س`} />
            ) : null}
          </View>
        </AppCard>

        {/* الخط الزمني */}
        {r.events && r.events.length > 0 ? (
          <View className="gap-2">
            <Text className="text-sm font-semibold text-ink">سجل الحالات</Text>
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
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="flex-1 text-right text-sm font-medium text-ink">{value}</Text>
    </View>
  );
}
