import type { ReactNode } from 'react';
import { View } from 'react-native';

import { AppText as Text } from '@/shared/components/AppText';

export type AppMapCoordinate = {
  latitude: number;
  longitude: number;
};

export type AppMapRegion = AppMapCoordinate & {
  latitudeDelta: number;
  longitudeDelta: number;
};

export type AppMapPressEvent = {
  nativeEvent: {
    coordinate: AppMapCoordinate;
  };
};

interface AppMapViewProps {
  children?: ReactNode;
  className?: string;
}

interface AppMapMarkerProps {
  children?: ReactNode;
}

interface AppMapCalloutProps {
  children?: ReactNode;
}

export function AppMapView({ className = '' }: AppMapViewProps) {
  return (
    <View className={`items-center justify-center bg-surface-soft dark:bg-dark-surface ${className}`}>
      <Text className="font-sans px-6 text-center text-sm text-muted dark:text-dark-muted">
        الخريطة متاحة داخل تطبيق الهاتف.
      </Text>
    </View>
  );
}

export function AppMapMarker(_props: AppMapMarkerProps) {
  return null;
}

export function AppMapCallout(_props: AppMapCalloutProps) {
  return null;
}
