import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  setSystemScheme: (scheme: 'light' | 'dark') => void;
  hydrate: () => Promise<void>;
}

const THEME_KEY = 'garaji_theme_mode';

function resolveTheme(mode: ThemeMode, systemScheme: 'light' | 'dark'): 'light' | 'dark' {
  if (mode === 'system') return systemScheme;
  return mode;
}

let _systemScheme: 'light' | 'dark' = 'light';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system' as ThemeMode,
  resolved: 'light' as const,
  hasHydrated: false,

  setMode: (mode: ThemeMode) => {
    const resolved = resolveTheme(mode, _systemScheme);
    set({ mode, resolved });
    void AsyncStorage.setItem(THEME_KEY, mode);
  },

  setSystemScheme: (scheme: 'light' | 'dark') => {
    _systemScheme = scheme;
    const { mode } = get();
    if (mode === 'system') {
      set({ resolved: scheme });
    }
  },

  hydrate: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        const resolved = resolveTheme(saved, _systemScheme);
        set({ mode: saved, resolved, hasHydrated: true });
      } else {
        set({ hasHydrated: true });
      }
    } catch {
      set({ hasHydrated: true });
    }
  },
}));
