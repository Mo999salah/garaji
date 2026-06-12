import * as Haptics from "expo-haptics";

export function triggerAuthPrimaryHaptic() {
 void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
 () => undefined,
 );
}

export function triggerAuthErrorHaptic() {
 void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
 () => undefined,
 );
}
