import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';
import type { PropsWithChildren } from 'react';

import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export function AuthPublicGate({ children }: PropsWithChildren) {
  const { hasHydrated, status, user } = useAuthStore();

  if (!hasHydrated || status === 'idle' || status === 'loading') {
    return (
      <ScreenContainer scroll={false}>
        <LoadingSpinner label="جارٍ التحقق من الجلسة..." />
      </ScreenContainer>
    );
  }

  if (user) {
    return <Redirect href={getHomePathForRole(user.role) as Href} />;
  }

  return children;
}
