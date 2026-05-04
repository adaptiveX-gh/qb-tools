import { z } from "zod";

const lineItemSchema = z.object({
  item_ref: z.string().min(1),
  qty: z.number().positive(),
  unit_price: z.number().nonnegative(),
  description: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  customer_ref: z.string().min(1),
  line_items: z.array(lineItemSchema).min(1),
  doc_number: z.string().optional(),
  txn_date: z.string().optional(),
});

export const bulkCreateInvoicesSchema = z.object({
  invoices: z.array(createInvoiceSchema).min(1),
});
