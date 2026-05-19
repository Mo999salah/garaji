import { ActivityIndicator, View } from 'react-native';

interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <View
      accessibilityLabel={label ?? 'Loading'}
      accessibilityRole="progressbar"
      className="items-center justify-center py-4"
    >
      <ActivityIndicator color="#17864A" size="large" />
    </View>
  );
}
