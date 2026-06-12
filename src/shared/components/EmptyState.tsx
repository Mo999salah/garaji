import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
 FadeInDown,
 useAnimatedStyle,
 useSharedValue,
 withRepeat,
 withSequence,
 withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { AppText as Text } from "@/shared/components/AppText";
import { AppButton } from "@/shared/components/AppButton";

interface EmptyStateProps {
 title: string;
 message: string;
 iconName?: keyof typeof Feather.glyphMap;
 ctaText?: string;
 onCtaPress?: () => void;
}

function FloatingIcon({ iconName }: { iconName: keyof typeof Feather.glyphMap }) {
 const translateY = useSharedValue(0);

 useEffect(() => {
 translateY.value = withRepeat(
 withSequence(
 withTiming(-6, { duration: 1400 }),
 withTiming(0, { duration: 1400 }),
 ),
 -1,
 true,
 );
 }, [translateY]);

 const animStyle = useAnimatedStyle(() => ({
 transform: [{ translateY: translateY.value }],
 }));

 return (
 <Animated.View
 style={animStyle}
 className="mb-5 h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container"
 >
 <Feather name={iconName} size={32} color="#00685f" />
 </Animated.View>
 );
}

export function EmptyState({ title, message, iconName = 'inbox', ctaText, onCtaPress }: EmptyStateProps) {
 return (
 <Animated.View
 entering={FadeInDown.duration(400).springify()}
 className="items-center justify-center rounded-3xl border border-dashed border-outline-variant bg-surface-container-lowest p-8 shadow-soft"
 >
 <FloatingIcon iconName={iconName} />
 <Text className="font-sans text-center text-[20px] font-bold text-on-surface">
 {title}
 </Text>
 <Text className="font-sans mt-2 text-center text-[16px] leading-6 text-on-surface-variant">
 {message}
 </Text>
 
 {ctaText && onCtaPress && (
 <View className="mt-6 w-full max-w-[200px]">
 <AppButton label={ctaText} onPress={onCtaPress} variant="primary" />
 </View>
 )}
 </Animated.View>
 );
}
