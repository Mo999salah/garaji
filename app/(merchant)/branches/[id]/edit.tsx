import { router, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { BranchForm } from '@/features/branches/components/BranchForm';
import { useBranchStore } from '@/features/branches/store/useBranchStore';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantBranchesEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { branches, editBranch, isLoading } = useBranchStore();

  const branch = branches.find((b) => b.id === id);

  if (!branch) {
    return (
      <ScreenContainer>
        <EmptyState message="لم يتم العثور على هذا الفرع." title="الفرع غير موجود" />
        <View className="mt-4">
          <AppButton onPress={() => router.back()}>رجوع</AppButton>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <BranchForm
        initialValues={{
          name: branch.name,
          city: branch.city,
          address: branch.address,
          phone: branch.phone,
          workingHours: branch.workingHours,
          isActive: branch.isActive,
        }}
        isLoading={isLoading}
        onSubmit={async (values) => {
          try {
            await editBranch(branch.id, values);
            router.back();
          } catch {
            Alert.alert('خطأ', 'تعذّر تحديث الفرع. يرجى المحاولة مجدداً.');
          }
        }}
        submitLabel="حفظ التغييرات"
      />
    </ScreenContainer>
  );
}
