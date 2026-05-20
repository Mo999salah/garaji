import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';

import { AuthBlockedState } from '@/features/auth/components/AuthBlockedState';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export default function IndexRoute() {
  const { errorMessage, hasHydrated, status, user } = useAuthStore();

  if (!hasHydrated || status === 'idle' || status === 'loading') {
    return (
      <ScreenContainer scroll={false}>
        <LoadingSpinner label="Restoring session" />
      </ScreenContainer>
    );
  }

  if (!user) {
    if (status === 'blocked') {
      return <AuthBlockedState message={errorMessage} />;
    }

    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href={getHomePathForRole(user.role) as Href} />;
}
