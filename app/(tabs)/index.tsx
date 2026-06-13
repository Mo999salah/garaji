import { router } from 'expo-router';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import { useCustomerRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { selectActiveRequests } from '@/features/requests/selectors/requestSelectors';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppText as Text } from '@/shared/components/AppText';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import { AppColors } from '@/shared/lib/colors';

export default function CustomerHomeScreen() {
 const { user } = useAuthStore();
 useRequestRealtimeListener({ customerId: user?.id, enabled: Boolean(user?.id) });
 const vehiclesQuery = useCustomerVehiclesQuery(user?.id);
 const requestsQuery = useCustomerRequestsQuery(user?.id);
 const vehicles = vehiclesQuery.data ?? [];
 const requests = requestsQuery.data ?? [];
 const refreshControl = useScreenRefresh(vehiclesQuery.refetch, requestsQuery.refetch);
 const activeRequests = selectActiveRequests(requests).slice(0, 3);

  const getStatusColor = (status: string) => {
  switch (status) {
  case 'pending': return 'bg-warning-container text-warning';
  case 'in_progress': return 'bg-primary-container/20 text-primary';
  case 'completed': return 'bg-surface-container-high text-secondary';
  case 'cancelled': return 'bg-error-container text-error';
  default: return 'bg-surface-container-high text-secondary';
  }
  };

 const getStatusLabel = (status: string) => {
 switch (status) {
 case 'pending': return 'قيد الانتظار';
 case 'in_progress': return 'قيد التنفيذ';
 case 'completed': return 'مكتمل';
 case 'cancelled': return 'ملغي';
 default: return status;
 }
 };

 // Loading state
 if (vehiclesQuery.isLoading || requestsQuery.isLoading) {
 return (
 <ScreenContainer>
 <View className="flex-col gap-stack-lg pt-6 pb-10">
 <SkeletonCard variant="metric" />
 <SkeletonCard />
 <SkeletonCard />
 <SkeletonCard />
 </View>
 </ScreenContainer>
 );
 }

 return (
 <ScreenContainer refreshControl={refreshControl}>
 <View className="flex-col pb-10">
 
 {/* Header Section */}
 <View className="flex-row-reverse items-center justify-between pt-6 pb-6">
 <View className="flex-col items-end">
 <Text className="font-body-md text-body-md text-secondary mb-1">مرحباً، {user?.fullName?.split(' ')[0] ?? 'عميلنا'}</Text>
 <Text className="font-display-lg-mobile text-display-lg-mobile font-bold text-on-surface text-right">{user?.fullName ?? 'مرحباً'}</Text>
 </View>
  <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface-container-lowest shadow-soft bg-surface-container-high flex items-center justify-center">
  <MaterialIcons name="person" size={28} color={AppColors.onSurfaceVariant} />
  </View>
 </View>


 <View className="flex-col gap-stack-lg">
 
 {/* Stats Row */}
 <View className="flex-row-reverse gap-gutter">
 <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-col justify-center items-center text-center">
 <Text className="font-display-lg-mobile text-display-lg-mobile font-bold text-error mb-1">{activeRequests.length}</Text>
 <Text className="font-label-sm text-label-sm text-secondary">طلبات نشطة</Text>
 </View>
 <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 shadow-soft flex-col justify-center items-center text-center">
 <Text className="font-display-lg-mobile text-display-lg-mobile font-bold text-on-surface mb-1">{vehicles.length}</Text>
 <Text className="font-label-sm text-label-sm text-secondary">سيارات مسجلة</Text>
 </View>
 </View>

  {/* Hero CTA */}
  <View className="bg-surface-container-lowest rounded-2xl p-2 shadow-soft">
  <AnimatedPressable
  accessibilityLabel="حجز موعد صيانة"
  accessibilityHint="الانتقال إلى حجز موعد في أقرب فرع"
  accessibilityRole="button"
  className="bg-primary rounded-xl p-5 flex-row-reverse items-center justify-between overflow-hidden"
  onPress={() => router.push('/book-branch')}
  >
  <View className="flex-row-reverse items-center gap-4 z-10">
  <View className="w-12 h-12 rounded-full bg-on-primary/20 flex items-center justify-center">
  <MaterialIcons name="calendar-month" size={28} color={AppColors.onPrimary} />
  </View>
  <View className="flex-col items-end">
  <Text className="font-title-md text-title-md font-bold text-on-primary mb-1 text-right">حجز موعد صيانة</Text>
  <Text className="font-label-sm text-label-sm text-on-primary opacity-90 text-right">احجز في أقرب مركز خدمة</Text>
  </View>
  </View>
  <MaterialIcons name="chevron-left" size={24} color={AppColors.onPrimary} className="z-10" />
  </AnimatedPressable>
  </View>

  {/* Quick Actions */}
  <View className="flex-col gap-stack-md">
  <Text className="font-title-md text-title-md font-bold text-on-surface text-right">إجراءات سريعة</Text>
  <View className="bg-surface-container-lowest rounded-2xl shadow-soft overflow-hidden flex-col">
  
  <AnimatedPressable
  accessibilityLabel="خدمة بالموقع"
  accessibilityHint="الفني يصل إليك"
  accessibilityRole="button"
  className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low"
  onPress={() => router.push('/book-service')}
  >
  <View className="flex-row-reverse items-center gap-4">
  <View className="w-10 h-10 rounded-lg bg-primary-container/20 flex items-center justify-center">
  <MaterialIcons name="location-on" size={24} color={AppColors.primary} />
  </View>
  <View className="flex-col items-end">
  <Text className="font-button-text text-button-text font-bold text-on-surface mb-1 text-right">خدمة بالموقع</Text>
  <Text className="font-label-sm text-label-sm text-secondary text-right">الفني يصل إليك</Text>
  </View>
  </View>
  <MaterialIcons name="chevron-left" size={24} color={AppColors.outline} />
  </AnimatedPressable>

  <AnimatedPressable
  accessibilityLabel="سياراتي"
  accessibilityHint="عرض وإدارة المركبات"
  accessibilityRole="button"
  className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low"
  onPress={() => router.push('/(tabs)/my-cars' as Href)}
  >
  <View className="flex-row-reverse items-center gap-4">
  <View className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
  <MaterialIcons name="directions-car" size={24} color={AppColors.secondary} />
  </View>
  <View className="flex-col items-end">
  <Text className="font-button-text text-button-text font-bold text-on-surface mb-1 text-right">سياراتي</Text>
  <Text className="font-label-sm text-label-sm text-secondary text-right">عرض وإدارة المركبات</Text>
  </View>
  </View>
  <MaterialIcons name="chevron-left" size={24} color={AppColors.outline} />
  </AnimatedPressable>

  <AnimatedPressable
  accessibilityLabel="خطط الصيانة"
  accessibilityHint="المواعيد القادمة"
  accessibilityRole="button"
  className="flex-row-reverse items-center justify-between p-4"
  onPress={() => router.push('/maintenance-plans')}
  >
  <View className="flex-row-reverse items-center gap-4">
  <View className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center">
  <MaterialIcons name="event-note" size={24} color={AppColors.error} />
  </View>
  <View className="flex-col items-end">
  <Text className="font-button-text text-button-text font-bold text-on-surface mb-1 text-right">خطط الصيانة</Text>
  <Text className="font-label-sm text-label-sm text-secondary text-right">المواعيد القادمة</Text>
  </View>
  </View>
  <MaterialIcons name="chevron-left" size={24} color={AppColors.outline} />
  </AnimatedPressable>

  </View>
  </View>

  {/* Recent Requests */}
  <View className="flex-col gap-stack-md">
  <View className="flex-row-reverse items-center justify-between">
  <Text className="font-title-md text-title-md font-bold text-on-surface">الطلبات الأخيرة</Text>
  <AnimatedPressable
  accessibilityLabel="عرض الكل"
  accessibilityRole="link"
  accessibilityHint="الانتقال إلى قائمة جميع الطلبات"
  className="min-h-11 justify-center px-1"
  onPress={() => router.push('/(tabs)/orders' as Href)}
  >
  <Text className="font-label-sm text-label-sm text-primary font-bold">عرض الكل</Text>
  </AnimatedPressable>
  </View>
  
  {activeRequests.length > 0 ? (
  <View className="flex-col gap-gutter">
  {activeRequests.map((request) => {
  const vehicle = vehicles.find((v) => v.id === request.vehicleId);
  const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'مركبة غير محددة';
  
  return (
  <AnimatedPressable
  key={request.id}
  accessibilityLabel={`طلب ${vehicleName}`}
  accessibilityHint="عرض تفاصيل الطلب"
  accessibilityRole="button"
  className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft"
  onPress={() => router.push({ pathname: '/order-details', params: { id: request.id } })}
  >
  <View className="flex-row-reverse justify-between items-start mb-3">
  <View className={`px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
  <Text className="font-label-sm text-label-sm font-bold text-center">{getStatusLabel(request.status)}</Text>
  </View>
  <MaterialIcons name="chevron-left" size={24} color={AppColors.outline} />
  </View>
  <Text className="font-button-text text-button-text font-bold text-on-surface mb-1 text-right">{vehicleName}</Text>
  <View className="flex-row-reverse items-center gap-2 mt-2">
  <MaterialIcons name="build" size={16} color={AppColors.secondary} />
  <Text className="text-secondary font-label-sm text-label-sm text-right">{request.requestType === 'branch_appointment' ? 'موعد في الفرع' : 'خدمة بالموقع'}</Text>
  <View className="w-1 h-1 rounded-full bg-outline-variant mx-1" />
  <MaterialIcons name="calendar-today" size={16} color={AppColors.secondary} />
  <Text className="text-secondary font-label-sm text-label-sm text-right">
  {request.scheduledAt ? new Date(request.scheduledAt).toLocaleDateString('ar-SA') : 'قريباً'}
  </Text>
  </View>
  </AnimatedPressable>
  );
  })}
  </View>
  ) : (
  <EmptyState
  message="لا توجد طلبات نشطة حالياً. ابدأ بحجز موعد صيانة."
  title="لا يوجد طلبات نشطة"
  />
  )}
  </View>

 </View>
 </View>
 </ScreenContainer>
 );
}
