import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View, Pressable, ScrollView, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { useCustomerRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import type { Vehicle } from '@/features/vehicles/types';
import type { ServiceRequest } from '@/features/requests/types';

export default function CustomerVehiclesScreen() {
  const user = useAuthStore((s) => s.user);
  
  const vehiclesQuery = useCustomerVehiclesQuery(user?.id);
  const requestsQuery = useCustomerRequestsQuery(user?.id);
  
  const { data: vehicles = [], error, isLoading } = vehiclesQuery;
  const { data: requests = [] } = requestsQuery;
  
  const refreshControl = useScreenRefresh(vehiclesQuery.refetch, requestsQuery.refetch);

  const getVehicleRequestsCount = (vehicleId: string) => {
    return requests.filter(r => r.vehicleId === vehicleId).length;
  };

  const getLatestMaintenanceDate = (vehicleId: string) => {
    const completedRequests = requests.filter(
      r => r.vehicleId === vehicleId && r.status === 'completed'
    ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    
    if (completedRequests.length > 0) {
      return `آخر صيانة: ${new Date(completedRequests[0]!.scheduledAt).toLocaleDateString('ar-SA')}`;
    }
    return 'لا يوجد سجل صيانة';
  };

  return (
    <View className="flex-1 bg-surface">
      {/* Top Bar */}
      <View className="z-40 bg-background/80 px-margin-mobile pt-10 pb-4 flex-row-reverse items-center justify-between">
        <Pressable 
          accessibilityLabel="رجوع"
          accessibilityRole="button"
          onPress={() => { if (router.canGoBack()) router.back(); else router.push('/(tabs)/'); }}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container-high"
        >
          <MaterialIcons name="arrow-forward" size={24} color="#1a1c1d" />
        </Pressable>
        <Text className="font-title-md text-[20px] leading-[28px] font-bold text-on-surface">سياراتي</Text>
        <View className="w-10 h-10" />
      </View>

      <ScrollView 
        className="flex-1 px-margin-mobile pt-stack-sm pb-[100px]"
        refreshControl={<RefreshControl refreshing={vehiclesQuery.isRefetching} onRefresh={vehiclesQuery.refetch} />}
      >
        <View className="flex-col gap-stack-md pb-32">
          {isLoading ? (
            [1, 2, 3].map((item) => <SkeletonCard key={item} variant="vehicle" />)
          ) : error ? (
            <EmptyState
              message={error instanceof Error ? error.message : 'تعذّر تحميل المركبات.'}
              title="خطأ في التحميل"
            />
          ) : vehicles.length ? (
            vehicles.map((vehicle) => {
              const reqCount = getVehicleRequestsCount(vehicle.id);
              return (
                <Pressable
                  key={vehicle.id}
                  onPress={() => router.push(`/edit-vehicle?id=${vehicle.id}`)}
                  className="w-full bg-surface-container-lowest rounded-[24px] p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-row-reverse items-center active:scale-[0.99] mb-4"
                >
                  {/* Right Icon */}
                  <View className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center ml-4">
                    <MaterialIcons name="directions-car" size={28} color="#f4fffc" />
                  </View>

                  {/* Middle Content */}
                  <View className="flex-1 flex-col justify-center items-end px-2">
                    <Text className="font-title-md text-[18px] leading-[28px] font-bold text-on-surface text-right w-full" numberOfLines={1} ellipsizeMode="tail">{vehicle.make} {vehicle.model}</Text>
                    <Text className="font-body-md text-[14px] leading-[24px] text-on-surface-variant mt-1 opacity-80 text-right w-full" numberOfLines={1} ellipsizeMode="tail">{vehicle.year} • {vehicle.color ?? 'لون غير محدد'} • {vehicle.plateNumber}</Text>
                    
                    {/* Status Row */}
                    <View className="flex-row-reverse items-center gap-2 mt-3">
                      <View className={`${reqCount > 0 ? 'bg-[#008378]/10 text-[#00685f]' : 'bg-surface-container-high text-on-surface-variant'} px-3 py-1 rounded-full`}>
                        <Text className={`font-label-sm text-[13px] leading-[18px] font-bold ${reqCount > 0 ? 'text-[#00685f]' : 'text-on-surface-variant'}`}>
                          {reqCount > 0 ? `${reqCount} طلبات` : 'لا توجد طلبات'}
                        </Text>
                      </View>
                      <Text className="font-label-sm text-[13px] leading-[18px] text-on-surface-variant opacity-70">
                        {getLatestMaintenanceDate(vehicle.id)}
                      </Text>
                    </View>
                  </View>

                  {/* Left Chevron */}
                  <View className="w-8 h-8 flex items-center justify-center rounded-full ml-2">
                    <MaterialIcons name="chevron-left" size={24} color="#bcc9c6" />
                  </View>
                </Pressable>
              );
            })
          ) : (
            <EmptyState
              message="أضف سياراتك لتتمكن من حجز خدمات الصيانة بسهولة."
              title="لا توجد سيارات"
              iconName="plus-circle"
              ctaText="أضف سيارة"
              onCtaPress={() => router.push('/add-vehicle')}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <Pressable 
        onPress={() => router.push('/add-vehicle')}
        className="absolute bottom-24 left-margin-mobile w-14 h-14 bg-primary rounded-full shadow-[0px_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-center active:scale-90 z-40"
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}
