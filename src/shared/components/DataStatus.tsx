import { Text, View } from 'react-native';

import { AppButton } from '@/shared/components/AppButton';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

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
      <View className="rounded-lg border border-line bg-white p-5">
        <LoadingSpinner label={loadingLabel} />
        <Text className="mt-2 text-center text-sm font-semibold text-muted">{loadingLabel}</Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="rounded-lg border border-red-100 bg-red-50 p-4">
        <Text className="text-base font-bold text-red-700">{errorTitle}</Text>
        <Text className="mt-1 text-sm leading-5 text-red-700">{errorMessage}</Text>
        {onRetry ? (
          <View className="mt-3">
            <AppButton onPress={onRetry} variant="secondary">
              Retry
            </AppButton>
          </View>
        ) : null}
      </View>
    );
  }

  return null;
}
