import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

interface AppCardProps extends PropsWithChildren {
  className?: string;
  tone?: 'default' | 'elevated' | 'quiet';
}

const tones = {
  default: 'border-line bg-card shadow-sm shadow-black/5 dark:border-dark-line dark:bg-dark-card dark:shadow-none',
  elevated: 'border-brand-100 bg-card shadow-md shadow-brand-700/10 dark:border-dark-brand-50 dark:bg-dark-card dark:shadow-none',
  quiet: 'border-line/70 bg-surface-soft/80 dark:border-dark-line dark:bg-dark-card/70',
};

export function AppCard({ children, className = '', tone = 'default' }: AppCardProps) {
  return (
    <View className={`rounded-lg border p-5 ${tones[tone]} ${className}`}>
      {children}
    </View>
  );
}
