import { z } from "zod";

export const createProductSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  stockQty: z.number().int().min(0, "Stock must be non-negative"),
  lowStockThreshold: z.number().int().min(0).default(5),
  category: z.string().optional(),
});

export const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  stockQty: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  category: z.string().optional(),
});

export const toggleProductActiveSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ToggleProductActiveInput = z.infer<typeof toggleProductActiveSchema>;
