import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { BranchCard } from '@/features/branches/components/BranchCard';
import { useAllBranchesQuery } from '@/features/branches/hooks/useBranchesQuery';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useScreenRefresh } from '@/shared/hooks/useScreenRefresh';

export default function AdminBranchesScreen() {
  const branchesQuery = useAllBranchesQuery();
  const { data: branches = [], isLoading } = branchesQuery;
  const refreshControl = useScreenRefresh(branchesQuery.refetch);

  return (
    <ScreenContainer scroll={false}>
      <View className="gap-4 px-5 py-5">
        <CommandHeader
          eyebrow="الفروع"
          subtitle="راجع مواقع الفروع وسعة المواعيد من مكان واحد."
          title="إدارة الفروع"
        >
          <AppButton onPress={() => router.push('/(admin)/branches/new')}>
            + إضافة فرع
          </AppButton>
        </CommandHeader>
      </View>

      {isLoading ? (
        <LoadingSpinner label="جارٍ تحميل الفروع..." />
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-5 pb-5" refreshControl={refreshControl}>
          {branches.length === 0 ? (
            <EmptyState
              message="لا توجد فروع بعد. أضف أول فرع لبدء العمل."
              title="لا توجد فروع"
            />
          ) : (
            branches.map((branch) => (
              <BranchCard
                branch={branch}
                key={branch.id}
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/branches/[id]/edit',
                    params: { id: branch.id },
                  })
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
