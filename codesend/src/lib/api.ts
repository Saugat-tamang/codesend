import { API_BASE_URL } from "@/lib/constants";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Set false for multipart/form-data requests (skips the JSON content-type header). */
  json?: boolean;
}

/**
 * Thin fetch wrapper for the CodeShare API.
 * Assumes the backend issues an httpOnly session cookie on login/register
 * (hence `credentials: "include"` on every call) rather than the frontend
 * handling bearer tokens directly. If your API uses bearer tokens instead,
 * attach the header here and nowhere else — every service call goes
 * through this one function.
 */
export async function apiFetch<T>(
  path: string,
  { json = true, headers, ...options }: ApiFetchOptions = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : null;

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message?: unknown }).message)
        : undefined) ?? "Something went wrong. Please try again.";
    throw new ApiError(message, res.status);
  }

  return body as T;
}
