import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import { useCustomerRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import {
 selectActiveRequests,
 selectCancelledRequests,
 selectCompletedRequests,
} from '@/features/requests/selectors/requestSelectors';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import { AppHeader } from '@/shared/components/AppHeader';
import { FilterChips } from '@/shared/components/FilterChips';

type OrdersTab = 'all' | 'active' | 'completed' | 'cancelled';

const SKELETON_ITEMS = ['orders-skeleton-1', 'orders-skeleton-2', 'orders-skeleton-3'];

export default function CustomerOrdersScreen() {
 const user = useAuthStore((s) => s.user);
 useRequestRealtimeListener({ customerId: user?.id, enabled: Boolean(user?.id) });
 
 const requestsQuery = useCustomerRequestsQuery(user?.id);
 const requests = requestsQuery.data ?? [];
 const isLoading = requestsQuery.isLoading;
 const refreshControl = useScreenRefresh(requestsQuery.refetch);

 const { data: vehicles = [] } = useCustomerVehiclesQuery(user?.id);
 const getVehicleName = (vehicleId: string) => {
 const v = vehicles.find((v) => v.id === vehicleId);
 return v ? `${v.make} ${v.model} ${v.year}` : undefined;
 };

 const [activeTab, setActiveTab] = useState<OrdersTab>('all');

 const active = selectActiveRequests(requests);
 const completed = selectCompletedRequests(requests);
 const cancelled = selectCancelledRequests(requests);

 const displayed =
 activeTab === 'all'
 ? requests
 : activeTab === 'active'
 ? active
 : activeTab === 'completed'
 ? completed
 : cancelled;

 const tabs: { id: OrdersTab; label: string }[] = [
 { id: 'all', label: 'الكل' },
 { id: 'active', label: 'نشطة' },
 { id: 'completed', label: 'مكتملة' },
 { id: 'cancelled', label: 'ملغاة' },
 ];

 return (
 <View className="flex-1 bg-background">
      <AppHeader 
        title="طلباتي" 
        showBack={false} 
        trailing={
          <Pressable 
            accessibilityLabel="الإشعارات"
            accessibilityRole="button"
            onPress={() => router.push('/notifications')}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-surface-container-high"
          >
            <MaterialIcons name="notifications" size={24} color="#00685f" />
          </Pressable>
        } 
      />

      <ScrollView
        contentContainerClassName="pt-stack-md flex-col gap-stack-lg pb-32"
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <FilterChips<OrdersTab>
          options={tabs}
          activeId={activeTab}
          onChange={setActiveTab}
        />

 {/* Requests List */}
 <View className="flex-col gap-stack-md px-margin-mobile">
 {isLoading ? (
 SKELETON_ITEMS.map((item) => <SkeletonCard key={item} />)
 ) : displayed.length === 0 ? (
 <EmptyState
 message={
 activeTab === 'all'
 ? 'ليس لديك أي طلبات حالياً.'
 : activeTab === 'active'
 ? 'ليس لديك طلبات نشطة حالياً.'
 : activeTab === 'completed'
 ? 'لا يوجد طلبات مكتملة بعد.'
 : 'لا يوجد طلبات ملغاة.'
 }
 title={
 activeTab === 'all'
 ? 'لا توجد طلبات'
 : activeTab === 'active'
 ? 'لا طلبات نشطة'
 : activeTab === 'completed'
 ? 'لا طلبات مكتملة'
 : 'لا طلبات ملغاة'
 }
 iconName="list"
 ctaText={activeTab === 'all' ? 'احجز موعد صيانة' : undefined}
 onCtaPress={activeTab === 'all' ? () => router.push('/book-service') : undefined}
 />
 ) : (
 displayed.map((request) => (
 <RequestCard
 key={request.id}
 onPress={() =>
 router.push({
 pathname: '/order-details',
 params: { id: request.id },
 })
 }
 request={request}
 vehicleName={getVehicleName(request.vehicleId)}
 />
 ))
 )}
 </View>
 </ScrollView>
 </View>
 );
}
