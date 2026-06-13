import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';

export default function NotificationsScreen() {
 return (
  <View className="flex-1 bg-surface">
      <AppHeader
        title="الإشعارات"
        showBack
        onBack={() => router.back()}
      />

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
