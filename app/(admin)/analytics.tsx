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
      // Mocks for UI parity with the design
      avgRating: '4.7 ★',
      newCustomers: 12,
      acceptanceRate: '94%',
    };
  }, [filteredRequests]);

  const periods: AnalyticsPeriod[] = ['all', '7d', '30d', '90d'];

  return (
    <View className="flex-1 bg-background pb-[80px] relative">
      {/* Top Navigation Bar */}
      <View className="bg-surface shadow-[0px_4px_20px_rgba(0,0,0,0.04)] w-full top-0 sticky z-40 flex flex-row-reverse justify-between items-center px-margin-mobile h-16 transition-all duration-300">
        <Pressable 
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors active:opacity-80"
        >
          <MaterialIcons name="menu" size={24} color="#3d4947" />
        </Pressable>
        <Text className="font-display-lg-mobile text-[20px] font-extrabold text-primary flex-1 text-center tracking-tight">التحليلات</Text>
        <View className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer flex items-center justify-center">
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
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              className="flex-row-reverse gap-2"
              contentContainerStyle={{ paddingRight: 4 }}
            >
              {periods.map(p => (
                <Pressable
                  key={p}
                  onPress={() => setPeriod(p)}
                  className={`px-6 py-2.5 rounded-full ml-2 transition-all active:scale-95 ${period === p ? 'bg-[#0D9488] shadow-md' : 'bg-surface shadow-sm hover:bg-surface-container'}`}
                >
                  <Text className={`font-button-text text-[16px] font-bold ${period === p ? 'text-white' : 'text-on-surface-variant'}`}>
                    {PERIOD_LABELS[p]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Revenue Card */}
            <View className="bg-surface-container-lowest rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]">
              <Text className="font-body-md text-[16px] text-[#6B7280] mb-2 text-right">الإيرادات</Text>
              <Text className="font-display-lg-mobile text-[28px] font-extrabold text-[#0D9488] mb-6 text-right">
                {stats.revenue.toLocaleString('ar-SA')} ريال
              </Text>
              
              {/* Minimal Chart Visualization (Simplified without SVG) */}
              <View className="relative h-32 w-full flex-col justify-end px-2">
                <View className="absolute inset-0 flex-col justify-between pointer-events-none border-b border-[#F3F4F6] pb-6">
                  <View className="w-full border-t border-[#F3F4F6] h-[1px]" />
                  <View className="w-full border-t border-[#F3F4F6] h-[1px]" />
                  <View className="w-full border-t border-[#F3F4F6] h-[1px]" />
                </View>
                {/* Fake Line Chart */}
                <View className="absolute inset-x-0 bottom-6 h-16 pointer-events-none items-center justify-center">
                  <View className="w-full h-full border-b-[3px] border-[#0D9488] opacity-50 rounded-[100%]" style={{ borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 }} />
                </View>

                <View className="flex-row-reverse justify-between w-full mt-auto pt-2">
                  <Text className="font-label-sm text-[11px] text-[#6B7280]">السبت</Text>
                  <Text className="font-label-sm text-[11px] text-[#6B7280]">الأحد</Text>
                  <Text className="font-label-sm text-[11px] text-[#6B7280]">الإثنين</Text>
                  <Text className="font-label-sm text-[11px] text-[#6B7280]">الثلاثاء</Text>
                  <Text className="font-label-sm text-[11px] text-[#6B7280]">الأربعاء</Text>
                  <Text className="font-label-sm text-[11px] text-[#6B7280]">الخميس</Text>
                  <Text className="font-label-sm text-[11px] text-[#6B7280]">الجمعة</Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row-reverse flex-wrap justify-between gap-y-4">
              <View className="w-[48%] bg-surface-container-lowest rounded-2xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-end">
                <Text className="font-label-sm text-[13px] text-[#6B7280] mb-2 text-right">طلبات مكتملة</Text>
                <Text className="font-title-md text-[20px] text-on-background font-bold text-right">{stats.completed}</Text>
              </View>
              <View className="w-[48%] bg-surface-container-lowest rounded-2xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-end">
                <Text className="font-label-sm text-[13px] text-[#6B7280] mb-2 text-right">متوسط التقييم</Text>
                <Text className="font-title-md text-[20px] text-amber-500 font-bold text-right" style={{ writingDirection: 'ltr' }}>{stats.avgRating}</Text>
              </View>
              <View className="w-[48%] bg-surface-container-lowest rounded-2xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-end">
                <Text className="font-label-sm text-[13px] text-[#6B7280] mb-2 text-right">عملاء جدد</Text>
                <Text className="font-title-md text-[20px] text-on-background font-bold text-right">{stats.newCustomers}</Text>
              </View>
              <View className="w-[48%] bg-surface-container-lowest rounded-2xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col items-end">
                <Text className="font-label-sm text-[13px] text-[#6B7280] mb-2 text-right">معدل القبول</Text>
                <Text className="font-title-md text-[20px] text-[#0D9488] font-bold text-right">{stats.acceptanceRate}</Text>
              </View>
            </View>

            {/* Top Services */}
            <View>
              <Text className="font-title-md text-[20px] text-on-background mb-4 font-bold text-right">الخدمات الأكثر طلباً</Text>
              <View className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex-col gap-5">
                
                {/* Service 1 */}
                <View className="flex-col gap-2">
                  <View className="flex-row-reverse justify-between items-center">
                    <Text className="font-body-md text-[16px] text-on-background text-right">تغيير زيت</Text>
                    <Text className="font-label-sm text-[13px] text-[#6B7280]">35%</Text>
                  </View>
                  <View className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden flex-row-reverse">
                    <View className="h-full bg-[#0D9488] rounded-full w-[35%]" />
                  </View>
                </View>

                {/* Service 2 */}
                <View className="flex-col gap-2">
                  <View className="flex-row-reverse justify-between items-center">
                    <Text className="font-body-md text-[16px] text-on-background text-right">فحص شامل</Text>
                    <Text className="font-label-sm text-[13px] text-[#6B7280]">25%</Text>
                  </View>
                  <View className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden flex-row-reverse">
                    <View className="h-full bg-[#0D9488] rounded-full w-[25%] opacity-80" />
                  </View>
                </View>

                {/* Service 3 */}
                <View className="flex-col gap-2">
                  <View className="flex-row-reverse justify-between items-center">
                    <Text className="font-body-md text-[16px] text-on-background text-right">فرامل</Text>
                    <Text className="font-label-sm text-[13px] text-[#6B7280]">15%</Text>
                  </View>
                  <View className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden flex-row-reverse">
                    <View className="h-full bg-[#0D9488] rounded-full w-[15%] opacity-60" />
                  </View>
                </View>

              </View>
            </View>

          </>
        )}
      </ScrollView>
    </View>
  );
}
