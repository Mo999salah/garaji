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
      className="min-h-10 flex-row-reverse items-center gap-2 rounded-md border border-[#E5E5E5] bg-white px-3 py-2 active:opacity-80 dark:border-dark-line dark:bg-dark-card"
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      <View className="rounded-md bg-[#F3F4F6] px-2 py-1 dark:bg-dark-line">
        <Text className="font-sans text-[10px] font-black text-[#111111] dark:text-dark-ink">{icon}</Text>
      </View>
      <Text className="font-sans text-xs font-semibold text-[#111111] dark:text-dark-ink">{label}</Text>
      {systemBadge && (
        <View className="rounded-md bg-[#F3F4F6] px-1.5 py-0.5 dark:bg-dark-line">
          <Text className="font-sans text-[10px] font-bold text-[#8A8A8A] dark:text-dark-muted">تلقائي</Text>
        </View>
      )}
    </Pressable>
  );
}
