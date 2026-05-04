import { apiFetch } from "./client";

export interface CreateInvoicePayload {
  customer_ref: string;
  line_items: Array<{
    item_ref: string;
    qty: number;
    unit_price: number;
    description?: string;
  }>;
  doc_number?: string;
  txn_date?: string;
}

export interface BulkResult {
  results: Array<{
    success: boolean;
    invoice?: any;
    error?: string;
    index: number;
  }>;
}

export async function bulkCreateInvoices(invoices: CreateInvoicePayload[]): Promise<BulkResult> {
  return apiFetch<BulkResult>("/api/invoices/bulk", {
    method: "POST",
    body: JSON.stringify({ invoices }),
  });
}

export async function searchInvoices(query?: object): Promise<any[]> {
  const params = query ? `?q=${encodeURIComponent(JSON.stringify(query))}` : "";
  return apiFetch<any[]>(`/api/invoices${params}`);
}
