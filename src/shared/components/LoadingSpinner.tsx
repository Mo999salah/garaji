import { ActivityIndicator, View } from 'react-native';

import { useThemeStore } from '@/shared/store/useThemeStore';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  const resolved = useThemeStore((s: { resolved: 'light' | 'dark' }) => s.resolved);

  return (
    <View
      accessibilityLabel={label ?? 'Loading'}
      accessibilityRole="progressbar"
      className="items-center justify-center py-4"
    >
      <ActivityIndicator color={resolved === 'dark' ? '#D7B45E' : '#111111'} size="large" />
    </View>
  );
}
