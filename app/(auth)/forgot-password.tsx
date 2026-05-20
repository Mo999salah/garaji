import { zodResolver } from '@hookform/resolvers/zod';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { z } from 'zod';

import { requestPasswordReset } from '@/features/auth/services/supabaseAuthService';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { ScreenContainer } from '@/shared/components/ScreenContainer';

const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email.'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await requestPasswordReset(values.email);
      setSuccessMessage('If an account exists for this email, a reset link has been sent.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not send reset email.');
    }
  });

  return (
    <ScreenContainer>
      <View className="py-6">
        <View className="mb-8">
          <Text className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            Qitaa
          </Text>
          <Text className="mt-3 text-4xl font-bold leading-tight text-ink">Reset password</Text>
          <Text className="mt-4 text-base leading-6 text-muted">
            We will email you a secure link to choose a new password.
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

          {successMessage ? <Text className="text-sm text-brand-700">{successMessage}</Text> : null}
          {errorMessage ? <Text className="text-sm text-red-600">{errorMessage}</Text> : null}

          <AppButton loading={isSubmitting} onPress={() => void onSubmit()}>
            Send reset link
          </AppButton>
          <AppButton onPress={() => router.replace('/(auth)/login' as Href)} variant="ghost">
            Back to sign in
          </AppButton>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}
