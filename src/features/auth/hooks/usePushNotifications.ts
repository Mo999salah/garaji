import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { saveProfilePushToken } from '@/features/auth/services/supabaseAuthService';
import type { AuthUser } from '@/shared/types/auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function logPushNotificationIssue(context: string, error?: unknown) {
  if (__DEV__) {
    console.warn(`[push-notifications] ${context}`, error);
  }
}

function getExpoProjectId(): string | undefined {
  return (
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.expoConfig?.extra?.expoClient?.extra?.eas?.projectId
  );
}

async function configureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C89B3C',
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    await configureAndroidNotificationChannel();

    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.status;

    if (existingPermissions.status !== Notifications.PermissionStatus.GRANTED) {
      const requestedPermissions = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermissions.status;
    }

    if (finalStatus !== Notifications.PermissionStatus.GRANTED) {
      logPushNotificationIssue('permission not granted');
      return null;
    }

    const projectId = getExpoProjectId();

    if (!projectId) {
      logPushNotificationIssue('missing Expo projectId');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    logPushNotificationIssue('registration failed', error);
    return null;
  }
}

export function usePushNotifications(user: AuthUser | null | undefined) {
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [lastResponse, setLastResponse] =
    useState<Notifications.NotificationResponse | null>(null);
  const registeredUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id || registeredUserIdRef.current === user.id) {
      return;
    }

    let isMounted = true;

    const registerAndPersistToken = async () => {
      const pushToken = await registerForPushNotificationsAsync();

      if (!isMounted || !pushToken) {
        return;
      }

      try {
        await saveProfilePushToken(user.id, pushToken);
        registeredUserIdRef.current = user.id;
      } catch (error) {
        logPushNotificationIssue('saving token failed', error);
      }
    };

    void registerAndPersistToken();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || Platform.OS === 'web') {
      return;
    }

    const notificationSubscription = Notifications.addNotificationReceivedListener(
      (incomingNotification) => {
        setNotification(incomingNotification);
      },
    );
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        setLastResponse(response);
      },
    );

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, [user?.id]);

  return {
    lastResponse,
    notification,
  };
}
