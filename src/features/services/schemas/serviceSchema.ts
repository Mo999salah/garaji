import { z } from 'zod';

export const serviceSchema = z.object({
 name: z.string().min(1, 'اسم الخدمة مطلوب').max(100),
 description: z.string().max(500).optional(),
 serviceType: z.enum(['branch', 'mobile', 'both'] as const, {
 error: 'نوع الخدمة مطلوب',
 }),
 estimatedPrice: z.number().min(0).optional(),
 durationMinutes: z.number().int().min(1).optional(),
 isActive: z.boolean(),
 sortOrder: z.number().int().min(0),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
