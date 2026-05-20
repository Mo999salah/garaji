import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email.'),
  password: z.string().min(1, 'Enter your password.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const infoMessage = useAuthStore((state) => state.infoMessage);
  const clearError = useAuthStore((state) => state.clearError);
  const clearInfo = useAuthStore((state) => state.clearInfo);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    clearInfo();
    try {
      const user = await signIn(values);
      router.replace(getHomePathForRole(user.role) as Href);
    } catch {
      // The auth store exposes a safe user-facing message.
    }
  });

  return (
    <ScreenContainer>
      <View className="min-h-full justify-between py-6">
        <View>
          <View className="mb-8">
            <Text className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Qitaa
            </Text>
            <Text className="mt-3 text-4xl font-bold leading-tight text-ink">Sign in</Text>
            <Text className="mt-4 text-base leading-6 text-muted">
              Access your customer or merchant workspace.
            </Text>
          </View>

          <AppCard className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email?.message}
                  inputMode="email"
                  keyboardType="email-address"
                  label="Email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onBlur, onChange, value } }) => (
                <AppInput
                  autoCapitalize="none"
                  autoComplete="password"
                  error={errors.password?.message}
                  label="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry
                  value={value}
                />
              )}
            />

            {infoMessage ? (
              <Text className="text-sm text-brand-700">{infoMessage}</Text>
            ) : null}
            {errorMessage ? <Text className="text-sm text-red-600">{errorMessage}</Text> : null}

            <AppButton loading={isSubmitting} onPress={() => void onSubmit()}>
              Sign in
            </AppButton>
            <AppButton onPress={() => router.push('/(auth)/forgot-password' as Href)} variant="ghost">
              Forgot password
            </AppButton>
            <AppButton onPress={() => router.push('/(auth)/signup' as Href)} variant="secondary">
              Create account
            </AppButton>
          </AppCard>
        </View>

        <Text className="mt-8 text-center text-xs leading-5 text-muted">
          Account setup is completed securely by Supabase Auth and database policies.
        </Text>
      </View>
    </ScreenContainer>
  );
}
