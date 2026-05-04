import { apiFetch } from "./client";

export async function searchItems(query?: object): Promise<any[]> {
  const params = query ? `?q=${encodeURIComponent(JSON.stringify(query))}` : "";
  return apiFetch<any[]>(`/api/items${params}`);
}
