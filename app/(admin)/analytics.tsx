import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import {
 filterRequestsByPeriod,
 selectCompletedRequests,
 type AnalyticsPeriod,
} from '@/features/requests/selectors/requestSelectors';
import { AppText as Text } from '@/shared/components/AppText';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';
import { FilterChips } from '@/shared/components/FilterChips';

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
 '7d': 'الأسبوع',
 '30d': 'الشهر',
 '90d': 'السنة',
 all: 'الكل',
};

export default function AdminAnalyticsScreen() {
 const requestsQuery = useAllRequestsQuery();
 const { data: requests = [], isLoading } = requestsQuery;
 const refreshControl = useScreenRefresh(requestsQuery.refetch);
 
 const [period, setPeriod] = useState<AnalyticsPeriod>('7d');

 const filteredRequests = useMemo(
 () => filterRequestsByPeriod(requests, period),
 [period, requests],
 );

  const stats = useMemo(() => {
  const completed = selectCompletedRequests(filteredRequests);

  const revenue = completed.reduce((sum, request) => {
  const value = request.finalPrice ?? request.estimatedPrice ?? 0;
  return sum + value;
  }, 0);

  return {
  total: filteredRequests.length,
  completed: completed.length,
  revenue,
  };
  }, [filteredRequests]);

 const periods: AnalyticsPeriod[] = ['all', '7d', '30d', '90d'];

 return (
 <View className="flex-1 bg-background pb-[80px] relative">
 {/* Top Navigation Bar */}
 <View className="bg-surface shadow-soft w-full z-40 flex flex-row-reverse justify-between items-center px-margin-mobile h-16">
 <Pressable 
 className="w-10 h-10 flex items-center justify-center rounded-full active:opacity-80"
 >
 <MaterialIcons name="menu" size={24} color="#3d4947" />
 </Pressable>
 <Text className="font-display-lg-mobile text-[20px] font-extrabold text-primary flex-1 text-center tracking-tight">التحليلات</Text>
 <View className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center">
 <MaterialIcons name="person" size={20} color="#3d4947" />
 </View>
 </View>

 <ScrollView 
 contentContainerClassName="px-margin-mobile py-stack-md flex-col gap-stack-lg"
 showsVerticalScrollIndicator={false}
 refreshControl={refreshControl}
 >
 {isLoading ? (
 <LoadingSpinner label="جارٍ تحميل التحليلات..." />
 ) : (
 <>
 {/* Period Selector */}
 <View className="-mx-margin-mobile px-margin-mobile pb-4">
 <FilterChips<AnalyticsPeriod>
 options={periods.map(p => ({ id: p, label: PERIOD_LABELS[p] }))}
 activeId={period}
 onChange={setPeriod}
 />
 </View>

 {/* Revenue Card */}
 <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-soft">
 <Text className="font-body-md text-[16px] text-on-surface-variant mb-2 text-right">الإيرادات</Text>
 <Text className="font-display-lg-mobile text-[28px] font-extrabold text-primary mb-6 text-right">
 {stats.revenue.toLocaleString('ar-SA')} ريال
 </Text>
 
  </View>

  {/* Stats Grid */}
  <View className="flex-row-reverse flex-wrap justify-between gap-y-4">
  <View className="w-[48%] bg-surface-container-lowest rounded-2xl p-5 shadow-soft flex-col items-end">
  <Text className="font-label-sm text-label-sm text-on-surface-variant mb-2 text-right">إجمالي الطلبات</Text>
  <Text className="font-title-md text-[20px] text-on-background font-bold text-right">{stats.total}</Text>
  </View>
  <View className="w-[48%] bg-surface-container-lowest rounded-2xl p-5 shadow-soft flex-col items-end">
  <Text className="font-label-sm text-label-sm text-on-surface-variant mb-2 text-right">طلبات مكتملة</Text>
  <Text className="font-title-md text-[20px] text-on-background font-bold text-right">{stats.completed}</Text>
  </View>
  </View>

  </>
 )}
 </ScrollView>
 </View>
 );
}
