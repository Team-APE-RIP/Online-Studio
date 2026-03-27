import { getAuthToken } from "@/src/lib/auth";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

function normalizeBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildAuthorizationHeader(init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});
  const hasAuthorization = headers.has("Authorization");

  if (!hasAuthorization) {
    const token = getAuthToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export async function fetchApi<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiEnvelope<T>> {
  const baseUrl = normalizeBaseUrl();
  const requestPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${baseUrl}${requestPath}`, {
    ...init,
    headers: buildAuthorizationHeader(init),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as ApiEnvelope<T>;
}

export async function safeFetchApi<T>(
  path: string,
  fallback: T,
  init?: RequestInit,
): Promise<T> {
  try {
    const response = await fetchApi<T>(path, init);
    return response.data;
  } catch {
    return fallback;
  }
}