// Workspace API service for all CRUD operations

import {
  MessageResponse,
  Workspace,
  WorkspaceCreate,
  WorkspaceDetailed,
  WorkspaceUpdate,
} from "../types/workspace";
import { apiClient } from "./apiClient";

class WorkspaceApi {
  /**
   * Create a new workspace
   */
  async createWorkspace(data: WorkspaceCreate): Promise<Workspace> {
    return await apiClient.post<Workspace>("/workspaces", data);
  }

  /**
   * List all workspaces for the current user with optional filtering
   */
  async listWorkspaces(options?: {
    starred?: boolean;
    archived?: boolean;
  }): Promise<Workspace[]> {
    const params = new URLSearchParams();

    if (options?.starred !== undefined) {
      params.append("starred", options.starred.toString());
    }

    if (options?.archived !== undefined) {
      params.append("archived", options.archived.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/workspaces?${queryString}` : "/workspaces";

    return await apiClient.get<Workspace[]>(endpoint);
  }

  /**
   * Get detailed workspace information with all related data
   */
  async getWorkspaceDetailed(workspaceId: number): Promise<WorkspaceDetailed> {
    return await apiClient.get<WorkspaceDetailed>(`/workspaces/${workspaceId}`);
  }

  /**
   * Update a workspace (only owner can update)
   */
  async updateWorkspace(
    workspaceId: number,
    data: WorkspaceUpdate
  ): Promise<Workspace> {
    return await apiClient.put<Workspace>(`/workspaces/${workspaceId}`, data);
  }

  /**
   * Delete a workspace (only owner can delete)
   */
  async deleteWorkspace(workspaceId: number): Promise<MessageResponse> {
    return await apiClient.delete<MessageResponse>(
      `/workspaces/${workspaceId}`
    );
  }

  /**
   * Star/unstar a workspace
   */
  async starWorkspace(
    workspaceId: number,
    starred: boolean
  ): Promise<Workspace> {
    return await apiClient.put<Workspace>(`/workspaces/${workspaceId}`, {
      is_starred: starred,
    });
  }

  /**
   * Archive/unarchive a workspace
   */
  async archiveWorkspace(
    workspaceId: number,
    archived: boolean
  ): Promise<Workspace> {
    return await apiClient.put<Workspace>(`/workspaces/${workspaceId}`, {
      is_archived: archived,
    });
  }
}

export const workspaceApi = new WorkspaceApi();
export default WorkspaceApi;
