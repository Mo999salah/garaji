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
 errorTitle = 'تعذّر تحميل البيانات',
 isLoading,
 loadingLabel = 'جارٍ تحميل البيانات',
 onRetry,
}: DataStatusProps) {
 if (isLoading) {
 return (
 <View className="rounded-lg border border-outline-variant bg-white p-6 shadow-soft">
 <LoadingSpinner label={loadingLabel} />
 <Text className="font-sans mt-2 text-center text-sm font-semibold text-on-surface-variant">{loadingLabel}</Text>
 </View>
 );
 }

 if (errorMessage) {
 return (
 <View className="rounded-lg border border-red-200 bg-red-50 p-6">
 <Text className="font-sans text-base font-bold text-red-800">{errorTitle}</Text>
 <Text className="font-sans mt-1 text-sm leading-5 text-red-600">{errorMessage}</Text>
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
