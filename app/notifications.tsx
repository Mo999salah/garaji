import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { EmptyState } from '@/shared/components/EmptyState';

// Dummy Data
const MOCK_NOTIFICATIONS = [
 {
 id: '1',
 title: 'تأكيد الحجز',
 message: 'تم تأكيد حجزك لخدمة تغيير الزيت بنجاح. الفني في طريقه إليك في الموعد المحدد.',
 date: 'منذ 10 دقائق',
 isRead: false,
 icon: 'check-circle' as const,
 color: '#00685f',
 },
 {
 id: '2',
 title: 'تحديث حالة الطلب',
 message: 'الفني أحمد قد وصل إلى موقعك.',
 date: 'منذ ساعة',
 isRead: false,
 icon: 'map-pin' as const,
 color: '#0284c7',
 },
 {
 id: '3',
 title: 'عرض خاص لك!',
 message: 'احصل على خصم 20% على خدمة فحص الفرامل. العرض ساري لمدة 3 أيام.',
 date: 'منذ يومين',
 isRead: true,
 icon: 'tag' as const,
 color: '#e11d48',
 },
 {
 id: '4',
 title: 'اكتملت الصيانة',
 message: 'تم الانتهاء من خدمة الفحص الشامل بنجاح. نتمنى لك قيادة آمنة!',
 date: 'منذ أسبوع',
 isRead: true,
 icon: 'tool' as const,
 color: '#00685f',
 },
];

export default function NotificationsScreen() {
 return (
 <View className="flex-1 bg-surface">
 {/* Top Bar */}
 <View className="z-40 bg-surface px-margin-mobile pt-10 pb-4 flex-row-reverse items-center justify-between border-b border-surface-container-highest">
 <Pressable 
 accessibilityLabel="رجوع"
 accessibilityRole="button"
 onPress={() => router.back()}
 className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-high"
 >
 <MaterialIcons name="arrow-forward" size={24} color="#1a1c1d" />
 </Pressable>
 <Text className="font-title-md text-title-md font-bold text-on-surface">الإشعارات</Text>
 <View className="w-10 h-10" />
 </View>

 <ScrollView 
 className="flex-1 px-margin-mobile pt-stack-sm pb-[100px]"
 showsVerticalScrollIndicator={false}
 >
 <View className="flex-col gap-3 pb-32">
 {MOCK_NOTIFICATIONS.length > 0 ? (
 MOCK_NOTIFICATIONS.map((item, index) => (
 <Animated.View key={item.id} entering={FadeInUp.delay(index * 50).springify()}>
 <AnimatedPressable
 className={`w-full rounded-3xl p-4 flex-row-reverse items-start shadow-sm border ${
 item.isRead 
 ? 'bg-surface-container-lowest border-surface-container-highest opacity-70' 
 : 'bg-primary-container/20 border-primary/20'
 }`}
 >
 <View className={`w-12 h-12 rounded-full items-center justify-center ml-4 ${
 item.isRead ? 'bg-surface-container-highest' : 'bg-white'
 }`}>
 <Feather name={item.icon} size={24} color={item.isRead ? '#70787d' : item.color} />
 </View>

 <View className="flex-1 items-end">
 <View className="flex-row-reverse justify-between items-center w-full mb-1">
 <Text className={`font-title-sm text-[16px] font-bold ${
 item.isRead ? 'text-on-surface-variant' : 'text-on-surface'
 }`}>
 {item.title}
 </Text>
 <Text className="font-label-sm text-[12px] text-on-surface-variant opacity-70">
 {item.date}
 </Text>
 </View>
 <Text className={`font-body-sm text-[14px] leading-relaxed text-right ${
 item.isRead ? 'text-on-surface-variant' : 'text-on-surface'
 }`}>
 {item.message}
 </Text>
 </View>
 </AnimatedPressable>
 </Animated.View>
 ))
 ) : (
 <View className="pt-12">
 <EmptyState
 title="لا توجد إشعارات"
 message="سيتم عرض الإشعارات المتعلقة بحالة طلباتك وعروضنا الخاصة هنا."
 iconName="bell"
 />
 </View>
 )}
 </View>
 </ScrollView>
 </View>
 );
}
