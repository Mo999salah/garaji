import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { View } from 'react-native';

import {
 addInvoiceItem,
 assignTechnician,
 createRequestReview,
 fetchRequestOperations,
 saveInspection,
 scheduleRequestReminder,
 sendRequestMessage,
} from '@/features/operations/services/supabaseOperationsService';
import type { ServiceRequest } from '@/features/requests/types';
import { invalidateRequestQueries, invalidateTechnicianQueries } from '@/shared/lib/invalidateQueries';
import { isSupabaseConfigured } from '@/shared/lib/supabase';

import { RequestInspectionSection } from './request-operations/RequestInspectionSection';
import { RequestInvoiceSection } from './request-operations/RequestInvoiceSection';
import { RequestMessagesSection } from './request-operations/RequestMessagesSection';
import { RequestRemindersSection } from './request-operations/RequestRemindersSection';
import { RequestReviewSection } from './request-operations/RequestReviewSection';
import { useTechniciansQuery } from '@/features/operations/hooks/useTechniciansQuery';
import { RequestTechnicianSection } from './request-operations/RequestTechnicianSection';

interface RequestOperationsPanelProps {
 request: ServiceRequest;
 mode: 'customer' | 'merchant';
}

export function RequestOperationsPanel({ mode, request }: RequestOperationsPanelProps) {
 const queryClient = useQueryClient();
 const isMerchant = mode === 'merchant';

 const operationsQuery = useQuery({
 queryKey: ['request-operations', request.id],
 enabled: isSupabaseConfigured,
 queryFn: () => fetchRequestOperations(request.id),
 });

 const techniciansQuery = useTechniciansQuery(!isMerchant);

 const operations = operationsQuery.data;
 const technicians = isMerchant
 ? (techniciansQuery.data ?? []).filter((tech) => tech.isActive)
 : (techniciansQuery.data ?? []);
 const assignedTechnician = technicians.find((tech) => tech.id === request.assignedTechnicianId);

 const invalidateOperations = async () => {
 await queryClient.invalidateQueries({ queryKey: ['request-operations', request.id] });
 await invalidateRequestQueries();
 };

 const sendMessageMutation = useMutation({
 mutationFn: (body: string) => sendRequestMessage(request.id, body),
 onSuccess: invalidateOperations,
 });

 const assignMutation = useMutation({
 mutationFn: (technicianId: string) => assignTechnician(request.id, technicianId),
 onSuccess: async () => {
 await invalidateOperations();
 await invalidateTechnicianQueries();
 },
 });

 const inspectionMutation = useMutation({
 mutationFn: (values: {
 checklist: Parameters<typeof saveInspection>[0]['checklist'];
 diagnosis: string;
 beforeImageUrl: string;
 afterImageUrl: string;
 }) =>
 saveInspection({
 requestId: request.id,
 checklist: values.checklist,
 diagnosis: values.diagnosis,
 beforeImageUrl: values.beforeImageUrl,
 afterImageUrl: values.afterImageUrl,
 customerVisible: true,
 }),
 onSuccess: invalidateOperations,
 });

 const invoiceMutation = useMutation({
 mutationFn: (values: { description: string; quantity: number; unitPrice: number }) =>
 addInvoiceItem({
 requestId: request.id,
 description: values.description,
 quantity: values.quantity,
 unitPrice: values.unitPrice,
 }),
 onSuccess: invalidateOperations,
 });

 const reviewMutation = useMutation({
 mutationFn: (values: { rating: number; comment: string }) =>
 createRequestReview({
 requestId: request.id,
 customerId: request.customerId,
 rating: values.rating,
 comment: values.comment,
 }),
 onSuccess: invalidateOperations,
 });

 const reminderMutation = useMutation({
 mutationFn: (values: { remindAt: string; body: string }) =>
 scheduleRequestReminder({
 requestId: request.id,
 profileId: request.customerId,
 kind: 'appointment',
 title: 'تذكير بموعد الصيانة',
 body: values.body || 'لديك موعد صيانة قريب في كراجي.',
 remindAt: new Date(values.remindAt).toISOString(),
 }),
 onSuccess: invalidateOperations,
 });

 return (
 <View className="gap-4">
 <RequestMessagesSection
 customerId={request.customerId}
 isMerchant={isMerchant}
 isSending={sendMessageMutation.isPending}
 messages={operations?.messages ?? []}
 onSend={(body) => sendMessageMutation.mutateAsync(body)}
 />

 <RequestInspectionSection
 inspection={operations?.inspection}
 isMerchant={isMerchant}
 isSaving={inspectionMutation.isPending}
 onSave={(values) => inspectionMutation.mutateAsync(values)}
 />

 <RequestInvoiceSection
 invoiceItems={operations?.invoiceItems ?? []}
 isMerchant={isMerchant}
 isSaving={invoiceMutation.isPending}
 onAddItem={(values) => invoiceMutation.mutateAsync(values)}
 />

 <RequestTechnicianSection
 assignedTechnicianId={request.assignedTechnicianId}
 assignedTechnicianName={assignedTechnician?.fullName}
 isAssigning={assignMutation.isPending}
 isMerchant={isMerchant}
 onAssign={(technicianId) => assignMutation.mutateAsync(technicianId)}
 technicians={technicians}
 />

 {isMerchant ? (
 <RequestRemindersSection
 isSaving={reminderMutation.isPending}
 onSchedule={(values) => reminderMutation.mutateAsync(values)}
 reminders={operations?.reminders ?? []}
 />
 ) : null}

 {!isMerchant && request.status === 'completed' ? (
 <RequestReviewSection
 isSaving={reviewMutation.isPending}
 onSubmit={(values) => reviewMutation.mutateAsync(values)}
 review={operations?.review}
 />
 ) : null}
 </View>
 );
}
