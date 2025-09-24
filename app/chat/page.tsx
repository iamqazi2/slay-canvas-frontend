"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChatNav from "../components/New-Navbar";
import SimpleChatInterface from "../components/SimpleChatInterface";
import { KnowledgeBase } from "../types/workspace";
import { apiClient } from "../utils/apiClient";

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
}

const ChatPage = () => {
  const searchParams = useSearchParams();
  const kbName = searchParams.get("kb");
  const conversationId = searchParams.get("conversationId");
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKnowledgeBase = async () => {
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
        };

        setKnowledgeBase(transformedKB);
      } catch (err) {
        console.error("Failed to fetch knowledge base:", err);
        setError("Failed to load knowledge base");
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeBase();
  }, [kbName]);

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
        <SimpleChatInterface
          knowledgeBase={knowledgeBase}
          className="h-full"
          initialConversationId={
            conversationId ? parseInt(conversationId) : undefined
          }
        />
      </div>
    </>
  );
};

export default ChatPage;
