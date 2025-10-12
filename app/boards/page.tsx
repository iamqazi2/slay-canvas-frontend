"use client";
import { Archive, MoreHorizontal, Plus, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GridIcon } from "../components/icons";
import DeleteIcon from "../components/icons/DeleteIcon";
import EditIcon from "../components/icons/EditIcon";
import EditWorkspaceModal from "../components/modals/EditWorkspaceModal";
import ChatNav from "../components/New-Navbar";
import { useToast } from "../components/ui/Toast";
import { useUserStore } from "../store/userStore";
import { useWorkspaceStore } from "../store/workspaceStore";

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
    starWorkspace,
    archiveWorkspace,
  } = useWorkspaceStore();

  const { isAuthenticated } = useUserStore();

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

  // Load workspaces on mount and when view changes
  useEffect(() => {
    if (isAuthenticated) {
      const filterOptions = getFilterOptionsForView(currentView);
      fetchWorkspaces(filterOptions);
    }
  }, [isAuthenticated, currentView, fetchWorkspaces]);

  // Helper function to get filter options based on current view
  const getFilterOptionsForView = (view: "all" | "starred" | "archived") => {
    switch (view) {
      case "starred":
        return { starred: true, archived: false };
      case "archived":
        return { archived: true };
      case "all":
      default:
        return { archived: false }; // Show only non-archived for "all"
    }
  };

  const toggleStar = async (boardId: number, currentStarred: boolean) => {
    const success = await starWorkspace(boardId, !currentStarred);
    if (success) {
      showToast(
        !currentStarred ? "Board starred" : "Board unstarred",
        "success"
      );
      // Refresh current view
      const filterOptions = getFilterOptionsForView(currentView);
      fetchWorkspaces(filterOptions);
    } else {
      showToast("Failed to update board", "error");
    }
  };

  const archiveBoard = async (boardId: number) => {
    const success = await archiveWorkspace(boardId, true);
    if (success) {
      showToast("Board archived", "success");
      // Refresh current view
      const filterOptions = getFilterOptionsForView(currentView);
      fetchWorkspaces(filterOptions);
    } else {
      showToast("Failed to archive board", "error");
    }
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
    router.push(`/workspace/${boardId}`);
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
      // Refresh current view
      const filterOptions = getFilterOptionsForView(currentView);
      fetchWorkspaces(filterOptions);
      showToast("Board updated successfully", "success");
    } else {
      showToast("Failed to update board", "error");
    }
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

  // Generate gradient colors for board thumbnails
  const getGradientColor = (index: number) => {
    const gradients = [
      "from-[#8e5eff] to-[#4596ff]",
      "from-[#4596ff] to-[#8e5eff]",
      "from-[#8e5eff]/80 to-[#4596ff]/80",
      "from-[#4596ff]/80 to-[#8e5eff]/80",
      "from-[#8e5eff]/60 to-[#4596ff]/60",
      "from-[#4596ff]/60 to-[#8e5eff]/60",
      "from-[#8e5eff]/40 to-[#4596ff]/40",
      "from-[#4596ff]/40 to-[#8e5eff]/40",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="h-screen flex flex-col">
      <ChatNav />
      <div className="flex flex-1 bg-gradient-to-br from-[#8e5eff]/5 to-[#4596ff]/5 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#8e5eff]/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-[#4596ff]/20 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-[#8e5eff]/15 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Sidebar with glass effect */}
        <div className="w-80 bg-white/70 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-xl relative z-10">
          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2">
            {/* All Boards */}
            <button
              onClick={() => setCurrentView("all")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                currentView === "all"
                  ? "text-[#4596ff] bg-gradient-to-r from-[#8e5eff]/10 to-[#4596ff]/10 backdrop-blur-sm shadow-lg scale-105"
                  : "text-gray-700 hover:bg-white/50 hover:backdrop-blur-sm hover:shadow-md"
              }`}
            >
              <GridIcon className="w-5 h-5" />
              <span className="font-medium">All Boards</span>
            </button>

            {/* Starred */}
            <button
              onClick={() => setCurrentView("starred")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                currentView === "starred"
                  ? "text-[#8e5eff] bg-gradient-to-r from-[#8e5eff]/10 to-[#4596ff]/10 backdrop-blur-sm shadow-lg scale-105"
                  : "text-gray-700 hover:bg-white/50 hover:backdrop-blur-sm hover:shadow-md"
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="font-medium">Starred</span>
            </button>
          </div>

          {/* Archived Boards */}
          <div className="p-4 border-t border-white/20">
            <button
              onClick={() => setCurrentView("archived")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                currentView === "archived"
                  ? "text-[#4596ff] bg-gradient-to-r from-[#8e5eff]/10 to-[#4596ff]/10 backdrop-blur-sm shadow-lg scale-105"
                  : "text-gray-700 hover:bg-white/50 hover:backdrop-blur-sm hover:shadow-md"
              }`}
            >
              <Archive className="w-5 h-5" />
              <span className="font-medium">Archived Boards</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto relative z-10">
          <div className="max-w-7xl mx-auto p-8">
            {/* New Board Button with glass effect */}
            <button
              onClick={handleCreateNewBoard}
              disabled={workspaceLoading}
              className="w-full bg-gradient-to-r from-[#8e5eff] to-[#4596ff] hover:from-[#7c4dff] hover:to-[#3b82f6] disabled:from-gray-300 disabled:to-gray-400 text-white rounded-2xl py-6 px-8 flex items-center justify-center gap-3 mb-8 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] backdrop-blur-sm"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xl font-semibold">Create New Board</span>
            </button>

            {/* Boards Section */}
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#8e5eff] to-[#4596ff] bg-clip-text text-transparent mb-6">
                {getSectionTitle()}
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {workspaces.map((ws, index) => (
                  <div
                    key={ws.id}
                    className="group bg-white/60 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-6 transition-all duration-300 border border-white/40 relative hover:bg-white/70 z-20"
                  >
                    {/* Gradient Thumbnail */}
                    <div
                      className={`w-20 h-20 bg-gradient-to-br ${getGradientColor(
                        index
                      )} rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                    >
                      {index + 1}
                    </div>

                    {/* Board Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => handleSelectBoard(ws.id)}
                        className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-[#4596ff] transition-colors duration-200"
                      >
                        {ws.name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#4596ff] rounded-full"></span>
                        Created {new Date(ws.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          toggleStar(ws.id, ws.is_starred || false)
                        }
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          ws.is_starred
                            ? "text-[#8e5eff] bg-[#8e5eff]/10"
                            : "text-gray-400 hover:text-[#8e5eff] hover:bg-[#8e5eff]/10"
                        }`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            ws.is_starred ? "fill-current" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditWorkspace({ id: ws.id, name: ws.name });
                        }}
                        className="p-2 hover:bg-[#4596ff]/10 rounded-lg transition-all duration-300"
                        title="Edit board"
                      >
                        <EditIcon size={24} color="#6B7280" />
                      </button>
                      <button
                        onClick={() =>
                          setOpenDropdown(openDropdown === ws.id ? null : ws.id)
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-[#8e5eff]/5 rounded-lg transition-all duration-300"
                      >
                        <MoreHorizontal className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Dropdown Menu with glass effect */}
                    {openDropdown === ws.id && (
                      <div className="absolute right-6 top-20 mt-2 w-52 bg-white/90 backdrop-blur-xl border border-white/40 rounded-xl shadow-2xl z-[100]">
                        <button
                          onClick={() => archiveBoard(ws.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[#4596ff] hover:bg-[#4596ff]/10 transition-all duration-200"
                        >
                          <Archive className="w-5 h-5" />
                          <span className="font-medium">Archive Board</span>
                        </button>
                        <button
                          onClick={() => deleteBoard(ws.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[#8e5eff] hover:bg-[#8e5eff]/10 transition-all duration-200"
                        >
                          <DeleteIcon size={20} color="currentColor" />
                          <span className="font-medium">Delete Board</span>
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

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
