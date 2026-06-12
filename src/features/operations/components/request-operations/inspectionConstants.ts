import type { InspectionChecklistItem } from '@/features/operations/types';

export const DEFAULT_CHECKLIST: InspectionChecklistItem[] = [
 { label: 'فحص السوائل', status: 'ok' },
 { label: 'فحص الفرامل', status: 'ok' },
 { label: 'فحص الإطارات', status: 'ok' },
 { label: 'فحص البطارية', status: 'ok' },
];

export const CHECKLIST_LABELS: Record<InspectionChecklistItem['status'], string> = {
 ok: 'سليم',
 attention: 'يحتاج انتباه',
 fixed: 'تم الإصلاح',
};

export const CHECKLIST_NEXT: Record<
 InspectionChecklistItem['status'],
 InspectionChecklistItem['status']
> = {
 ok: 'attention',
 attention: 'fixed',
 fixed: 'ok',
};
