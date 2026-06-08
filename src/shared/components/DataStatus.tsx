import { View } from 'react-native';

import { AppButton } from '@/shared/components/AppButton';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

import { AppText as Text } from '@/shared/components/AppText';
interface DataStatusProps {
  errorMessage?: string | null;
  errorTitle?: string;
  isLoading?: boolean;
  loadingLabel?: string;
  onRetry?: () => void;
}

export function DataStatus({
  errorMessage,
  errorTitle = 'Could not load data',
  isLoading,
  loadingLabel = 'Loading data',
  onRetry,
}: DataStatusProps) {
  if (isLoading) {
    return (
      <View className="rounded-lg border border-line bg-white p-6 shadow-tactile-sm dark:border-dark-line dark:bg-dark-card">
        <LoadingSpinner label={loadingLabel} />
        <Text className="font-sans mt-2 text-center text-sm font-semibold text-muted dark:text-dark-muted">{loadingLabel}</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/40">
        <Text className="font-sans text-base font-bold text-red-800 dark:text-red-300">{errorTitle}</Text>
        <Text className="font-sans mt-1 text-sm leading-5 text-red-600 dark:text-red-400">{errorMessage}</Text>
        {onRetry ? (
          <View className="mt-4">
            <AppButton onPress={onRetry} variant="secondary">
              إعادة المحاولة
            </AppButton>
          </View>
        ) : null}
      </View>
    );
  }

  return null;
}
