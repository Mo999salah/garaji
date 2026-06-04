import { Pressable, View } from 'react-native';

import { useThemeStore } from '@/shared/store/useThemeStore';

import { AppText as Text } from '@/shared/components/AppText';
export function ThemeToggle() {
  const { mode, resolved, setMode } = useThemeStore();

  const handlePress = () => {
    const next = resolved === 'light' ? 'dark' : 'light';
    setMode(next);
  };

  const handleLongPress = () => {
    setMode('system');
  };

  const icon = resolved === 'dark' ? 'ليل' : 'نهار';
  const label = resolved === 'dark' ? 'وضع ليلي' : 'وضع نهاري';
  const systemBadge = mode === 'system';

  return (
    <Pressable
      accessibilityLabel={`تبديل المظهر: ${label}`}
      accessibilityRole="button"
      className="min-h-10 flex-row-reverse items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 active:opacity-80 dark:border-dark-line dark:bg-dark-card"
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <View className="rounded-md bg-brand-50 px-2 py-1 dark:bg-dark-brand-50">
        <Text className="font-sans text-[10px] font-black text-brand-500 dark:text-dark-brand-500">{icon}</Text>
      </View>
      <Text className="font-sans text-xs font-semibold text-ink dark:text-dark-ink">{label}</Text>
      {systemBadge && (
        <View className="rounded-md bg-gold-50 px-1.5 py-0.5 dark:bg-dark-gold-50">
          <Text className="font-sans text-[10px] font-bold text-muted dark:text-dark-muted">تلقائي</Text>
        </View>
      )}
    </Pressable>
  );
}
