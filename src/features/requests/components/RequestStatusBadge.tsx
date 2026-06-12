import { View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { STATUS_LABELS } from "@/features/requests/selectors/requestSelectors";
import type { ServiceRequestStatus } from "@/features/requests/types";
import { AppText as Text } from "@/shared/components/AppText";

interface BadgeConfig {
 container: string;
 text: string;
}

const badgeStyles: Record<ServiceRequestStatus, BadgeConfig> = {
 pending: {
 container: "bg-warning/10",
 text: "text-warning"},
 confirmed: {
 container: "bg-primary-container/10",
 text: "text-primary-container"},
 in_progress: {
 container: "bg-primary-container/10",
 text: "text-primary-container"},
 completed: {
 container: "bg-[#10B981]/10",
 text: "text-success"},
 cancelled: {
 container: "bg-error-container/20",
 text: "text-error"}};

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
 const styles = badgeStyles[status];

 return (
 <View className={`px-2.5 py-1 rounded-md ${styles.container}`}>
 <Text className={`font-label-sm text-[11px] leading-[18px] font-bold tracking-wide ${styles.text}`}>
 {STATUS_LABELS[status]}
 </Text>
 </View>
 );
}

interface RequestStatusBadgeProps {
 status: ServiceRequestStatus;
}
