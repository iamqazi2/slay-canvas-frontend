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
   * List all workspaces for the current user
   */
  async listWorkspaces(): Promise<Workspace[]> {
    return await apiClient.get<Workspace[]>("/workspaces");
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
}

export const workspaceApi = new WorkspaceApi();
export default WorkspaceApi;
