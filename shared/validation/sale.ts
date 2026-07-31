import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string(),
  qty: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export const createSaleSchema = z.object({
  businessId: z.string().uuid(),
  items: z.array(saleItemSchema).min(1, "At least one item required"),
  total: z.number().min(0),
  paymentMethod: z.enum(["cash", "mobile_money", "card"]),
  customerId: z.string().uuid().optional(),
  note: z.string().optional(),
});

export const createPublicSaleSchema = z.object({
  businessId: z.string().uuid(),
  items: z.array(saleItemSchema).min(1, "At least one item required"),
  total: z.number().min(0),
  paymentMethod: z.enum(["cash", "mobile_money", "card"]),
});

export type SaleItemInput = z.infer<typeof saleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreatePublicSaleInput = z.infer<typeof createPublicSaleSchema>;
