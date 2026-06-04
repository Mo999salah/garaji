import { TouchableOpacity, View } from 'react-native';

import { AppText as Text } from '@/shared/components/AppText';

interface CommandHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function CommandHeader({ children, eyebrow, subtitle, title }: CommandHeaderProps) {
  return (
    <View className="rounded-lg border border-gold-500/30 bg-brand-500 p-5 shadow-md shadow-black/10 dark:border-dark-line dark:bg-dark-card dark:shadow-none">
      <View className="items-end">
        <View className="rounded-lg border border-white/20 bg-white/10 px-3 py-1 dark:border-dark-gold-500/30 dark:bg-dark-gold-50">
          <Text className="font-sans text-xs font-bold text-gold-100 dark:text-dark-gold-500">{eyebrow}</Text>
        </View>
        <Text className="font-sans mt-4 text-right text-3xl font-black leading-tight text-white dark:text-dark-ink">{title}</Text>
        <Text className="font-sans mt-2 text-right text-base leading-6 text-white/75 dark:text-dark-muted">{subtitle}</Text>
      </View>
      {children ? <View className="mt-5">{children}</View> : null}
    </View>
  );
}

interface MetricTileProps {
  label: string;
  value: string;
  tone?: 'dark' | 'gold' | 'muted';
}

const metricTone = {
  dark: 'text-ink dark:text-dark-ink',
  gold: 'text-gold-600 dark:text-dark-gold-500',
  muted: 'text-muted dark:text-dark-muted',
};

export function MetricTile({ label, tone = 'dark', value }: MetricTileProps) {
  return (
    <View className="min-w-[47%] flex-1 rounded-lg border border-line bg-card p-4 dark:border-dark-line dark:bg-dark-card">
      <Text className="font-sans text-right text-xs font-bold text-muted dark:text-dark-muted">{label}</Text>
      <Text className={`font-sans mt-2 text-right text-3xl font-black ${metricTone[tone]}`}>{value}</Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ action, subtitle, title }: SectionHeaderProps) {
  return (
    <View className="flex-row-reverse items-end justify-between gap-3">
      <View className="flex-1 items-end">
        <Text className="font-sans text-right text-lg font-bold text-ink dark:text-dark-ink">{title}</Text>
        {subtitle ? (
          <Text className="font-sans mt-1 text-right text-sm leading-5 text-muted dark:text-dark-muted">{subtitle}</Text>
        ) : null}
      </View>
      {action}
    </View>
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
    <View className="rounded-lg border border-line bg-card p-1 dark:border-dark-line dark:bg-dark-card">
      <View className="flex-row-reverse flex-wrap gap-1">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              className={`min-h-10 flex-1 items-center justify-center rounded-lg px-3 py-2 ${
                selected ? 'bg-brand-500' : 'bg-transparent'
              }`}
              key={tab.id}
              onPress={() => onChange(tab.id)}
            >
              <Text className={`font-sans text-xs font-bold ${selected ? 'text-white' : 'text-muted dark:text-dark-muted'}`}>
                {tab.count === undefined ? tab.label : `${tab.label} ${tab.count}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

interface StepIndicatorProps {
  current: number;
  steps: string[];
}

export function StepIndicator({ current, steps }: StepIndicatorProps) {
  return (
    <View className="rounded-lg border border-line bg-card p-3 dark:border-dark-line dark:bg-dark-card">
      <View className="flex-row-reverse items-center gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const active = stepNumber <= current;
          return (
            <View className="flex-1 items-center gap-1" key={step}>
              <View className={`h-7 w-7 items-center justify-center rounded-lg ${active ? 'bg-brand-500' : 'bg-surface-soft dark:bg-dark-surface'}`}>
                <Text className={`font-sans text-xs font-black ${active ? 'text-white' : 'text-muted dark:text-dark-muted'}`}>
                  {stepNumber}
                </Text>
              </View>
              <Text className="font-sans text-center text-[10px] font-bold text-muted dark:text-dark-muted">{step}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
