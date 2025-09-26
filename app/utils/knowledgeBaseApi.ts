// Knowledge Base API service for CRUD operations and asset linking

import { apiClient } from "./apiClient";

export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
  project_name: string;
  chunk_size?: number;
  chunk_overlap?: number;
}

export interface KnowledgeBaseResponse {
  message: string;
  name: string;
  project_name: string;
  collection_name: string;
  user_id: string;
  id: string;
}

export interface LinkAssetResponse {
  message: string;
  asset_id: number;
  knowledge_base_id: number;
  chunks_created: number;
}

export interface UnlinkAssetResponse {
  message: string;
  asset_id: number;
  chunks_removed: number;
}

class KnowledgeBaseApi {
  /**
   * Create a new knowledge base
   */
  async createKnowledgeBase(
    data: CreateKnowledgeBaseRequest
  ): Promise<KnowledgeBaseResponse> {
    return await apiClient.post<KnowledgeBaseResponse>(
      "/agent/knowledge-bases",
      data
    );
  }

  /**
   * Delete a knowledge base
   */
  async deleteKnowledgeBase(kbName: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(
      `/agent/knowledge-bases/${kbName}`
    );
  }

  /**
   * Link an asset to a knowledge base
   */
  async linkAssetToKnowledgeBase(
    workspaceId: number,
    assetId: number,
    knowledgeBaseId: number
  ): Promise<LinkAssetResponse> {
    return await apiClient.post<LinkAssetResponse>(
      `/workspaces/${workspaceId}/assets/${assetId}/link-to-kb/${knowledgeBaseId}`,
      {}
    );
  }

  /**
   * Unlink an asset from its knowledge base
   */
  async unlinkAssetFromKnowledgeBase(
    workspaceId: number,
    assetId: number
  ): Promise<UnlinkAssetResponse> {
    return await apiClient.delete<UnlinkAssetResponse>(
      `/workspaces/${workspaceId}/assets/${assetId}/unlink-from-kb`
    );
  }

  /**
   * Link a collection to a knowledge base
   */
  async linkCollectionToKnowledgeBase(
    workspaceId: number,
    collectionId: number,
    knowledgeBaseId: number
  ): Promise<LinkAssetResponse> {
    return await apiClient.post<LinkAssetResponse>(
      `/workspaces/${workspaceId}/collections/${collectionId}/link-to-kb/${knowledgeBaseId}`,
      {}
    );
  }

  /**
   * Unlink a collection from its knowledge base
   */
  async unlinkCollectionFromKnowledgeBase(
    workspaceId: number,
    collectionId: number
  ): Promise<UnlinkAssetResponse> {
    return await apiClient.delete<UnlinkAssetResponse>(
      `/workspaces/${workspaceId}/collections/${collectionId}/unlink-from-kb`
    );
  }
}

export const knowledgeBaseApi = new KnowledgeBaseApi();
export default KnowledgeBaseApi;
