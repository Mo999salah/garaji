import { Pressable, Text, View } from 'react-native';

import { RequestStatusBadge } from '@/features/requests/components/RequestStatusBadge';
import type { ServiceRequest, ServiceRequestType } from '@/features/requests/types';

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
    <Pressable
      accessibilityLabel={`طلب ${REQUEST_TYPE_LABELS[request.requestType]}`}
      accessibilityRole="button"
      className="rounded-lg border border-line bg-white p-4 shadow-sm active:opacity-80"
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          {serviceName ? (
            <Text className="text-base font-bold text-ink">{serviceName}</Text>
          ) : null}
          <Text className="mt-0.5 text-xs text-muted">
            {REQUEST_TYPE_LABELS[request.requestType]}
          </Text>
          {vehicleName ? (
            <Text className="mt-1 text-sm text-muted">🚗 {vehicleName}</Text>
          ) : null}
          <Text className="mt-1 text-sm text-muted">📅 {formatDate(request.scheduledAt)}</Text>
          {request.branchId && request.requestType === 'branch_appointment' ? (
            <Text className="mt-0.5 text-xs text-muted">📍 فرع محدد</Text>
          ) : null}
          {request.locationAddress ? (
            <Text className="mt-0.5 text-xs text-muted">📍 {request.locationAddress}</Text>
          ) : null}
        </View>
        <View className="items-end gap-2">
          <RequestStatusBadge status={request.status} />
          {request.estimatedPrice !== undefined ? (
            <Text className="text-base font-bold text-brand-700">
              {(request.finalPrice ?? request.estimatedPrice).toLocaleString('ar-SA')} ر.س
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
