const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ordo_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(
      data.error?.message ?? "Request failed",
      data.error?.code ?? "ERROR",
      res.status
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

// ─── Price helpers ────────────────────────────────────────────────────────
/** ₹850 (string) → 85000 (paise int) */
export function rupeesToPaise(rupees: string): number {
  return Math.round(parseFloat(rupees) * 100);
}

/** 85000 (paise int) → "850" (rupees string) */
export function paiseToRupees(paise: number): string {
  return (paise / 100).toString();
}
