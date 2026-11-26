import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  categoryId: z.string().uuid(),
  price: z.number().finite().nonnegative(),
  unit: z.string().trim().min(1).max(30),
  inStock: z.boolean().default(true),
  minimumQuantity: z.number().positive().default(1),
  quantityStep: z.number().positive().default(1),
});

export type ProductInput = z.infer<typeof productSchema>;
