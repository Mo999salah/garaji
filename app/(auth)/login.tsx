import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { UserRole } from '@/shared/types/auth';

const loginSchema = z.object({
  role: z.enum(['customer', 'merchant']),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const signInAsRole = useAuthStore((state) => state.signInAsRole);
  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async ({ role }) => {
    await signInAsRole(role);
    router.replace(getHomePathForRole(role) as Href);
  });

  const continueAs = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
    void onSubmit();
  };

  return (
    <ScreenContainer>
      <View className="min-h-full justify-between py-6">
        <View>
          <View className="mb-10">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Qitaa
            </Text>
            <Text className="mt-3 text-4xl font-bold leading-tight text-ink">
              B2B ordering for auto parts teams.
            </Text>
            <Text className="mt-4 text-base leading-6 text-muted">
              Choose a mock role to preview protected customer and merchant workflows.
            </Text>
          </View>

          <AppCard className="gap-3">
            <AppButton
              accessibilityLabel="Continue as Customer"
              loading={isSubmitting && selectedRole === 'customer'}
              onPress={() => continueAs('customer')}
            >
              Continue as Customer
            </AppButton>
            <AppButton
              accessibilityLabel="Continue as Merchant"
              loading={isSubmitting && selectedRole === 'merchant'}
              onPress={() => continueAs('merchant')}
              variant="secondary"
            >
              Continue as Merchant
            </AppButton>
          </AppCard>
        </View>

        <Text className="mt-8 text-center text-xs leading-5 text-muted">
          Sessions are stored with expo-secure-store. Mock auth can be replaced with Supabase
          without changing the protected route contracts.
        </Text>
      </View>
    </ScreenContainer>
  );
}
