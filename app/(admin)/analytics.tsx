import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { useAllRequestsQuery } from '@/features/requests/hooks/useRequestsQuery';
import {
  filterRequestsByPeriod,
  selectByStatus,
  selectCompletedRequests,
  type AnalyticsPeriod,
} from '@/features/requests/selectors/requestSelectors';
import { AppCard } from '@/shared/components/AppCard';
import { CommandHeader, FilterTabs, MetricTile, SectionHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

import { AppText as Text } from '@/shared/components/AppText';

const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
  '7d': 'آخر 7 أيام',
  '30d': 'آخر 30 يوماً',
  '90d': 'آخر 90 يوماً',
  all: 'كل الفترات',
};

export default function AdminAnalyticsScreen() {
  const requestsQuery = useAllRequestsQuery();
  const { data: requests = [], isLoading } = requestsQuery;
  const refreshControl = useScreenRefresh(requestsQuery.refetch);
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  const filteredRequests = useMemo(
    () => filterRequestsByPeriod(requests, period),
    [period, requests],
  );

  const stats = useMemo(() => {
    const completed = selectCompletedRequests(filteredRequests);
    const pending = selectByStatus(filteredRequests, 'pending');
    const inProgress = selectByStatus(filteredRequests, 'in_progress');
    const cancelled = selectByStatus(filteredRequests, 'cancelled');

    const revenue = completed.reduce((sum, request) => {
      const value = request.finalPrice ?? request.estimatedPrice ?? 0;
      return sum + value;
    }, 0);

    return {
      total: filteredRequests.length,
      completed: completed.length,
      pending: pending.length,
      inProgress: inProgress.length,
      cancelled: cancelled.length,
      revenue,
    };
  }, [filteredRequests]);

  const periodTabs = [
    { id: '7d' as const, label: '7 أيام' },
    { id: '30d' as const, label: '30 يوماً' },
    { id: '90d' as const, label: '90 يوماً' },
    { id: 'all' as const, label: 'الكل' },
  ];

  if (isLoading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingSpinner label="جارٍ تحميل التحليلات..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshControl={refreshControl}>
      <View className="gap-5">
        <CommandHeader
          eyebrow="التحليلات"
          subtitle={`مؤشرات التشغيل والإيرادات لـ ${PERIOD_LABELS[period]}.`}
          title="مؤشرات التشغيل"
        />

        <FilterTabs active={period} onChange={setPeriod} tabs={periodTabs} />

        <View className="flex-row-reverse flex-wrap gap-3">
          <MetricTile label="إجمالي الطلبات" value={String(stats.total)} />
          <MetricTile label="مكتملة" tone="gold" value={String(stats.completed)} />
          <MetricTile label="قيد الانتظار" value={String(stats.pending)} />
          <MetricTile label="قيد التنفيذ" value={String(stats.inProgress)} />
        </View>

        <AppCard tone="quiet">
          <SectionHeader subtitle="ملخص مالي مبسّط من الطلبات المكتملة." title="الإيرادات" />
          <Text className="font-sans mt-4 text-right text-3xl font-black text-ink dark:text-dark-ink">
            {stats.revenue.toLocaleString('ar-SA')} ر.س
          </Text>
          <Text className="font-sans mt-2 text-right text-sm text-muted dark:text-dark-muted">
            {stats.cancelled.toLocaleString('ar-SA')} طلب ملغى خلال {PERIOD_LABELS[period]}.
          </Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
