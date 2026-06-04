import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  make: z.string().min(1, 'الشركة المصنعة مطلوبة').max(50),
  model: z.string().min(1, 'الموديل مطلوب').max(50),
  year: z
    .number({ error: 'السنة مطلوبة' })
    .int()
    .min(1900, 'سنة غير صالحة')
    .max(currentYear + 2, 'سنة غير صالحة'),
  plateNumber: z.string().min(1, 'رقم اللوحة مطلوب').max(20),
  color: z.string().max(30).optional(),
  mileage: z.number().int().min(0).optional(),
  documentUrl: z.string().url().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;
