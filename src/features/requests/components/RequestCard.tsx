import { View } from 'react-native';

import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import type { ServiceRequest, ServiceRequestType } from '@/features/requests/types';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';

import { AppText as Text } from '@/shared/components/AppText';
interface RequestCardProps {
  request: ServiceRequest;
  onPress?: () => void;
  vehicleName?: string;
  serviceName?: string;
}

const REQUEST_TYPE_LABELS: Record<ServiceRequestType, string> = {
  branch_appointment: 'موعد في الفرع',
  mobile_service: 'خدمة بالموقع',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ar-SA', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function RequestCard({ onPress, request, serviceName, vehicleName }: RequestCardProps) {
  return (
    <AnimatedPressable
      accessibilityLabel={`طلب ${REQUEST_TYPE_LABELS[request.requestType]}`}
      accessibilityRole="button"
      className="rounded-md border border-[#E5E5E5] bg-white p-4 dark:border-dark-line dark:bg-dark-card"
      onPress={onPress}
    >
      <View className="gap-3">
        <View className="flex-row-reverse items-start justify-between gap-3">
          <View className="flex-1 items-end">
            <Text className="font-sans text-right text-base font-bold text-[#111111] dark:text-dark-ink">
              {serviceName ?? REQUEST_TYPE_LABELS[request.requestType]}
            </Text>
            <Text className="font-sans mt-0.5 text-right text-xs text-[#8A8A8A] dark:text-dark-muted">
              {REQUEST_TYPE_LABELS[request.requestType]}
            </Text>
          </View>
          <View className="items-start gap-2">
            <RequestStatusBadge status={request.status} />
            {request.estimatedPrice !== undefined ? (
              <Text className="font-sans text-base font-black text-[#111111] dark:text-dark-ink">
                {(request.finalPrice ?? request.estimatedPrice).toLocaleString('ar-SA')} ر.س
              </Text>
            ) : null}
          </View>
        </View>

        <View className="items-end border-t border-[#E5E5E5] pt-3 dark:border-dark-line">
          {vehicleName ? (
            <Text className="font-sans text-right text-sm text-[#8A8A8A] dark:text-dark-muted">المركبة: {vehicleName}</Text>
          ) : null}
          <Text className="font-sans mt-1 text-right text-sm text-[#8A8A8A] dark:text-dark-muted">الموعد: {formatDate(request.scheduledAt)}</Text>
          {request.branchId && request.requestType === 'branch_appointment' ? (
            <Text className="font-sans mt-1 text-right text-xs text-[#8A8A8A] dark:text-dark-muted">فرع محدد</Text>
          ) : null}
          {request.locationAddress ? (
            <Text className="font-sans mt-1 text-right text-xs text-[#8A8A8A] dark:text-dark-muted">{request.locationAddress}</Text>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}
