import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import {
  selectActiveRequests,
  selectByStatus,
} from '@/features/requests/selectors/requestSelectors';
import type { ServiceRequest, ServiceRequestStatus } from '@/features/requests/types';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SkeletonCard } from '@/shared/components/SkeletonCard';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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
      className={`bg-surface rounded-[18px] p-gutter shadow-[0px_4px_20px_rgba(0,0,0,0.04)] relative overflow-hidden mb-4 transition-all duration-200 active:scale-[0.98] ${isCompleted ? 'opacity-90' : ''}`}
    >
      <View className="flex-row-reverse justify-between items-start mb-4">
        {isPending && (
          <View className="bg-[#FEF3C7] px-3 py-1 rounded-full flex-row-reverse items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            <Text className="text-[#D97706] font-label-sm text-[12px] font-bold">بانتظار القبول</Text>
          </View>
        )}
        {isConfirmed && (
          <View className="bg-primary/10 px-3 py-1 rounded-full flex-row-reverse items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-primary" />
            <Text className="text-primary font-label-sm text-[12px] font-bold">مؤكد</Text>
          </View>
        )}
        {isCompleted && (
          <View className="bg-[#D1FAE5] px-3 py-1 rounded-full flex-row-reverse items-center gap-1">
            <MaterialIcons name="check-circle" size={14} color="#059669" />
            <Text className="text-[#059669] font-label-sm text-[12px] font-bold">مكتمل</Text>
          </View>
        )}
        {(!isPending && !isConfirmed && !isCompleted) && (
          <View className="bg-surface-container-high px-3 py-1 rounded-full flex-row-reverse items-center gap-1">
            <Text className="text-on-surface-variant font-label-sm text-[12px] font-bold">
              {request.status === 'in_progress' ? 'قيد التنفيذ' : 'ملغى'}
            </Text>
          </View>
        )}
        
        <MaterialIcons name="more-vert" size={20} color="#3d4947" />
      </View>

      <View className="flex-row-reverse items-center gap-4 mb-4">
        <View className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
          <MaterialIcons name="person" size={24} color="#00685f" />
        </View>
        <View className="flex-1 items-end">
          <View className="flex-row-reverse justify-between items-center w-full">
            <Text className="font-title-md text-[16px] text-on-surface font-bold">عميل كراجي</Text>
            <Pressable className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
              <MaterialIcons name="call" size={18} color="#00685f" />
            </Pressable>
          </View>
          <View className="flex-row-reverse items-center gap-1 mt-1">
            <MaterialIcons name="directions-car" size={16} color="#3d4947" />
            <Text className="font-body-md text-[14px] text-on-surface-variant">المركبة</Text>
          </View>
        </View>
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

      {isPending && (
        <View className="flex-row-reverse gap-3">
          <Pressable className="flex-1 bg-primary h-[48px] rounded-xl flex items-center justify-center transition-opacity hover:opacity-90 active:scale-95">
            <Text className="text-white font-button-text text-[16px] font-bold">قبول</Text>
          </Pressable>
          <Pressable className="flex-1 bg-surface-container-low h-[48px] rounded-xl flex items-center justify-center transition-colors hover:bg-surface-container active:scale-95">
            <Text className="text-on-surface font-button-text text-[16px] font-bold">رفض</Text>
          </Pressable>
        </View>
      )}

      {isConfirmed && (
        <Pressable className="w-full bg-surface-container-high h-[48px] rounded-xl flex items-center justify-center transition-colors hover:bg-surface-variant active:scale-95">
          <Text className="text-primary font-button-text text-[16px] font-bold">بدء العمل</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export default function AdminManageOrdersScreen() {
  const { user } = useAuthStore();
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
      {/* TopAppBar */}
      <View className="bg-surface shadow-[0px_4px_20px_rgba(0,0,0,0.04)] w-full top-0 sticky z-40">
        <View className="flex-row-reverse justify-between items-center px-margin-mobile h-16 w-full">
          <Pressable onPress={() => router.back()} className="p-2 rounded-full hover:bg-surface-container-low active:scale-95 transition-all">
            <MaterialIcons name="menu" size={24} color="#00685f" />
          </Pressable>
          <Text className="font-title-md text-[20px] text-primary font-bold absolute left-1/2 -translate-x-1/2">إدارة الطلبات</Text>
          <View className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
            <MaterialIcons name="person" size={24} color="#6d7a77" style={{ marginTop: 4, alignSelf: 'center' }} />
          </View>
        </View>
      </View>

      <View className="flex-1">
        {/* Filter Tabs */}
        <View className="pt-stack-md pb-2">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-margin-mobile gap-gutter flex-row-reverse"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  className={`flex-row-reverse items-center justify-center px-6 py-2 rounded-full flex-shrink-0 shadow-sm border transition-all duration-200
                    ${isActive ? 'bg-primary border-primary' : 'bg-surface border-surface-container-highest hover:bg-surface-container-lowest'}
                  `}
                >
                  <Text className={`font-label-sm text-[13px] font-bold ${isActive ? 'text-white' : 'text-on-surface-variant'}`}>
                    {tab.label}
                  </Text>
                  {tab.id === 'pending' && tab.count > 0 && (
                    <View className="bg-[#F59E0B] w-4 h-4 rounded-full flex items-center justify-center mr-2">
                      <Text className="text-white text-[10px] font-bold">{tab.count}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
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
