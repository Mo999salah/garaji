import { useState } from 'react';
import { Alert, Image, TouchableOpacity, View } from 'react-native';

import type { InspectionChecklistItem, RequestInspection } from '@/features/operations/types';
import { AppButton } from '@/shared/components/AppButton';
import { AppCard } from '@/shared/components/AppCard';
import { AppInput } from '@/shared/components/AppInput';
import { AppText as Text } from '@/shared/components/AppText';
import { EmptyState } from '@/shared/components/EmptyState';
import { SectionHeader } from '@/shared/components/OperationalUI';

import {
 CHECKLIST_LABELS,
 CHECKLIST_NEXT,
 DEFAULT_CHECKLIST,
} from './inspectionConstants';

interface RequestInspectionSectionProps {
 inspection: RequestInspection | null | undefined;
 isMerchant: boolean;
 isSaving: boolean;
 onSave: (values: {
 checklist: InspectionChecklistItem[];
 diagnosis: string;
 beforeImageUrl: string;
 afterImageUrl: string;
 }) => Promise<void>;
}

interface MerchantInspectionEditorProps {
 inspection: RequestInspection | null | undefined;
 isSaving: boolean;
 onSave: RequestInspectionSectionProps['onSave'];
}

function MerchantInspectionEditor({
 inspection,
 isSaving,
 onSave,
}: MerchantInspectionEditorProps) {
 const [diagnosis, setDiagnosis] = useState(() => inspection?.diagnosis ?? '');
 const [beforeImageUrl, setBeforeImageUrl] = useState(() => inspection?.beforeImageUrl ?? '');
 const [afterImageUrl, setAfterImageUrl] = useState(() => inspection?.afterImageUrl ?? '');
 const [checklist, setChecklist] = useState<InspectionChecklistItem[]>(() =>
 inspection?.checklist.length ? inspection.checklist : DEFAULT_CHECKLIST,
 );

 const toggleChecklistItem = (index: number) => {
 setChecklist((items) =>
 items.map((item, itemIndex) =>
 itemIndex === index ? { ...item, status: CHECKLIST_NEXT[item.status] } : item,
 ),
 );
 };

 const handleSave = () => {
 if (!diagnosis.trim()) {
 Alert.alert('تنبيه', 'اكتب ملخص الفحص قبل الحفظ.');
 return;
 }

 void onSave({ checklist, diagnosis, beforeImageUrl, afterImageUrl });
 };

 return (
 <View className="gap-3 border-t border-outline-variant pt-4">
 <View className="gap-2">
 {checklist.map((item, index) => (
 <TouchableOpacity
 accessibilityRole="button"
 className="flex-row-reverse items-center justify-between rounded-lg border border-outline-variant bg-white p-3"
 key={item.label}
 onPress={() => toggleChecklistItem(index)}
 >
 <Text className="font-sans text-right text-sm font-bold text-on-surface">
 {item.label}
 </Text>
 <Text className="font-sans text-xs font-bold text-on-surface-variant">
 {CHECKLIST_LABELS[item.status]}
 </Text>
 </TouchableOpacity>
 ))}
 </View>
 <AppInput
 label="ملخص الفحص"
 multiline
 numberOfLines={3}
 onChangeText={setDiagnosis}
 placeholder="مثال: تم فحص السيارة وتحتاج تبديل فلتر الهواء..."
 textAlign="right"
 value={diagnosis}
 />
 <AppInput
 label="رابط صورة قبل الصيانة (اختياري)"
 onChangeText={setBeforeImageUrl}
 textAlign="right"
 value={beforeImageUrl}
 />
 <AppInput
 label="رابط صورة بعد الصيانة (اختياري)"
 onChangeText={setAfterImageUrl}
 textAlign="right"
 value={afterImageUrl}
 />
 <AppButton loading={isSaving} onPress={handleSave}>
 حفظ تقرير الفحص
 </AppButton>
 </View>
 );
}

export function RequestInspectionSection({
 inspection,
 isMerchant,
 isSaving,
 onSave,
}: RequestInspectionSectionProps) {
 return (
 <AppCard tone="quiet">
 <SectionHeader
 subtitle="تقرير مختصر للسيارة مع نقاط فحص وصور مرجعية."
 title="تقرير الفحص"
 />
 <View className="mt-4 gap-3">
 {inspection ? (
 <View className="gap-3">
 <Text className="font-sans text-right text-sm leading-6 text-on-surface">
 {inspection.diagnosis ?? 'لا يوجد ملخص مكتوب.'}
 </Text>
 <View className="gap-2">
 {inspection.checklist.map((item) => (
 <View
 className="flex-row-reverse items-center justify-between rounded-lg border border-outline-variant bg-white p-3"
 key={`${item.label}-${item.status}`}
 >
 <Text className="font-sans text-sm font-bold text-on-surface">
 {item.label}
 </Text>
 <Text className="font-sans text-xs font-bold text-on-surface-variant">
 {CHECKLIST_LABELS[item.status]}
 </Text>
 </View>
 ))}
 </View>
 {inspection.beforeImageUrl ? (
 <Image
 className="h-40 w-full rounded-md"
 resizeMode="cover"
 source={{ uri: inspection.beforeImageUrl }}
 />
 ) : null}
 {inspection.afterImageUrl ? (
 <Image
 className="h-40 w-full rounded-md"
 resizeMode="cover"
 source={{ uri: inspection.afterImageUrl }}
 />
 ) : null}
 </View>
 ) : (
 <EmptyState message="لم يتم حفظ تقرير فحص بعد." title="لا يوجد تقرير" />
 )}

 {isMerchant ? (
 <MerchantInspectionEditor
 key={inspection?.id ?? 'new-inspection'}
 inspection={inspection}
 isSaving={isSaving}
 onSave={onSave}
 />
 ) : null}
 </View>
 </AppCard>
 );
}
