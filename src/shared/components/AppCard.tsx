import type { PropsWithChildren } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AppCardProps extends PropsWithChildren {
  className?: string;
  tone?: 'default' | 'elevated' | 'quiet';
  delay?: number;
}

const tones = {
  default: 'border-[#E5E5E5] bg-white dark:border-dark-line dark:bg-dark-card',
  elevated: 'border-[#E5E5E5] bg-white dark:border-dark-line dark:bg-dark-card',
  quiet: 'border-[#E5E5E5]/60 bg-[#F3F4F6]/50 dark:border-dark-line dark:bg-dark-card/70',
};

export function AppCard({ children, className = '', tone = 'default', delay = 0 }: AppCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify().damping(16).mass(0.8)}
      className={`rounded-md border p-6 ${tones[tone]} ${className}`}
    >
      {children}
    </Animated.View>
  );
}
