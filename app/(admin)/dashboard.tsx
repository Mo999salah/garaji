import { router } from 'expo-router';
import { View, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import {
  selectActiveRequests,
  selectByStatus,
  selectCompletedToday,
} from '@/features/requests/selectors/requestSelectors';
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
    <View className="flex-1 bg-[#F7F7F8] pb-24 relative">
      {/* TopAppBar Semantic Shell Substitute */}
      <View className="flex-row-reverse justify-between items-center px-margin-mobile pt-8 pb-4 w-full z-40 bg-surface shadow-sm sticky top-0">
        <View className="flex-row-reverse items-center gap-3">
          <Pressable onPress={handleSignOut} className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden active:scale-95 transition-transform">
            <MaterialIcons name="logout" size={20} color="#6d7a77" />
          </Pressable>
        </View>
        <View className="items-end">
          <Text className="text-[14px] text-[#6B7280] font-body-md leading-tight text-right">مركز الخدمة</Text>
          <Text className="font-title-md text-[20px] text-[#1A1A2E] text-right font-bold">{user?.fullName ?? 'مركز الصيانة المتقدم'}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-margin-mobile pt-stack-md space-y-stack-lg" showsVerticalScrollIndicator={false}>
        
        {/* Metrics Grid */}
        <View className="grid flex-row-reverse flex-wrap gap-gutter mb-stack-lg">
          {/* Top Right */}
          <View className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-center justify-center text-center flex-1 min-w-[45%]">
            <Text className="text-[32px] leading-[40px] font-bold text-[#F59E0B]">{needsAction}</Text>
            <Text className="text-[14px] font-body-md text-[#6B7280] mt-1">تحتاج إجراء</Text>
          </View>
          {/* Top Left */}
          <View className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-center justify-center text-center flex-1 min-w-[45%]">
            <Text className="text-[32px] leading-[40px] font-bold text-[#0D9488]">{inProgress.length}</Text>
            <Text className="text-[14px] font-body-md text-[#6B7280] mt-1">قيد التنفيذ</Text>
          </View>
          {/* Bottom Right */}
          <View className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-center justify-center text-center flex-1 min-w-[45%] mt-4">
            <Text className="text-[32px] leading-[40px] font-bold text-[#1A1A2E]">{completedToday.length}</Text>
            <Text className="text-[14px] font-body-md text-[#6B7280] mt-1">مكتملة اليوم</Text>
          </View>
          {/* Bottom Left */}
          <View className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-center justify-center text-center flex-1 min-w-[45%] mt-4">
            <Text className="text-[32px] leading-[40px] font-bold text-[#1A1A2E]">{active.length}</Text>
            <Text className="text-[14px] font-body-md text-[#6B7280] mt-1">إجمالي نشطة</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-stack-lg">
          <Text className="font-title-md text-[20px] text-on-surface mb-stack-md text-right font-bold">اختصارات التشغيل</Text>
          <View className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
            <Pressable 
              onPress={() => router.push('/(admin)/manage-orders')}
              className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low hover:bg-surface-container-lowest transition-colors active:bg-surface-container-lowest"
            >
              <View className="flex-row-reverse items-center gap-3">
                <MaterialIcons name="inbox" size={24} color="#0D9488" />
                <Text className="font-body-md text-[16px] text-on-surface font-bold">مراجعة الطلبات</Text>
              </View>
              <MaterialIcons name="chevron-left" size={20} color="#6d7a77" />
            </Pressable>
            
            <Pressable 
              onPress={() => router.push('/(admin)/services')}
              className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low hover:bg-surface-container-lowest transition-colors active:bg-surface-container-lowest"
            >
              <View className="flex-row-reverse items-center gap-3">
                <MaterialIcons name="build" size={24} color="#6B7280" />
                <Text className="font-body-md text-[16px] text-on-surface font-bold">الخدمات والأسعار</Text>
              </View>
              <MaterialIcons name="chevron-left" size={20} color="#6d7a77" />
            </Pressable>

            <Pressable 
              onPress={() => router.push('/(admin)/branches')}
              className="flex-row-reverse items-center justify-between p-4 border-b border-surface-container-low hover:bg-surface-container-lowest transition-colors active:bg-surface-container-lowest"
            >
              <View className="flex-row-reverse items-center gap-3">
                <MaterialIcons name="map" size={24} color="#6B7280" />
                <Text className="font-body-md text-[16px] text-on-surface font-bold">الفروع والمواقع</Text>
              </View>
              <MaterialIcons name="chevron-left" size={20} color="#6d7a77" />
            </Pressable>

            <Pressable 
              onPress={() => router.push('/(admin)/technicians')}
              className="flex-row-reverse items-center justify-between p-4 hover:bg-surface-container-lowest transition-colors active:bg-surface-container-lowest"
            >
              <View className="flex-row-reverse items-center gap-3">
                <MaterialIcons name="group" size={24} color="#F59E0B" />
                <Text className="font-body-md text-[16px] text-on-surface font-bold">الفنيون والفريق</Text>
              </View>
              <MaterialIcons name="chevron-left" size={20} color="#6d7a77" />
            </Pressable>
          </View>
        </View>

        {/* Live Queue */}
        <View className="mb-stack-lg pb-10">
          <View className="flex-row-reverse items-center justify-between mb-stack-md">
            <Text className="font-title-md text-[20px] text-on-surface font-bold">قائمة العمل</Text>
            <Pressable onPress={() => router.push('/(admin)/manage-orders')}>
              <Text className="font-label-sm text-[13px] text-[#0D9488] hover:underline font-bold">عرض الكل</Text>
            </Pressable>
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
