import { getAuthToken } from "@/src/lib/auth";

export interface UpdateResourcePayload {
  type?: string;
  title?: string;
  slug?: string;
  summary?: string;
  content?: object;
  baseRevision?: string;
}

interface ResourceResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    organizationId: string;
    projectId: string;
    type: string;
    title: string;
    slug: string;
    summary: string | null;
    createdAt: string;
    updatedAt: string;
    revision: string;
  };
  timestamp: string;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export async function updateResource(
  resourceId: string,
  payload: UpdateResourcePayload,
) {
  const token = getAuthToken();

  const response = await fetch(`${getApiBaseUrl()}/resources/${resourceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as ResourceResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update resource");
  }

  return result.data;
}