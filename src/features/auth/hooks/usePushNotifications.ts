import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { saveProfilePushToken } from '@/features/auth/services/supabaseAuthService';
import type { AuthUser } from '@/shared/types/auth';

type NotificationsModule = typeof import('expo-notifications');
type Notification = import('expo-notifications').Notification;
type NotificationResponse = import('expo-notifications').NotificationResponse;

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;
let notificationHandlerConfigured = false;
const PUSH_PERMISSION_RATIONALE_KEY = 'garaji.pushPermissionRationale.dismissed.v1';

function isExpoGoAndroid() {
  return (
    Platform.OS === 'android' &&
    ((Constants as { appOwnership?: string }).appOwnership === 'expo' ||
      Constants.executionEnvironment === 'storeClient')
  );
}

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (Platform.OS === 'web' || isExpoGoAndroid()) {
    return null;
  }

  notificationsModulePromise ??= import('expo-notifications')
    .then((module) => {
      if (!notificationHandlerConfigured) {
        module.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });
        notificationHandlerConfigured = true;
      }

      return module;
    })
    .catch((error) => {
      logPushNotificationIssue('loading expo-notifications failed', error);
      return null;
    });

  return notificationsModulePromise;
}

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

function getRequestIdFromNotificationResponse(
  response: NotificationResponse,
): string | null {
  const requestId = response.notification.request.content.data?.requestId;

  if (typeof requestId === 'string' && requestId.trim()) {
    return requestId.trim();
  }

  if (typeof requestId === 'number' && Number.isFinite(requestId)) {
    return String(requestId);
  }

  return null;
}

function getRequestRouteForUser(user: AuthUser, requestId: string): Href {
  if (user.role === 'merchant') {
    return `/(merchant)/requests/${requestId}` as Href;
  }

  return `/(customer)/requests/${requestId}` as Href;
}

async function configureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  const notifications = await getNotificationsModule();

  if (!notifications) {
    return;
  }

  await notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C89B3C',
  });
}

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  if (isExpoGoAndroid()) {
    logPushNotificationIssue('push notifications skipped in Expo Go on Android');
    return null;
  }

  try {
    const notifications = await getNotificationsModule();

    if (!notifications) {
      return null;
    }

    await configureAndroidNotificationChannel();

    const existingPermissions = await notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.status;

    if (existingPermissions.status !== notifications.PermissionStatus.GRANTED) {
      const requestedPermissions = await notifications.requestPermissionsAsync();
      finalStatus = requestedPermissions.status;
    }

    if (finalStatus !== notifications.PermissionStatus.GRANTED) {
      logPushNotificationIssue('permission not granted');
      return null;
    }

    const projectId = getExpoProjectId();

    if (!projectId) {
      logPushNotificationIssue('missing Expo projectId');
      return null;
    }

    const token = await notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    logPushNotificationIssue('registration failed', error);
    return null;
  }
}

export function usePushNotifications(user: AuthUser | null | undefined) {
  const [notification, setNotification] =
    useState<Notification | null>(null);
  const [lastResponse, setLastResponse] =
    useState<NotificationResponse | null>(null);
  const [permissionSheetVisible, setPermissionSheetVisible] = useState(false);
  const registeredUserIdRef = useRef<string | null>(null);
  const handledResponseIdRef = useRef<string | null>(null);
  const permissionRequestInFlightRef = useRef(false);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerAndPersistToken = useCallback(async (targetUser: AuthUser) => {
    if (permissionRequestInFlightRef.current) {
      return;
    }

    permissionRequestInFlightRef.current = true;

    try {
      const pushToken = await registerForPushNotificationsAsync();

      if (!pushToken) {
        return;
      }

      await saveProfilePushToken(targetUser.id, pushToken);
      registeredUserIdRef.current = targetUser.id;
    } catch (error) {
      logPushNotificationIssue('saving token failed', error);
    } finally {
      permissionRequestInFlightRef.current = false;
    }
  }, []);

  const handleAllowPushPermission = useCallback(() => {
    if (!user) {
      setPermissionSheetVisible(false);
      return;
    }

    setPermissionSheetVisible(false);
    void AsyncStorage.setItem(PUSH_PERMISSION_RATIONALE_KEY, 'accepted');
    void registerAndPersistToken(user);
  }, [registerAndPersistToken, user]);

  const handleDismissPushPermission = useCallback(() => {
    setPermissionSheetVisible(false);
    void AsyncStorage.setItem(PUSH_PERMISSION_RATIONALE_KEY, 'dismissed');
  }, []);

  useEffect(() => {
    if (!user?.id || registeredUserIdRef.current === user.id) {
      return;
    }

    let isMounted = true;

    const preparePushPermission = async () => {
      const notifications = await getNotificationsModule();

      if (!notifications || !isMounted) {
        return;
      }

      try {
        await configureAndroidNotificationChannel();
        const existingPermissions = await notifications.getPermissionsAsync();

        if (existingPermissions.status === notifications.PermissionStatus.GRANTED) {
          await registerAndPersistToken(user);
          return;
        }

        const previousDecision = await AsyncStorage.getItem(
          PUSH_PERMISSION_RATIONALE_KEY,
        );

        if (isMounted && !previousDecision) {
          setPermissionSheetVisible(true);
        }
      } catch (error) {
        logPushNotificationIssue('permission preflight failed', error);
      }
    };

    void preparePushPermission();

    return () => {
      isMounted = false;
    };
  }, [registerAndPersistToken, user]);

  useEffect(() => {
    if (!user?.id || Platform.OS === 'web' || isExpoGoAndroid()) {
      return;
    }

    let isMounted = true;
    let notificationSubscription: { remove: () => void } | null = null;
    let responseSubscription: { remove: () => void } | null = null;

    const handleNotificationResponse = (response: NotificationResponse) => {
      if (!isMounted) {
        return;
      }

      setLastResponse(response);

      const responseId = response.notification.request.identifier;

      if (handledResponseIdRef.current === responseId) {
        return;
      }

      const requestId = getRequestIdFromNotificationResponse(response);

      if (!requestId) {
        logPushNotificationIssue('notification response missing requestId');
        return;
      }

      handledResponseIdRef.current = responseId;

      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      navigationTimeoutRef.current = setTimeout(() => {
        try {
          router.push(getRequestRouteForUser(user, requestId));
        } catch (error) {
          logPushNotificationIssue('notification route failed', error);
        }
      }, 250);
    };

    void getNotificationsModule().then((notifications) => {
      if (!notifications || !isMounted) {
        return;
      }

      notificationSubscription = notifications.addNotificationReceivedListener(
        (incomingNotification) => {
          setNotification(incomingNotification);
        },
      );
      responseSubscription = notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse,
      );

      void notifications
        .getLastNotificationResponseAsync()
        .then((response) => {
          if (response) {
            handleNotificationResponse(response);
          }
        })
        .catch((error) => {
          logPushNotificationIssue('loading last notification response failed', error);
        });
    });

    return () => {
      isMounted = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }

      notificationSubscription?.remove();
      responseSubscription?.remove();
    };
  }, [user]);

  return {
    lastResponse,
    notification,
    permissionSheet: {
      onAllow: handleAllowPushPermission,
      onDismiss: handleDismissPushPermission,
      visible: permissionSheetVisible,
    },
  };
}
