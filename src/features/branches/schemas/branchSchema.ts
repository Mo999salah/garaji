import { z } from 'zod';

export const branchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب').max(100),
  city: z.string().min(1, 'المدينة مطلوبة').max(50),
  address: z.string().min(1, 'العنوان مطلوب').max(200),
  phone: z.string().max(20).optional(),
  workingHours: z.string().max(100).optional(),
  isActive: z.boolean(),
});

export type BranchFormValues = z.infer<typeof branchSchema>;
