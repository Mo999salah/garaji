import create from 'zustand';

import {
  AuthFlowError,
  getCurrentAuthUser,
  signInWithEmail,
  signOutSupabase,
  signUpWithEmail,
  type SignInCredentials,
  type SignUpCredentials,
} from '@/features/auth/services/supabaseAuthService';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import { useServiceStore } from '@/features/services/store/useServiceStore';
import { useVehicleStore } from '@/features/vehicles/store/useVehicleStore';
import type { AuthUser, UserRole } from '@/shared/types/auth';
import { resetSessionStores } from '@/shared/lib/sessionStores';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'blocked';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  hasHydrated: boolean;
  errorMessage: string | null;
  infoMessage: string | null;
  hydrateSession: () => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<AuthUser>;
  signUp: (credentials: SignUpCredentials) => Promise<{ user: AuthUser | null; message: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  clearInfo: () => void;
  setInfoMessage: (message: string | null) => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof AuthFlowError) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

async function syncRoleData(user: AuthUser) {
  if (user.role === 'customer') {
    await Promise.all([
      useVehicleStore.getState().loadVehicles(user.id),
      useRequestStore.getState().loadCustomerRequests(user.id),
      useServiceStore.getState().loadActiveServices(),
      useBranchStore.getState().loadActiveBranches(),
    ]);
    return;
  }

  if (user.role === 'merchant') {
    await Promise.all([
      useRequestStore.getState().loadAllRequests(),
      useServiceStore.getState().loadAllServices(),
      useBranchStore.getState().loadAllBranches(),
    ]);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  hasHydrated: false,
  errorMessage: null,
  infoMessage: null,
  hydrateSession: async () => {
    set({ status: 'loading', errorMessage: null });

    try {
      const user = await getCurrentAuthUser();

      if (user) {
        await syncRoleData(user);
      }

      set({
        user,
        status: user ? 'authenticated' : 'unauthenticated',
        hasHydrated: true,
        errorMessage: null,
      });
    } catch (error) {
      set({
        user: null,
        status: 'blocked',
        hasHydrated: true,
        errorMessage: getErrorMessage(error),
      });
    }
  },
  signIn: async (credentials) => {
    set({ status: 'loading', errorMessage: null, infoMessage: null });

    try {
      const user = await signInWithEmail(credentials);
      await syncRoleData(user);
      set({ user, status: 'authenticated', hasHydrated: true, errorMessage: null, infoMessage: null });
      return user;
    } catch (error) {
      const message = getErrorMessage(error);
      set({ user: null, status: 'unauthenticated', hasHydrated: true, errorMessage: message });
      throw new AuthFlowError(message);
    }
  },
  signUp: async (credentials) => {
    set({ status: 'loading', errorMessage: null, infoMessage: null });

    try {
      const result = await signUpWithEmail(credentials);

      if (result.needsEmailConfirmation) {
        const message = 'Check your email to confirm your account, then sign in.';
        set({
          user: null,
          status: 'unauthenticated',
          hasHydrated: true,
          errorMessage: null,
          infoMessage: message,
        });
        return { user: null, message };
      }

      if (result.user) {
        try {
          await syncRoleData(result.user);
        } catch (syncError) {
          if (__DEV__) {
            console.warn('[auth] post-signup data sync failed', syncError);
          }
        }
      }

      set({
        user: result.user,
        status: result.user ? 'authenticated' : 'unauthenticated',
        hasHydrated: true,
        errorMessage: null,
        infoMessage: null,
      });

      return { user: result.user, message: 'Account created.' };
    } catch (error) {
      const message = getErrorMessage(error);
      set({ user: null, status: 'unauthenticated', hasHydrated: true, errorMessage: message });
      throw new AuthFlowError(message);
    }
  },
  signOut: async () => {
    set({ status: 'loading', errorMessage: null, infoMessage: null });

    try {
      await signOutSupabase();
    } finally {
      resetSessionStores();
      set({
        user: null,
        status: 'unauthenticated',
        hasHydrated: true,
        errorMessage: null,
        infoMessage: null,
      });
    }
  },
  clearError: () => set({ errorMessage: null }),
  clearInfo: () => set({ infoMessage: null }),
  setInfoMessage: (message) => set({ infoMessage: message }),
}));

export function getHomePathForRole(role: UserRole) {
  return role === 'customer' ? '/(customer)/home' : '/(merchant)/home';
}
