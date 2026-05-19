import type { Href } from 'expo-router';
import { Redirect, Stack } from 'expo-router';

import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function AuthLayout() {
  const { hasHydrated, status, user } = useAuthStore();

  if (!hasHydrated || status === 'idle') {
    return (
      <ScreenContainer scroll={false}>
        <LoadingSpinner label="Checking session" />
      </ScreenContainer>
    );
  }

  if (user) {
    return <Redirect href={getHomePathForRole(user.role) as Href} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
