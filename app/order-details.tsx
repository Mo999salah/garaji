import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, ScrollView, View, Linking } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

import { RoleGate } from '@/features/auth/components/RoleGate';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useAllBranchesQuery } from '@/features/branches/hooks/useBranchesQuery';
import { RequestOperationsPanel } from '@/features/operations/components/RequestOperationsPanel';
import { RequestTimeline } from '@/features/requests/components/RequestTimeline';
import { useRequestByIdQuery } from '@/features/requests/hooks/useRequestsQuery';
import { useRequestRealtimeListener } from '@/features/requests/hooks/useRequestRealtimeListener';
import {
 canCustomerCancel,
 getNextStatuses,
 isTerminal,
 STATUS_LABELS,
} from '@/features/requests/selectors/requestSelectors';
import { useRequestStore } from '@/features/requests/store/useRequestStore';
import type { ServiceRequestStatus } from '@/features/requests/types';
import { useAllServicesQuery } from '@/features/services/hooks/useServicesQuery';
import { useCustomerVehiclesQuery } from '@/features/vehicles/hooks/useVehiclesQuery';
import { AnimatedPressable } from '@/shared/components/AnimatedPressable';
import { AppButton } from '@/shared/components/AppButton';
import { AppHeader } from '@/shared/components/AppHeader';
import { EmptyState } from '@/shared/components/EmptyState';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { AppColors } from '@/shared/lib/colors';

import { AppText as Text } from '@/shared/components/AppText';

function OrderDetailsScreen() {
 const { id } = useLocalSearchParams<{ id: string }>();
 const requestId = typeof id === 'string' ? id : undefined;
 const user = useAuthStore((s) => s.user);
 const isMerchant = user?.role === 'merchant';
 const queryClient = useQueryClient();
 const changeRequestStatus = useRequestStore((s) => s.changeRequestStatus);
 const cancelCustomerRequest = useRequestStore((s) => s.cancelCustomerRequest);

 const { data: request, isLoading: isRequestLoading } = useRequestByIdQuery(requestId);
 const { data: vehicles = [], isLoading: isVehiclesLoading } = useCustomerVehiclesQuery(
 request?.customerId,
 );
 const { data: services = [], isLoading: isServicesLoading } = useAllServicesQuery();
 const { data: branches = [], isLoading: isBranchesLoading } = useAllBranchesQuery();

 useRequestRealtimeListener({ requestId });

 const statusMutation = useMutation({
 mutationFn: (newStatus: ServiceRequestStatus) => {
 if (!requestId) {
 throw new Error('Missing request id.');
 }
 return changeRequestStatus(requestId, newStatus);
 },
 onSuccess: async () => {
 await queryClient.invalidateQueries({ queryKey: ['requests'] });
 },
 });

 const cancelMutation = useMutation({
 mutationFn: () => {
 if (!requestId) {
 throw new Error('Missing request id.');
 }
 return cancelCustomerRequest(requestId);
 },
 onSuccess: async () => {
 await queryClient.invalidateQueries({ queryKey: ['requests'] });
 },
 });

 if (isRequestLoading && !request) {
 return (
 <View className="flex-1 bg-background justify-center">
 <LoadingSpinner label="جارٍ تحميل تفاصيل الطلب..." />
 </View>
 );
 }

  if (!request) {
  return (
  <View className="flex-1 bg-background">
  <AppHeader title="تفاصيل الطلب" />
  <EmptyState message="تعذّر إيجاد هذا الطلب." title="الطلب غير موجود" />
  </View>
  );
  }

 const vehicle = vehicles.find((item) => item.id === request.vehicleId);
 const service = services.find((item) => item.id === request.serviceId);
 const branch = branches.find((item) => item.id === request.branchId);

 const vehicleName = vehicle
 ? `${vehicle.make} ${vehicle.model} ${vehicle.year}`
 : isVehiclesLoading
 ? 'جارٍ تحميل بيانات السيارة...'
 : 'مركبة غير محددة';
 const serviceName =
 service?.name ?? (isServicesLoading ? 'جارٍ تحميل بيانات الخدمة...' : request.requestType === 'branch_appointment' ? 'خدمة فرع' : 'خدمة موقع');
 const branchName =
 branch?.name ?? (isBranchesLoading ? 'جارٍ تحميل بيانات الفرع...' : 'فرع غير محدد');

 const scheduledDate = new Date(request.scheduledAt).toLocaleString('ar-SA', {
 month: 'long',
 day: 'numeric',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 hour12: true,
 });

 const priceLabel =
 request.finalPrice !== undefined || request.estimatedPrice !== undefined
 ? `${request.finalPrice ?? request.estimatedPrice} ر.س`
 : 'غير محدد';

 const nextStatuses = getNextStatuses(request.status);
 const isCustomerOwner = user?.role === 'customer' && request.customerId === user.id;
 const showCustomerCancel = isCustomerOwner && canCustomerCancel(request.status);

 const handleStatusChange = (newStatus: ServiceRequestStatus) => {
 const label = STATUS_LABELS[newStatus];
 Alert.alert('تأكيد تغيير الحالة', `هل تريد تغيير حالة الطلب إلى "${label}"؟`, [
 { style: 'cancel', text: 'إلغاء' },
 {
 style: 'default',
 text: 'تأكيد',
 onPress: async () => {
 try {
 await statusMutation.mutateAsync(newStatus);
 } catch {
 Alert.alert('خطأ', 'تعذّر تغيير حالة الطلب. يرجى المحاولة مجدداً.');
 }
 },
 },
 ]);
 };

 const handleCustomerCancel = () => {
 Alert.alert('إلغاء الطلب', 'هل تريد إلغاء هذا الطلب؟ لا يمكن التراجع بعد الإلغاء.', [
 { style: 'cancel', text: 'رجوع' },
 {
 style: 'destructive',
 text: 'إلغاء الطلب',
 onPress: async () => {
 try {
 await cancelMutation.mutateAsync();
 } catch {
 Alert.alert('خطأ', 'تعذّر إلغاء الطلب. يرجى المحاولة مجدداً.');
 }
 },
 },
 ]);
 };

 const shortId = request.id.slice(0, 4).toUpperCase();

  return (
  <View className="flex-1 bg-background">
  <AppHeader title="تفاصيل الطلب" />

  <ScrollView contentContainerClassName="px-margin-mobile py-stack-md flex-col gap-stack-lg pb-32" showsVerticalScrollIndicator={false}>
 {/* Status Header Card */}
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 text-center flex-col items-center justify-center gap-2">
  <View className="bg-primary-container/20 px-6 py-2 rounded-full">
  <Text className="text-primary font-title-md text-title-md font-bold text-center">
  {STATUS_LABELS[request.status]}
  </Text>
  </View>
 <Text className="text-on-surface-variant font-body-md text-body-md opacity-80 mt-1">الطلب #{shortId}</Text>
 </View>

 {/* Status Timeline */}
 <RequestTimeline currentStatus={request.status} events={request.events} />

 {/* Details Card */}
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft overflow-hidden">
 <DetailRow label="المركبة" value={vehicleName} />
 <DetailRow label="الخدمة" value={serviceName} />
 <DetailRow 
 label={request.requestType === 'branch_appointment' ? 'الفرع' : 'الموقع'} 
 value={request.requestType === 'branch_appointment' ? branchName : (request.locationCity ? `${request.locationCity} - ${request.locationAddress || ''}` : 'موقع غير محدد')} 
 />
  <View className="px-6 py-4 flex-row-reverse justify-between items-center border-b border-surface-variant/50">
  <Text className="text-on-surface-variant text-label-sm font-label-sm text-label-sm">التاريخ</Text>
  <Text className="text-on-surface font-body-md text-body-md font-bold text-right">{scheduledDate}</Text>
  </View>
 <View className="px-6 py-4 flex-row-reverse justify-between items-center bg-surface-container-low/30">
 <Text className="text-on-surface-variant text-label-sm font-label-sm text-label-sm">التكلفة الإجمالية</Text>
 <Text className="text-primary font-title-md text-title-md font-bold">{priceLabel}</Text>
 </View>
 </View>

  {/* Technician Section */}
  <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 mb-8">
  <Text className="font-title-md text-title-md font-bold text-on-surface mb-4 text-right">الفني المسؤول</Text>
  <View className="flex-row-reverse items-center justify-between">
  <View className="flex-row-reverse items-center gap-3">
  <View className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
  <MaterialIcons name="person" size={24} color={AppColors.onSecondaryContainer} />
  </View>
  <Text className="font-body-md text-body-md font-bold text-on-surface text-right">
  {(request as any).technicianName ?? 'لم يُعيّن فني بعد'}
  </Text>
  </View>
  {(request as any).technicianPhone ? (
  <AnimatedPressable
  accessibilityLabel="تواصل عبر واتساب"
  accessibilityHint="فتح واتساب للتواصل مع الفني"
  accessibilityRole="button"
  onPress={() => Linking.openURL(`whatsapp://send?text=مرحباً، لدي استفسار بخصوص طلبي&phone=${(request as any).technicianPhone}`)}
  className="min-h-11 px-4 rounded-xl border border-whatsapp flex-row-reverse items-center gap-2 active:bg-whatsapp/10"
  >
  <Text className="font-button-text text-button-text text-whatsapp">واتساب</Text>
  <FontAwesome name="whatsapp" size={20} color={AppColors.whatsapp} />
  </AnimatedPressable>
  ) : null}
  </View>
  </View>

 {isMerchant && !isTerminal(request.status) && nextStatuses.length > 0 ? (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 mb-4">
  <Text className="font-title-md text-title-md font-bold text-on-surface mb-4 text-right">الإجراء المطلوب</Text>
 <View className="gap-2">
 {nextStatuses.map((status) => (
 <AppButton
 key={status}
 loading={statusMutation.isPending}
 onPress={() => handleStatusChange(status)}
 variant={status === 'cancelled' ? 'ghost' : 'primary'}
 >
 {STATUS_LABELS[status]}
 </AppButton>
 ))}
 </View>
 </View>
 ) : null}

 {showCustomerCancel ? (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 mb-4">
 <AppButton
 loading={cancelMutation.isPending}
 onPress={handleCustomerCancel}
 variant="secondary"
 >
 إلغاء الطلب
 </AppButton>
 </View>
 ) : null}

 {request.status === 'completed' && user?.role === 'customer' ? (
 <View className="bg-surface-container-lowest rounded-2xl shadow-soft p-6 mb-4">
  <Text className="font-title-md text-title-md font-bold text-on-surface mb-4 text-right">تقييم الخدمة</Text>
 <AppButton
 onPress={() => router.push({ pathname: '/rate-service', params: { id: request.id } })}
 variant="primary"
 >
 قيّم الخدمة الآن
 </AppButton>
 </View>
 ) : null}

 <RequestOperationsPanel mode={isMerchant ? 'merchant' : 'customer'} request={request} />

 </ScrollView>
 </View>
 );
}

export default function OrderDetailsRoute() {
 return (
 <RoleGate role="authenticated">
 <OrderDetailsScreen />
 </RoleGate>
 );
}

function DetailRow({ label, value }: { label: string; value: string }) {
 return (
 <View className="px-6 py-4 flex-row-reverse justify-between items-center border-b border-surface-variant/50">
 <Text className="text-on-surface-variant text-label-sm font-label-sm text-label-sm">{label}</Text>
 <Text className="text-on-surface font-body-md text-body-md font-bold text-right">{value}</Text>
 </View>
 );
}
