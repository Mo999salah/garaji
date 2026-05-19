import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import create from 'zustand';

import { signInWithMockRole } from '@/features/auth/services/mockAuthService';
import type { AuthUser, UserRole } from '@/shared/types/auth';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
const SESSION_KEY = 'qitaa-auth-session';
let webSession: string | null = null;

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  hasHydrated: boolean;
  hydrateSession: () => Promise<void>;
  signInAsRole: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

async function getStoredSession() {
  if (Platform.OS === 'web') {
    return webSession;
  }

  return SecureStore.getItemAsync(SESSION_KEY);
}

async function setStoredSession(value: string) {
  if (Platform.OS === 'web') {
    webSession = value;
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, value);
}

async function clearStoredSession() {
  if (Platform.OS === 'web') {
    webSession = null;
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  hasHydrated: false,
  hydrateSession: async () => {
    if (get().hasHydrated) {
      return;
    }

    set({ status: 'loading' });

    try {
      const storedSession = await getStoredSession();
      const parsedSession = storedSession
        ? (JSON.parse(storedSession) as { user?: AuthUser })
        : null;

      set({
        user: parsedSession?.user ?? null,
        status: parsedSession?.user ? 'authenticated' : 'unauthenticated',
        hasHydrated: true,
      });
    } catch {
      await clearStoredSession();
      set({ user: null, status: 'unauthenticated', hasHydrated: true });
    }
  },
  signInAsRole: async (role) => {
    set({ status: 'loading' });
    const user = await signInWithMockRole(role);
    await setStoredSession(JSON.stringify({ user }));
    set({ user, status: 'authenticated', hasHydrated: true });
  },
  signOut: async () => {
    await clearStoredSession();
    set({ user: null, status: 'unauthenticated', hasHydrated: true });
  },
}));

export function getHomePathForRole(role: UserRole) {
  return role === 'customer' ? '/(customer)/home' : '/(merchant)/home';
}
