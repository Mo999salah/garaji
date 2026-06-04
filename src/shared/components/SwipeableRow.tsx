import type { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import type { SwipeableProps } from 'react-native-gesture-handler';

import { AppText as Text } from '@/shared/components/AppText';
interface SwipeAction {
  label: string;
  icon?: string;
  color: string;
  bgColor: string;
  onPress: () => void;
}

interface SwipeableRowProps extends PropsWithChildren {
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  enabled?: boolean;
}

function renderActions(actions: SwipeAction[], side: 'left' | 'right') {
  return () => (
    <View className={`flex-row ${side === 'right' ? '' : 'flex-row-reverse'}`}>
      {actions.map((action) => (
        <View
          key={action.label}
          className="w-20 items-center justify-center"
          style={{ backgroundColor: action.bgColor }}
        >
          <View
            className="items-center justify-center rounded-xl px-2 py-3"
            onTouchEnd={action.onPress}
          >
            {action.icon ? (
              <Text className="font-sans mb-1 text-lg">{action.icon}</Text>
            ) : null}
            <Text
              className="font-sans text-xs font-bold"
              style={{ color: action.color }}
            >
              {action.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function SwipeableRow({
  children,
  leftActions,
  rightActions,
  enabled = true,
}: SwipeableRowProps) {
  if (!enabled || (!leftActions?.length && !rightActions?.length)) {
    return <>{children}</>;
  }

  const swipeableProps: Partial<SwipeableProps> = {
    friction: 2,
    overshootFriction: 8,
    overshootLeft: false,
    overshootRight: false,
  };

  if (leftActions?.length) {
    swipeableProps.renderLeftActions = renderActions(leftActions, 'left');
    swipeableProps.leftThreshold = 40;
  }

  if (rightActions?.length) {
    swipeableProps.renderRightActions = renderActions(rightActions, 'right');
    swipeableProps.rightThreshold = 40;
  }

  return (
    <Swipeable {...swipeableProps}>
      {children}
    </Swipeable>
  );
}
