import { z } from "zod";

export const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9+()\-\s]{8,20}$/),
  address: z.string().trim().min(8).max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  deliveryTime: z.enum(["Now", "Evening"]),
  notes: z.string().trim().max(500).optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive().max(1000),
  })).min(1).max(100),
});

export type OrderInput = z.infer<typeof orderSchema>;
