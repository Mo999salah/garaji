import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { TechnicianForm } from '@/features/operations/components/TechnicianForm';
import {
  formatSpecialties,
  parseSpecialties,
  type TechnicianFormValues,
} from '@/features/operations/schemas/technicianSchema';
import {
  fetchTechnicianById,
  updateTechnician,
} from '@/features/operations/services/supabaseOperationsService';
import { AppButton } from '@/shared/components/AppButton';
import { EmptyState } from '@/shared/components/EmptyState';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { invalidateTechnicianQueries } from '@/shared/lib/invalidateQueries';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

export default function AdminTechnicianEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const technicianQuery = useQuery({
    queryKey: ['technicians', 'detail', id],
    enabled: Boolean(id) && isSupabaseConfigured,
    queryFn: () => fetchTechnicianById(id!),
  });

  const updateMutation = useMutation({
    mutationFn: (values: TechnicianFormValues) =>
      updateTechnician(id!, {
        fullName: values.fullName,
        phone: values.phone,
        specialties: parseSpecialties(values.specialties),
        isActive: values.isActive,
      }),
    onSuccess: async () => {
      await invalidateTechnicianQueries();
      await queryClient.invalidateQueries({ queryKey: ['technicians', 'detail', id] });
      router.back();
    },
  });

  const technician = technicianQuery.data;

  if (technicianQuery.isLoading) {
    return (
      <ScreenContainer>
        <LoadingSpinner label="جارٍ تحميل بيانات الفني..." />
      </ScreenContainer>
    );
  }

  if (!technician) {
    return (
      <ScreenContainer>
        <EmptyState message="لم يتم العثور على هذا الفني." title="غير موجود" />
        <AppButton className="mt-4" onPress={() => router.back()}>
          رجوع
        </AppButton>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <CommandHeader
        eyebrow="الفريق"
        subtitle="حدّث بيانات الفني أو أوقفه مؤقتاً."
        title="تعديل الفني"
      />
      <TechnicianForm
        initialValues={{
          fullName: technician.fullName,
          phone: technician.phone ?? '',
          specialties: formatSpecialties(technician.specialties),
          isActive: technician.isActive,
        }}
        isLoading={updateMutation.isPending}
        onSubmit={async (values) => {
          try {
            await updateMutation.mutateAsync(values);
          } catch {
            Alert.alert('خطأ', 'تعذّر تحديث بيانات الفني. يرجى المحاولة مجدداً.');
          }
        }}
        showActiveToggle
        submitLabel="حفظ التعديلات"
      />
    </ScreenContainer>
  );
}
