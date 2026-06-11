import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Appearance, View } from 'react-native';
import type { ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@garaji_theme_preference';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** The resolved scheme — always 'light' or 'dark'. */
  colorScheme: 'light' | 'dark';
  /** The user's preference — 'light' | 'dark' | 'system'. */
  themeMode: ThemeMode;
  /** Toggle or set the theme. */
  setThemeMode: (mode: ThemeMode) => void;
  /** True while loading from storage. */
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'light',
  themeMode: 'system',
  setThemeMode: () => {},
  isLoading: true,
});

export function useTheme() {
  return useContext(ThemeContext);
}

function resolveScheme(mode: ThemeMode, systemScheme: ColorSchemeName): 'light' | 'dark' {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const systemScheme = Appearance.getColorScheme();

  const colorScheme = resolveScheme(themeMode, systemScheme);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored);
        }
      } catch {
        // Ignore — fallback to system
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  }, []);

  return (
    <ThemeContext.Provider value={{ colorScheme, themeMode, setThemeMode, isLoading }}>
      <View className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}
