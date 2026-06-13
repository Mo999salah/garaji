import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import { selectByStatus } from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequest, ServiceRequestStatus } from '@/features/requests/types';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { FilterChips } from '@/shared/components/FilterChips';
import { AppHeader } from '@/shared/components/AppHeader';

type OrdersTab = 'all' | ServiceRequestStatus;

const TABS: { id: OrdersTab; label: string }[] = [
 { id: 'all', label: 'الكل' },
 { id: 'pending', label: 'بانتظار' },
 { id: 'confirmed', label: 'مؤكدة' },
 { id: 'in_progress', label: 'قيد التنفيذ' },
 { id: 'completed', label: 'مكتملة' },
 { id: 'cancelled', label: 'ملغاة' },
];

const SKELETON_ITEMS = [
 'admin-orders-skeleton-1',
 'admin-orders-skeleton-2',
 'admin-orders-skeleton-3',
 'admin-orders-skeleton-4',
];

function AdminOrderCard({ request, onPress }: { request: ServiceRequest; onPress: () => void }) {
 const isPending = request.status === 'pending';
 const isConfirmed = request.status === 'confirmed';
 const isCompleted = request.status === 'completed';

 const dateStr = request.scheduledAt 
 ? new Date(request.scheduledAt).toLocaleString('ar-SA', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) 
 : 'غير محدد';

 return (
 <Pressable 
 onPress={onPress}
 className={`bg-surface rounded-2xl p-gutter shadow-soft relative overflow-hidden mb-4 active:scale-[0.98] ${isCompleted ? 'opacity-90' : ''}`}
 >
      <View className="flex-row-reverse justify-between items-start mb-4">
        {isPending && <StatusBadge label="بانتظار القبول" variant="warning" />}
        {isConfirmed && <StatusBadge label="مؤكد" variant="primary" />}
        {isCompleted && <StatusBadge label="مكتمل" variant="success" icon="check-circle" />}
        {(!isPending && !isConfirmed && !isCompleted) && (
          <StatusBadge label={request.status === 'in_progress' ? 'قيد التنفيذ' : 'ملغى'} variant="default" />
        )}
        <MaterialIcons name="more-vert" size={20} color="#3d4947" />
      </View>

 <View className="flex-row-reverse gap-4 mb-4 bg-surface-container-lowest border border-surface-container-low p-3 rounded-xl">
 <View className="flex-1 items-end">
 <Text className="font-label-sm text-[12px] text-on-surface-variant">الخدمة</Text>
 <Text className="font-body-md text-[14px] text-on-surface mt-0.5">{request.serviceId || 'خدمة صيانة'}</Text>
 </View>
 <View className="flex-1 items-end">
 <Text className="font-label-sm text-[12px] text-on-surface-variant">السعر</Text>
 <Text className="font-title-md text-[14px] text-primary mt-0.5 font-bold">{request.estimatedPrice ? `${request.estimatedPrice} ريال` : 'غير محدد'}</Text>
 </View>
 </View>

 <View className="flex-row-reverse items-center gap-2 mb-5">
 <MaterialIcons name="calendar-today" size={18} color="#3d4947" />
 <Text className="font-body-md text-[14px] text-on-surface-variant">{dateStr}</Text>
 </View>
 </Pressable>
 );
}

export default function AdminManageOrdersScreen() {
 const requestsQuery = useAllRequestsQuery();
 const { data: requests = [], isLoading } = requestsQuery;
 const refreshControl = useScreenRefresh(requestsQuery.refetch);
 const [activeTab, setActiveTab] = useState<OrdersTab>('all');

 useRequestRealtimeListener();

 const displayed =
 activeTab === 'all' ? requests : selectByStatus(requests, activeTab as ServiceRequestStatus);

 const tabs = TABS.map((tab) => ({
 ...tab,
 count:
 tab.id === 'all'
 ? requests.length
 : selectByStatus(requests, tab.id as ServiceRequestStatus).length,
 }));

 return (
 <View className="flex-1 bg-background pb-[80px] relative">
      <AppHeader 
        title="إدارة الطلبات" 
        showBack={false}
        trailing={
          <View className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
            <MaterialIcons name="person" size={24} color="#6d7a77" style={{ marginTop: 4, alignSelf: 'center' }} />
          </View>
        }
      />

      <View className="flex-1">
        <View className="pt-stack-md pb-2">
          <FilterChips<OrdersTab>
            options={tabs}
            activeId={activeTab}
            onChange={setActiveTab}
          />
        </View>

 <ScrollView 
 contentContainerClassName="p-margin-mobile"
 showsVerticalScrollIndicator={false}
 refreshControl={refreshControl}
 >
 {isLoading ? (
 <View className="gap-4">
 {SKELETON_ITEMS.map((item) => <SkeletonCard key={item} />)}
 </View>
 ) : displayed.length === 0 ? (
 <EmptyState message="لا توجد طلبات في هذه الحالة." title="لا طلبات" />
 ) : (
 <View>
 {displayed.map((request) => (
 <AdminOrderCard
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
 )}
 </ScrollView>
 </View>
 </View>
 );
}
