import { apiClient } from "./apiClient";

export interface ChatMessage {
  id: number;
  content: string;
  role: "user" | "agent";
  created_at: string;
  user_id: number;
}

export interface ConversationWithMessages {
  id: number;
  conversation_name: string;
  project_id: number;
  knowledge_base_id: number | null;
  user_id: number;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatAgentRequest {
  message: string;
  knowledge_base_name: string;
  conversation_id?: number | null;
}

export class ChatApi {
  /**
   * Send a message to the chat agent and get streaming response
   * Using your apiClient's stream method
   */
  async sendMessage(
    request: ChatAgentRequest
  ): Promise<ReadableStream<Uint8Array>> {
    try {
      return await apiClient.stream(
        `/agent/knowledge-bases/${request.knowledge_base_name}/selective-search`,
        { ...request, document_titles: [] }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Get conversation with messages using your apiClient
   */
  async getConversation(
    conversationId: number
  ): Promise<ConversationWithMessages> {
    return apiClient.get<ConversationWithMessages>(
      `/agent/conversations/${conversationId}`
    );
  }

  /**
   * Process streaming response from chat agent
   */
  async *processStreamingResponse(
    stream: ReadableStream<Uint8Array>
  ): AsyncGenerator<{
    type: "message" | "conversation_id" | "done" | "error";
    content: string;
    conversationId?: number;
  }> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // Remove 'data: ' prefix

            if (data === "[DONE]") {
              yield { type: "done", content: "" };
              return;
            } else if (data.startsWith("[CONVERSATION_ID:")) {
              const conversationId = parseInt(data.match(/\d+/)?.[0] || "0");
              yield { type: "conversation_id", content: "", conversationId };
            } else if (data.startsWith("[ERROR:")) {
              const error = data.slice(7, -1); // Remove '[ERROR:' and ']'
              yield { type: "error", content: error };
              return;
            } else if (data.trim()) {
              yield { type: "message", content: data };
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const chatApi = new ChatApi();
