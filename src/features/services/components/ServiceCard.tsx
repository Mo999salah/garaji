import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { Service, ServiceType } from '@/features/services/types';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';

import { AppText as Text } from '@/shared/components/AppText';
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
    'rounded-lg border p-5 shadow-sm shadow-brand-700/10 bg-card dark:bg-dark-card dark:shadow-none',
    selected
      ? 'border-brand-500 bg-brand-50/60 dark:border-dark-brand-500 dark:bg-dark-brand-50/60'
      : 'border-line dark:border-dark-line',
  ].join(' ');

  return (
    <AnimatedPressable
      accessibilityLabel={service.name}
      accessibilityRole="button"
      className={containerCls}
      onPress={onPress}
    >
      <View className="flex-row-reverse items-start justify-between gap-4">
        <View className="flex-1 items-end">
          <View className="mb-3 h-10 w-10 items-center justify-center rounded-lg bg-action-50 dark:bg-emerald-950/20">
            <Feather name="tool" size={18} color="#059669" />
          </View>
          <Text className="font-sans text-base font-bold text-ink text-right dark:text-dark-ink">{service.name}</Text>
          {service.description ? (
            <Text className="font-sans mt-1 text-sm text-muted text-right dark:text-dark-muted" numberOfLines={2}>
              {service.description}
            </Text>
          ) : null}
          <View className="mt-3 rounded-lg border border-line bg-surface-soft px-3 py-1 dark:border-dark-line dark:bg-dark-surface">
            <Text className="font-sans text-xs font-semibold text-muted text-right dark:text-dark-muted">
            {SERVICE_TYPE_LABELS[service.serviceType]}
            </Text>
          </View>
          {service.durationMinutes ? (
            <Text className="font-sans mt-2 text-xs text-muted text-right dark:text-dark-muted">{service.durationMinutes} دقيقة</Text>
          ) : null}
        </View>
        <View className="items-end gap-2">
          {service.estimatedPrice !== undefined ? (
            <Text className="font-sans text-base font-bold text-action-700 dark:text-emerald-300">
              {service.estimatedPrice.toLocaleString('ar-SA')} ر.س
            </Text>
          ) : null}
          {selected && (
            <View className="h-6 w-6 items-center justify-center rounded-lg bg-brand-500 shadow-sm shadow-brand-700/10 dark:bg-dark-brand-500">
              <Text className="font-sans text-xs font-bold text-white dark:text-brand-700">✓</Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}
