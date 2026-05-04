import { QuickbooksClient } from "../quickbooks-client.js";
import { ToolResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

export async function getCompanyInfo(client: QuickbooksClient, companyId?: string): Promise<ToolResponse<any>> {
  try {
    await client.authenticate();
    const quickbooks = client.getQuickbooks();
    const id = companyId || (quickbooks as any).realmId;

    return new Promise((resolve) => {
      (quickbooks as any).getCompanyInfo(id, (err: any, info: any) => {
        if (err) {
          resolve({ result: null, isError: true, error: formatError(err) });
        } else {
          resolve({ result: info, isError: false, error: null });
        }
      });
    });
  } catch (error) {
    return { result: null, isError: true, error: formatError(error) };
  }
}
