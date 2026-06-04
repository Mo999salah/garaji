import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';

import { useThemeStore } from '@/shared/store/useThemeStore';

export function ThemeProvider({ children }: PropsWithChildren) {
  const hydrate = useThemeStore((s: { hydrate: () => Promise<void> }) => s.hydrate);
  const setSystemScheme = useThemeStore((s: { setSystemScheme: (scheme: 'light' | 'dark') => void }) => s.setSystemScheme);
  const resolved = useThemeStore((s: { resolved: 'light' | 'dark' }) => s.resolved);
  const colorScheme = useColorScheme();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    setSystemScheme(colorScheme === 'dark' ? 'dark' : 'light');
  }, [colorScheme, setSystemScheme]);

  return (
    <View className={`flex-1 ${resolved === 'dark' ? 'dark' : ''}`}>
      {children}
    </View>
  );
}
