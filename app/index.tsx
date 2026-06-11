import { useEffect, useState } from 'react';
import type { Href } from 'expo-router';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthBlockedState } from '@/features/auth/components/AuthBlockedState';
import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';

export default function IndexRoute() {
  const { errorMessage, hasHydrated, status, user } = useAuthStore();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const value = await AsyncStorage.getItem('@has_seen_onboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (e) {
        setHasSeenOnboarding(false);
      }
    }
    checkOnboarding();
  }, []);

  if (!hasHydrated || status === 'idle' || status === 'loading' || hasSeenOnboarding === null) {
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

    if (!hasSeenOnboarding) {
      return <Redirect href="/onboarding" />;
    }

    return <Redirect href="/login" />;
  }

  return <Redirect href={getHomePathForRole(user.role) as Href} />;
}
