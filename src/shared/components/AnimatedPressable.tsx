import type { PropsWithChildren } from 'react';
import { Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, 'style' | 'children'> {
  children?: React.ReactNode;
  className?: string;
  scaleValue?: number;
}

export function AnimatedPressable({
  children,
  className = '',
  scaleValue = 0.97,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressableBase
      {...props}
      className={className}
      style={animatedStyle}
      onPressIn={(e) => {
        scale.value = withSpring(scaleValue, {
          damping: 15,
          stiffness: 400,
          mass: 0.5,
        });
        opacity.value = withSpring(0.88, { damping: 15, stiffness: 400 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, {
          damping: 12,
          stiffness: 300,
          mass: 0.6,
        });
        opacity.value = withSpring(1, { damping: 12, stiffness: 300 });
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressableBase>
  );
}
