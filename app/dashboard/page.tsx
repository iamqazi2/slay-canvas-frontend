"use client";
import { assetApi } from "@/app/utils/assetApi";
import { knowledgeBaseApi } from "@/app/utils/knowledgeBaseApi";
import { useCallback, useEffect, useState } from "react";

import "reactflow/dist/style.css";
import {
  ChatInterfaceDraggable,
  // FolderCollection,
  ImageCollection,
  PdfDocument,
  Sidebar,
  SimpleChatInterface,
  TextCollection,
  VideoPreview,
  WikipediaLink,
} from "../components";
import ChatNav from "../components/New-Navbar";
import { useUserStore } from "../store/userStore";
import { useWorkspaceStore } from "../store/workspaceStore";
import { KnowledgeBase, WorkspaceDetailed } from "../types/workspace";
import {
  assetsToComponentInstances,
  componentInstanceToAssetCreate,
  getAssetCreationStrategy,
  getAssetIdFromComponentId,
  isBackendAsset,
} from "../utils/assetUtils";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  NodeResizer,
} from "reactflow";
import "reactflow/dist/style.css";
import FolderCollection from "../components/FolderCollection";
import AudioPlayer from "../components/AudioPlayer";

interface AssetItem {
  id: string;
  type: string;
  title: string;
  data?: { file?: File; files?: File[]; text?: string };
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
  };
  name?: string;
  assets?: AssetItem[];
}

interface Workspace {
  id: string;
  name: string;
  componentInstances: ComponentInstance[];
  nodes: Node[];
  edges: Edge[];
  attachedAssets: ComponentInstance[];
  showChatInFlow: boolean;
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
      return (
        <FolderCollection key={id} id={id} inline={true} initialData={data} />
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
      case "text":
        return "Text Content";
      case "folderCollection":
        return instance.data?.name || "Collection";
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
            ? "1px solid #4596FF"
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

      <Handle
        type="target"
        position={Position.Left}
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
      <Handle
        type="source"
        position={Position.Right}
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
  };
}) => {
  return (
    <div className="w-full h-full">
      <SimpleChatInterface
        knowledgeBase={data.knowledgeBase}
        workspace={data.workspace}
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
  // Workspace store
  const {
    // workspaces,
    currentWorkspace,
    currentWorkspaceId,
    isLoading: workspaceLoading,
    error: workspaceError,
    fetchWorkspaces,
    createWorkspace,
    switchWorkspace,
    clearError,
  } = useWorkspaceStore();

  const { isAuthenticated } = useUserStore();

  // Local canvas state
  const [componentInstances, setComponentInstances] = useState<
    ComponentInstance[]
  >([]);

  const [showChatInFlow, setShowChatInFlow] = useState<boolean>(false);
  const [attachedAssets, setAttachedAssets] = useState<ComponentInstance[]>([]);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isWorkspaceSidebarOpen, setIsWorkspaceSidebarOpen] =
    useState<boolean>(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: "default",
      name: "Workspace 1",
      componentInstances: [],
      nodes: [],
      edges: [],
      attachedAssets: [],
      showChatInFlow: false,
    },
  ]);
  // const [currentWorkspaceId, setCurrentWorkspaceId] =
  //   useState<string>("default");

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
    if (currentWorkspace && currentWorkspace.assets) {
      const workspaceAssets = assetsToComponentInstances(
        currentWorkspace.assets
      );
      setComponentInstances(workspaceAssets);

      // Load knowledge bases from workspace
      if (currentWorkspace.knowledge_bases) {
        setKnowledgeBases(currentWorkspace.knowledge_bases);
      } else {
        setKnowledgeBases([]);
      }

      // Reset other states when switching workspaces
      setAttachedAssets([]);
      setShowChatInFlow(false);
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

  const onConnect = useCallback(
    async (params: Connection) => {
      // Handle connections to/from knowledge base nodes
      const targetIsKB = params.target?.startsWith("kb-");
      const sourceIsKB = params.source?.startsWith("kb-");

      if (targetIsKB || sourceIsKB) {
        setEdges((eds) => addEdge(params, eds));

        // Determine which asset and which KB are being connected
        const assetNodeId = targetIsKB ? params.source : params.target;
        const kbNodeId = targetIsKB ? params.target : params.source;

        if (assetNodeId && kbNodeId) {
          const assetNode = nodes.find((n) => n.id === assetNodeId);

          if (assetNode && assetNode.data) {
            const assetData = assetNode.data as ComponentInstance;
            setAttachedAssets((prev) => {
              const exists = prev.find((a) => a.id === assetData.id);
              if (!exists) {
                return [...prev, assetData];
              }
              return prev;
            });

            // Extract KB ID from node ID (kb-4 -> 4)
            const kbId = parseInt(kbNodeId.replace("kb-", ""));

            // Link asset to knowledge base if we have both IDs
            if (currentWorkspaceId) {
              const assetId = getAssetIdFromComponentId(assetData.id);
              if (assetId) {
                try {
                  await knowledgeBaseApi.linkAssetToKnowledgeBase(
                    currentWorkspaceId,
                    assetId,
                    kbId
                  );
                  console.log(
                    `Linked asset ${assetId} to knowledge base ${kbId}`
                  );
                } catch (error) {
                  console.error(
                    "Failed to link asset to knowledge base:",
                    error
                  );
                }
              }
            }
          }
        }
      }
    },
    [nodes, setEdges, setAttachedAssets, currentWorkspaceId]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
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
            // Add asset to collection
            const draggedInstance = draggedNode.data as ComponentInstance;
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
                  : draggedInstance.type === "text"
                  ? "Text Content"
                  : "Asset",
              data: draggedInstance.data,
            };
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
    [nodes, setNodes, setComponentInstances, setEdges]
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
    const newNodes: Node[] = [
      ...componentInstances.map((instance, index) => {
        const dimensions = getNodeDimensions(instance.type);
        // Find existing node to preserve position and size
        const existingNode = nodes.find((n) => n.id === instance.id);
        return {
          id: instance.id,
          type: "asset",
          position: existingNode
            ? existingNode.position
            : { x: 100 + index * 200, y: 100 },
          data: instance,
          width: existingNode?.width || dimensions.width,
          height: existingNode?.height || dimensions.height,
          style:
            instance.type === "folderCollection"
              ? {}
              : { width: dimensions.width, height: dimensions.height },
        };
      }),
      ...(showChatInFlow
        ? [
            (() => {
              const chatPosition = nodes.find((n) => n.id === "chat-node")
                ?.position || {
                x: 400,
                y: 300,
              };
              return {
                id: "chat-node",
                type: "chat",
                position: chatPosition,
                data: { attachedAssets, position: chatPosition },
                style: { width: 800, height: 600 },
              };
            })(),
          ]
        : []),
    ];
    setNodes(newNodes);
  }, [componentInstances, showChatInFlow, attachedAssets, setNodes]);

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

      // Remove from attachedAssets if present
      setAttachedAssets((prev) =>
        prev.filter((asset) => asset.id !== componentId)
      );

      // Delete from backend if it's a backend asset
      if (
        currentWorkspaceId &&
        isBackendAsset({ id: componentId } as ComponentInstance)
      ) {
        try {
          const assetId = getAssetIdFromComponentId(componentId);
          console.log("🔍 Extracted asset ID:", assetId);
          if (assetId) {
            console.log("🔥 Calling deleteAsset API for asset ID:", assetId);
            await assetApi.deleteAsset(currentWorkspaceId, assetId);
            console.log("✅ Successfully deleted asset from backend:", assetId);
          }
        } catch (error) {
          console.error("❌ Failed to delete asset from backend:", error);
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
  }, [setNodes, setEdges, setAttachedAssets, currentWorkspaceId]);

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
                workspaces.map((ws, index) => (
                  <div
                    key={ws.id}
                    onClick={() => switchWorkspace(ws.id)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group ${
                      ws.id === currentWorkspaceId
                        ? "bg-gradient-to-r from-[#8E5EFF]/10 to-[#4596FF]/10 border-2 border-[#8E5EFF] shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Workspace Icon */}
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                          ws.id === currentWorkspaceId
                            ? "bg-gradient-to-r from-[#8E5EFF] to-[#4596FF]"
                            : "bg-gradient-to-r from-[#8E5EFF]/70 to-[#4596FF]/70 group-hover:from-[#8E5EFF] group-hover:to-[#4596FF]"
                        } transition-all duration-200`}
                      >
                        <span className="text-white font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${
                            ws.id === currentWorkspaceId
                              ? "text-gray-800"
                              : "text-gray-700 group-hover:text-gray-800"
                          } transition-colors duration-200`}
                        >
                          {ws.name}
                        </h4>
                      </div>

                      {/* Active Indicator */}
                      {ws.id === currentWorkspaceId && (
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#8E5EFF] to-[#4596FF] shadow-lg">
                          <div className="w-full h-full rounded-full bg-gradient-to-r from-[#8E5EFF] to-[#4596FF] animate-pulse"></div>
                        </div>
                      )}
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
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            defaultEdgeOptions={{
              style: { stroke: "#4596FF", strokeDasharray: "5,5" },
            }}
          >
            <Controls />
            <Background />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
