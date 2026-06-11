import { router } from 'expo-router';
import { View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { Href } from 'expo-router';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import { useCustomerRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { selectActiveRequests } from '@/features/requests/selectors/requestSelectors';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

export default function CustomerHomeScreen() {
  const { signOut, user } = useAuthStore();
  useRequestRealtimeListener({ customerId: user?.id, enabled: Boolean(user?.id) });
  const vehiclesQuery = useCustomerVehiclesQuery(user?.id);
  const requestsQuery = useCustomerRequestsQuery(user?.id);
  const vehicles = vehiclesQuery.data ?? [];
  const requests = requestsQuery.data ?? [];
  const refreshControl = useScreenRefresh(vehiclesQuery.refetch, requestsQuery.refetch);
  const activeRequests = selectActiveRequests(requests).slice(0, 3);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      case 'in_progress': return 'bg-[#008378]/20 text-[#00685f]'; // primary-container text-primary
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

  return (
    <ScreenContainer refreshControl={refreshControl}>
      <View className="flex-col pb-10">
        
        {/* Header Section */}
        <View className="flex-row-reverse items-center justify-between pt-6 pb-6">
          <View className="flex-col items-end">
            <Text className="font-body-md text-[16px] leading-[24px] text-secondary mb-1">مرحباً، {user?.fullName?.split(' ')[0] ?? 'عميلنا'}</Text>
            <Text className="font-display-lg-mobile text-[28px] leading-[36px] font-bold text-on-surface text-right">{user?.fullName ?? 'مرحباً'}</Text>
          </View>
          <View className="w-14 h-14 rounded-full overflow-hidden border-2 border-surface-container-lowest shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-surface-container-high flex items-center justify-center">
            <MaterialIcons name="person" size={28} color="#6d7a77" />
          </View>
        </View>


        <View className="flex-col gap-stack-lg">
          
          {/* Stats Row */}
          <View className="flex-row-reverse gap-gutter">
            <View className="flex-1 bg-surface-container-lowest rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col justify-center items-center text-center">
              <Text className="font-display-lg-mobile text-[28px] leading-[36px] font-bold text-error mb-1">{activeRequests.length}</Text>
              <Text className="font-label-sm text-[13px] leading-[18px] text-secondary">طلبات نشطة</Text>
            </View>
            <View className="flex-1 bg-surface-container-lowest rounded-[16px] p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col justify-center items-center text-center">
              <Text className="font-display-lg-mobile text-[28px] leading-[36px] font-bold text-on-surface mb-1">{vehicles.length}</Text>
              <Text className="font-label-sm text-[13px] leading-[18px] text-secondary">سيارات مسجلة</Text>
            </View>
          </View>

          {/* Hero CTA */}
          <View className="bg-surface-container-lowest rounded-2xl p-2 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
            <Pressable 
              className="bg-primary rounded-xl p-5 flex-row-reverse items-center justify-between active:scale-[0.98] overflow-hidden"
              onPress={() => router.push('/book-branch')}
            >
              <View className="flex-row-reverse items-center gap-4 z-10">
                <View className="w-12 h-12 rounded-full bg-on-primary/20 flex items-center justify-center">
                  <MaterialIcons name="calendar-month" size={28} color="#ffffff" />
                </View>
                <View className="flex-col items-end">
                  <Text className="font-title-md text-[20px] leading-[28px] font-bold text-on-primary mb-1 text-right">حجز موعد صيانة</Text>
                  <Text className="font-label-sm text-[13px] leading-[18px] text-[#f4fffc] opacity-90 text-right">احجز في أقرب مركز خدمة</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-left" size={24} color="#ffffff" className="z-10" />
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View className="flex-col gap-stack-md">
            <Text className="font-title-md text-[20px] leading-[28px] font-bold text-on-surface text-right">إجراءات سريعة</Text>
            <View className="bg-surface-container-lowest rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden flex-col">
              
              <Pressable 
                className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low active:bg-surface-container-high"
                onPress={() => router.push('/book-service')}
              >
                <View className="flex-row-reverse items-center gap-4">
                  <View className="w-10 h-10 rounded-lg bg-[#008378]/20 flex items-center justify-center">
                    <MaterialIcons name="location-on" size={24} color="#00685f" />
                  </View>
                  <View className="flex-col items-end">
                    <Text className="font-button-text text-[16px] leading-[16px] font-bold text-on-surface mb-1 text-right">خدمة بالموقع</Text>
                    <Text className="font-label-sm text-[13px] leading-[18px] text-secondary text-right">الفني يصل إليك</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-left" size={24} color="#6d7a77" />
              </Pressable>

              <Pressable 
                className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low active:bg-surface-container-high"
                onPress={() => router.push('/(tabs)/my-cars' as Href)}
              >
                <View className="flex-row-reverse items-center gap-4">
                  <View className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
                    <MaterialIcons name="directions-car" size={24} color="#5d5c74" />
                  </View>
                  <View className="flex-col items-end">
                    <Text className="font-button-text text-[16px] leading-[16px] font-bold text-on-surface mb-1 text-right">سياراتي</Text>
                    <Text className="font-label-sm text-[13px] leading-[18px] text-secondary text-right">عرض وإدارة المركبات</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-left" size={24} color="#6d7a77" />
              </Pressable>

              <Pressable 
                className="flex-row-reverse items-center justify-between p-4 active:bg-surface-container-high"
                onPress={() => router.push('/maintenance-plans')}
              >
                <View className="flex-row-reverse items-center gap-4">
                  <View className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center">
                    <MaterialIcons name="event-note" size={24} color="#ba1a1a" />
                  </View>
                  <View className="flex-col items-end">
                    <Text className="font-button-text text-[16px] leading-[16px] font-bold text-on-surface mb-1 text-right">خطط الصيانة</Text>
                    <Text className="font-label-sm text-[13px] leading-[18px] text-secondary text-right">المواعيد القادمة</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-left" size={24} color="#6d7a77" />
              </Pressable>

            </View>
          </View>

          {/* Recent Requests */}
          <View className="flex-col gap-stack-md">
            <View className="flex-row-reverse items-center justify-between">
              <Text className="font-title-md text-[20px] leading-[28px] font-bold text-on-surface">الطلبات الأخيرة</Text>
              <Pressable onPress={() => router.push('/(tabs)/orders' as Href)}>
                <Text className="font-label-sm text-[13px] leading-[18px] text-primary font-bold">عرض الكل</Text>
              </Pressable>
            </View>
            
            {activeRequests.length > 0 ? (
              <View className="flex-col gap-gutter">
                {activeRequests.map((request) => {
                  const vehicle = vehicles.find((v) => v.id === request.vehicleId);
                  const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}` : 'مركبة غير محددة';
                  
                  return (
                  <Pressable 
                    key={request.id}
                    className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] active:scale-[0.98]"
                    onPress={() => router.push({ pathname: '/order-details', params: { id: request.id } })}
                  >
                    <View className="flex-row-reverse justify-between items-start mb-3">
                      <View className={`px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
                        <Text className="font-label-sm text-[13px] leading-[18px] font-bold text-center">{getStatusLabel(request.status)}</Text>
                      </View>
                      <MaterialIcons name="chevron-left" size={24} color="#6d7a77" />
                    </View>
                    <Text className="font-button-text text-[16px] leading-[16px] font-bold text-on-surface mb-1 text-right">{vehicleName}</Text>
                    <View className="flex-row-reverse items-center gap-2 mt-2">
                      <MaterialIcons name="build" size={16} color="#5d5c74" />
                      <Text className="text-secondary font-label-sm text-[13px] leading-[18px] text-right">{request.requestType === 'branch_appointment' ? 'موعد في الفرع' : 'خدمة بالموقع'}</Text>
                      <View className="w-1 h-1 rounded-full bg-outline-variant mx-1" />
                      <MaterialIcons name="calendar-today" size={16} color="#5d5c74" />
                      <Text className="text-secondary font-label-sm text-[13px] leading-[18px] text-right">
                        {request.scheduledAt ? new Date(request.scheduledAt).toLocaleDateString('ar-SA') : 'قريباً'}
                      </Text>
                    </View>
                  </Pressable>
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
