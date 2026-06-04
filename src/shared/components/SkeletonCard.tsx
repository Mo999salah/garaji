import { View } from 'react-native';

interface SkeletonCardProps {
  variant?: 'request' | 'vehicle';
  className?: string;
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      className={`bg-line dark:bg-dark-line ${className}`}
    />
  );
}

export function SkeletonCard({ className = '', variant = 'request' }: SkeletonCardProps) {
  return (
    <View
      accessibilityLabel="جارٍ تحميل المحتوى"
      accessibilityRole="progressbar"
      className={`animate-pulse rounded-lg border border-line bg-card p-5 shadow-sm shadow-brand-700/10 dark:border-dark-line dark:bg-dark-card dark:shadow-none ${className}`}
    >
      <View className="flex-row-reverse items-start justify-between gap-4">
        <View className="flex-1 items-end gap-3">
          <SkeletonBlock className="h-9 w-9 rounded-lg bg-surface-soft dark:bg-dark-surface" />
          <SkeletonBlock className="h-4 w-3/4 rounded-full" />
          <SkeletonBlock className="h-3 w-1/2 rounded-full bg-surface-soft dark:bg-dark-surface" />
          {variant === 'vehicle' ? (
            <View className="mt-1 items-end gap-2">
              <SkeletonBlock className="h-7 w-24 rounded-lg bg-surface-soft dark:bg-dark-surface" />
              <SkeletonBlock className="h-3 w-28 rounded-full" />
            </View>
          ) : (
            <View className="mt-2 w-full flex-row-reverse gap-2">
              <SkeletonBlock className="h-10 flex-1 rounded-lg bg-surface-soft dark:bg-dark-surface" />
              <SkeletonBlock className="h-10 flex-1 rounded-lg bg-surface-soft dark:bg-dark-surface" />
            </View>
          )}
        </View>

        <View className="items-start gap-3">
          <SkeletonBlock className="h-7 w-20 rounded-full bg-surface-soft dark:bg-dark-surface" />
          {variant === 'request' ? (
            <SkeletonBlock className="h-4 w-16 rounded-full" />
          ) : null}
        </View>
      </View>
    </View>
  );
}
