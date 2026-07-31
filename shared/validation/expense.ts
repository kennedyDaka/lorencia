import { z } from "zod";

export const createExpenseSchema = z.object({
  businessId: z.string().uuid(),
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(0, "Amount must be positive"),
  note: z.string().optional(),
});

export const itemLineSchema = z.object({
  description: z.string().min(1),
  qty: z.number().min(0),
  unit: z.string().optional(),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
});

export const createItemizedExpenseSchema = z.object({
  businessId: z.string().uuid(),
  category: z.string().min(1, "Category is required"),
  items: z.array(itemLineSchema).min(1, "At least one item required"),
  note: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ItemLineInput = z.infer<typeof itemLineSchema>;
export type CreateItemizedExpenseInput = z.infer<typeof createItemizedExpenseSchema>;
