import { router } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/shared/lib/colors';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import {
 selectActiveRequests,
 selectByStatus,
 selectCompletedToday,
} from '@/features/requests/selectors/requestSelectors';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';

export default function AdminDashboardScreen() {
 const { signOut, user } = useAuthStore();
 const requestsQuery = useAllRequestsQuery();
 const { data: requests = [] } = requestsQuery;

 const active = selectActiveRequests(requests);
 const pending = selectByStatus(requests, 'pending');
 const confirmed = selectByStatus(requests, 'confirmed');
 const inProgress = selectByStatus(requests, 'in_progress');
 const completedToday = selectCompletedToday(requests);
 const recentActive = active.slice(0, 3);
 const needsAction = pending.length + confirmed.length;

 const handleSignOut = async () => {
 await signOut();
 router.replace('/login');
 };

 return (
 <View className="flex-1 bg-background pb-24 relative">
  {/* TopAppBar */}
  <View className="flex-row-reverse justify-between items-center px-margin-mobile pb-4 w-full z-40 bg-surface" style={{ paddingTop: Math.max(useSafeAreaInsets().top, 8) + 4 }}>
  <View className="flex-row-reverse items-center gap-3">
  <AnimatedPressable
  accessibilityLabel="تسجيل الخروج"
  accessibilityHint="تسجيل الخروج من الحساب"
  accessibilityRole="button"
  onPress={handleSignOut}
  className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden"
  >
  <MaterialIcons name="logout" size={20} color={AppColors.outline} />
  </AnimatedPressable>
  </View>
  <View className="items-end">
  <Text className="font-body-md text-body-md text-secondary leading-tight text-right">مركز الخدمة</Text>
  <Text className="font-title-md text-title-md text-on-surface text-right font-bold">{user?.fullName ?? 'مركز الصيانة المتقدم'}</Text>
  </View>
  </View>

 <ScrollView className="flex-1 px-margin-mobile pt-stack-md space-y-stack-lg" showsVerticalScrollIndicator={false}>
 
  {/* Metrics Grid */}
  <View className="flex-row-reverse flex-wrap gap-gutter mb-stack-lg">
  {/* Top Right */}
  <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-col items-center justify-center text-center flex-1 min-w-[45%]">
  <Text className="text-display-lg font-bold text-warning">{needsAction}</Text>
  <Text className="font-body-md text-body-md text-secondary mt-1">تحتاج إجراء</Text>
  </View>
  {/* Top Left */}
  <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-col items-center justify-center text-center flex-1 min-w-[45%]">
  <Text className="text-display-lg font-bold text-primary">{inProgress.length}</Text>
  <Text className="font-body-md text-body-md text-secondary mt-1">قيد التنفيذ</Text>
  </View>
  {/* Bottom Right */}
  <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-col items-center justify-center text-center flex-1 min-w-[45%] mt-4">
  <Text className="text-display-lg font-bold text-on-surface">{completedToday.length}</Text>
  <Text className="font-body-md text-body-md text-secondary mt-1">مكتملة اليوم</Text>
  </View>
  {/* Bottom Left */}
  <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-col items-center justify-center text-center flex-1 min-w-[45%] mt-4">
  <Text className="text-display-lg font-bold text-on-surface">{active.length}</Text>
  <Text className="font-body-md text-body-md text-secondary mt-1">إجمالي نشطة</Text>
  </View>
  </View>

  {/* Quick Actions */}
  <View className="mb-stack-lg">
  <Text className="font-title-md text-title-md text-on-surface mb-stack-md text-right font-bold">اختصارات التشغيل</Text>
  <View className="bg-surface-container-lowest rounded-2xl shadow-soft overflow-hidden">
  <AnimatedPressable
  accessibilityLabel="مراجعة الطلبات"
  accessibilityHint="عرض وإدارة طلبات العملاء"
  accessibilityRole="button"
  onPress={() => router.push('/(admin)/manage-orders')}
  className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low"
  >
  <View className="flex-row-reverse items-center gap-3">
  <MaterialIcons name="inbox" size={24} color={AppColors.primary} />
  <Text className="font-body-md text-body-md text-on-surface font-bold">مراجعة الطلبات</Text>
  </View>
  <MaterialIcons name="chevron-left" size={20} color={AppColors.outline} />
  </AnimatedPressable>
  
  <AnimatedPressable
  accessibilityLabel="الخدمات والأسعار"
  accessibilityHint="إدارة الخدمات والأسعار"
  accessibilityRole="button"
  onPress={() => router.push('/(admin)/services')}
  className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low"
  >
  <View className="flex-row-reverse items-center gap-3">
  <MaterialIcons name="build" size={24} color={AppColors.outline} />
  <Text className="font-body-md text-body-md text-on-surface font-bold">الخدمات والأسعار</Text>
  </View>
  <MaterialIcons name="chevron-left" size={20} color={AppColors.outline} />
  </AnimatedPressable>

  <AnimatedPressable
  accessibilityLabel="الفروع والمواقع"
  accessibilityHint="إدارة فروع المركز"
  accessibilityRole="button"
  onPress={() => router.push('/(admin)/branches')}
  className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low"
  >
  <View className="flex-row-reverse items-center gap-3">
  <MaterialIcons name="map" size={24} color={AppColors.outline} />
  <Text className="font-body-md text-body-md text-on-surface font-bold">الفروع والمواقع</Text>
  </View>
  <MaterialIcons name="chevron-left" size={20} color={AppColors.outline} />
  </AnimatedPressable>

  <AnimatedPressable
  accessibilityLabel="الفنيون والفريق"
  accessibilityHint="إدارة فريق الفنيين"
  accessibilityRole="button"
  onPress={() => router.push('/(admin)/technicians')}
  className="flex-row-reverse items-center justify-between p-4"
  >
  <View className="flex-row-reverse items-center gap-3">
  <MaterialIcons name="group" size={24} color={AppColors.warning} />
  <Text className="font-body-md text-body-md text-on-surface font-bold">الفنيون والفريق</Text>
  </View>
  <MaterialIcons name="chevron-left" size={20} color={AppColors.outline} />
  </AnimatedPressable>
  </View>
  </View>

  {/* Live Queue */}
  <View className="mb-stack-lg pb-10">
  <View className="flex-row-reverse items-center justify-between mb-stack-md">
  <Text className="font-title-md text-title-md text-on-surface font-bold">قائمة العمل</Text>
  <AnimatedPressable
  accessibilityLabel="عرض الكل"
  accessibilityRole="link"
  accessibilityHint="عرض جميع الطلبات النشطة"
  className="min-h-11 justify-center px-1"
  onPress={() => router.push('/(admin)/manage-orders')}
  >
  <Text className="font-label-sm text-label-sm text-primary font-bold">عرض الكل</Text>
  </AnimatedPressable>
  </View>

 {recentActive.length ? (
 <View className="flex-col gap-stack-sm">
 {recentActive.map((request) => (
 <RequestCard
 key={request.id}
 onPress={() =>
 router.push({
 pathname: '/order-details',
 params: { id: request.id },
 })
 }
 request={request}
 />
 ))}
 </View>
 ) : (
 <EmptyState
 message="لا توجد طلبات نشطة حالياً. ستظهر هنا طلبات العملاء."
 title="لا طلبات نشطة"
 />
 )}
 </View>

 </ScrollView>
 </View>
 );
}
