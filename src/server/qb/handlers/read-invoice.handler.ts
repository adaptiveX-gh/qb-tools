import { QuickbooksClient } from "../quickbooks-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export async function readInvoice(client: QuickbooksClient, invoiceId: string): Promise<ToolResponse<any>> {
  try {
    await client.authenticate();
    const quickbooks = client.getQuickbooks();

    return new Promise((resolve) => {
      (quickbooks as any).getInvoice(invoiceId, (err: any, invoice: any) => {
        if (err) {
          resolve({ result: null, isError: true, error: formatError(err) });
        } else {
          resolve({ result: invoice, isError: false, error: null });
        }
      });
    });
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
