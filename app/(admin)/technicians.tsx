import { router } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { useAdminTechniciansQuery } from '@/features/operations/hooks/useTechniciansQuery';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

export default function AdminTechniciansScreen() {
  const techniciansQuery = useAdminTechniciansQuery();
  const { data: technicians = [], error, isLoading } = techniciansQuery;
  const refreshControl = useScreenRefresh(techniciansQuery.refetch);

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="الفريق"
          subtitle="تابع الفنيين النشطين وتخصصاتهم."
          title="الفنيون"
        >
          <AppButton onPress={() => router.push('/(admin)/technicians/new')}>
            + إضافة فني
          </AppButton>
        </CommandHeader>
      </View>

      {isLoading ? (
        <LoadingSpinner label="جارٍ تحميل الفنيين..." />
      ) : error ? (
        <View className="px-5">
          <EmptyState
            message={error instanceof Error ? error.message : 'تعذّر تحميل الفنيين.'}
            title="خطأ في التحميل"
          />
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-5 pb-5" refreshControl={refreshControl}>
          {technicians.length === 0 ? (
            <EmptyState
              message="أضف أول فني لربطه بالطلبات."
              title="لا يوجد فنيون"
            />
          ) : (
            technicians.map((technician) => (
              <TouchableOpacity
                key={technician.id}
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/technicians/[id]/edit',
                    params: { id: technician.id },
                  })
                }
              >
                <AppCard tone="quiet">
                  <View className="items-end gap-2">
                    <Text className="font-sans text-right text-lg font-bold text-ink dark:text-dark-ink">
                      {technician.fullName}
                    </Text>
                    {technician.phone ? (
                      <Text className="font-sans text-right text-sm text-muted dark:text-dark-muted">
                        {technician.phone}
                      </Text>
                    ) : null}
                    {technician.specialties.length ? (
                      <Text className="font-sans text-right text-xs text-muted dark:text-dark-muted">
                        {technician.specialties.join(' · ')}
                      </Text>
                    ) : null}
                    <Text
                      className={`font-sans text-right text-xs font-bold ${technician.isActive ? 'text-action-600' : 'text-muted'}`}
                    >
                      {technician.isActive ? 'نشط' : 'غير نشط'}
                    </Text>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
