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
  const { position } = data;
  const { x, y } = position;
  const centerX = 400;
  const centerY = 300;
  const threshold = 100;

  let handleStyle: React.CSSProperties = {};
  let handleType: "source" | "target" = "source";
  let handlePosition: Position = Position.Right;

  if (x < centerX - threshold && y < centerY - threshold) {
    // left top -> right bottom
    handleStyle = { right: "-12px", bottom: "-12px" };
    handleType = "source";
    handlePosition = Position.Bottom;
  } else if (x < centerX - threshold && Math.abs(y - centerY) <= threshold) {
    // center left -> center right
    handleStyle = { right: "-12px", top: "50%", transform: "translateY(-50%)" };
    handleType = "source";
    handlePosition = Position.Right;
  } else if (x < centerX - threshold && y > centerY + threshold) {
    // left bottom -> top right
    handleStyle = { right: "-12px", top: "-12px" };
    handleType = "source";
    handlePosition = Position.Top;
  } else if (Math.abs(x - centerX) <= threshold && y < centerY - threshold) {
    // top center -> center bottom
    handleStyle = {
      bottom: "-12px",
      left: "50%",
      transform: "translateX(-50%)",
    };
    handleType = "source";
    handlePosition = Position.Bottom;
  } else if (Math.abs(x - centerX) <= threshold && y > centerY + threshold) {
    // bottom center -> top center
    handleStyle = { top: "-12px", left: "50%", transform: "translateX(-50%)" };
    handleType = "source";
    handlePosition = Position.Top;
  } else if (x > centerX + threshold && y < centerY - threshold) {
    // right top -> bottom left
    handleStyle = { left: "-12px", bottom: "-12px" };
    handleType = "target";
    handlePosition = Position.Bottom;
  } else if (x > centerX + threshold && Math.abs(y - centerY) <= threshold) {
    // right center -> left center
    handleStyle = { left: "-12px", top: "50%", transform: "translateY(-50%)" };
    handleType = "target";
    handlePosition = Position.Left;
  } else if (x > centerX + threshold && y > centerY + threshold) {
    // right bottom -> left top
    handleStyle = { left: "-12px", top: "-12px" };
    handleType = "target";
    handlePosition = Position.Top;
  } else {
    // default center right
    handleStyle = { right: "-12px", top: "50%", transform: "translateY(-50%)" };
    handleType = "source";
    handlePosition = Position.Right;
  }

  return (
    <div className="w-full h-full">
      <Handle
        type={handleType}
        position={handlePosition}
        style={{
          background: "#F0F5F7",
          width: "24px",
          height: "24px",
          border: "2px solid #4596FF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: 1000,
          ...handleStyle,
        }}
      />
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
    [nodes, showChatInFlow]
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
  }, []);

  return (
    <div className="">
      <div className="relative">
        <ChatNav />
        <Sidebar onChatClick={() => setShowChatInFlow(true)} />
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
