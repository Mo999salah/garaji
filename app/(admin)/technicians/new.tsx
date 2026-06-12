import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { TechnicianForm } from '@/features/operations/components/TechnicianForm';
import {
 parseSpecialties,
 type TechnicianFormValues,
} from '@/features/operations/schemas/technicianSchema';
import { createTechnician } from '@/features/operations/services/supabaseOperationsService';
import { CommandHeader } from '@/shared/components/OperationalUI';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { invalidateTechnicianQueries } from '@/shared/lib/invalidateQueries';

export default function AdminTechnicianNewScreen() {
 const queryClient = useQueryClient();

 const createMutation = useMutation({
 mutationFn: (values: TechnicianFormValues) =>
 createTechnician({
 fullName: values.fullName,
 phone: values.phone,
 specialties: parseSpecialties(values.specialties),
 }),
 onSuccess: async () => {
 await invalidateTechnicianQueries();
 await queryClient.invalidateQueries({ queryKey: ['technicians'] });
 router.back();
 },
 });

 return (
 <ScreenContainer scroll={false}>
 <CommandHeader
 eyebrow="الفريق"
 subtitle="أضف فنياً جديداً لربطه بالطلبات."
 title="فني جديد"
 />
 <TechnicianForm
 isLoading={createMutation.isPending}
 onSubmit={async (values) => {
 try {
 await createMutation.mutateAsync(values);
 } catch {
 Alert.alert('خطأ', 'تعذّر إضافة الفني. يرجى المحاولة مجدداً.');
 }
 }}
 submitLabel="إضافة الفني"
 />
 </ScreenContainer>
 );
}
