"use client";
import { useState, useEffect, useCallback } from "react";
import {
  AudioPlayer,
  ChatInterfaceDraggable,
  ImageCollection,
  PdfDocument,
  Sidebar,
  TextCollection,
  VideoCollection,
  WikipediaLink,
} from "../components";
import ChatNav from "../components/New-Navbar";
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
} from "reactflow";
import "reactflow/dist/style.css";

interface ComponentInstance {
  id: string;
  type: string;
  data?: { file?: File; files?: File[]; text?: string };
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
      return <VideoCollection key={id} id={id} inline={true} />;
    case "audioPlayer":
      return (
        <AudioPlayer
          key={id}
          id={id}
          inline={true}
          initialData={data?.file ? { file: data.file } : undefined}
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
          initialData={data?.file ? { file: data.file } : undefined}
        />
      );
    case "wikipediaLink":
      return (
        <WikipediaLink
          key={id}
          id={id}
          inline={true}
          initialData={data?.text ? { text: data.text } : undefined}
        />
      );
    case "text":
      return (
        <TextCollection
          key={id}
          id={id}
          inline={true}
          initialData={data?.text ? { text: data.text } : undefined}
        />
      );
    default:
      return null;
  }
};

// Custom Node Components
const AssetNode = ({ data }: { data: ComponentInstance }) => {
  return (
    <div
      className="relative h-full"
      style={{
        border:
          data.type === "videoCollection" ? "1px solid #4596FF" : undefined,
        borderRadius: data.type === "videoCollection" ? "8px" : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#4596FF",
          width: "24px",
          height: "24px",
          border: "3px solid white",
          left: "-12px",
          top: "55%",
          transform: "translateY(-50%)",
          zIndex: 1000,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#4596FF",
          width: "24px",
          height: "24px",
          border: "3px solid white",
          right: "-12px",
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
  };
}) => {
  return (
    <div className="w-full h-full">
      <ChatInterfaceDraggable
        attachedAssets={data.attachedAssets}
        inline={true}
      />
    </div>
  );
};

const nodeTypes = {
  asset: AssetNode,
  chat: ChatNode,
};

export default function Home() {
  const [componentInstances, setComponentInstances] = useState<
    ComponentInstance[]
  >([{ id: "video-collection-1", type: "videoCollection" }]);

  const [showChatInFlow, setShowChatInFlow] = useState<boolean>(false);
  const [attachedAssets, setAttachedAssets] = useState<ComponentInstance[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isWorkspaceSidebarOpen, setIsWorkspaceSidebarOpen] =
    useState<boolean>(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: "default",
      name: "Workspace 1",
      componentInstances: [
        { id: "video-collection-1", type: "videoCollection" },
      ],
      nodes: [],
      edges: [],
      attachedAssets: [],
      showChatInFlow: false,
    },
  ]);
  const [currentWorkspaceId, setCurrentWorkspaceId] =
    useState<string>("default");

  const saveCurrentWorkspace = () => {
    setWorkspaces((prev) =>
      prev.map((ws) =>
        ws.id === currentWorkspaceId
          ? {
              ...ws,
              componentInstances,
              nodes,
              edges,
              attachedAssets,
              showChatInFlow,
            }
          : ws
      )
    );
  };

  const createNewWorkspace = () => {
    saveCurrentWorkspace();
    const newId = `workspace-${Date.now()}`;
    const newWorkspace: Workspace = {
      id: newId,
      name: `Workspace ${workspaces.length + 1}`,
      componentInstances: [],
      nodes: [],
      edges: [],
      attachedAssets: [],
      showChatInFlow: false,
    };
    setWorkspaces((prev) => [...prev, newWorkspace]);
    setCurrentWorkspaceId(newId);
    setComponentInstances([]);
    setNodes([]);
    setEdges([]);
    setAttachedAssets([]);
    setShowChatInFlow(false);
  };

  const switchWorkspace = (id: string) => {
    saveCurrentWorkspace();
    const ws = workspaces.find((w) => w.id === id);
    if (ws) {
      setComponentInstances(ws.componentInstances);
      setNodes(ws.nodes);
      setEdges(ws.edges);
      setAttachedAssets(ws.attachedAssets);
      setShowChatInFlow(ws.showChatInFlow);
      setCurrentWorkspaceId(id);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (showChatInFlow) {
        // Handle connections to chat node (asset -> chat)
        if (params.target === "chat-node") {
          setEdges((eds) => addEdge(params, eds));
          // Add the asset to attachedAssets
          const assetNode = nodes.find((n) => n.id === params.source);
          if (assetNode && assetNode.data) {
            setAttachedAssets((prev) => {
              const exists = prev.find((a) => a.id === assetNode.data.id);
              if (!exists) {
                return [...prev, assetNode.data as ComponentInstance];
              }
              return prev;
            });
          }
        }
        // Handle connections from chat node (chat -> asset)
        else if (params.source === "chat-node") {
          setEdges((eds) => addEdge(params, eds));
          // Add the asset to attachedAssets
          const assetNode = nodes.find((n) => n.id === params.target);
          if (assetNode && assetNode.data) {
            setAttachedAssets((prev) => {
              const exists = prev.find((a) => a.id === assetNode.data.id);
              if (!exists) {
                return [...prev, assetNode.data as ComponentInstance];
              }
              return prev;
            });
          }
        }
      }
    },
    [nodes, showChatInFlow, setEdges, setAttachedAssets]
  );

  // Update nodes when componentInstances or showChatInFlow change
  useEffect(() => {
    const getNodeDimensions = (type: string) => {
      switch (type) {
        case "videoCollection":
          return { width: 475, height: 409 };
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
        default:
          return { width: 300, height: 200 };
      }
    };

    const newNodes: Node[] = [
      ...componentInstances.map((instance, index) => {
        const dimensions = getNodeDimensions(instance.type);
        // Find existing node to preserve position
        const existingNode = nodes.find((n) => n.id === instance.id);
        return {
          id: instance.id,
          type: "asset",
          position: existingNode
            ? existingNode.position
            : { x: 100 + index * 200, y: 100 },
          data: instance,
          style: { width: dimensions.width, height: dimensions.height },
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
    const handleCreateComponent = (event: CustomEvent) => {
      const { componentType, data } = event.detail;
      const newInstance: ComponentInstance = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        data: data,
      };

      setComponentInstances((prev) => [...prev, newInstance]);
    };

    const handleRemoveComponent = (event: CustomEvent) => {
      const { componentId } = event.detail;
      console.log(
        "handleRemoveComponent called with componentId:",
        componentId
      );
      setComponentInstances((prev) => {
        console.log("Current component instances before filter:", prev);
        const filtered = prev.filter((instance) => instance.id !== componentId);
        console.log("Filtered component instances:", filtered);
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
    };

    window.addEventListener(
      "createComponent",
      handleCreateComponent as EventListener
    );
    window.addEventListener(
      "removeComponent",
      handleRemoveComponent as EventListener
    );

    return () => {
      window.removeEventListener(
        "createComponent",
        handleCreateComponent as EventListener
      );
      window.removeEventListener(
        "removeComponent",
        handleRemoveComponent as EventListener
      );
    };
  }, [setNodes, setEdges, setAttachedAssets]);

  return (
    <div className="">
      <div className="relative">
        <ChatNav
          onWorkspaceToggle={() =>
            setIsWorkspaceSidebarOpen(!isWorkspaceSidebarOpen)
          }
        />
        <Sidebar onChatClick={() => setShowChatInFlow(true)} />

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
              {workspaces.map((ws, index) => (
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
                    {
                      workspaces.find((ws) => ws.id === currentWorkspaceId)
                        ?.name
                    }
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
