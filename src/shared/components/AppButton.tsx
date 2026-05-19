import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

interface AppButtonProps extends PropsWithChildren {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  accessibilityLabel?: string;
}

const variants = {
  primary: 'bg-brand-600 border-brand-600',
  secondary: 'bg-white border-line',
  ghost: 'bg-transparent border-transparent',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-ink',
  ghost: 'text-brand-700',
};

export function AppButton({
  children,
  disabled,
  loading,
  onPress,
  variant = 'primary',
  accessibilityLabel,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className={`min-h-12 items-center justify-center rounded-lg border px-5 ${variants[variant]} ${
        disabled || loading ? 'opacity-60' : 'active:opacity-80'
      }`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#17864A'} />
      ) : (
        <Text className={`text-base font-semibold ${textVariants[variant]}`}>{children}</Text>
      )}
    </Pressable>
  );
}
