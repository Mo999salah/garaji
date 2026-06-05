import { TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AppText as Text } from '@/shared/components/AppText';

interface CommandHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function CommandHeader({ children, eyebrow, subtitle, title }: CommandHeaderProps) {
  return (
    <Animated.View 
      entering={FadeInDown.duration(500).springify().damping(15)} 
      className="rounded-md border border-[#E5E5E5] bg-[#111111] p-6 dark:border-dark-line dark:bg-dark-card"
    >
      <View className="items-end">
        <View className="rounded-md border border-white/10 bg-white/15 px-3 py-1 dark:border-dark-line dark:bg-dark-line">
          <Text className="font-sans text-xs font-bold text-white/80 dark:text-dark-muted">{eyebrow}</Text>
        </View>
        <Text className="font-sans mt-4 text-right text-3xl font-black leading-tight text-white dark:text-dark-ink">{title}</Text>
        <Text className="font-sans mt-2 text-right text-base leading-6 text-white/60 dark:text-dark-muted">{subtitle}</Text>
      </View>
      {children ? <View className="mt-5">{children}</View> : null}
    </Animated.View>
  );
}

interface MetricTileProps {
  label: string;
  value: string;
  tone?: 'dark' | 'gold' | 'muted';
  delay?: number;
}

const metricTone = {
  dark: 'text-[#111111] dark:text-dark-ink',
  gold: 'text-[#111111] dark:text-dark-ink',
  muted: 'text-[#8A8A8A] dark:text-dark-muted',
};

export function MetricTile({ label, tone = 'dark', value, delay = 100 }: MetricTileProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(400).springify()} 
      className="min-w-[47%] flex-1 rounded-md border border-[#E5E5E5] bg-white p-4 dark:border-dark-line dark:bg-dark-card"
    >
      <Text className="font-sans text-right text-xs font-bold text-[#8A8A8A] dark:text-dark-muted">{label}</Text>
      <Text className={`font-sans mt-2 text-right text-3xl font-black ${metricTone[tone]}`}>{value}</Text>
    </Animated.View>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ action, subtitle, title }: SectionHeaderProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} className="flex-row-reverse items-end justify-between gap-3">
      <View className="flex-1 items-end">
        <Text className="font-sans text-right text-lg font-bold text-[#111111] dark:text-dark-ink">{title}</Text>
        {subtitle ? (
          <Text className="font-sans mt-1 text-right text-sm leading-5 text-[#8A8A8A] dark:text-dark-muted">{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </Animated.View>
  );
}

interface FilterTab<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function FilterTabs<T extends string>({ active, onChange, tabs }: FilterTabsProps<T>) {
  return (
    <Animated.View layout={LinearTransition} className="rounded-md border border-[#E5E5E5] bg-white p-1 dark:border-dark-line dark:bg-dark-card">
      <View className="flex-row-reverse flex-wrap gap-1">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`min-h-10 flex-1 items-center justify-center rounded-md px-3 py-2 ${
                selected ? 'bg-[#111111] dark:bg-[#E0E0E0]' : 'bg-transparent'
              }`}
              key={tab.id}
              onPress={() => onChange(tab.id)}
            >
              <Text className={`font-sans text-xs font-bold ${selected ? 'text-white dark:text-[#111111]' : 'text-[#8A8A8A] dark:text-dark-muted'}`}>
                {tab.count === undefined ? tab.label : `${tab.label} ${tab.count}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

interface StepIndicatorProps {
  current: number;
  steps: string[];
}

export function StepIndicator({ current, steps }: StepIndicatorProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} className="rounded-md border border-[#E5E5E5] bg-white p-3 dark:border-dark-line dark:bg-dark-card">
      <View className="flex-row-reverse items-center gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const active = stepNumber <= current;
          return (
            <Animated.View 
              layout={LinearTransition}
              className="flex-1 items-center gap-1" 
              key={step}
            >
              <View className={`h-7 w-7 items-center justify-center rounded-md ${active ? 'bg-[#111111] dark:bg-[#E0E0E0]' : 'bg-[#F3F4F6] dark:bg-dark-surface'}`}>
                <Text className={`font-sans text-xs font-black ${active ? 'text-white dark:text-[#111111]' : 'text-[#8A8A8A] dark:text-dark-muted'}`}>
                  {stepNumber}
                </Text>
              </View>
              <Text className="font-sans text-center text-[10px] font-bold text-[#8A8A8A] dark:text-dark-muted">{step}</Text>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}
