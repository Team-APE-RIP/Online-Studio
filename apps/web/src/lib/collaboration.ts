import { io, type Socket } from "socket.io-client";
import { getAuthToken } from "@/src/lib/auth";

export interface CollaborationPresenceUser {
  userId: string;
  username: string;
  email: string;
  joinedAt: string;
}

export interface CollaborationSnapshot {
  id: string;
  organizationId: string;
  projectId: string;
  type: string;
  title: string;
  slug: string;
  summary: string | null;
  content: Record<string, unknown>;
  revision: string;
  updatedAt: string;
}

export interface CollaborationUpdatedPayload {
  id: string;
  projectId: string;
  organizationId: string;
  content: Record<string, unknown>;
  revision: string;
  updatedAt: string;
  updatedBy: {
    userId: string;
    username: string;
  };
}

function normalizeApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function getCollaborationServerUrl() {
  const apiBaseUrl = normalizeApiBaseUrl();

  if (apiBaseUrl.startsWith("http://") || apiBaseUrl.startsWith("https://")) {
    return apiBaseUrl.replace(/\/api\/v1$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

export function createCollaborationSocket() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const socket: Socket = io(`${getCollaborationServerUrl()}/collaboration`, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  return socket;
}