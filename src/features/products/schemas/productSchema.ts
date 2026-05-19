import { z } from 'zod';

export const productFormSchema = z.object({
  categoryId: z.string().min(1, 'Choose a category.'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  brand: z.string().trim().min(2, 'Brand must be at least 2 characters.'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be greater than zero.'),
  unit: z.string().trim().min(2, 'Unit is required.'),
  imageUrl: z
    .string()
    .trim()
    .url('Enter a valid image URL.')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
});

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;
