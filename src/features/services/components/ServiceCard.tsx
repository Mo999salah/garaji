import { Pressable, Text, View } from 'react-native';

import type { Service, ServiceType } from '@/features/services/types';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
  selected?: boolean;
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  branch: 'في الفرع',
  mobile: 'بالموقع',
  both: 'في الفرع أو بالموقع',
};

export function ServiceCard({ onPress, selected, service }: ServiceCardProps) {
  const containerCls = [
    'rounded-lg border p-4 shadow-sm bg-white',
    selected ? 'border-brand-600' : 'border-line',
  ].join(' ');

  return (
    <Pressable
      accessibilityLabel={service.name}
      accessibilityRole="button"
      className={containerCls}
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-ink">{service.name}</Text>
          {service.description ? (
            <Text className="mt-1 text-sm text-muted" numberOfLines={2}>
              {service.description}
            </Text>
          ) : null}
          <Text className="mt-1.5 text-xs text-muted">
            {SERVICE_TYPE_LABELS[service.serviceType]}
          </Text>
          {service.durationMinutes ? (
            <Text className="mt-0.5 text-xs text-muted">⏱ {service.durationMinutes} دقيقة</Text>
          ) : null}
        </View>
        <View className="items-end gap-1">
          {service.estimatedPrice !== undefined ? (
            <Text className="text-base font-bold text-brand-700">
              {service.estimatedPrice.toLocaleString('ar-SA')} ر.س
            </Text>
          ) : null}
          {selected && (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-brand-600">
              <Text className="text-xs text-white">✓</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
