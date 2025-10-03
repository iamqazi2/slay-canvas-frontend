// Workspace store using Zustand for state management

import {
  Workspace,
  WorkspaceCreate,
  WorkspaceDetailed,
  WorkspaceUpdate,
} from "@/app/types/workspace";
import { workspaceApi } from "@/app/utils/workspaceApi";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: WorkspaceDetailed | null;
  currentWorkspaceId: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentWorkspaceId: (id: number | null) => void;

  // API Actions
  fetchWorkspaces: (options?: {
    starred?: boolean;
    archived?: boolean;
  }) => Promise<void>;
  createWorkspace: (data: WorkspaceCreate) => Promise<Workspace | null>;
  updateWorkspace: (
    id: number,
    data: WorkspaceUpdate
  ) => Promise<Workspace | null>;
  deleteWorkspace: (id: number) => Promise<boolean>;
  starWorkspace: (id: number, starred: boolean) => Promise<boolean>;
  archiveWorkspace: (id: number, archived: boolean) => Promise<boolean>;
  fetchWorkspaceDetails: (id: number) => Promise<WorkspaceDetailed | null>;
  switchWorkspace: (id: number) => Promise<void>;

  // Local state management
  clearError: () => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspace: null,
      currentWorkspaceId: null,
      isLoading: false,
      error: null,

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setCurrentWorkspaceId: (currentWorkspaceId: number | null) => {
        set({ currentWorkspaceId });
      },

      fetchWorkspaces: async (options?: {
        starred?: boolean;
        archived?: boolean;
      }) => {
        try {
          set({ isLoading: true, error: null });

          const workspaces = await workspaceApi.listWorkspaces(options);

          set({
            workspaces,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to fetch workspaces:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch workspaces",
            isLoading: false,
          });
        }
      },

      createWorkspace: async (data: WorkspaceCreate) => {
        try {
          set({ isLoading: true, error: null });

          const newWorkspace = await workspaceApi.createWorkspace(data);

          set((state) => ({
            workspaces: [...state.workspaces, newWorkspace],
            isLoading: false,
          }));

          return newWorkspace;
        } catch (error) {
          console.error("Failed to create workspace:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create workspace",
            isLoading: false,
          });
          return null;
        }
      },

      updateWorkspace: async (id: number, data: WorkspaceUpdate) => {
        try {
          set({ isLoading: true, error: null });

          const updatedWorkspace = await workspaceApi.updateWorkspace(id, data);

          set((state) => ({
            workspaces: state.workspaces.map((ws) =>
              ws.id === id ? updatedWorkspace : ws
            ),
            currentWorkspace:
              state.currentWorkspace?.id === id
                ? { ...state.currentWorkspace, ...updatedWorkspace }
                : state.currentWorkspace,
            isLoading: false,
          }));

          return updatedWorkspace;
        } catch (error) {
          console.error("Failed to update workspace:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update workspace",
            isLoading: false,
          });
          return null;
        }
      },

      deleteWorkspace: async (id: number) => {
        try {
          set({ isLoading: true, error: null });

          await workspaceApi.deleteWorkspace(id);

          set((state) => ({
            workspaces: state.workspaces.filter((ws) => ws.id !== id),
            currentWorkspace:
              state.currentWorkspace?.id === id ? null : state.currentWorkspace,
            currentWorkspaceId:
              state.currentWorkspaceId === id ? null : state.currentWorkspaceId,
            isLoading: false,
          }));

          return true;
        } catch (error) {
          console.error("Failed to delete workspace:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete workspace",
            isLoading: false,
          });
          return false;
        }
      },

      starWorkspace: async (id: number, starred: boolean) => {
        try {
          const updatedWorkspace = await workspaceApi.starWorkspace(
            id,
            starred
          );

          set((state) => ({
            workspaces: state.workspaces.map((ws) =>
              ws.id === id ? updatedWorkspace : ws
            ),
            currentWorkspace:
              state.currentWorkspace?.id === id
                ? { ...state.currentWorkspace, ...updatedWorkspace }
                : state.currentWorkspace,
          }));

          return true;
        } catch (error) {
          console.error("Failed to star/unstar workspace:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update workspace",
          });
          return false;
        }
      },

      archiveWorkspace: async (id: number, archived: boolean) => {
        try {
          const updatedWorkspace = await workspaceApi.archiveWorkspace(
            id,
            archived
          );

          set((state) => ({
            workspaces: state.workspaces.map((ws) =>
              ws.id === id ? updatedWorkspace : ws
            ),
            currentWorkspace:
              state.currentWorkspace?.id === id
                ? { ...state.currentWorkspace, ...updatedWorkspace }
                : state.currentWorkspace,
          }));

          return true;
        } catch (error) {
          console.error("Failed to archive/unarchive workspace:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update workspace",
          });
          return false;
        }
      },

      fetchWorkspaceDetails: async (id: number) => {
        try {
          set({ isLoading: true, error: null });

          const workspaceDetails = await workspaceApi.getWorkspaceDetailed(id);

          set({
            currentWorkspace: workspaceDetails,
            currentWorkspaceId: id,
            isLoading: false,
          });

          return workspaceDetails;
        } catch (error) {
          console.error("Failed to fetch workspace details:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch workspace details",
            isLoading: false,
          });
          return null;
        }
      },

      switchWorkspace: async (id: number) => {
        const state = get();

        // If already current workspace, no need to fetch again
        // if (state.currentWorkspaceId === id && state.currentWorkspace) {
        //   return;
        // }

        await state.fetchWorkspaceDetails(id);
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set({
          workspaces: [],
          currentWorkspace: null,
          currentWorkspaceId: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "workspace-storage",
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
);
