import { apiClient } from "./apiClient";

export interface Collection {
  id: number;
  name: string;
  description?: string;
  collection_metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  workspace_id: number;
  asset_count?: number;
}

export interface CollectionCreate {
  name: string;
  description?: string;
  collection_metadata?: Record<string, unknown>;
  is_active?: boolean;
}

export interface Asset {
  id: number;
  type: string;
  title: string;
  url?: string;
  file_path?: string;
  content?: string;
  collection_id?: number;
  knowledge_base_id?: number;
  is_active: boolean;
  created_at: string;
}

export const collectionApi = {
  // Create a new collection
  async createCollection(
    workspaceId: number,
    data: CollectionCreate
  ): Promise<Collection> {
    return await apiClient.post<Collection>(
      `/workspaces/${workspaceId}/collections/`,
      data
    );
  },

  // Get all collections in a workspace
  async getCollections(workspaceId: number): Promise<Collection[]> {
    return await apiClient.get<Collection[]>(
      `/workspaces/${workspaceId}/collections/`
    );
  },

  // Get a specific collection
  async getCollection(
    workspaceId: number,
    collectionId: number
  ): Promise<Collection> {
    return await apiClient.get<Collection>(
      `/workspaces/${workspaceId}/collections/${collectionId}`
    );
  },

  // Update a collection
  async updateCollection(
    workspaceId: number,
    collectionId: number,
    data: Partial<CollectionCreate>
  ): Promise<Collection> {
    return await apiClient.put<Collection>(
      `/workspaces/${workspaceId}/collections/${collectionId}`,
      data
    );
  },

  // Delete a collection
  async deleteCollection(
    workspaceId: number,
    collectionId: number
  ): Promise<void> {
    await apiClient.delete<void>(
      `/workspaces/${workspaceId}/collections/${collectionId}`
    );
  },

  // Rename a collection
  async renameCollection(
    workspaceId: number,
    collectionId: number,
    newName: string
  ): Promise<Collection> {
    return await apiClient.patch<Collection>(
      `/workspaces/${workspaceId}/collections/${collectionId}/rename?new_name=${encodeURIComponent(
        newName
      )}`,
      {}
    );
  },

  // Link an existing asset to a collection
  async linkAssetToCollection(
    workspaceId: number,
    assetId: number,
    collectionId: number
  ): Promise<Asset> {
    return await apiClient.post<Asset>(
      `/workspaces/${workspaceId}/assets/${assetId}/link-to-collection/${collectionId}`,
      {} // No body needed for the new endpoint
    );
  },

  // Unlink an asset from a collection
  async unlinkAssetFromCollection(
    workspaceId: number,
    assetId: number,
    collectionId: number
  ): Promise<Asset> {
    return await apiClient.delete<Asset>(
      `/workspaces/${workspaceId}/assets/${assetId}/unlink-from-collection/${collectionId}`
    );
  },
};
