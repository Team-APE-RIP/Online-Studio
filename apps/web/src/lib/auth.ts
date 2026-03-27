export const AUTH_TOKEN_KEY = "team-ape-rip-auth-token";

export interface AuthUserPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveAuthToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function parseJwtPayload(token: string): AuthUserPayload | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded =
      typeof window !== "undefined"
        ? window.atob(normalized)
        : Buffer.from(normalized, "base64").toString("utf-8");

    return JSON.parse(decoded) as AuthUserPayload;
  } catch {
    return null;
  }
}

export function getCurrentAuthUser() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const payload = parseJwtPayload(token);

  if (!payload) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.exp <= now) {
    clearAuthToken();
    return null;
  }

  return payload;
}

export function isAuthenticated() {
  return Boolean(getCurrentAuthUser());
}