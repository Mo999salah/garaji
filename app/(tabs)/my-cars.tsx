import { router } from 'expo-router';
import { View, ScrollView, RefreshControl, I18nManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { useCustomerRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { AppHeader } from '@/shared/components/AppHeader';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { AppColors } from '@/shared/lib/colors';

export default function CustomerVehiclesScreen() {
 const user = useAuthStore((s) => s.user);
 
 const vehiclesQuery = useCustomerVehiclesQuery(user?.id);
 const requestsQuery = useCustomerRequestsQuery(user?.id);
 
 const { data: vehicles = [], error, isLoading } = vehiclesQuery;
 const { data: requests = [] } = requestsQuery;
 
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
      <AppHeader 
        title="سياراتي" 
        showBack={false}
        trailing={
          <AnimatedPressable
            accessibilityLabel={router.canGoBack() ? 'رجوع' : 'إغلاق'}
            accessibilityRole="button"
            onPress={() => { if (router.canGoBack()) router.back(); else router.push('/(tabs)/'); }}
            className="w-10 h-10 flex items-center justify-center rounded-full"
          >
            <MaterialIcons name="arrow-forward" size={24} color={AppColors.onSurface} />
          </AnimatedPressable>
        }
      />

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
  <AnimatedPressable
            key={vehicle.id}
            onPress={() => router.push(`/edit-vehicle?id=${vehicle.id}`)}
            accessibilityLabel={`${vehicle.make} ${vehicle.model}`}
            accessibilityHint="تحرير بيانات المركبة"
            accessibilityRole="button"
            className="w-full bg-surface-container-lowest rounded-3xl p-4 shadow-soft flex-row-reverse items-center mb-4"
          >
            {/* Right Icon */}
            <View className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center ml-4">
              <MaterialIcons name="directions-car" size={28} color={AppColors.onPrimaryContainer} />
            </View>

            {/* Middle Content */}
            <View className="flex-1 flex-col justify-center items-end px-2">
              <Text className="text-title-md font-bold text-on-surface text-right w-full" numberOfLines={1} ellipsizeMode="tail">{vehicle.make} {vehicle.model}</Text>
              <Text className="text-body-md text-on-surface-variant mt-1 opacity-80 text-right w-full" numberOfLines={1} ellipsizeMode="tail">{vehicle.year} • {vehicle.color ?? 'لون غير محدد'} • {vehicle.plateNumber}</Text>

              {/* Status Row */}
              <View className="flex-row-reverse items-center gap-2 mt-3">
                <StatusBadge
                  label={reqCount > 0 ? `${reqCount} طلبات` : 'لا توجد طلبات'}
                  variant={reqCount > 0 ? 'primary' : 'default'}
                />
                <Text className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
                  {getLatestMaintenanceDate(vehicle.id)}
                </Text>
              </View>
            </View>

            {/* Left Chevron */}
            <View className="w-8 h-8 flex items-center justify-center rounded-full ml-2">
              <MaterialIcons name="chevron-left" size={24} color={AppColors.outlineVariant} />
            </View>
          </AnimatedPressable>
 );
 })
 ) : (
 <EmptyState
 message="أضف سياراتك لتتمكن من حجز خدمات الصيانة بسهولة."
 title="لا توجد سيارات"
 iconName="add-circle"
 ctaText="أضف سيارة"
 onCtaPress={() => router.push('/add-vehicle')}
 />
 )}
 </View>
 </ScrollView>

  {/* Floating Action Button (FAB) */}
  <AnimatedPressable
        onPress={() => router.push('/add-vehicle')}
        accessibilityLabel="إضافة مركبة جديدة"
        accessibilityRole="button"
        className={`absolute bottom-24 ${I18nManager.isRTL ? 'right-margin-mobile' : 'left-margin-mobile'} w-14 h-14 bg-primary rounded-full shadow-elevated flex items-center justify-center z-40`}
      >
        <MaterialIcons name="add" size={28} color={AppColors.onPrimary} />
      </AnimatedPressable>
 </View>
 );
}
