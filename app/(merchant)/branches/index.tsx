import { router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import { BranchCard } from '@/features/branches/components/BranchCard';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantBranchesIndexScreen() {
  const { branches, loadAllBranches, isLoading } = useBranchStore();

  useEffect(() => {
    void loadAllBranches();
  }, [loadAllBranches]);

  return (
    <ScreenContainer scroll={false}>
      <View className="p-4 pb-0">
        <AppButton onPress={() => router.push('/(merchant)/branches/new')}>
          إضافة فرع جديد
        </AppButton>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <ScrollView contentContainerClassName="gap-3 p-4">
          {branches.length === 0 ? (
            <EmptyState
              message="لا توجد فروع بعد. أضف أول فرع لبدء العمل."
              title="لا توجد فروع"
            />
          ) : (
            branches.map((b) => (
              <BranchCard
                branch={b}
                key={b.id}
                onPress={() => router.push(`/(merchant)/branches/${b.id}/edit`)}
              />
            ))
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
