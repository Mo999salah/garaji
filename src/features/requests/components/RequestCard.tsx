import { View, I18nManager } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { RequestStatusBadge } from "@/features/requests/components/RequestStatusBadge";
import type {
 ServiceRequest,
 ServiceRequestType,
 ServiceRequestStatus,
} from "@/features/requests/types";
import { AnimatedPressable } from "@/shared/components/AnimatedPressable";

import { AppText as Text } from "@/shared/components/AppText";

interface RequestCardProps {
 request: ServiceRequest;
 onPress?: () => void;
 vehicleName?: string;
 serviceName?: string;
}

const REQUEST_TYPE_LABELS: Record<ServiceRequestType, string> = {
 branch_appointment: "موعد في الفرع",
 mobile_service: "خدمة بالموقع",
};

function formatDate(iso: string): string {
 return new Date(iso).toLocaleString("ar-SA", {
 month: "short",
 day: "numeric",
 year: "numeric",
 });
}

function getBorderColor(status: ServiceRequestStatus) {
 switch (status) {
 case 'pending': return 'border-[#F59E0B]/30';
 case 'confirmed': return 'border-primary-container/30';
 case 'in_progress': return 'border-primary-container/30';
 case 'completed': return 'border-[#10B981]/30';
 case 'cancelled': return 'border-error/30';
 default: return 'border-outline-variant';
 }
}

export function RequestCard({
 onPress,
 request,
 serviceName,
 vehicleName,
}: RequestCardProps) {
 const shortId = request.id.slice(0, 4).toUpperCase();
 const borderStyle = getBorderColor(request.status);
 
 return (
 <AnimatedPressable
 accessibilityLabel={`طلب ${REQUEST_TYPE_LABELS[request.requestType]}`}
 accessibilityRole="button"
 className="bg-surface-container-lowest rounded-2xl p-5 shadow-soft flex-col gap-4 relative overflow-hidden"
 onPress={onPress}
 scaleValue={0.98}
 >
 <View className="flex-row justify-between items-start w-full">
 <Text className="font-label-sm text-label-sm text-outline">#{shortId}</Text>
 <RequestStatusBadge status={request.status} />
 </View>

 <View className={`flex-col gap-1 pr-1 ${I18nManager.isRTL ? 'border-r-2' : 'border-l-2'} ${borderStyle}`}>
 <Text className="font-button-text text-button-text font-bold text-on-surface text-right">
 {vehicleName ?? 'مركبة غير محددة'}
 </Text>
 <Text className="font-body-md text-body-md text-on-surface-variant text-right">
 {serviceName ?? REQUEST_TYPE_LABELS[request.requestType]}
 </Text>
 </View>

 <View className="flex-row-reverse justify-between items-center mt-2 pt-4 border-t border-surface-container-high/50">
 <View className="flex-row-reverse items-center gap-4 text-on-surface-variant">
 <View className="flex-row-reverse items-center gap-1.5">
 <MaterialIcons name="calendar-month" size={18} color="#00685f" />
 <Text className="font-label-sm text-label-sm text-on-surface-variant">{formatDate(request.scheduledAt)}</Text>
 </View>
 <View className="flex-row-reverse items-center gap-1.5">
 <MaterialIcons name={request.requestType === 'branch_appointment' ? 'location-on' : 'my-location'} size={18} color="#00685f" />
 <Text className="font-label-sm text-label-sm text-on-surface-variant">
 {request.requestType === 'branch_appointment' ? 'فرع الرياض' : 'خدمة بالموقع'}
 </Text>
 </View>
 </View>
 <MaterialIcons name="chevron-left" size={24} color="#bcc9c6" style={{ marginRight: 'auto' }} />
 </View>
 </AnimatedPressable>
 );
}
