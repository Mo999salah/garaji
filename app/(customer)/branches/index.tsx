import { Text, View } from 'react-native';

import { BranchCard } from '@/features/branches/components/BranchCard';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function BranchesIndexScreen() {
  const { branches, error, isLoading } = useBranchStore();
  const activeBranches = branches.filter((b) => b.isActive);

  return (
    <ScreenContainer>
      <View className="gap-5">
        <Text className="text-2xl font-bold text-ink">فروعنا</Text>

        {isLoading ? (
          <LoadingSpinner label="جارٍ تحميل الفروع..." />
        ) : error ? (
          <EmptyState message={error} title="خطأ في التحميل" />
        ) : activeBranches.length ? (
          <View className="gap-3">
            {activeBranches.map((b) => (
              <BranchCard key={b.id} branch={b} />
            ))}
          </View>
        ) : (
          <EmptyState message="لا توجد فروع متاحة حالياً." title="لا توجد فروع" />
        )}
      </View>
    </ScreenContainer>
  );
}
