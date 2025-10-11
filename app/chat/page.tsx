"use client";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import MultiStepChatInterface from "../components/MultiStepChatInterface";
import ChatNav from "../components/New-Navbar";
import SimpleChatInterface from "../components/SimpleChatInterface";
import { Asset, Collection, KnowledgeBase } from "../types/workspace";
import { apiClient } from "../utils/apiClient";
import { assetApi } from "../utils/assetApi";
import {
  componentInstanceToAssetCreate,
  getAssetCreationStrategy,
} from "../utils/assetUtils";
import { knowledgeBaseApi } from "../utils/knowledgeBaseApi";

interface KnowledgeBaseApiResponse {
  name: string;
  description?: string;
  document_count: number;
  chunk_count: number;
  created_at: string;
  stats: {
    id: number;
    collection_name: string;
    chunk_size: number;
    chunk_overlap: number;
    embedding_model: string;
    is_active: boolean;
    workspace_id: number;
    total_entities: number;
    dimension: number;
    collection_info: Record<string, unknown>;
  };
  conversations: Array<{
    id: number;
    conversation_name: string;
    project_id: number;
    knowledge_base_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
  }>;
  assets: Asset[];
  collections: Collection[];
  notes: Array<{
    id: number;
    content: string;
    role: "user" | "agent";
    created_at: string;
    notes: boolean;
  }>;
}

const ChatPage = () => {
  const searchParams = useSearchParams();
  const kbName = searchParams.get("kb");
  const conversationId = searchParams.get("conversationId");
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(
    null
  );
  const [workspaceData, setWorkspaceData] = useState<{
    assets: Asset[];
    collections: Collection[];
    notes: Array<{
      id: number;
      content: string;
      role: "user" | "agent";
      created_at: string;
      notes: boolean;
    }>;
  } | null>(null);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingAsset, setIsCreatingAsset] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBase = useCallback(async () => {
    if (!kbName) {
      setError("No knowledge base specified");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch knowledge base with conversations
      const kbData = await apiClient.get<KnowledgeBaseApiResponse>(
        `/agent/knowledge-bases/${kbName}`
      );

      // Transform the data to match KnowledgeBase interface
      const transformedKB: KnowledgeBase = {
        id: kbData.stats.id,
        name: kbData.name,
        description: kbData.description,
        collection_name: kbData.stats.collection_name,
        is_active: kbData.stats.is_active,
        created_at: kbData.created_at,
        conversations: kbData.conversations,
        position_x: 0,
        position_y: 0,
      };

      // Store assets and collections for the chat interface
      setWorkspaceData({
        assets: kbData.assets || [],
        collections: kbData.collections || [],
        notes: kbData.notes || [],
      });

      // Store the workspace ID from the response
      setWorkspaceId(kbData.stats.workspace_id);

      setKnowledgeBase(transformedKB);
    } catch (err) {
      console.error("Failed to fetch knowledge base:", err);
      setError("Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  }, [kbName]);

  useEffect(() => {
    fetchKnowledgeBase();
  }, [fetchKnowledgeBase]);

  // Handle component creation events (similar to workspace page)
  useEffect(() => {
    const handleCreateComponent = async (event: CustomEvent) => {
      const { componentType, data } = event.detail;

      if (!knowledgeBase || !workspaceData || !workspaceId) {
        console.error(
          "No knowledge base, workspace data, or workspace ID available"
        );
        return;
      }

      console.log("🔧 Chat page handleCreateComponent called with:", {
        componentType,
        data,
      });

      setIsCreatingAsset(true);

      // Create a temporary component instance for asset creation
      const newInstance = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        data: data,
      };

      try {
        const strategy = getAssetCreationStrategy(componentType);
        console.log("📍 Asset creation strategy:", strategy);

        let savedAsset;

        if (strategy.endpoint === "link") {
          // Handle social, wiki, internet links
          console.log("🔗 Creating link asset");
          const assetCreate = componentInstanceToAssetCreate(newInstance);
          console.log("📝 Asset create data:", assetCreate);
          savedAsset = await assetApi.createLinkAsset(
            workspaceId, // Using actual workspace ID from KB response
            assetCreate
          );
        } else if (strategy.endpoint === "text") {
          // Handle text content
          console.log("📄 Creating text asset");
          const assetCreate = componentInstanceToAssetCreate(newInstance);
          console.log("📝 Asset create data:", assetCreate);
          savedAsset = await assetApi.createTextAsset(
            workspaceId, // Using actual workspace ID from KB response
            assetCreate
          );
        } else if (strategy.endpoint === "file") {
          // Check for file in data.file or data.files
          const fileToUpload = data?.file || (data?.files && data.files[0]);

          if (fileToUpload) {
            // Handle file uploads (image, audio, document)
            console.log("📁 Creating file asset");
            const title = data?.title || fileToUpload?.name || "Uploaded File";
            console.log("📂 File upload details:", {
              fileName: fileToUpload.name,
              fileType: fileToUpload.type,
              assetType: strategy.assetType,
              title,
            });
            savedAsset = await assetApi.uploadFileAsset(
              workspaceId, // Using actual workspace ID from KB response
              fileToUpload,
              strategy.assetType as "image" | "audio" | "document",
              title
            );
          } else {
            console.error(
              "❌ No file provided for file asset type:",
              componentType
            );
            return;
          }
        }

        // If asset was created successfully, link it to the knowledge base
        if (savedAsset) {
          console.log("✅ Asset saved successfully:", savedAsset);

          // Link asset to the current knowledge base
          await knowledgeBaseApi.linkAssetToKnowledgeBase(
            workspaceId, // Using actual workspace ID
            savedAsset.id,
            knowledgeBase.id
          );

          console.log("✅ Asset linked to knowledge base successfully");

          // Refresh the knowledge base data to show the new asset
          await fetchKnowledgeBase();
        }
      } catch (error) {
        console.error("❌ Failed to save asset to backend:", error);
        alert("Failed to create asset. Please try again.");
      } finally {
        setIsCreatingAsset(false);
      }
    };

    // Add event listener
    window.addEventListener(
      "createComponent",
      handleCreateComponent as unknown as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "createComponent",
        handleCreateComponent as unknown as EventListener
      );
    };
  }, [knowledgeBase, workspaceData, workspaceId, fetchKnowledgeBase]);

  if (loading) {
    return (
      <>
        <ChatNav />
        <div className="flex items-center justify-center h-[calc(100vh-78px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !knowledgeBase) {
    return (
      <>
        <ChatNav />
        <div className="flex items-center justify-center h-[calc(100vh-78px)]">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-2">Error</div>
            <p className="text-gray-600">
              {error || "Knowledge base not found"}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ChatNav />
      <div className="h-[calc(100vh-78px)]">
        {knowledgeBase.name.includes("kb_search") ? (
          <MultiStepChatInterface
            isFullscreen={true}
            workspaceId={workspaceId ?? undefined}
            onWorkspaceUpdate={fetchKnowledgeBase}
            externalLoading={isCreatingAsset}
            workspace={
              workspaceData
                ? {
                    id: knowledgeBase?.id || 0,
                    name: knowledgeBase?.name || "",
                    description: knowledgeBase?.description,
                    settings: {},
                    is_public: false,
                    user_id: 0,
                    created_at: knowledgeBase?.created_at || "",
                    updated_at: knowledgeBase?.created_at || "",
                    collaborators: [],
                    knowledge_bases: [
                      { ...knowledgeBase, notes: workspaceData.notes },
                    ],
                    assets: workspaceData.assets,
                    collections: workspaceData.collections,
                  }
                : undefined
            }
          />
        ) : (
          <SimpleChatInterface
            knowledgeBase={knowledgeBase}
            workspace={
              workspaceData
                ? {
                    id: knowledgeBase?.id || 0,
                    name: knowledgeBase?.name || "",
                    description: knowledgeBase?.description,
                    settings: {},
                    is_public: false,
                    user_id: 0,
                    created_at: knowledgeBase?.created_at || "",
                    updated_at: knowledgeBase?.created_at || "",
                    collaborators: [],
                    knowledge_bases: [],
                    assets: workspaceData.assets,
                    collections: workspaceData.collections,
                  }
                : undefined
            }
            className="h-full"
            initialConversationId={
              conversationId ? parseInt(conversationId) : undefined
            }
          />
        )}
      </div>
    </>
  );
};

export default ChatPage;
