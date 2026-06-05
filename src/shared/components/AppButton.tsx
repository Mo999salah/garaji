import type { PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AnimatedPressable } from '@/shared/components/AnimatedPressable';

import { AppText as Text } from '@/shared/components/AppText';
interface AppButtonProps extends PropsWithChildren {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  accessibilityLabel?: string;
  className?: string;
}

const variants = {
  primary: 'bg-[#111111] border-[#111111] dark:bg-[#E0E0E0] dark:border-[#E0E0E0]',
  secondary: 'bg-[#F3F4F6] border-[#E5E5E5] dark:bg-dark-card dark:border-dark-line',
  ghost: 'bg-transparent border-transparent',
};

const textVariants = {
  primary: 'text-white font-bold dark:text-[#111111]',
  secondary: 'text-[#111111] font-semibold dark:text-dark-ink',
  ghost: 'text-[#111111] font-bold dark:text-dark-ink',
};

export function AppButton({
  children,
  disabled,
  loading,
  onPress,
  variant = 'primary',
  accessibilityLabel,
  className = '',
}: AppButtonProps) {
  return (
    <View
      className={`overflow-hidden rounded-md border ${variants[variant]} ${
        disabled || loading ? 'opacity-50' : ''
      } ${className}`}
    >
      <AnimatedPressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled || loading}
        onPress={onPress}
        scaleValue={0.97}
        className="min-h-12 items-center justify-center px-5"
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#111111'} />
        ) : (
          <Text className={`font-sans text-base font-semibold ${textVariants[variant]}`}>{children}</Text>
        )}
      </AnimatedPressable>
    </View>
  );
}
