import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/shared/lib/colors';
import { AppText as Text } from '@/shared/components/AppText';

interface AppHeaderProps {
  /** Screen title displayed in the centre */
  title: string;
  /** Show a back arrow (RTL-friendly). Defaults to `true`. */
  showBack?: boolean;
  /** Override the default back behaviour. */
  onBack?: () => void;
  /** Optional element rendered on the leading side (left in RTL). */
  trailing?: React.ReactNode;
  /** `"primary"` tints the title; `"default"` keeps it neutral. */
  variant?: 'primary' | 'default';
}

/**
 * Unified top-bar used across all screens.
 *
 * Place this **outside** your `ScrollView` so it stays fixed.
 * It reads `useSafeAreaInsets().top` to avoid notch overlap.
 */
export function AppHeader({
  title,
  showBack = true,
  onBack,
  trailing,
  variant = 'primary',
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const titleColor =
    variant === 'primary' ? 'text-primary' : 'text-on-surface';

  return (
    <View
      className="bg-surface z-40 w-full flex-row-reverse items-center justify-between px-margin-mobile pb-3"
      style={{ paddingTop: Math.max(insets.top, 8) + 4 }}
      accessibilityRole="header"
    >
      {/* Right side in RTL = back button */}
      {showBack ? (
        <Pressable
          accessibilityLabel="رجوع"
          accessibilityRole="button"
          className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-high"
          onPress={handleBack}
        >
          <MaterialIcons name="arrow-forward" size={24} color={AppColors.onSurfaceVariant} />
        </Pressable>
      ) : (
        <View className="w-10 h-10" />
      )}

      {/* Centre title */}
      <Text
        className={`flex-1 text-center font-title-md text-[20px] leading-[28px] font-bold ${titleColor}`}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Left side in RTL = trailing action */}
      {trailing ?? <View className="w-10 h-10" />}
    </View>
  );
}
