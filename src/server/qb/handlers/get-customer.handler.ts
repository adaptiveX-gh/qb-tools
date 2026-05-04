import { QuickbooksClient } from "../quickbooks-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export async function getCustomer(client: QuickbooksClient, id: string): Promise<ToolResponse<any>> {
  try {
    await client.authenticate();
    const quickbooks = client.getQuickbooks();

    return new Promise((resolve) => {
      (quickbooks as any).getCustomer(id, (err: any, customer: any) => {
        if (err) {
          resolve({ result: null, isError: true, error: formatError(err) });
        } else {
          resolve({ result: customer, isError: false, error: null });
        }
      });
    });
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
