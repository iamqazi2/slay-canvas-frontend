// Asset API service for CRUD operations

import { apiClient } from "./apiClient";

export interface AssetMetadata {
  [key: string]: string | number | boolean | null;
}

export interface AssetCreate {
  type: string;
  url?: string;
  title?: string;
  content?: string;
  asset_metadata?: AssetMetadata;
  collection_id?: number;
  is_active?: boolean;
}

export interface AssetCreateWithFile {
  type: string;
  title?: string;
  asset_metadata?: AssetMetadata;
  collection_id?: number;
  is_active?: boolean;
}

export interface AssetRead {
  id: number;
  type: string;
  url?: string;
  title?: string;
  content?: string;
  file_path?: string;
  asset_metadata?: AssetMetadata;
  workspace_id: number;
  user_id?: number;
  collection_id?: number;
  knowledge_base_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class AssetApi {
  /**
   * Create a link-based asset (social, wiki, internet)
   */
  async createLinkAsset(
    workspaceId: number,
    data: AssetCreate
  ): Promise<AssetRead> {
    return await apiClient.post<AssetRead>(
      `/workspaces/${workspaceId}/assets/link/`,
      data
    );
  }

  /**
   * Create a text asset
   */
  async createTextAsset(
    workspaceId: number,
    data: AssetCreate
  ): Promise<AssetRead> {
    return await apiClient.post<AssetRead>(
      `/workspaces/${workspaceId}/assets/text/`,
      data
    );
  }

  /**
   * Upload a file asset
   */
  async uploadFileAsset(
    workspaceId: number,
    file: File,
    assetType: "image" | "audio" | "document",
    title?: string,
    collectionId?: number
  ): Promise<AssetRead> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("asset_type", assetType);

    if (title) {
      formData.append("title", title);
    }

    if (collectionId) {
      formData.append("collection_id", collectionId.toString());
    }

    return await apiClient.post<AssetRead>(
      `/workspaces/${workspaceId}/assets/file/`,
      formData
    );
  }

  /**
   * List assets in workspace
   */
  async listAssets(
    workspaceId: number,
    assetType?: string,
    collectionId?: number
  ): Promise<AssetRead[]> {
    const params = new URLSearchParams();

    if (assetType) {
      params.append("asset_type", assetType);
    }

    if (collectionId) {
      params.append("collection_id", collectionId.toString());
    }

    const query = params.toString();
    const url = `/workspaces/${workspaceId}/assets/${query ? `?${query}` : ""}`;

    return await apiClient.get<AssetRead[]>(url);
  }

  /**
   * Get a specific asset
   */
  async getAsset(workspaceId: number, assetId: number): Promise<AssetRead> {
    return await apiClient.get<AssetRead>(
      `/workspaces/${workspaceId}/assets/${assetId}`
    );
  }

  /**
   * Delete an asset
   */
  async deleteAsset(workspaceId: number, assetId: number): Promise<void> {
    return await apiClient.delete<void>(
      `/workspaces/${workspaceId}/assets/${assetId}`
    );
  }
}

export const assetApi = new AssetApi();
export default AssetApi;
