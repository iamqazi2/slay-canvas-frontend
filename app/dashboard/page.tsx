"use client";
import { assetApi } from "@/app/utils/assetApi";
import { knowledgeBaseApi } from "@/app/utils/knowledgeBaseApi";
import { updatePosition } from "@/app/utils/positionApi";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "../components/ui/Toast";

import { ConnectionMode } from "@xyflow/react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  NodeResizer,
  Position,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  ImageCollection,
  PdfDocument,
  Sidebar,
  SimpleChatInterface,
  TextCollection,
  VideoPreview,
  WebLink,
  WikipediaLink,
} from "../components";
import AudioPlayer from "../components/AudioPlayer";
import FolderCollection from "../components/FolderCollection";
import ChatNav from "../components/New-Navbar";
import { DeleteIcon, EditIcon } from "../components/icons";
import DeleteWorkspaceModal from "../components/modals/DeleteWorkspaceModal";
import EditWorkspaceModal from "../components/modals/EditWorkspaceModal";
import { useUserStore } from "../store/userStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import {
  Collection,
  KnowledgeBase,
  WorkspaceDetailed,
} from "../types/workspace";
import {
  assetsToComponentInstances,
  componentInstanceToAssetCreate,
  getAssetCreationStrategy,
  getAssetIdFromComponentId,
  isBackendAsset,
} from "../utils/assetUtils";
import { collectionApi } from "../utils/collectionApi";

interface AssetItem {
  id: string;
  type: string;
  title: string;
  data?: {
    file?: File;
    files?: File[];
    text?: string;
    url?: string;
    title?: string;
    content?: string;
  };
}

interface ComponentInstance {
  id: string;
  type: string;
  data?: {
    file?: File;
    files?: File[];
    text?: string;
    url?: string;
    content?: string;
    title?: string;
    name?: string;
    assets?: AssetItem[];
    collectionId?: number;
  };
  name?: string;
  assets?: AssetItem[];
  backendCollection?: Collection;
}

const renderComponent = (instance: ComponentInstance) => {
  const { id, type, data } = instance;

  switch (type) {
    case "videoCollection":
    // return (
    //   <VideoPreview
    //     key={id}
    //     id={id}
    //     file={data?.file}
    //     src={data?.url || data?.text}
    //   />
    // );
    case "videoSocial":
      return <VideoPreview key={id} id={id} src={data?.url || data?.text} />;
    case "socialVideo": // Handle social video file uploads
      return <VideoPreview key={id} id={id} file={data?.file} />;
    // return <VideoPreview key={id} file={data?.file} src={data?.text} />;
    case "audioPlayer":
      return (
        <AudioPlayer
          key={id}
          id={id}
          inline={true}
          initialData={
            data?.file
              ? { file: data.file }
              : data?.url
              ? { url: data.url, name: data.title }
              : undefined
          }
        />
      );
    case "imageCollection":
      return (
        <ImageCollection
          key={id}
          id={id}
          inline={true}
          initialData={
            data?.files
              ? { files: data.files }
              : data?.file
              ? { files: [data.file] }
              : data?.url
              ? { url: data.url, title: data.title || "Image Collection" }
              : undefined
          }
        />
      );
    case "pdfDocument":
      return (
        <PdfDocument
          key={id}
          id={id}
          inline={true}
          initialData={
            data?.file
              ? { file: data.file }
              : data?.url
              ? { url: data.url, title: data.title || "PDF Document" }
              : undefined
          }
        />
      );
    case "wikipediaLink":
      return (
        <WikipediaLink
          key={id}
          id={id}
          inline={true}
          initialData={
            data?.text
              ? { text: data.text }
              : data?.url
              ? { text: data.url }
              : undefined
          }
        />
      );
    case "webLink":
      return (
        <WebLink
          key={id}
          id={id}
          inline={true}
          initialData={
            data?.url
              ? { url: data.url, text: data.text || data.url }
              : data?.text
              ? { text: data.text }
              : undefined
          }
        />
      );
    case "text":
      return (
        <TextCollection
          key={id}
          id={id}
          inline={true}
          initialData={
            data?.text
              ? { text: data.text }
              : data?.content
              ? { text: data.content }
              : undefined
          }
        />
      );
    case "folderCollection":
      console.log("Rendering FolderCollection with data:", {
        name: data?.name || data?.title,
        assets: data?.assets,
        fullData: data,
      });
      return (
        <FolderCollection
          key={id}
          id={id}
          inline={true}
          initialData={{
            name: data?.name || data?.title,
            assets: data?.assets,
          }}
        />
      );
    default:
      return null;
  }
};

// Custom Node Components
const AssetNode = ({ data }: { data: ComponentInstance }) => {
  const handleDragStart = (e: React.DragEvent) => {
    // Set drag data for the asset
    const dragData = {
      id: data.id,
      type: data.type,
      title: getAssetTitle(data),
      data: data.data,
    };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";
  };

  const getAssetTitle = (instance: ComponentInstance): string => {
    switch (instance.type) {
      case "imageCollection":
        return "Image Collection";
      case "audioPlayer":
        return "Audio Player";
      case "videoCollection":
        return "Video Collection";
      case "pdfDocument":
        return "PDF Document";
      case "wikipediaLink":
        return "Wikipedia Link";
      case "webLink":
        return "Web Link";
      case "text":
        return "Text Content";
      case "folderCollection":
        return instance.data?.name || instance.data?.title || "Collection";
      default:
        return "Asset";
    }
  };

  return (
    <div
      className="relative "
      style={{
        border:
          data.type === "videoCollection" || data.type === "videoSocial"
            ? "1px solid #fff"
            : undefined,
        // borderRadius:
        //   data.type === "videoCollection" || data.type === "videoSocial"
        //     ? "24px"
        //     : undefined,
        //   data.type === "videoCollection" ? "1px solid #4596FF" : undefined,
        borderRadius: data.type === "videoCollection" ? "24px" : undefined,
      }}
      draggable={data.type !== "folderCollection"}
      onDragStart={handleDragStart}
    >
      {data.type === "folderCollection" && (
        <NodeResizer
          color="#fff"
          isVisible={true}
          minWidth={300}
          minHeight={200}
        />
      )}

      {/* Left handle */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{
          background: "#F0F5F7",
          width: "24px",
          height: "24px",
          border: "1px solid rgba(69, 150, 255, 0.1)",
          boxShadow: "0 0 8px rgba(69, 150, 255, 0.3)",
          left: "-28px",
          top: "55%",
          transform: "translateY(-50%)",
          zIndex: 1000,
        }}
      />

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{
          background: "#F0F5F7",
          width: "24px",
          height: "24px",
          border: "1px solid rgba(69, 150, 255, 0.1)",
          boxShadow: "0 0 8px rgba(69, 150, 255, 0.3)",
          right: "-28px",
          top: "55%",
          transform: "translateY(-50%)",
          zIndex: 1000,
        }}
      />
      {renderComponent(data)}
    </div>
  );
};

const ChatNode = ({
  data,
}: {
  data: {
    attachedAssets: ComponentInstance[];
    position: { x: number; y: number };
    knowledgeBase: KnowledgeBase;
    workspace?: WorkspaceDetailed;
    isLoading?: boolean;
  };
}) => {
  return (
    <div className="w-full h-full relative">
      {data.isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4596FF]"></div>
            <span className="text-sm text-gray-600">Connecting...</span>
          </div>
        </div>
      )}
      <SimpleChatInterface
        knowledgeBase={data.knowledgeBase}
        workspace={data.workspace}
        attachedAssets={data.attachedAssets}
        className="h-full"
        showHandles={true}
      />
    </div>
  );
};

const nodeTypes = {
  asset: AssetNode,
  chat: ChatNode,
};

export default function Home() {
  const { showToast } = useToast();

  // Workspace store
  const {
    workspaces,
    currentWorkspace,
    currentWorkspaceId,
    isLoading: workspaceLoading,
    error: workspaceError,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    clearError,
  } = useWorkspaceStore();

  const { isAuthenticated } = useUserStore();

  // Local canvas state
  const [componentInstances, setComponentInstances] = useState<
    ComponentInstance[]
  >([]);

  const [showChatInFlow, setShowChatInFlow] = useState<boolean>(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [kbLoadingStates, setKbLoadingStates] = useState<
    Record<number, boolean>
  >({});

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isWorkspaceSidebarOpen, setIsWorkspaceSidebarOpen] =
    useState<boolean>(false);
  // const [currentWorkspaceId, setCurrentWorkspaceId] =
  //   useState<string>("default");

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Load workspaces on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspaces();
    }
  }, [isAuthenticated, fetchWorkspaces]);

  // Auto-select first workspace if none is selected
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspaceId && !workspaceLoading) {
      switchWorkspace(workspaces[0].id);
    }
  }, [workspaces, currentWorkspaceId, workspaceLoading, switchWorkspace]);

  // Load workspace details when currentWorkspaceId changes
  useEffect(() => {
    if (
      currentWorkspaceId &&
      (!currentWorkspace || currentWorkspace.id !== currentWorkspaceId)
    ) {
      switchWorkspace(currentWorkspaceId);
    }
  }, [currentWorkspaceId, currentWorkspace, switchWorkspace]);

  // Load workspace assets when currentWorkspace changes
  useEffect(() => {
    if (currentWorkspace) {
      let allComponentInstances: ComponentInstance[] = [];

      // Load assets (excluding those that are already in collections)
      if (currentWorkspace.assets) {
        const standaloneAssets = currentWorkspace.assets.filter(
          (asset) => !asset.collection_id
        );
        const workspaceAssets = assetsToComponentInstances(standaloneAssets);
        allComponentInstances = [...allComponentInstances, ...workspaceAssets];
      }

      // Load collections as folder collections
      if (currentWorkspace.collections && currentWorkspace.assets) {
        const workspaceCollections = currentWorkspace.collections.map(
          (collection): ComponentInstance => {
            // Find assets that belong to this collection
            const collectionAssets = currentWorkspace.assets
              .filter((asset) => asset.collection_id === collection.id)
              .map((asset): AssetItem => {
                // Convert backend asset type to component type
                const getComponentType = (backendType: string): string => {
                  switch (backendType) {
                    case "image":
                      return "imageCollection";
                    case "audio":
                      return "audioPlayer";
                    case "video":
                    case "social":
                      return "videoCollection";
                    case "document":
                      return "pdfDocument";
                    case "wiki":
                      return "wikipediaLink";
                    case "link":
                      return "webLink";
                    case "text":
                      return "text";
                    default:
                      return "text";
                  }
                };

                return {
                  id: `asset-${asset.id}`,
                  type: getComponentType(asset.type),
                  title: asset.title,
                  data: (() => {
                    // Structure data based on component type
                    switch (getComponentType(asset.type)) {
                      case "imageCollection":
                        return {
                          url: asset.file_path || asset.url,
                          title: asset.title,
                        };
                      case "audioPlayer":
                        return {
                          url: asset.file_path || asset.url,
                          title: asset.title,
                        };
                      case "videoCollection":
                        return {
                          url: asset.file_path || asset.url || asset.content,
                          text: asset.content || asset.url || asset.file_path,
                        };
                      case "pdfDocument":
                        return {
                          url: asset.file_path || asset.url,
                          title: asset.title,
                          content: asset.content,
                        };
                      case "wikipediaLink":
                        return {
                          text: asset.url || asset.content,
                          url: asset.url,
                        };
                      case "webLink":
                        return {
                          text: asset.url || asset.content,
                          url: asset.url,
                        };
                      case "text":
                        return {
                          text: asset.content,
                          content: asset.content,
                        };
                      default:
                        return {
                          text: asset.content || asset.url || asset.file_path,
                        };
                    }
                  })(),
                };
              });

            console.log(
              `Collection ${collection.id} (${collection.name}) has ${collectionAssets.length} assets:`,
              collectionAssets
            );

            return {
              id: `collection-${collection.id}`,
              type: "folderCollection",
              data: {
                name: collection.name,
                collectionId: collection.id,
                assets: collectionAssets,
              },
              backendCollection: collection,
            };
          }
        );
        allComponentInstances = [
          ...allComponentInstances,
          ...workspaceCollections,
        ];
      }

      setComponentInstances(allComponentInstances);

      // Load knowledge bases from workspace
      if (currentWorkspace.knowledge_bases) {
        setKnowledgeBases(currentWorkspace.knowledge_bases);
      } else {
        setKnowledgeBases([]);
      }

      // Reset other states when switching workspaces
      setShowChatInFlow(false);
      // Clear KB loading states when switching workspaces
      setKbLoadingStates({});
    }
  }, [currentWorkspace]);

  const createNewWorkspace = async () => {
    const newWorkspace = await createWorkspace({
      name: `Workspace ${workspaces.length + 1}`,
      description: "New workspace",
      settings: {},
      is_public: false,
      collaborator_ids: [],
    });

    if (newWorkspace) {
      // Switch to the new workspace
      switchWorkspace(newWorkspace.id);
    }
  };

  // Modal handlers
  const handleEditWorkspace = (workspace: { id: number; name: string }) => {
    setSelectedWorkspace(workspace);
    setIsEditModalOpen(true);
  };

  const handleDeleteWorkspace = (workspace: { id: number; name: string }) => {
    setSelectedWorkspace(workspace);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmEdit = async (newName: string) => {
    if (!selectedWorkspace) return;

    const success = await updateWorkspace(selectedWorkspace.id, {
      name: newName,
    });

    if (success) {
      setIsEditModalOpen(false);
      setSelectedWorkspace(null);
      // Refresh workspaces list
      fetchWorkspaces();
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedWorkspace) return;

    const success = await deleteWorkspace(selectedWorkspace.id);

    if (success) {
      setIsDeleteModalOpen(false);
      setSelectedWorkspace(null);
      // Refresh workspaces list
      fetchWorkspaces();
    }
  };

  // Handle chat click - show existing knowledge bases or create new
  const handleChatClick = async () => {
    if (!currentWorkspace) {
      console.error("No current workspace");
      return;
    }

    try {
      // Create a new knowledge base
      const kbResponse = await knowledgeBaseApi.createKnowledgeBase({
        name: `Chat Session ${new Date().toLocaleDateString()}`,
        description: `Knowledge base for chat session in ${currentWorkspace.name}`,
        project_name: currentWorkspace.name,
      });

      console.log("Created knowledge base:", kbResponse);

      // Convert API response to KnowledgeBase format and add to local state
      const newKnowledgeBase: KnowledgeBase = {
        id: parseInt(kbResponse.id),
        name: kbResponse.name,
        description: `Knowledge base for chat session in ${currentWorkspace.name}`,
        collection_name: kbResponse.collection_name,
        is_active: true,
        created_at: new Date().toISOString(),
        position_x: 0, // Default position
        position_y: 0, // Default position
      };

      // Optimistically add the new KB to local state so it appears immediately
      setKnowledgeBases((prev) => [...prev, newKnowledgeBase]);

      // Optionally refresh workspace in background to sync with backend
      setTimeout(() => {
        switchWorkspace(currentWorkspaceId!);
      }, 1000);
    } catch (error) {
      console.error("Failed to handle chat click:", error);
    }
  };

  // Helper functions for KB loading states
  const setKbLoading = useCallback((kbId: number, loading: boolean) => {
    setKbLoadingStates((prev) => ({
      ...prev,
      [kbId]: loading,
    }));
  }, []);

  const onConnect = useCallback(
    async (params: Connection) => {
      // Handle connections to/from knowledge base nodes
      const targetIsKB = params.target?.startsWith("kb-");
      const sourceIsKB = params.source?.startsWith("kb-");

      if (targetIsKB || sourceIsKB) {
        setEdges((eds) => addEdge(params, eds));

        // Determine which asset/collection and which KB are being connected
        const nodeId = targetIsKB ? params.source : params.target;
        const kbNodeId = targetIsKB ? params.target : params.source;

        if (nodeId && kbNodeId) {
          const node = nodes.find((n) => n.id === nodeId);

          if (node && node.data) {
            const nodeData = node.data as ComponentInstance;

            // Extract KB ID from node ID (kb-4 -> 4)
            const kbId = parseInt(kbNodeId.replace("kb-", ""));

            if (currentWorkspaceId) {
              try {
                // Show loading on the specific KB
                setKbLoading(kbId, true);

                // Determine handles based on connection params
                const sourceHandle = params.sourceHandle || "right"; // default fallback
                const targetHandle = params.targetHandle || "left"; // default fallback

                // Determine which handles to use for asset/collection and KB
                const assetHandle = targetIsKB ? sourceHandle : targetHandle;
                const kbHandle = targetIsKB ? targetHandle : sourceHandle;

                console.log(
                  `Connection handles - Asset: ${assetHandle}, KB: ${kbHandle}`
                );

                // Check if this is a collection or individual asset
                if (nodeData.type === "folderCollection") {
                  // Handle collection linking with automatic handle detection
                  const collectionId = nodeData.data?.collectionId;
                  if (collectionId) {
                    await knowledgeBaseApi.linkCollectionToKnowledgeBase(
                      currentWorkspaceId,
                      collectionId,
                      kbId,
                      assetHandle as "left" | "right",
                      kbHandle as "left" | "right"
                    );
                    console.log(
                      `Linked collection ${collectionId} to knowledge base ${kbId} with handles ${assetHandle}-${kbHandle}`
                    );
                    showToast(
                      "Collection successfully connected to chat",
                      "success"
                    );
                  }
                } else {
                  // Handle individual asset linking with automatic handle detection
                  const assetId = getAssetIdFromComponentId(nodeData.id);
                  if (assetId) {
                    await knowledgeBaseApi.linkAssetToKnowledgeBase(
                      currentWorkspaceId,
                      assetId,
                      kbId,
                      assetHandle as "left" | "right",
                      kbHandle as "left" | "right"
                    );
                    console.log(
                      `Linked asset ${assetId} to knowledge base ${kbId} with handles ${assetHandle}-${kbHandle}`
                    );
                    showToast(
                      "Asset successfully connected to chat",
                      "success"
                    );
                  }
                }

                // Refresh workspace
                switchWorkspace(currentWorkspaceId);
              } catch (error) {
                console.error("Failed to link to knowledge base:", error);
                showToast("Failed to connect asset to chat", "error");
              } finally {
                // Hide loading on the specific KB
                setKbLoading(kbId, false);
              }
            }
          }
        }
      }
    },
    [
      nodes,
      setEdges,
      currentWorkspaceId,
      switchWorkspace,
      showToast,
      setKbLoading,
    ]
  );

  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      if (currentWorkspaceId && node.data) {
        console.log("Node drag stop:", node);
        try {
          let itemType: "asset" | "collection" | "kb" | undefined;

          // Determine the item type and ID based on node type and data
          if (node.id.includes("asset-")) {
            itemType = "asset";
            // const componentInstance = node.data as ComponentInstance;
            // const assetId = getAssetIdFromComponentId(componentInstance.id);
            // if (assetId !== null) {
            //   itemId = assetId;
            //   itemType = "asset";
            // }
          } else if (node.id.includes("collection-")) {
            // const collectionData = node.data as {
            //   collectionId?: number;
            //   id?: number;
            // };
            // itemId = collectionData.collectionId || collectionData.id;
            itemType = "collection";
          } else if (node.id.includes("kb-")) {
            // const kbData = node.data as {
            //   knowledgeBaseId?: number;
            //   id?: number;
            // };
            // itemId = kbData.knowledgeBaseId || kbData.id;
            itemType = "kb";
          }

          const itemId = node.id.includes("asset-")
            ? node.id.split("asset-")[1]
            : node.id.includes("collection-")
            ? node.id.split("collection-")[1]
            : node.id.includes("kb-")
            ? node.id.split("kb-")[1]
            : undefined;

          console.log(itemId, itemType);
          // Call position API if we have valid data
          if (itemId && itemType) {
            await updatePosition(currentWorkspaceId, {
              id: Number(itemId),
              type: itemType,
              x: Math.round(node.position.x),
              y: Math.round(node.position.y),
            });
            console.log(
              `Updated ${itemType} ${itemId} position:`,
              node.position
            );
          }
        } catch (error) {
          console.error("Failed to update position:", error);
          // Optionally show toast notification
        }
      }

      // Check if dragged node is over a folderCollection node
      const draggedNode = node;
      if (
        draggedNode.type === "asset" &&
        (draggedNode.data as ComponentInstance)?.type !== "folderCollection"
      ) {
        const folderNodes = nodes.filter(
          (n) =>
            n.type === "asset" &&
            (n.data as ComponentInstance)?.type === "folderCollection"
        );
        for (const folderNode of folderNodes) {
          const folderLeft = folderNode.position.x;
          const folderTop = folderNode.position.y;
          const folderWidth = folderNode.width || 400;
          const folderHeight = folderNode.height || 300;
          const folderRight = folderLeft + folderWidth;
          const folderBottom = folderTop + folderHeight;

          const draggedLeft = draggedNode.position.x;
          const draggedTop = draggedNode.position.y;
          const draggedWidth = draggedNode.width || 300;
          const draggedHeight = draggedNode.height || 200;
          const draggedCenterX = draggedLeft + draggedWidth / 2;
          const draggedCenterY = draggedTop + draggedHeight / 2;

          if (
            draggedCenterX >= folderLeft &&
            draggedCenterX <= folderRight &&
            draggedCenterY >= folderTop &&
            draggedCenterY <= folderBottom
          ) {
            // Check if the asset is already linked to a knowledge base
            const draggedInstance = draggedNode.data as ComponentInstance;
            const assetId = getAssetIdFromComponentId(draggedInstance.id);

            if (assetId && currentWorkspace?.assets) {
              const workspaceAsset = currentWorkspace.assets.find(
                (asset) => asset.id === assetId
              );

              if (workspaceAsset?.knowledge_base_id) {
                // Show user notification and prevent adding to collection
                showToast(
                  "This asset is already linked to a knowledge base and cannot be added to a collection. Please unlink it from the knowledge base first.",
                  "warning"
                );
                console.warn(
                  `Asset ${assetId} is already linked to knowledge base ${workspaceAsset.knowledge_base_id}, cannot add to collection`
                );
                return; // Exit early, don't add to collection
              }
            }

            // Add asset to collection
            const folderInstance = folderNode.data as ComponentInstance;

            const assetItem: AssetItem = {
              id: draggedInstance.id,
              type: draggedInstance.type,
              title:
                draggedInstance.type === "imageCollection"
                  ? "Image Collection"
                  : draggedInstance.type === "audioPlayer"
                  ? "Audio Player"
                  : draggedInstance.type === "videoCollection"
                  ? "Video Collection"
                  : draggedInstance.type === "pdfDocument"
                  ? "PDF Document"
                  : draggedInstance.type === "wikipediaLink"
                  ? "Wikipedia Link"
                  : draggedInstance.type === "webLink"
                  ? "Web Link"
                  : draggedInstance.type === "text"
                  ? "Text Content"
                  : "Asset",
              data: draggedInstance.data,
            };

            // Update local state first for immediate UI response
            setComponentInstances((prev) =>
              prev.map((inst) => {
                if (inst.id === folderNode.id) {
                  const assets = inst.data?.assets || [];
                  const exists = assets.find(
                    (a) => a.id === draggedInstance.id
                  );
                  if (!exists) {
                    return {
                      ...inst,
                      data: {
                        ...inst.data,
                        assets: [...assets, assetItem],
                      },
                    };
                  }
                }
                return inst;
              })
            );

            // Call backend API to link asset to collection
            if (currentWorkspaceId && folderInstance.data?.collectionId) {
              try {
                // Get asset ID from component instance
                const assetId = getAssetIdFromComponentId(draggedInstance.id);
                if (assetId) {
                  await collectionApi.linkAssetToCollection(
                    currentWorkspaceId,
                    assetId,
                    folderInstance.data.collectionId
                  );
                  switchWorkspace(currentWorkspaceId);
                  console.log(
                    `Successfully linked asset ${assetId} to collection ${folderInstance.data.collectionId}`
                  );
                } else {
                  console.warn(
                    "Could not extract asset ID from component ID:",
                    draggedInstance.id
                  );
                }
              } catch (error) {
                console.error("Failed to link asset to collection:", error);
                // Could show user notification here
              }
            }

            // Remove the dragged node
            setNodes((nds) => nds.filter((n) => n.id !== draggedNode.id));
            setComponentInstances((prev) =>
              prev.filter((inst) => inst.id !== draggedInstance.id)
            );
            setEdges((eds) =>
              eds.filter(
                (edge) =>
                  edge.source !== draggedNode.id &&
                  edge.target !== draggedNode.id
              )
            );
            break;
          }
        }
      }
    },
    [
      nodes,
      setNodes,
      setComponentInstances,
      setEdges,
      currentWorkspaceId,
      currentWorkspace,
      showToast,
      switchWorkspace,
    ]
  );

  // Update nodes when componentInstances or showChatInFlow change
  useEffect(() => {
    const getNodeDimensions = (type: string) => {
      switch (type) {
        case "videoCollection":
        case "videoSocial":
          return { width: 400, height: 600 };
        case "imageCollection":
          return { width: 296, height: 224 };
        case "audioPlayer":
          return { width: 400, height: 200 };
        case "pdfDocument":
          return { width: 300, height: 145 };
        case "wikipediaLink":
          return { width: 300, height: 145 };
        case "webLink":
          return { width: 300, height: 145 };
        case "text":
          return { width: 300, height: 200 };
        case "folderCollection":
          // For resizable nodes, use initial dimensions
          return { width: 400, height: 300 };
        default:
          return { width: 300, height: 200 };
      }
    };

    //   setNodes((currentNodes) => {
    //     const newNodes: Node[] = [
    //       // Asset nodes
    //       ...componentInstances.map((instance, index) => {
    //         const dimensions = getNodeDimensions(instance.type);
    //         // Find existing node to preserve position
    //         const existingNode = currentNodes.find((n) => n.id === instance.id);
    //         return {
    //           id: instance.id,
    //           type: "asset",
    //           position: existingNode
    //             ? existingNode.position
    //             : { x: 100 + index * 200, y: 100 },
    //           data: instance,
    //           style: { width: dimensions.width, height: dimensions.height },
    //         };
    //       }),
    //       // Knowledge base (chat) nodes
    //       ...knowledgeBases.map((kb, index) => {
    //         const kbNodeId = `kb-${kb.id}`;
    //         const existingKbNode = currentNodes.find((n) => n.id === kbNodeId);

    //         // Find assets linked to this knowledge base
    //         const linkedAssets = componentInstances.filter((instance) => {
    //           // Extract asset ID from component instance ID (asset-15 -> 15)
    //           const assetId = getAssetIdFromComponentId(instance.id);
    //           if (!assetId || !currentWorkspace?.assets) return false;

    //           // Find the corresponding asset in workspace data
    //           const workspaceAsset = currentWorkspace.assets.find(
    //             (a) => a.id === assetId
    //           );
    //           return workspaceAsset?.knowledge_base_id === kb.id;
    //         });

    //         return {
    //           id: kbNodeId,
    //           type: "chat",
    //           position: existingKbNode
    //             ? existingKbNode.position
    //             : { x: 400 + index * 300, y: 300 + index * 100 },
    //           data: {
    //             attachedAssets: linkedAssets,
    //             position: existingKbNode?.position || {
    //               x: 400 + index * 300,
    //               y: 300 + index * 100,
    //             },
    //             knowledgeBase: kb,
    //             workspace: currentWorkspace,
    //           },
    //           style: { width: 800, height: 600 },
    //         };
    //       }),
    //     ];
    //     return newNodes;
    //   });
    // }, [
    //   componentInstances,
    //   showChatInFlow,
    //   attachedAssets,
    //   knowledgeBases,
    //   currentWorkspace,
    //   setNodes,
    // ]);

    // Create edges for existing asset-knowledge base relationships
    // useEffect(() => {
    //   if (!currentWorkspace?.assets || knowledgeBases.length === 0) return;

    //   const existingEdges: Edge[] = [];

    //   currentWorkspace.assets.forEach((asset) => {
    //     if (asset.knowledge_base_id) {
    //       // Create edge from asset to knowledge base
    //       const assetNodeId = `asset-${asset.id}`;
    //       const kbNodeId = `kb-${asset.knowledge_base_id}`;

    //       existingEdges.push({
    //         id: `${assetNodeId}-${kbNodeId}`,
    //         source: assetNodeId,
    //         target: kbNodeId,
    //         type: "default",
    //         style: { stroke: "#4596FF", strokeDasharray: "5,5" },
    //       });
    //     }
    //   });

    //   if (existingEdges.length > 0) {
    //     console.log("Creating edges for existing relationships:", existingEdges);
    //     setEdges(existingEdges);
    //   }
    // }, [currentWorkspace?.assets, knowledgeBases, setEdges]);
    setNodes((currentNodes) => {
      const newNodes: Node[] = [
        ...componentInstances.map((instance, index) => {
          const dimensions = getNodeDimensions(instance.type);
          // Find existing node to preserve position and size
          const existingNode = currentNodes.find((n) => n.id === instance.id);

          // Get backend position for this instance
          let backendPosition = { x: 100 + index * 200, y: 100 }; // default fallback

          if (instance.id.startsWith("asset-")) {
            const assetId = getAssetIdFromComponentId(instance.id);
            if (assetId && currentWorkspace?.assets) {
              const backendAsset = currentWorkspace.assets.find(
                (a) => a.id === assetId
              );
              if (
                backendAsset &&
                backendAsset.position_x !== undefined &&
                backendAsset.position_y !== undefined
              ) {
                backendPosition = {
                  x: backendAsset.position_x,
                  y: backendAsset.position_y,
                };
              }
            }
          } else if (instance.id.startsWith("collection-")) {
            const collectionId = parseInt(
              instance.id.replace("collection-", "")
            );
            if (currentWorkspace?.collections) {
              const backendCollection = currentWorkspace.collections.find(
                (c) => c.id === collectionId
              );
              if (
                backendCollection &&
                backendCollection.position_x !== undefined &&
                backendCollection.position_y !== undefined
              ) {
                backendPosition = {
                  x: backendCollection.position_x,
                  y: backendCollection.position_y,
                };
              }
            }
          }

          return {
            id: instance.id,
            type: "asset",
            position: existingNode ? existingNode.position : backendPosition, // Use backend position instead of default
            data: instance,
            width: existingNode?.width || dimensions.width,
            height: existingNode?.height || dimensions.height,
            style:
              instance.type === "folderCollection"
                ? {}
                : { width: dimensions.width, height: dimensions.height },
          };
        }),
        // Knowledge base (chat) nodes
        ...knowledgeBases.map((kb, index) => {
          const kbNodeId = `kb-${kb.id}`;
          const existingKbNode = currentNodes.find((n) => n.id === kbNodeId);

          // Get backend position for knowledge base
          const backendPosition =
            kb.position_x !== undefined && kb.position_y !== undefined
              ? { x: kb.position_x, y: kb.position_y }
              : { x: 400 + index * 300, y: 300 + index * 100 }; // fallback

          // Find assets linked to this knowledge base
          const linkedAssets = componentInstances.filter((instance) => {
            // Extract asset ID from component instance ID (asset-15 -> 15)
            const assetId = getAssetIdFromComponentId(instance.id);
            if (!assetId || !currentWorkspace?.assets) return false;

            // Find the corresponding asset in workspace data
            const workspaceAsset = currentWorkspace.assets.find(
              (a) => a.id === assetId
            );
            return workspaceAsset?.knowledge_base_id === kb.id;
          });

          return {
            id: kbNodeId,
            type: "chat",
            position: existingKbNode
              ? existingKbNode.position
              : backendPosition, // Use backend position instead of default
            data: {
              attachedAssets: linkedAssets,
              position: existingKbNode?.position || backendPosition, // Use backend position here too
              knowledgeBase: kb,
              workspace: currentWorkspace,
              isLoading: kbLoadingStates[kb.id] || false, // Add loading state
            },
            style: { width: 800, height: 600 },
          };
        }),
        ...(showChatInFlow
          ? [
              (() => {
                const chatPosition = currentNodes.find(
                  (n) => n.id === "chat-node"
                )?.position || {
                  x: 400,
                  y: 300,
                };
                return {
                  id: "chat-node",
                  type: "chat",
                  position: chatPosition,
                  data: { attachedAssets: [], position: chatPosition },
                  style: { width: 800, height: 600 },
                };
              })(),
            ]
          : []),
      ];
      return newNodes;
    });
  }, [
    componentInstances,
    showChatInFlow,
    knowledgeBases,
    currentWorkspace,
    kbLoadingStates,
    setNodes,
  ]);

  // Create edges for existing asset-knowledge base relationships
  useEffect(() => {
    if (!currentWorkspace?.assets || knowledgeBases.length === 0) return;

    const existingEdges: Edge[] = [];

    // Create edges for individual assets linked to knowledge bases
    currentWorkspace.assets.forEach((asset) => {
      if (asset.knowledge_base_id) {
        // Create edge from asset to knowledge base
        const assetNodeId = `asset-${asset.id}`;
        const kbNodeId = `kb-${asset.knowledge_base_id}`;

        console.log(`Asset ${asset.id} edge creation:`, {
          assetId: asset.id,
          kb_connection_asset_handle: asset.kb_connection_asset_handle,
          kb_connection_kb_handle: asset.kb_connection_kb_handle,
          sourceHandle: asset.kb_connection_asset_handle || "right",
          targetHandle: asset.kb_connection_kb_handle || "left",
        });

        existingEdges.push({
          id: `${assetNodeId}-${kbNodeId}`,
          source: assetNodeId,
          target: kbNodeId,
          sourceHandle: asset.kb_connection_asset_handle || "right",
          targetHandle: asset.kb_connection_kb_handle || "left",
          type: "default",
          style: { stroke: "#4596FF", strokeDasharray: "5,5" },
        });
      }
    });

    // Create edges for collections linked to knowledge bases
    if (currentWorkspace.collections) {
      currentWorkspace.collections.forEach((collection) => {
        if (collection.knowledge_base_id) {
          // Create edge from collection to knowledge base
          const collectionNodeId = `collection-${collection.id}`;
          const kbNodeId = `kb-${collection.knowledge_base_id}`;

          existingEdges.push({
            id: `${collectionNodeId}-${kbNodeId}`,
            source: collectionNodeId,
            target: kbNodeId,
            sourceHandle: collection.kb_connection_asset_handle || "right",
            targetHandle: collection.kb_connection_kb_handle || "left",
            type: "default",
            style: { stroke: "#4596FF", strokeDasharray: "5,5" },
          });
        }
      });
    }

    if (existingEdges.length > 0) {
      console.log("Creating edges for existing relationships:", existingEdges);
      setEdges(existingEdges);
    }
  }, [
    currentWorkspace?.assets,
    currentWorkspace?.collections,
    knowledgeBases,
    setEdges,
  ]);

  // Listen for component creation events
  useEffect(() => {
    const handleCreateComponent = async (event: CustomEvent) => {
      const { componentType, data } = event.detail;
      console.log("🔧 handleCreateComponent called with:", {
        componentType,
        data,
      });

      const newInstance: ComponentInstance = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        data: data,
      };

      // Add to local state immediately for UI responsiveness
      setComponentInstances((prev) => [...prev, newInstance]);

      // Skip backend asset creation for folderCollection since it's handled separately
      if (componentType === "folderCollection") {
        console.log(
          "🔄 Skipping asset creation for folderCollection - handled by collection API"
        );
        return;
      }

      // Save to backend if we have a current workspace
      if (currentWorkspaceId) {
        try {
          const strategy = getAssetCreationStrategy(componentType);
          console.log("📍 Asset creation strategy:", strategy);
          console.log("🔍 Data structure analysis:", {
            hasFile: !!data?.file,
            hasFiles: !!data?.files,
            fileType: data?.file?.constructor?.name,
            filesType: data?.files?.constructor?.name,
            dataKeys: data ? Object.keys(data) : "no data",
            fullData: data,
          });
          let savedAsset;

          if (strategy.endpoint === "link") {
            // Handle social, wiki, internet links
            console.log("🔗 Creating link asset");
            const assetCreate = componentInstanceToAssetCreate(newInstance);
            console.log("📝 Asset create data:", assetCreate);
            savedAsset = await assetApi.createLinkAsset(
              currentWorkspaceId,
              assetCreate
            );
          } else if (strategy.endpoint === "text") {
            // Handle text content
            console.log("📄 Creating text asset");
            const assetCreate = componentInstanceToAssetCreate(newInstance);
            console.log("📝 Asset create data:", assetCreate);
            savedAsset = await assetApi.createTextAsset(
              currentWorkspaceId,
              assetCreate
            );
          } else if (strategy.endpoint === "file") {
            console.log("📁 Checking file upload conditions...");
            console.log(
              "  - strategy.endpoint === 'file':",
              strategy.endpoint === "file"
            );
            console.log("  - data?.file exists:", !!data?.file);
            console.log("  - data?.files exists:", !!data?.files);

            // Check for file in data.file or data.files
            const fileToUpload = data?.file || (data?.files && data.files[0]);
            console.log("  - fileToUpload:", fileToUpload);

            if (fileToUpload) {
              // Handle file uploads (image, audio, document)
              console.log("📁 Creating file asset");
              const title =
                data?.title || fileToUpload?.name || "Uploaded File";
              console.log("📂 File upload details:", {
                fileName: fileToUpload.name,
                fileType: fileToUpload.type,
                assetType: strategy.assetType,
                title,
              });
              savedAsset = await assetApi.uploadFileAsset(
                currentWorkspaceId,
                fileToUpload,
                strategy.assetType as "image" | "audio" | "document",
                title
              );
            } else {
              console.error(
                "❌ No file provided for file asset type:",
                componentType,
                "Data received:",
                data
              );
              return;
            }
          } else {
            console.error(
              "❌ Unknown strategy endpoint:",
              strategy.endpoint,
              "for componentType:",
              componentType
            );
            return;
          }

          // Update the instance with the backend ID
          if (savedAsset) {
            console.log("✅ Asset saved successfully:", savedAsset);
            const newBackendId = `asset-${savedAsset.id}`;

            // Update component instances
            setComponentInstances((prev) =>
              prev.map((instance) =>
                instance.id === newInstance.id
                  ? { ...instance, id: newBackendId }
                  : instance
              )
            );

            // Update nodes to reflect the new ID
            setNodes((prevNodes) =>
              prevNodes.map((node) =>
                node.id === newInstance.id
                  ? {
                      ...node,
                      id: newBackendId,
                      data: { ...node.data, id: newBackendId },
                    }
                  : node
              )
            );

            // Update edges to reflect the new ID
            setEdges((prevEdges) =>
              prevEdges.map((edge) => ({
                ...edge,
                source:
                  edge.source === newInstance.id ? newBackendId : edge.source,
                target:
                  edge.target === newInstance.id ? newBackendId : edge.target,
              }))
            );
          }
        } catch (error) {
          console.error("❌ Failed to save asset to backend:", error);
          // Optionally show user notification here
        }
      } else {
        console.warn("⚠️ No current workspace ID available");
      }
    };

    const handleRemoveComponent = async (event: CustomEvent) => {
      const { componentId } = event.detail;
      console.log(
        "🗑️ handleRemoveComponent called with componentId:",
        componentId
      );
      console.log("🔍 Current workspace ID:", currentWorkspaceId);
      console.log(
        "🔍 Is backend asset:",
        isBackendAsset({ id: componentId } as ComponentInstance)
      );

      // Remove from local state
      setComponentInstances((prev) => {
        console.log("📋 Current component instances before filter:", prev);
        const filtered = prev.filter((instance) => instance.id !== componentId);
        console.log("📋 Filtered component instances:", filtered);
        return filtered;
      });

      // Remove node and edges
      setNodes((nds) => nds.filter((node) => node.id !== componentId));
      setEdges((eds) =>
        eds.filter(
          (edge) => edge.source !== componentId && edge.target !== componentId
        )
      );

      // Delete from backend if it's a backend asset or collection
      if (currentWorkspaceId) {
        try {
          if (componentId.startsWith("collection-")) {
            // Handle collection deletion
            const collectionId = parseInt(
              componentId.replace("collection-", ""),
              10
            );
            if (!isNaN(collectionId)) {
              console.log(
                "🔥 Calling deleteCollection API for collection ID:",
                collectionId
              );
              await collectionApi.deleteCollection(
                currentWorkspaceId,
                collectionId
              );
              console.log(
                "✅ Successfully deleted collection from backend:",
                collectionId
              );

              // Refresh workspace data to ensure UI is in sync
              console.log(
                "🔄 Refreshing workspace data after collection deletion"
              );
              switchWorkspace(currentWorkspaceId);
            }
          } else if (componentId.startsWith("asset-")) {
            // Handle asset deletion (both standalone and within collections)
            const assetId = getAssetIdFromComponentId(componentId);
            console.log("🔍 Extracted asset ID:", assetId);
            if (assetId) {
              console.log("🔥 Calling deleteAsset API for asset ID:", assetId);
              await assetApi.deleteAsset(currentWorkspaceId, assetId);

              console.log(
                "✅ Successfully deleted asset from backend:",
                assetId
              );

              // Refresh workspace data to ensure UI is in sync
              console.log("🔄 Refreshing workspace data after asset deletion");
              switchWorkspace(currentWorkspaceId);
            }
          }
        } catch (error) {
          console.error("❌ Failed to delete from backend:", error);
          // Optionally show user notification here
        }
      }
    };

    const handleUpdateComponent = (event: CustomEvent) => {
      const { componentId, data } = event.detail;
      setComponentInstances((prev) =>
        prev.map((instance) =>
          instance.id === componentId
            ? { ...instance, data: { ...instance.data, ...data } }
            : instance
        )
      );
    };

    window.addEventListener(
      "createComponent",
      handleCreateComponent as unknown as EventListener
    );
    window.addEventListener(
      "removeComponent",
      handleRemoveComponent as unknown as EventListener
    );
    window.addEventListener(
      "updateComponent",
      handleUpdateComponent as EventListener
    );

    return () => {
      window.removeEventListener(
        "createComponent",
        handleCreateComponent as unknown as EventListener
      );
      window.removeEventListener(
        "removeComponent",
        handleRemoveComponent as unknown as EventListener
      );
      window.removeEventListener(
        "updateComponent",
        handleUpdateComponent as EventListener
      );
    };
  }, [setNodes, setEdges, currentWorkspaceId, switchWorkspace]);

  return (
    <div className="">
      <div className="relative">
        <ChatNav
          onWorkspaceToggle={() =>
            setIsWorkspaceSidebarOpen(!isWorkspaceSidebarOpen)
          }
        />
        <Sidebar onChatClick={handleChatClick} />

        {/* Light Theme Workspace Sidebar */}
        <div
          className={`absolute left-0 top-0 h-screen w-80 bg-white shadow-2xl z-40 transform transition-all duration-300 ease-in-out ${
            isWorkspaceSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#8E5EFF] to-[#4596FF] flex items-center justify-center shadow-md">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12H15V22"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Workspaces</h2>
              </div>
              <button
                onClick={() => setIsWorkspaceSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-2xl font-light cursor-pointer hover:bg-gray-100 rounded-lg w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Create New Workspace Button */}
            <button
              onClick={createNewWorkspace}
              className="w-full bg-gradient-to-r from-[#8E5EFF] to-[#4596FF] hover:from-[#9A6AFF] hover:to-[#5BA6FF] focus:ring-2 focus:ring-[#8E5EFF] focus:ring-offset-2 focus:ring-offset-white text-white font-semibold py-3 px-6 rounded-xl mb-6 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Create New Workspace</span>
            </button>

            {/* Workspaces List */}
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-4">
                Your Workspaces
              </h3>

              {/* Error Display */}
              {workspaceError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-600 text-sm">{workspaceError}</p>
                  <button
                    onClick={clearError}
                    className="text-red-500 text-xs underline mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Loading State */}
              {workspaceLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E5EFF]"></div>
                </div>
              )}

              {/* Workspaces */}
              {!workspaceLoading &&
                workspaces.length === 0 &&
                !workspaceError && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No workspaces found</p>
                    <p className="text-xs mt-1">
                      Create your first workspace to get started
                    </p>
                  </div>
                )}

              {!workspaceLoading &&
                workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                      ws.id === currentWorkspaceId
                        ? "bg-gradient-to-r from-[#8E5EFF]/10 to-[#4596FF]/10 border-2 border-[#8E5EFF] shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Workspace Icon and Content */}
                    <div className="flex items-center space-x-4">
                      <div
                        className="flex-1"
                        onClick={() => switchWorkspace(ws.id)}
                      >
                        <h4
                          className={`font-semibold truncate ${
                            ws.id === currentWorkspaceId
                              ? "text-gray-800"
                              : "text-gray-700 group-hover:text-gray-800"
                          } transition-colors duration-200`}
                          title={ws.name}
                        >
                          {ws.name}
                        </h4>
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWorkspace({ id: ws.id, name: ws.name });
                          }}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit workspace"
                        >
                          <EditIcon size={16} color="#6B7280" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWorkspace({ id: ws.id, name: ws.name });
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete workspace"
                        >
                          <DeleteIcon size={16} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-xs text-gray-600 text-center">
                <p>
                  Current:{" "}
                  <span className="text-[#8E5EFF] font-medium">
                    {currentWorkspace?.name || "No workspace selected"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* <LetsGetStarted /> */}
        <div className="absolute inset-0 w-full h-screen overflow-hidden ml-20 sm:ml-24">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            isValidConnection={() => true}
            connectionMode={ConnectionMode.Loose}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            defaultEdgeOptions={{
              style: { stroke: "#4596FF", strokeDasharray: "5,5" },
            }}
            // noDragClassName="noDrag"
            noWheelClassName="noDrag"
            // nodesDraggable={true}
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Workspace Modals */}
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

        <DeleteWorkspaceModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedWorkspace(null);
          }}
          onConfirm={handleConfirmDelete}
          workspaceName={selectedWorkspace?.name || ""}
          isLoading={workspaceLoading}
        />
      </div>
    </div>
  );
}
