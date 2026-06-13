import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { ServiceRequestEvent, ServiceRequestStatus } from '@/features/requests/types';

import { AppText as Text } from '@/shared/components/AppText';

interface RequestTimelineProps {
 events?: ServiceRequestEvent[];
 currentStatus: ServiceRequestStatus;
}

const ORDERED_STATUSES: ServiceRequestStatus[] = [
 'pending',
 'confirmed',
 'in_progress',
 'completed',
];

const TIMELINE_LABELS: Record<ServiceRequestStatus, string> = {
 pending: 'مراجعة الطلب',
 confirmed: 'تأكيد الطلب',
 in_progress: 'تنفيذ الصيانة',
 completed: 'اكتمال الطلب',
 cancelled: 'الطلب ملغى'};

function formatEventDate(iso: string): string {
 const d = new Date(iso);
 return d.toLocaleString('ar-SA', {
 month: 'long',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 hour12: true});
}

export function RequestTimeline({ currentStatus, events }: RequestTimelineProps) {
 if (currentStatus === 'cancelled') {
 const cancelEvent = events?.find((e) => e.status === 'cancelled');
 return (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 relative">
 <View className="flex-row-reverse items-start gap-4">
 <View className="w-6 h-6 rounded-full bg-error flex items-center justify-center flex-shrink-0 mt-0.5">
 <MaterialIcons name="close" size={16} color="white" />
 </View>
 <View className="flex-col items-end">
 <Text className="font-title-md text-[16px] leading-[28px] font-bold text-error">الطلب ملغى</Text>
 {cancelEvent?.note ? (
 <Text className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-right">{cancelEvent.note}</Text>
 ) : null}
 {cancelEvent ? (
 <Text className="font-label-sm text-label-sm text-on-surface-variant mt-1">{formatEventDate(cancelEvent.createdAt)}</Text>
 ) : null}
 </View>
 </View>
 </View>
 );
 }

 const currentIndex = ORDERED_STATUSES.indexOf(currentStatus);

 return (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 relative">
      {/* Vertical Line — circle center at 36px from right, line 2px wide → left edge at 35px */}
      <View className="absolute top-10 bottom-10 w-0.5 bg-surface-variant z-0" style={{ right: 35 }} />
 
 <View className="flex-col gap-6 relative z-10">
 {ORDERED_STATUSES.map((step, index) => {
 const isComplete = index < currentIndex;
 const isCurrent = index === currentIndex;
 const isFuture = index > currentIndex;
 
 const event = events?.find((e) => e.status === step);

 return (
 <Animated.View
 entering={FadeIn.delay(index * 100).duration(300)}
 className={`flex-row-reverse items-start gap-4 ${isFuture ? 'opacity-50' : ''}`}
 key={step}
 >
 {isComplete ? (
 <View className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
 <MaterialIcons name="check" size={16} color="white" />
 </View>
 ) : isCurrent ? (
 <View className="w-6 h-6 rounded-full border-2 border-primary bg-surface-container-lowest flex items-center justify-center flex-shrink-0 mt-0.5">
 <View className="w-2.5 h-2.5 bg-primary rounded-full" />
 </View>
 ) : (
 <View className="w-6 h-6 rounded-full border-2 border-outline-variant bg-surface-container-lowest flex items-center justify-center flex-shrink-0 mt-0.5" />
 )}

 <View className="flex-col items-end">
 <Text className={`font-title-md text-[16px] leading-[28px] font-bold ${isCurrent ? 'text-primary' : isFuture ? 'text-on-surface-variant' : 'text-on-surface'}`}>
 {TIMELINE_LABELS[step]}
 </Text>
 
 <Text className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-right">
 {isComplete && event ? formatEventDate(event.createdAt) : isCurrent ? 'الآن...' : 'قريباً'}
 </Text>
 
 {event?.note && isComplete ? (
 <Text className="font-label-sm text-label-sm text-on-surface-variant mt-1 text-right">
 {event.note}
 </Text>
 ) : null}
 </View>
 </Animated.View>
 );
 })}
 </View>
 </View>
 );
}
