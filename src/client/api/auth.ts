import { apiFetch } from "./client";

export interface AuthStatus {
  connected: boolean;
  companyName?: string;
  realmId?: string;
}

export async function getAuthStatus(): Promise<AuthStatus> {
  return apiFetch<AuthStatus>("/api/auth/status");
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}

export function connectToQuickBooks() {
  window.location.href = "/api/auth/qb/connect";
}
