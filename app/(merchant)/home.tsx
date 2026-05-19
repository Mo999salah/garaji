import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

export default function MerchantHomeScreen() {
  const { signOut, user } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-brand-700">Merchant portal</Text>
            <Text className="mt-2 text-3xl font-bold text-ink">{user?.companyName}</Text>
            <Text className="mt-1 text-base text-muted">Welcome, {user?.displayName}</Text>
          </View>
          <AppButton onPress={handleSignOut} variant="ghost">
            Sign out
          </AppButton>
        </View>

        <AppCard>
          <Text className="text-lg font-semibold text-ink">Order desk</Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            Review customer demand, confirm availability, and prepare fulfillment updates.
          </Text>
          <View className="mt-4">
            <AppButton onPress={() => router.push('/(merchant)/orders')}>Incoming orders</AppButton>
          </View>
          <View className="mt-3">
            <AppButton onPress={() => router.push('/(merchant)/products')}>Manage products</AppButton>
          </View>
        </AppCard>

        <EmptyState
          title="No pending requests"
          message="Customer order requests will appear here once submitted."
        />
      </View>
    </ScreenContainer>
  );
}
