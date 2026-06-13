import { ActivityIndicator, View } from 'react-native';

import { AppColors } from '@/shared/lib/colors';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <View
      accessibilityLabel={label ?? 'جارٍ التحميل...'}
      accessibilityRole="progressbar"
      className="items-center justify-center py-4"
    >
      <ActivityIndicator color={AppColors.primary} size="large" />
    </View>
  );
}
