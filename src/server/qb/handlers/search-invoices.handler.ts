import { QuickbooksClient } from "../quickbooks-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { buildQuickbooksSearchCriteria, QuickbooksSearchCriteriaInput } from "../helpers/build-search-criteria.js";

export async function searchInvoices(client: QuickbooksClient, criteria: QuickbooksSearchCriteriaInput): Promise<ToolResponse<any[]>> {
  try {
    await client.authenticate();
    const quickbooks = client.getQuickbooks();
    const normalizedCriteria = buildQuickbooksSearchCriteria(criteria);

    return new Promise((resolve) => {
      (quickbooks as any).findInvoices(normalizedCriteria, (err: any, invoices: any) => {
        if (err) {
          resolve({ result: null, isError: true, error: formatError(err) });
        } else {
          resolve({ result: invoices.QueryResponse.Invoice || [], isError: false, error: null });
        }
      });
    });
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
