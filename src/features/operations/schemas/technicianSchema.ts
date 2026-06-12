import { z } from 'zod';

export const technicianSchema = z.object({
 fullName: z.string().trim().min(2, 'أدخل اسم الفني.'),
 phone: z.string().trim().optional(),
 specialties: z.string().trim().optional(),
 isActive: z.boolean().optional(),
});

export type TechnicianFormValues = z.infer<typeof technicianSchema>;

export function parseSpecialties(value?: string): string[] {
 if (!value?.trim()) return [];
 return value
 .split(/[,،]/)
 .map((item) => item.trim())
 .filter(Boolean);
}

export function formatSpecialties(specialties: string[]): string {
 return specialties.join('، ');
}
