import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface AppCardProps extends PropsWithChildren {
  className?: string;
}

export function AppCard({ children, className = '' }: AppCardProps) {
  return (
    <View className={`rounded-lg border border-line bg-white p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
}
