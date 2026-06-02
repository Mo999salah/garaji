import { z } from 'zod';

export const branchBookingSchema = z.object({
  vehicleId: z.string().min(1, 'اختر مركبة'),
  serviceId: z.string().min(1, 'اختر خدمة'),
  branchId: z.string().min(1, 'اختر فرعًا'),
  scheduledAt: z.string().min(1, 'حدد موعدًا'),
  notes: z.string().max(500).optional(),
});

export const mobileBookingSchema = z.object({
  vehicleId: z.string().min(1, 'اختر مركبة'),
  serviceId: z.string().min(1, 'اختر خدمة'),
  locationCity: z.string().min(1, 'المدينة مطلوبة').max(50),
  locationAddress: z.string().min(1, 'العنوان مطلوب').max(200),
  scheduledAt: z.string().min(1, 'حدد موعدًا'),
  notes: z.string().max(500).optional(),
});

export type BranchBookingValues = z.infer<typeof branchBookingSchema>;
export type MobileBookingValues = z.infer<typeof mobileBookingSchema>;
