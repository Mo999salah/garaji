import { Modal, Pressable, View } from 'react-native';

import { AppButton } from '@/shared/components/AppButton';
import { AppText as Text } from '@/shared/components/AppText';

interface SmartPermissionSheetProps {
 visible: boolean;
 title?: string;
 message?: string;
 confirmLabel?: string;
 dismissLabel?: string;
 onAllow: () => void;
 onDismiss: () => void;
}

export function SmartPermissionSheet({
 confirmLabel = 'تفعيل التنبيهات',
 dismissLabel = 'لاحقاً',
 message = 'لمتابعة حالة سيارتك لحظة بلحظة، وتنبيهك عند تأكيد الموعد أو تحديث الطلب.',
 onAllow,
 onDismiss,
 title = 'ابقَ على اطلاع',
 visible,
}: SmartPermissionSheetProps) {
 return (
 <Modal
 animationType="fade"
 onRequestClose={onDismiss}
 transparent
 visible={visible}
 >
 <View className="flex-1 justify-end bg-black/35 px-4 pb-5">
 <Pressable className="absolute inset-0" onPress={onDismiss} />
 <View className="rounded-lg border border-outline-variant bg-white p-5 shadow-elevated">
 <View className="items-end">
 <View className="h-12 w-12 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
 <Text className="font-sans text-2xl font-black text-amber-600">
 !
 </Text>
 </View>
 <Text className="font-sans mt-4 text-right text-2xl font-black text-on-surface">
 {title}
 </Text>
 <Text className="font-sans mt-2 text-right text-base leading-6 text-on-surface-variant">
 {message}
 </Text>
 </View>

 <View className="mt-5 gap-3">
 <AppButton accessibilityLabel={confirmLabel} onPress={onAllow}>
 {confirmLabel}
 </AppButton>
 <AppButton
 accessibilityLabel={dismissLabel}
 onPress={onDismiss}
 variant="ghost"
 >
 {dismissLabel}
 </AppButton>
 </View>
 </View>
 </View>
 </Modal>
 );
}
