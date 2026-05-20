import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

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
          title="Account setup incomplete"
          message={message ?? 'Your account is missing required profile information.'}
        />
        <Text className="text-center text-sm leading-5 text-muted">
          Contact support if this continues after signing in again.
        </Text>
        <AppButton loading={status === 'loading'} onPress={() => void handleRetry()}>
          Try again
        </AppButton>
        <AppButton onPress={handleSignOut} variant="secondary">
          Sign out
        </AppButton>
      </View>
    </ScreenContainer>
  );
}
