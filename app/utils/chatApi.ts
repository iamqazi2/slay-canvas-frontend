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
  document_titles?: string[];
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
        {
          message: request.message,
          knowledge_base_name: request.knowledge_base_name,
          conversation_id: request.conversation_id,
          document_titles: request.document_titles || [],
        }
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
        console.log("Raw buffer:", buffer);

        // Backend sends complete response with control messages at the end
        // Need to separate content from control messages

        // Check if we have [DONE] - this means the response is complete
        if (buffer.includes("[DONE]")) {
          let content = buffer;

          // Extract and handle [CONVERSATION_ID:] if present
          const conversationMatch = content.match(/\[CONVERSATION_ID:(\d+)\]/);
          if (conversationMatch) {
            const conversationId = parseInt(conversationMatch[1]);
            // Remove conversation ID from content
            content = content.replace(/\[CONVERSATION_ID:\d+\]/, "");
            yield { type: "conversation_id", content: "", conversationId };
          }

          // Remove [DONE] from content
          content = content.replace("[DONE]", "");

          // Yield the main content (if any)
          if (content.trim()) {
            yield { type: "message", content: content };
          }

          yield { type: "done", content: "" };
          return;
        }

        // Check for error messages
        if (buffer.includes("[ERROR:")) {
          const match = buffer.match(/\[ERROR:([^\]]*)\]/);
          if (match) {
            const error = match[1];
            yield { type: "error", content: error };
            return;
          }
        }

        // If no control messages yet, yield partial content for streaming effect
        if (buffer && !buffer.includes("[")) {
          yield { type: "message", content: buffer };
          buffer = ""; // Clear buffer after yielding
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const chatApi = new ChatApi();
