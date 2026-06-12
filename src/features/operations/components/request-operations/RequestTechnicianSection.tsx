import { View } from 'react-native';

import type { Technician } from '@/features/operations/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionHeader } from '@/shared/components/OperationalUI';

interface RequestTechnicianSectionProps {
 assignedTechnicianName?: string;
 assignedTechnicianId?: string;
 isMerchant: boolean;
 isAssigning: boolean;
 technicians: Technician[];
 onAssign: (technicianId: string) => Promise<void>;
}

export function RequestTechnicianSection({
 assignedTechnicianId,
 assignedTechnicianName,
 isAssigning,
 isMerchant,
 onAssign,
 technicians,
}: RequestTechnicianSectionProps) {
 return (
 <AppCard tone="quiet">
 <SectionHeader
 subtitle="ربط الطلب بفني مسؤول يجعل متابعة العمل أوضح."
 title="الفني المسؤول"
 />
 <View className="mt-4 gap-3">
 <Text className="font-sans text-right text-base font-bold text-on-surface">
 {assignedTechnicianName ?? 'لم يتم تعيين فني بعد'}
 </Text>

 {isMerchant ? (
 <View className="gap-2">
 {technicians.length ? (
 technicians.map((technician) => (
 <AppButton
 key={technician.id}
 loading={isAssigning}
 onPress={() => onAssign(technician.id)}
 variant={technician.id === assignedTechnicianId ? 'primary' : 'secondary'}
 >
 {technician.fullName}
 </AppButton>
 ))
 ) : (
 <EmptyState message="أضف فنيين من لوحة الفنيين أولاً." title="لا يوجد فنيون" />
 )}
 </View>
 ) : null}
 </View>
 </AppCard>
 );
}
