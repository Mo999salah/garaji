import { router } from 'expo-router';
import { View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

import { AppText as Text } from '@/shared/components/AppText';
interface AuthBlockedStateProps {
  message?: string | null;
}

export function AuthBlockedState({ message }: AuthBlockedStateProps) {
  const signOut = useAuthStore((state) => state.signOut);
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const status = useAuthStore((state) => state.status);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleRetry = async () => {
    await hydrateSession();
  };

  return (
    <ScreenContainer>
      <View className="gap-4">
        <EmptyState
          title="إعداد الحساب غير مكتمل"
          message={message ?? 'حسابك يفتقر إلى بعض المعلومات المطلوبة.'}
        />
        <Text className="font-sans text-center text-sm leading-5 text-muted dark:text-dark-muted">
          تواصل مع الدعم إذا استمرت المشكلة بعد تسجيل الدخول مرة أخرى.
        </Text>
        <AppButton loading={status === 'loading'} onPress={() => void handleRetry()}>
          إعادة المحاولة
        </AppButton>
        <AppButton onPress={handleSignOut} variant="secondary">
          تسجيل الخروج
        </AppButton>
      </View>
    </ScreenContainer>
  );
}
