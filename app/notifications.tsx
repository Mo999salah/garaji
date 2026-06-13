import { View, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';

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
 <View className="pt-12">
 <EmptyState
 title="لا توجد إشعارات"
 message="سيتم عرض الإشعارات المتعلقة بحالة طلباتك وعروضنا الخاصة هنا."
 iconName="notifications"
 />
 </View>
 </View>
 </ScrollView>
 </View>
 );
}
