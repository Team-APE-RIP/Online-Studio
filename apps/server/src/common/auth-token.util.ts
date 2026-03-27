import { UnauthorizedException } from "@nestjs/common";
import { createHmac } from "node:crypto";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf-8");
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function parseBearerToken(authorization?: string | null) {
  if (!authorization) {
    throw new UnauthorizedException("Missing authorization header");
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedException("Invalid authorization header");
  }

  return token;
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new UnauthorizedException("Invalid token format");
  }

  const secret =
    process.env.JWT_SECRET ||
    "team-ape-rip-development-secret-change-in-production";

  const expectedSignature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  if (signature !== expectedSignature) {
    throw new UnauthorizedException("Invalid token signature");
  }

  try {
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload),
    ) as AuthTokenPayload;

    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp <= now) {
      throw new UnauthorizedException("Token has expired");
    }

    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }

    throw new UnauthorizedException("Failed to parse token payload");
  }
}

export function signAuthToken(payload: Record<string, unknown>) {
  const secret =
    process.env.JWT_SECRET ||
    "team-ape-rip-development-secret-change-in-production";

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + 60 * 60 * 24 * 7;

  const fullPayload = {
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = encodeBase64Url(JSON.stringify(header));
  const encodedPayload = encodeBase64Url(JSON.stringify(fullPayload));
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}