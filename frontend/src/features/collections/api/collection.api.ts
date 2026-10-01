import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  Collection,
  CreateCollectionRequest,
  PageResponse,
  UpdateCollectionRequest,
} from "../types/collection.types";

export async function getCollections(
  workspaceId: string,
  page = 0,
  size = 50
): Promise<Collection[]> {
  const response = await apiClient<ApiResponse<PageResponse<Collection>> | ApiResponse<Collection[]>>(
    `/workspaces/${workspaceId}/collections?page=${page}&size=${size}`
  );

  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  return data.content || [];
}

export async function getCollection(collectionId: string): Promise<Collection> {
  const response = await apiClient<ApiResponse<Collection>>(`/collections/${collectionId}`);
  return response.data;
}

export async function createCollection(
  workspaceId: string,
  request: CreateCollectionRequest
): Promise<Collection> {
  const response = await apiClient<ApiResponse<Collection>>(
    `/workspaces/${workspaceId}/collections`,
    {
      method: "POST",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function updateCollection(
  collectionId: string,
  request: UpdateCollectionRequest
): Promise<Collection> {
  const response = await apiClient<ApiResponse<Collection>>(
    `/collections/${collectionId}`,
    {
      method: "PATCH",
      data: JSON.stringify(request),
    }
  );
  return response.data;
}

export async function deleteCollection(collectionId: string): Promise<void> {
  await apiClient<ApiResponse<void>>(`/collections/${collectionId}`, {
    method: "DELETE",
  });
}
