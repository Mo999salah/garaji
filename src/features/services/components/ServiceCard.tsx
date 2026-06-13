import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { Service, ServiceType } from '@/features/services/types';
import { AppColors } from '@/shared/lib/colors';
import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';

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

const SERVICE_TYPE_ICONS: Record<ServiceType, keyof typeof MaterialIcons.glyphMap> = {
  branch: "home-repair-service",
  mobile: "directions-car",
  both: "handyman",
};

export function ServiceCard({ onPress, selected, service }: ServiceCardProps) {
  return (
    <AnimatedPressable
      accessibilityLabel={service.name}
      accessibilityHint="اضغط لاختيار هذه الخدمة"
      accessibilityRole="button"
      className="relative block"
      onPress={onPress}
      scaleValue={0.98}
    >
      <View className={`bg-surface-container-lowest rounded-2xl p-4 shadow-soft border flex-row-reverse items-start gap-4 ${
        selected ? 'border-primary bg-on-primary-container' : 'border-transparent'
      }`}>
        {selected && (
          <View className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-3/4 bg-primary rounded-l-full" />
        )}

        <View className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
          selected ? 'bg-primary-container/20' : 'bg-surface-container-highest'
        }`}>
          <MaterialIcons
            name={SERVICE_TYPE_ICONS[service.serviceType]}
            size={24}
            color={selected ? AppColors.primary : AppColors.onSurfaceVariant}
          />
        </View>

        <View className="flex-1">
          <View className="flex-row-reverse justify-between items-start mb-1">
            <Text className="font-button-text text-button-text font-bold text-on-background text-right">{service.name}</Text>
            {service.estimatedPrice !== undefined ? (
              <View className="flex-row-reverse items-center gap-1 bg-surface-container rounded-full px-2 py-0.5">
                <Text className="font-label-sm text-[11px] text-on-surface-variant font-bold text-primary">{service.estimatedPrice.toLocaleString('ar-SA')} ر.س</Text>
              </View>
            ) : null}
          </View>
          {service.description ? (
            <Text className="font-body-md text-[14px] leading-[24px] text-on-surface-variant mb-2 text-right">{service.description}</Text>
          ) : null}
          <View className="flex-row-reverse items-center gap-4 text-on-surface-variant mt-1">
            <View className="flex-row-reverse items-center gap-1">
              <MaterialIcons name="location-on" size={14} color={AppColors.onSurfaceVariant} />
              <Text className="font-label-sm text-[12px] leading-[18px] text-on-surface-variant">{SERVICE_TYPE_LABELS[service.serviceType]}</Text>
            </View>
            {service.durationMinutes ? (
              <View className="flex-row-reverse items-center gap-1">
                <MaterialIcons name="schedule" size={14} color={AppColors.onSurfaceVariant} />
                <Text className="font-label-sm text-[12px] leading-[18px] text-on-surface-variant">{service.durationMinutes} دقيقة</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
          selected ? 'border-primary bg-primary' : 'border-outline'
        }`}>
          {selected && <MaterialIcons name="check" size={12} color="white" />}
        </View>
      </View>
    </AnimatedPressable>
  );
}
