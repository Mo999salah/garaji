import type { PropsWithChildren } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AppCardProps extends PropsWithChildren {
 className?: string;
 tone?: "default" | "elevated" | "quiet";
 delay?: number;
}

const tones = {
 default:
 "border-outline-variant bg-surface-container-lowest shadow-soft ",
 elevated:
 "border-outline-variant bg-surface-container-lowest shadow-elevated ",
 quiet:
 "border-outline-variant/70 bg-surface-container-low shadow-soft",
};

export function AppCard({
 children,
 className = "",
 tone = "default",
 delay = 0,
}: AppCardProps) {
 return (
 <Animated.View
 entering={FadeInDown.delay(delay)
 .duration(400)
 .springify()
 .damping(16)
 .mass(0.8)}
 className={`rounded-2xl border p-5 ${tones[tone]} ${className}`}
 >
 {children}
 </Animated.View>
 );
}
