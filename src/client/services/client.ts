export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (res.status === 401) {
    // Not connected — redirect to login
    window.location.reload();
    throw new ApiError(401, "Not connected to QuickBooks");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error || res.statusText);
  }

  return res.json();
}
