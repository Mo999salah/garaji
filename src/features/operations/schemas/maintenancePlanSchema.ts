import { z } from 'zod';

import type { MaintenancePlan, MaintenancePlanValues } from '@/features/operations/types';

export const maintenancePlanSchema = z
 .object({
 vehicleId: z.string().min(1, 'اختر المركبة.'),
 title: z.string().trim().min(2, 'أدخل عنوان الخطة.'),
 intervalKm: z.string().trim(),
 intervalMonths: z.string().trim(),
 lastServiceMileage: z.string().trim(),
 lastServiceAt: z.string().trim(),
 nextDueMileage: z.string().trim(),
 nextDueAt: z.string().trim(),
 notes: z.string().trim().optional(),
 })
 .refine((values) => Boolean(values.intervalKm || values.intervalMonths), {
 message: 'حدد فترة بالكيلومتر أو بالأشهر.',
 path: ['intervalKm'],
 });

export type MaintenancePlanFormValues = z.infer<typeof maintenancePlanSchema>;

function parseOptionalInt(value: string): number | undefined {
 if (!value) return undefined;
 const parsed = Number.parseInt(value, 10);
 return Number.isFinite(parsed) ? parsed : undefined;
}

export function toMaintenancePlanValues(
 customerId: string,
 values: MaintenancePlanFormValues,
): MaintenancePlanValues {
 return {
 vehicleId: values.vehicleId,
 customerId,
 title: values.title,
 intervalKm: parseOptionalInt(values.intervalKm),
 intervalMonths: parseOptionalInt(values.intervalMonths),
 lastServiceMileage: parseOptionalInt(values.lastServiceMileage),
 lastServiceAt: values.lastServiceAt || undefined,
 nextDueMileage: parseOptionalInt(values.nextDueMileage),
 nextDueAt: values.nextDueAt || undefined,
 notes: values.notes,
 };
}

export function toMaintenancePlanFormValues(plan: MaintenancePlan): MaintenancePlanFormValues {
 return {
 vehicleId: plan.vehicleId,
 title: plan.title,
 intervalKm: plan.intervalKm?.toString() ?? '',
 intervalMonths: plan.intervalMonths?.toString() ?? '',
 lastServiceMileage: plan.lastServiceMileage?.toString() ?? '',
 lastServiceAt: plan.lastServiceAt?.split('T')[0] ?? '',
 nextDueMileage: plan.nextDueMileage?.toString() ?? '',
 nextDueAt: plan.nextDueAt?.split('T')[0] ?? '',
 notes: plan.notes ?? '',
 };
}

export function toMaintenancePlanUpdateValues(values: MaintenancePlanFormValues) {
 return {
 title: values.title,
 intervalKm: parseOptionalInt(values.intervalKm),
 intervalMonths: parseOptionalInt(values.intervalMonths),
 lastServiceMileage: parseOptionalInt(values.lastServiceMileage),
 lastServiceAt: values.lastServiceAt || undefined,
 nextDueMileage: parseOptionalInt(values.nextDueMileage),
 nextDueAt: values.nextDueAt || undefined,
 notes: values.notes,
 };
}
