import type { PropsWithChildren } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";

interface AppCardProps extends PropsWithChildren {
  className?: string;
  tone?: "default" | "elevated" | "quiet";
  delay?: number;
}

const tones = {
  default:
    "border-line bg-card shadow-tactile-sm dark:border-dark-line dark:bg-dark-card",
  elevated:
    "border-line bg-card shadow-tactile-md dark:border-dark-line dark:bg-dark-card",
  quiet:
    "border-line/70 bg-surface-soft shadow-tactile-sm dark:border-dark-line dark:bg-dark-card/70",
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
