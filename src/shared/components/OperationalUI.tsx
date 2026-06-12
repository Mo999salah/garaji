import { TouchableOpacity, View } from "react-native";
import Animated, {
 FadeIn,
 FadeInDown,
 LinearTransition,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { AppText as Text } from "@/shared/components/AppText";

interface CommandHeaderProps {
 eyebrow: string;
 title: string;
 subtitle: string;
 children?: React.ReactNode;
}

export function CommandHeader({
 children,
 eyebrow,
 subtitle,
 title,
}: CommandHeaderProps) {
 return (
 <Animated.View
 entering={FadeInDown.duration(500).springify().damping(15)}
 className="overflow-hidden rounded-2xl border border-outline-variant bg-white p-5 shadow-elevated"
 >
 <View className="items-end">
 <View className="rounded-full border border-brand-500/20 bg-primary-container/10 px-3 py-1">
 <Text className="font-sans text-xs font-bold text-primary">
 {eyebrow}
 </Text>
 </View>
 <Text className="font-sans mt-4 text-right text-3xl font-black leading-tight text-on-surface">
 {title}
 </Text>
 <Text className="font-sans mt-2 text-right text-base leading-6 text-on-surface-variant">
 {subtitle}
 </Text>
 </View>
 {children ? <View className="mt-5">{children}</View> : null}
 </Animated.View>
 );
}

interface MetricTileProps {
 label: string;
 value: string;
 tone?: "dark" | "gold" | "muted";
 delay?: number;
}

const metricTone = {
 dark: "text-on-surface ",
 gold: "text-success dark:text-emerald-300",
 muted: "text-on-surface-variant ",
};

export function MetricTile({
 label,
 tone = "dark",
 value,
 delay = 100,
}: MetricTileProps) {
 return (
 <Animated.View
 entering={FadeInDown.delay(delay).duration(400).springify()}
 className="min-w-[47%] flex-1 rounded-2xl border border-outline-variant bg-white p-4 shadow-soft"
 >
 <Text className="font-sans text-right text-xs font-bold text-on-surface-variant">
 {label}
 </Text>
 <Text
 className={`font-sans mt-2 text-right text-3xl font-black ${metricTone[tone]}`}
 >
 {value}
 </Text>
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
 <Animated.View
 entering={FadeIn.duration(400)}
 className="flex-row-reverse items-end justify-between gap-3"
 >
 <View className="flex-1 items-end">
 <Text className="font-sans text-right text-lg font-bold text-on-surface">
 {title}
 </Text>
 {subtitle ? (
 <Text className="font-sans mt-1 text-right text-sm leading-5 text-on-surface-variant">
 {subtitle}
 </Text>
 ) : null}
 </View>
 {action}
 </Animated.View>
 );
}

interface QuickActionTileProps {
 icon: keyof typeof Feather.glyphMap;
 title: string;
 subtitle: string;
 onPress: () => void;
 tone?: "brand" | "action" | "amber";
 className?: string;
}

const quickActionTone = {
 brand: {
 iconBox: "bg-primary-container/10 ",
 iconColor: "#0284C7",
 title: "text-primary ",
 },
 action: {
 iconBox: "bg-success-container dark:bg-emerald-950/20",
 iconColor: "#059669",
 title: "text-action-700 dark:text-emerald-300",
 },
 amber: {
 iconBox: "bg-amber-50 dark:bg-amber-950/20",
 iconColor: "#D97706",
 title: "text-amber-700 dark:text-amber-300",
 },
};

export function QuickActionTile({
 icon,
 onPress,
 subtitle,
 title,
 tone = "brand",
 className = "",
}: QuickActionTileProps) {
 const styles = quickActionTone[tone];

 return (
 <TouchableOpacity
 accessibilityLabel={title}
 accessibilityRole="button"
 activeOpacity={0.82}
 className={`min-h-[112px] rounded-2xl border border-outline-variant bg-white p-4 shadow-soft ${className}`}
 onPress={onPress}
 >
 <View className="items-end gap-3">
 <View className={`h-11 w-11 items-center justify-center rounded-full ${styles.iconBox}`}>
 <Feather name={icon} size={20} color={styles.iconColor} />
 </View>
 <View className="items-end">
 <Text className={`font-sans text-right text-base font-bold ${styles.title}`}>
 {title}
 </Text>
 <Text className="font-sans mt-1 text-right text-xs leading-5 text-on-surface-variant">
 {subtitle}
 </Text>
 </View>
 </View>
 </TouchableOpacity>
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

export function FilterTabs<T extends string>({
 active,
 onChange,
 tabs,
}: FilterTabsProps<T>) {
 return (
 <Animated.View
 layout={LinearTransition}
 className="rounded-full border border-outline-variant bg-white p-1 shadow-soft"
 >
 <View className="flex-row-reverse flex-wrap gap-1">
 {tabs.map((tab) => {
 const selected = active === tab.id;
 return (
 <TouchableOpacity
 accessibilityRole="tab"
 accessibilityState={{ selected }}
 className={`min-h-10 flex-1 items-center justify-center rounded-full px-3 py-2 ${
 selected ? "bg-primary" : "bg-transparent"
 }`}
 key={tab.id}
 onPress={() => onChange(tab.id)}
 >
 <Text
 className={`font-sans text-xs font-bold ${selected ? "text-white" : "text-on-surface-variant "}`}
 >
 {tab.count === undefined
 ? tab.label
 : `${tab.label} ${tab.count}`}
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
 <Animated.View
 entering={FadeIn.duration(400)}
 className="rounded-2xl border border-outline-variant bg-white p-3 shadow-soft"
 >
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
 <View
 className={`h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-primary" : "bg-surface-container-low "}`}
 >
 <Text
 className={`font-sans text-xs font-black ${active ? "text-white" : "text-on-surface-variant "}`}
 >
 {stepNumber}
 </Text>
 </View>
 <Text className="font-sans text-center text-[10px] font-bold text-on-surface-variant">
 {step}
 </Text>
 </Animated.View>
 );
 })}
 </View>
 </Animated.View>
 );
}
