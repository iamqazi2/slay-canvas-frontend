"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Archive, Plus, MoreHorizontal } from "lucide-react";
import DeleteIcon from "../components/icons/DeleteIcon";
import EditIcon from "../components/icons/EditIcon";
import { GridIcon } from "../components/icons";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useUserStore } from "../store/userStore";
import { useToast } from "../components/ui/Toast";
import EditWorkspaceModal from "../components/modals/EditWorkspaceModal";
import ChatNav from "../components/New-Navbar";

export default function BoardsDashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const {
    workspaces,
    isLoading: workspaceLoading,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
  } = useWorkspaceStore();

  const { isAuthenticated } = useUserStore();

  const [starredMap, setStarredMap] = useState<Record<number, boolean>>({});
  const [archivedMap, setArchivedMap] = useState<Record<number, boolean>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<
    "all" | "starred" | "archived"
  >("all");

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Load workspaces on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, fetchWorkspaces]);

  // Initialize starred and archived maps when workspaces load
  useEffect(() => {
    const newStarred: Record<number, boolean> = {};
    const newArchived: Record<number, boolean> = {};
    workspaces.forEach((ws) => {
      newStarred[ws.id] = starredMap[ws.id] || false;
      newArchived[ws.id] = archivedMap[ws.id] || false;
    });
    setStarredMap(newStarred);
    setArchivedMap(newArchived);
  }, [workspaces]);

  const toggleStar = (boardId: number) => {
    setStarredMap((prev) => ({
      ...prev,
      [boardId]: !prev[boardId],
    }));
  };

  const archiveBoard = (boardId: number) => {
    setArchivedMap((prev) => ({
      ...prev,
      [boardId]: true,
    }));
    setOpenDropdown(null);
  };

  const deleteBoard = async (boardId: number) => {
    const success = await deleteWorkspace(boardId);
    if (success) {
      showToast("Board deleted successfully", "success");
      fetchWorkspaces();
    } else {
      showToast("Failed to delete board", "error");
    }
    setOpenDropdown(null);
  };

  const handleSelectBoard = async (boardId: number) => {
    await switchWorkspace(boardId);
    router.push("/dashboard");
  };

  const handleCreateNewBoard = async () => {
    const newWorkspace = await createWorkspace({
      name: `Board ${workspaces.length + 1}`,
      description: "New board",
      settings: {},
      is_public: false,
      collaborator_ids: [],
    });
    if (newWorkspace) {
      showToast("New board created", "success");
      fetchWorkspaces();
    }
  };

  const handleEditWorkspace = (workspace: { id: number; name: string }) => {
    setSelectedWorkspace(workspace);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async (newName: string) => {
    if (!selectedWorkspace) return;

    const success = await updateWorkspace(selectedWorkspace.id, {
      name: newName,
    });

    if (success) {
      setIsEditModalOpen(false);
      setSelectedWorkspace(null);
      fetchWorkspaces();
      showToast("Board updated successfully", "success");
    } else {
      showToast("Failed to update board", "error");
    }
  };

  const getFilteredBoards = () => {
    return workspaces.filter((ws) => {
      const isStarred = starredMap[ws.id] || false;
      const isArchived = archivedMap[ws.id] || false;
      switch (currentView) {
        case "starred":
          return isStarred && !isArchived;
        case "archived":
          return isArchived;
        default:
          return !isArchived;
      }
    });
  };

  const getSectionTitle = () => {
    switch (currentView) {
      case "starred":
        return "Starred Boards";
      case "archived":
        return "Archived Boards";
      default:
        return "Recent Boards";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <ChatNav />
      <div className="flex flex-1 bg-gray-50 relative">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Navigation Items */}
            <div className="flex-1 p-4 space-y-1">
              {/* All Boards */}
              <button
                onClick={() => setCurrentView("all")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === "all"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <GridIcon className="w-5 h-5 " />
                <span className="font-normal">All Boards</span>
              </button>

              {/* Starred */}
              <button
                onClick={() => setCurrentView("starred")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === "starred"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Star className="w-5 h-5" />
                <span className="font-normal">Starred</span>
              </button>

              {/* Templates */}
              {/* <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Grid2x2 className="w-5 h-5" />
            <span className="font-medium">Templates</span>
          </button> */}

              {/* Shared with me */}
              {/* <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium">Shared with me</span>
          </button> */}

              {/* Folders Section */}
              {/* <div className="pt-6">
            <div className="flex items-center justify-between px-4 py-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Folders</span>
              <button className="text-gray-500 hover:text-gray-700">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Folder className="w-5 h-5" />
              <span className="font-medium">Instagram Page</span>
            </button>
          </div> */}
            </div>

            {/* Archived Boards */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setCurrentView("archived")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === "archived"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Archive className="w-5 h-5" />
                <span className="font-normal">Archived Boards</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-8">
              {/* New Board Button */}
              <button
                onClick={handleCreateNewBoard}
                disabled={workspaceLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-2xl py-6 px-8 flex items-center justify-center gap-3 mb-8 transition-colors shadow-sm"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xl font-semibold">New Board</span>
              </button>

              {/* Boards Section */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {getSectionTitle()}
                </h2>

                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {getFilteredBoards().map((ws, index) => (
                    <div
                      key={ws.id}
                      className="bg-white rounded-xl p-6 flex items-center gap-6 hover:shadow-md transition-shadow border border-gray-200 relative"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-800 font-bold text-lg">
                        {index + 1}
                      </div>

                      {/* Board Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => handleSelectBoard(ws.id)}
                          className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600"
                        >
                          {ws.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Created {new Date(ws.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => toggleStar(ws.id)}
                          className={`transition-colors ${
                            starredMap[ws.id]
                              ? "text-red-500"
                              : "text-gray-400 hover:text-yellow-500"
                          }`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starredMap[ws.id] ? "fill-current" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWorkspace({ id: ws.id, name: ws.name });
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit board"
                        >
                          <EditIcon size={24} color="#6B7280" />
                        </button>
                        <button
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === ws.id ? null : ws.id
                            )
                          }
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreHorizontal className="w-6 h-6" />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      {openDropdown === ws.id && (
                        <div className="absolute right-6 top-18 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => archiveBoard(ws.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Archive className="w-5 h-5" />
                            <span>Archive Board</span>
                          </button>
                          <button
                            onClick={() => deleteBoard(ws.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <DeleteIcon size={20} color="currentColor" />
                            <span>Delete Board</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Edit Workspace Modal */}
      <EditWorkspaceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedWorkspace(null);
        }}
        onSubmit={handleConfirmEdit}
        workspaceName={selectedWorkspace?.name || ""}
        isLoading={workspaceLoading}
      />
    </div>
  );
}
