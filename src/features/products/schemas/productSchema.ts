import { z } from 'zod';

export const productFormSchema = z.object({
  categoryId: z.string().min(1, 'Choose a category.'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  brand: z.string().trim().min(2, 'Brand must be at least 2 characters.'),
  partNumber: z.string().trim().min(2, 'Part number is required.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.'),
  vehicleMake: z.string().trim().optional(),
  vehicleModel: z.string().trim().optional(),
  yearStart: z.coerce
    .number()
    .int('Use a whole year.')
    .min(1950, 'Use a realistic year.')
    .max(2100, 'Use a realistic year.')
    .optional()
    .or(z.literal('')),
  yearEnd: z.coerce
    .number()
    .int('Use a whole year.')
    .min(1950, 'Use a realistic year.')
    .max(2100, 'Use a realistic year.')
    .optional()
    .or(z.literal('')),
  price: z.coerce.number().positive('Price must be greater than zero.'),
  unit: z.string().trim().min(2, 'Unit is required.'),
  stockQuantity: z.coerce
    .number()
    .int('Use a whole stock quantity.')
    .nonnegative('Stock cannot be negative.')
    .optional()
    .or(z.literal('')),
  minOrderQuantity: z.coerce
    .number()
    .int('Use a whole minimum order quantity.')
    .positive('Minimum order quantity must be at least 1.'),
  imageUrl: z
    .string()
    .trim()
    .url('Enter a valid image URL.')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
}).superRefine((value, context) => {
  if (
    typeof value.yearStart === 'number' &&
    typeof value.yearEnd === 'number' &&
    value.yearStart > value.yearEnd
  ) {
    context.addIssue({
      code: 'custom',
      message: 'Start year must be before end year.',
      path: ['yearStart'],
    });
  }

  if (
    typeof value.stockQuantity === 'number' &&
    value.stockQuantity > 0 &&
    value.minOrderQuantity > value.stockQuantity
  ) {
    context.addIssue({
      code: 'custom',
      message: 'Minimum order cannot exceed stock.',
      path: ['minOrderQuantity'],
    });
  }
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;
