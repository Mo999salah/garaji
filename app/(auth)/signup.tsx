import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { getHomePathForRole, useAuthStore } from '@/features/auth/store/useAuthStore';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { UserRole } from '@/shared/types/auth';

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name.'),
    phone: z.string().trim().optional(),
    email: z.string().trim().email('Enter a valid email.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    role: z.enum(['customer', 'merchant']),
    merchantName: z.string().trim().optional(),
    region: z.string().trim().optional(),
  })
  .superRefine((value, context) => {
    if (value.role === 'merchant' && !value.merchantName) {
      context.addIssue({
        code: 'custom',
        message: 'Enter your merchant name.',
        path: ['merchantName'],
      });
    }
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const signUp = useAuthStore((state) => state.signUp);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const clearError = useAuthStore((state) => state.clearError);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      role: 'customer',
      merchantName: '',
      region: '',
    },
  });
  const selectedRole = useWatch({ control, name: 'role' });

  const setRole = (role: UserRole) => {
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const result = await signUp(values);

      if (result.user) {
        router.replace(getHomePathForRole(result.user.role) as Href);
        return;
      }

      useAuthStore.getState().setInfoMessage(result.message);
      router.replace('/(auth)/login');
    } catch {
      // The auth store exposes a safe user-facing message.
    }
  });

  return (
    <ScreenContainer>
      <View className="py-6">
        <View className="mb-8">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Qitaa
          </Text>
          <Text className="mt-3 text-4xl font-bold leading-tight text-ink">Create account</Text>
          <Text className="mt-4 text-base leading-6 text-muted">
            Your profile is created by the database after Supabase signup.
          </Text>
        </View>

        <AppCard className="gap-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <AppButton
                onPress={() => setRole('customer')}
                variant={selectedRole === 'customer' ? 'primary' : 'secondary'}
              >
                Customer
              </AppButton>
            </View>
            <View className="flex-1">
              <AppButton
                onPress={() => setRole('merchant')}
                variant={selectedRole === 'merchant' ? 'primary' : 'secondary'}
              >
                Merchant
              </AppButton>
            </View>
          </View>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                autoComplete="name"
                error={errors.fullName?.message}
                label="Full name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onBlur, onChange, value } }) => (
              <AppInput
                autoComplete="tel"
                error={errors.phone?.message}
                inputMode="tel"
                keyboardType="phone-pad"
                label="Phone"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
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
                autoComplete="new-password"
                error={errors.password?.message}
                label="Password"
                onBlur={onBlur}
                onChangeText={onChange}
                secureTextEntry
                value={value}
              />
            )}
          />

          {selectedRole === 'merchant' ? (
            <>
              <Controller
                control={control}
                name="merchantName"
                render={({ field: { onBlur, onChange, value } }) => (
                  <AppInput
                    error={errors.merchantName?.message}
                    label="Merchant name"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name="region"
                render={({ field: { onBlur, onChange, value } }) => (
                  <AppInput
                    error={errors.region?.message}
                    label="Region"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            </>
          ) : null}

          {errorMessage ? <Text className="text-sm text-red-600">{errorMessage}</Text> : null}

          <AppButton loading={isSubmitting} onPress={() => void onSubmit()}>
            Create account
          </AppButton>
          <AppButton onPress={() => router.replace('/(auth)/login' as Href)} variant="ghost">
            Back to sign in
          </AppButton>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
