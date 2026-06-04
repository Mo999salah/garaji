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
  primary: 'bg-brand-500 border-brand-500 shadow-sm shadow-brand-700/20 dark:bg-brand-500 dark:border-brand-500',
  secondary: 'bg-card border-line dark:bg-dark-card dark:border-dark-line',
  ghost: 'bg-transparent border-transparent',
};

const textVariants = {
  primary: 'text-white font-bold dark:text-white',
  secondary: 'text-ink font-semibold dark:text-dark-ink',
  ghost: 'text-brand-500 font-bold dark:text-dark-brand-500',
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
      className={`overflow-hidden rounded-lg border ${variants[variant]} ${
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
          <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#C89B3C'} />
        ) : (
          <Text className={`font-sans text-base font-semibold ${textVariants[variant]}`}>{children}</Text>
        )}
      </AnimatedPressable>
    </View>
  );
}
