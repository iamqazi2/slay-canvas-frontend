"use client";

import { Asset, KnowledgeBase, WorkspaceDetailed } from "@/app/types/workspace";
import {
  ChevronLeft,
  File,
  ImageIcon,
  Link,
  Loader2,
  Music,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { apiClient } from "../utils/apiClient";
import { chatApi } from "../utils/chatApi";

// WiFi Icon Component
const WifiIcon = ({
  width = 24,
  height = 24,
}: {
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    className="text-gray-400"
  >
    <path
      d="M1 8.5L12 2L23 8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 15.5L12 9.5L18 15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);

type Step = "context" | "assets" | "chat";

interface Source {
  id: number;
  title: string;
  description: string;
  type: "article" | "pdf";
  selected: boolean;
  url?: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score: number | null;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results: number;
  error: string | null;
}

interface Message {
  id: number;
  content: string;
  role: "user" | "agent";
  created_at: string;
  user_id: number;
}

// Message Component
const MessageComponent: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        <div
          className={`rounded-2xl shadow-md border-[1px] border-black/10 px-4 py-3 ${
            isUser ? "bg-[#4596FF]/20 text-black" : "bg-white text-black"
          }`}
        >
          <div className="text-sm leading-relaxed prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom styling for markdown elements
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc ml-4 mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 mb-2">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre overflow-x-auto">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="mb-2">{children}</pre>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-semibold mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold mb-1">{children}</h3>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotebookLMFlow = ({
  isFullscreen = false,
  workspace,
}: {
  isFullscreen?: boolean;
  workspace?: WorkspaceDetailed;
}) => {
  const router = useRouter();
  const params = useParams();
  const workspaceId =
    workspace?.id || (params?.id ? parseInt(params.id as string) : undefined);

  // Find the search knowledge base
  const searchKb = workspace?.knowledge_bases.find((kb: KnowledgeBase) =>
    kb.name.includes("kb_search")
  );

  // Get assets linked to the search knowledge base
  const searchAssets =
    workspace?.assets.filter(
      (asset: Asset) => asset.knowledge_base_id === searchKb?.id
    ) || [];

  const [isMaximized] = useState(isFullscreen);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(
    () => new Set(searchAssets.map((asset) => asset.id))
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [originalSearchResults, setOriginalSearchResults] = useState<
    SearchResult[]
  >([]);
  const [currentStep, setCurrentStep] = useState<Step>(() => {
    // If there are already assets linked to the search KB, start from chat step
    if (searchAssets && searchAssets.length > 0) {
      return "chat";
    }

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notebookCurrentStep");
      return (saved as Step) || "context";
    }
    return "context";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookCurrentStep", currentStep);
    }
  }, [currentStep]);

  const [contextInput, setContextInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notebookContextInput") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookContextInput", contextInput);
    }
  }, [contextInput]);

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notebookSearchQuery") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookSearchQuery", searchQuery);
    }
  }, [searchQuery]);

  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookSources", JSON.stringify(sources));
    }
  }, [sources]);

  const [chatInput, setChatInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("notebookChatInput") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("notebookChatInput", chatInput);
    }
  }, [chatInput]);

  const handleContextSubmit = async () => {
    if (contextInput.trim()) {
      setIsLoading(true);
      setSearchQuery(contextInput);
      setCurrentStep("assets");

      try {
        const data = await apiClient.post<SearchResponse>("/search/web", {
          query: contextInput.trim(),
          count: 10,
          use_rerank: false,
          search_engine: "langsearch",
        });

        // Store original search results for later API call
        setOriginalSearchResults(data.results || []);

        // Convert search results to sources format
        const newSources: Source[] =
          data.results?.map((result: SearchResult, index: number) => ({
            id: index + 1,
            title: result.title,
            description: result.snippet,
            type: result.url.includes(".pdf") ? "pdf" : "article",
            selected: true,
            url: result.url,
          })) || [];

        setSources(newSources);
      } catch (error) {
        console.error("Search error:", error);
        // Keep existing sources as fallback
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleSource = (id: number) => {
    setSources(
      sources.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  // Attachment Modal Component
  const AttachmentModal = () => {
    const [activeTab, setActiveTab] = useState<"link" | "file">("link");
    const [linkUrl, setLinkUrl] = useState("");
    const [linkTitle, setLinkTitle] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Validate file type (only images and documents)
        const isImage = file.type.startsWith("image/");
        const isDocument =
          file.type === "application/pdf" ||
          file.type.includes("document") ||
          file.type.includes("text") ||
          file.type.includes("msword") ||
          file.type.includes("officedocument");

        if (isImage || isDocument) {
          setSelectedFile(file);
        } else {
          alert("Please select an image or document file.");
        }
      }
    };

    const handleSubmit = async () => {
      if (activeTab === "link" && linkUrl.trim()) {
        await handleLinkAttach(linkUrl.trim(), linkTitle.trim());
      } else if (activeTab === "file" && selectedFile) {
        await handleFileAttach(selectedFile);
      }
    };

    if (!isAttachModalOpen) return null;

    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsAttachModalOpen(false);
          }
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 transition-opacity duration-300 animate-in fade-in" />

        {/* Modal */}
        <div
          className={`relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <h2 className="text-xl font-semibold text-gray-900">
              Attach Content
            </h2>
            <button
              onClick={() => setIsAttachModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2 rounded-full p-1 hover:bg-gray-100"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab("link")}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "link"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Link className="w-4 h-4 inline mr-2" />
                Add Link
              </button>
              <button
                onClick={() => setActiveTab("file")}
                className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === "file"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload File
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "link" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Enter a custom title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Supports social media links (Facebook, Instagram, TikTok,
                  etc.), Wikipedia, and general web links.
                </p>
              </div>
            )}

            {activeTab === "file" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {selectedFile && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Supported formats: Images (JPG, PNG, GIF, etc.) and Documents
                  (PDF, DOC, DOCX, TXT)
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2"
                disabled={isAttaching}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isAttaching ||
                  (activeTab === "link" && !linkUrl.trim()) ||
                  (activeTab === "file" && !selectedFile)
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isAttaching ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Attaching...
                  </>
                ) : (
                  "Attach"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const toggleAllSources = () => {
    const allSelected = sources.every((s) => s.selected);
    setSources(sources.map((s) => ({ ...s, selected: !allSelected })));
  };

  const handleImportBoard = async () => {
    console.log("🔥 Import Board clicked!");
    console.log("🔥 URL params:", params);
    console.log("🔥 Parsed workspaceId:", workspaceId);
    console.log(
      "🔥 Selected sources:",
      sources.filter((source) => source.selected)
    );
    console.log("🔥 Original search results:", originalSearchResults);

    if (!workspaceId) {
      console.error("❌ Workspace ID is required but not found in URL params");
      console.error("❌ Current params:", params);
      return;
    }

    setIsImporting(true);

    try {
      const selectedTitles = sources
        .filter((source) => source.selected)
        .map((source) => source.title);

      console.log("🚀 Making API call with payload:", {
        workspace_id: workspaceId,
        selected_titles: selectedTitles,
        search_results: originalSearchResults,
      });

      await apiClient.post("/search/select-and-create-kb", {
        workspace_id: workspaceId,
        selected_titles: selectedTitles,
        search_results: originalSearchResults,
      });

      console.log("✅ API call successful!");
      setCurrentStep("chat");
    } catch (error) {
      console.error("❌ Error creating knowledge base:", error);
      // Still proceed to chat step even if API call fails
      setCurrentStep("chat");
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = sources.filter((s) => s.selected).length;

  // Helper functions for asset selection
  const toggleAssetSelection = (assetId: number) => {
    setSelectedAssets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const toggleAllAssets = () => {
    if (selectedAssets.size === searchAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(searchAssets.map((asset) => asset.id)));
    }
  };

  // Get selected asset titles for API call
  const getSelectedAssetTitles = (): string[] => {
    if (selectedAssets.size === 0) {
      // If no assets selected, return empty array (no selective search)
      return [];
    }
    if (selectedAssets.size === searchAssets.length) {
      // If all assets are selected, return empty array (search all content, no selective filtering)
      return [];
    }
    // Only return specific asset titles when partial selection is made
    return searchAssets
      .filter((asset) => selectedAssets.has(asset.id))
      .map((asset) => asset.title);
  };

  // Send chat message with selective search
  const sendChatMessage = async (messageText: string) => {
    if (!searchKb || !messageText.trim() || !workspaceId || isStreaming) return;

    const userMessage: Message = {
      id: Date.now(),
      content: messageText.trim(),
      role: "user",
      created_at: new Date().toISOString(),
      user_id: 0, // Will be set by backend
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      const selectedAssetTitles = getSelectedAssetTitles();

      // Use existing conversation ID or the one from searchKb
      const existingConversationId =
        conversationId ||
        (searchKb.conversations && searchKb.conversations.length > 0
          ? searchKb.conversations[0].id
          : null);

      const stream = await chatApi.sendMessage({
        message: messageText.trim(),
        model: "gpt-4o-mini",
        knowledge_base_name: searchKb.name,
        conversation_id: existingConversationId,
        document_titles: selectedAssetTitles,
      });

      // Start streaming response
      let agentMessage = "";
      const agentMessageId = Date.now() + 1;

      // Add empty agent message that will be updated as stream comes in
      const initialAgentMessage: Message = {
        id: agentMessageId,
        content: "",
        role: "agent",
        created_at: new Date().toISOString(),
        user_id: 0,
      };
      setMessages((prev) => [...prev, initialAgentMessage]);

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }

      // Process streaming response
      for await (const chunk of chatApi.processStreamingResponse(stream)) {
        switch (chunk.type) {
          case "message":
            agentMessage += chunk.content;

            // Delay for smooth streaming effect
            await sleep(50);

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === agentMessageId
                  ? { ...msg, content: agentMessage }
                  : msg
              )
            );
            break;
          case "conversation_id":
            if (chunk.conversationId && !conversationId) {
              setConversationId(chunk.conversationId);
            }
            break;
          case "done":
            console.log("Streaming completed");
            break;
          case "error":
            console.error("Streaming error:", chunk.content);
            break;
        }
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  // Handle chat form submission
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isStreaming) return;

    const message = chatInput.trim();
    setChatInput(""); // Clear input immediately

    try {
      await sendChatMessage(message);
    } catch (error) {
      console.error("Error in handleChatSubmit:", error);
    }
  };

  // Helper function to determine link type based on URL
  const getLinkType = (url: string): "social" | "wiki" | "internet" => {
    const lowerUrl = url.toLowerCase();

    // Social media platforms
    if (
      lowerUrl.includes("facebook.com") ||
      lowerUrl.includes("fb.com") ||
      lowerUrl.includes("instagram.com") ||
      lowerUrl.includes("twitter.com") ||
      lowerUrl.includes("x.com") ||
      lowerUrl.includes("tiktok.com") ||
      lowerUrl.includes("youtube.com") ||
      lowerUrl.includes("youtu.be") ||
      lowerUrl.includes("linkedin.com") ||
      lowerUrl.includes("snapchat.com")
    ) {
      return "social";
    }

    // Wikipedia
    if (lowerUrl.includes("wikipedia.org")) {
      return "wiki";
    }

    // Default to internet
    return "internet";
  };

  // Handle file attachment
  const handleFileAttach = async (file: File) => {
    setIsAttaching(true);
    try {
      // Determine component type based on file type
      let componentType = "pdfDocument"; // default for documents
      if (file.type.startsWith("image/")) {
        componentType = "imageCollection";
      }

      // Dispatch createComponent event like other sidebar components
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: {
            componentType: componentType,
            data:
              componentType === "imageCollection"
                ? { files: [file] }
                : { file: file },
          },
        })
      );

      // Close modal
      setIsAttachModalOpen(false);
    } catch (error) {
      console.error("Failed to attach file:", error);
      alert("Failed to attach file. Please try again.");
    } finally {
      setIsAttaching(false);
    }
  };

  // Handle link attachment
  const handleLinkAttach = async (url: string, title: string) => {
    setIsAttaching(true);
    try {
      const linkType = getLinkType(url);

      // Determine component type based on link type
      let componentType = "webLink"; // default
      if (linkType === "wiki") {
        componentType = "wikipediaLink";
      } else if (linkType === "social") {
        componentType = "webLink"; // or could be "socialVideo" depending on platform
      }

      // Dispatch createComponent event like other sidebar components
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: {
            componentType: componentType,
            data: {
              url: url,
              text: url,
              title: title || url,
            },
          },
        })
      );

      // Close modal
      setIsAttachModalOpen(false);
    } catch (error) {
      console.error("Failed to attach link:", error);
      alert("Failed to attach link. Please try again.");
    } finally {
      setIsAttaching(false);
    }
  };

  // Helper function to render asset icon based on type
  const renderAssetIcon = (asset: Asset) => {
    switch (asset.type) {
      case "internet":
      case "web_link":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-blue-600"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case "text":
      case "document":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-600"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline
              points="14,2 14,8 20,8"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16"
              y1="13"
              x2="8"
              y2="13"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16"
              y1="17"
              x2="8"
              y2="17"
              stroke="currentColor"
              strokeWidth="2"
            />
            <polyline
              points="10,9 9,9 8,9"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        );
      case "pdf":
        return (
          <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
            PDF
          </div>
        );
      case "image":
        return <ImageIcon className="text-gray-600" size={20} />;
      case "audio":
        return <Music className="text-gray-600" size={20} />;
      case "video":
        return <Video className="text-gray-600" size={20} />;
      default:
        return <File className="text-gray-600" size={20} />;
    }
  };

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="p-8">
      <div className="bg-[#4596FF]/10 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-2">
          <span className="text-gray-600 font-medium">Searched:</span>
          <span className="text-gray-900 font-semibold flex-1">
            {searchQuery}
          </span>
        </div>
      </div>

      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>

        <div className="space-y-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl"
            >
              <div className="min-w-12 min-h-12 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0"></div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded-full w-36"></div>
        </div>
      </div>
    </div>
  );

  // Only show chat step if search knowledge base exists, otherwise start from context
  // If no searchKb exists, user should go through context -> assets -> chat flow
  if (!searchKb && currentStep === "chat") {
    // Reset to context step if no search KB exists yet
    setCurrentStep("context");
  }

  return (
    <div className={isMaximized ? "" : "flex items-center justify-center p-4"}>
      <div
        className={
          isMaximized
            ? "w-full h-full bg-[#F0F5F8] overflow-hidden"
            : "w-full max-w-4xl bg-[#F0F5F8] rounded-2xl shadow-lg overflow-hidden"
        }
        style={isMaximized ? {} : { height: "87vh" }}
      >
        {/* Header */}
        <div className="bg-black border-1 border-black text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep !== "context" && currentStep !== "chat" && (
              <button
                onClick={() => {
                  if (currentStep === "assets") setCurrentStep("context");
                }}
                className="text-white hover:bg-gray-800  rounded mr-2"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <WifiIcon width={40} height={40} />
            </div>
          </div>
          {currentStep === "chat" && (
            <button
              onClick={
                isMaximized
                  ? () => window.history.back()
                  : () => router.push(`/chat?kb=${searchKb?.collection_name}`)
              }
              className="text-white hover:bg-gray-800  rounded"
            >
              {isMaximized ? (
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.303 6.22217V8.44439C17.303 9.03376 17.5371 9.59899 17.9539 10.0157C18.3706 10.4325 18.9359 10.6666 19.5252 10.6666H21.7475M17.303 21.7777V19.5555C17.303 18.9661 17.5371 18.4009 17.9539 17.9842C18.3706 17.5674 18.9359 17.3333 19.5252 17.3333H21.7475M6.19189 10.6666H8.41412C9.00349 10.6666 9.56872 10.4325 9.98546 10.0157C10.4022 9.59899 10.6363 9.03376 10.6363 8.44439V6.22217M6.19189 17.3333H8.41412C9.00349 17.3333 9.56872 17.5674 9.98546 17.9842C10.4022 18.4009 10.6363 18.9661 10.6363 19.5555V21.7777"
                    stroke="white"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.303 21.7777V19.5555C17.303 18.9661 17.5371 18.4009 17.9539 17.9842C18.3706 17.5674 18.9359 17.3333 19.5252 17.3333H21.7475M17.303 6.22217V8.44439C17.303 9.03376 17.5371 9.59899 17.9539 10.0157C18.3706 10.4325 18.9359 10.6666 19.5252 10.6666H21.7475M6.19189 17.3333H8.41412C9.00349 17.3333 9.56872 17.5674 9.98546 17.9842C10.4022 18.4009 10.6363 18.9661 10.6363 19.5555V21.7777M6.19189 10.6666H8.41412C9.00349 10.6666 9.56872 10.4325 9.98546 10.0157C10.4022 9.59899 10.6363 9.03376 10.6363 8.44439V6.22217"
                    stroke="white"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="">
          {/* Step 1: Context Input */}
          {currentStep === "context" && (
            <div className="flex flex-col items-center bg-[#F0F5F8] justify-center  px-8 py-16">
              <svg
                width="100"
                height="100"
                viewBox="0 0 49 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.302734"
                  width="48"
                  height="48"
                  rx="22"
                  fill="#4596FF"
                  fill-opacity="0.1"
                />
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M21.4368 11.0162C22.2678 11.0162 23.0844 11.0993 23.871 11.2598C24.2434 11.3354 24.5705 11.5558 24.7803 11.8726C24.9901 12.1894 25.0656 12.5766 24.9899 12.9489C24.9143 13.3213 24.6939 13.6484 24.3771 13.8583C24.0603 14.0681 23.6731 14.1435 23.3008 14.0679C21.4962 13.6998 19.6231 13.875 17.9181 14.5713C16.2132 15.2677 14.753 16.4539 13.7221 17.9801C12.6913 19.5063 12.1361 21.3038 12.1268 23.1455C12.1175 24.9871 12.6544 26.7902 13.6698 28.3267C14.6851 29.8633 16.1332 31.0642 17.8311 31.7778C19.5289 32.4914 21.4002 32.6855 23.2083 32.3357C25.0165 31.9859 26.6803 31.1078 27.9894 29.8124C29.2986 28.517 30.1942 26.8626 30.5632 25.0582C30.6006 24.8739 30.674 24.6987 30.7792 24.5426C30.8843 24.3866 31.0192 24.2528 31.176 24.1489C31.3329 24.045 31.5087 23.973 31.6934 23.9371C31.878 23.9011 32.068 23.9019 32.2524 23.9393C32.4368 23.9767 32.612 24.0501 32.768 24.1553C32.924 24.2604 33.0578 24.3953 33.1617 24.5521C33.2656 24.709 33.3376 24.8848 33.3736 25.0695C33.4095 25.2541 33.4088 25.4441 33.3713 25.6285C33.0224 27.3372 32.3105 28.951 31.2839 30.3607L31.0016 30.7332L36.2339 35.9655C36.4936 36.2227 36.6451 36.5695 36.6575 36.9348C36.6699 37.3001 36.5422 37.6563 36.3006 37.9306C36.0589 38.2048 35.7216 38.3763 35.3576 38.41C34.9936 38.4437 34.6306 38.337 34.3427 38.1117L34.208 37.9914L28.9758 32.7591C27.4506 33.9611 25.66 34.7809 23.7535 35.1502C21.8471 35.5194 19.8799 35.4274 18.0162 34.8818C16.1525 34.3362 14.4463 33.3528 13.04 32.0137C11.6337 30.6746 10.568 29.0186 9.93179 27.1838C9.29562 25.349 9.10744 23.3888 9.38296 21.4665C9.65847 19.5442 10.3897 17.7157 11.5156 16.1335C12.6415 14.5513 14.1295 13.2613 15.8553 12.3711C17.5812 11.4809 19.4949 11.0164 21.4368 11.0162ZM33.6149 9.5835C33.8829 9.5835 34.1456 9.65868 34.373 9.80051C34.6004 9.94234 34.7835 10.1451 34.9015 10.3858L34.9702 10.5534L35.1565 11.095C35.3531 11.6712 35.6698 12.1991 36.0857 12.6437C36.5017 13.0883 37.0073 13.4394 37.5692 13.6739L37.8342 13.7742L38.3758 13.959C38.644 14.0505 38.879 14.2195 39.0512 14.4445C39.2233 14.6696 39.3249 14.9407 39.343 15.2235C39.3611 15.5063 39.2949 15.7881 39.1528 16.0333C39.0108 16.2785 38.7992 16.476 38.5449 16.6009L38.3758 16.6697L37.8342 16.856C37.258 17.0525 36.7301 17.3693 36.2855 17.7852C35.841 18.2011 35.4898 18.7068 35.2553 19.2686L35.1551 19.5337L34.9702 20.0753C34.8786 20.3434 34.7095 20.5783 34.4843 20.7503C34.2592 20.9223 33.988 21.0237 33.7053 21.0417C33.4225 21.0596 33.1407 20.9933 32.8956 20.8511C32.6505 20.7089 32.4531 20.4973 32.3283 20.2429L32.2595 20.0753L32.0733 19.5337C31.8767 18.9575 31.56 18.4296 31.144 17.985C30.7281 17.5404 30.2225 17.1893 29.6606 16.9548L29.3955 16.8545L28.854 16.6697C28.5858 16.5782 28.3507 16.4092 28.1786 16.1842C28.0064 15.9591 27.9049 15.688 27.8868 15.4052C27.8687 15.1224 27.9349 14.8406 28.0769 14.5954C28.219 14.3503 28.4306 14.1527 28.6849 14.0278L28.854 13.959L29.3955 13.7728C29.9718 13.5762 30.4996 13.2594 30.9442 12.8435C31.3888 12.4276 31.74 11.9219 31.9744 11.3601L32.0747 11.095L32.2595 10.5534C32.3561 10.2706 32.5386 10.025 32.7817 9.85111C33.0247 9.67719 33.316 9.58362 33.6149 9.5835ZM33.6149 14.1625C33.276 14.589 32.8895 14.9754 32.463 15.3144C32.8909 15.6534 33.2749 16.0374 33.6149 16.4663C33.954 16.0384 34.3379 15.6544 34.7668 15.3144C34.3403 14.9754 33.9538 14.589 33.6149 14.1625Z"
                  fill="#4596FF"
                />
              </svg>

              <h1 className="text-3xl mt-6 font-normal text-gray-900 mb-12">
                What are you interested in?
              </h1>

              <div className="w-full max-w-2xl">
                <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="Cultural Meanings and Symbolism of Color, Especially Yellow"
                  className="w-full px-6 py-4 border-2 border-gray-900 rounded-xl resize-none focus:outline-none focus:border-gray-800 text-gray-900 placeholder-gray-900"
                  rows={6}
                  style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                />
              </div>

              <div className="flex items-center gap-4 mt-8">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border-[1px] border-black/10 text-gray-600 rounded-full cursor-pointer transition-colors">
                  <Sparkles size={18} />
                  <span>I am feeling curious</span>
                </button>
                <button
                  onClick={handleContextSubmit}
                  disabled={!contextInput.trim() || isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Searching...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Assets Selection */}
          {currentStep === "assets" && (
            <>
              {isLoading ? (
                <SkeletonLoader />
              ) : (
                <div className="p-8">
                  <div className="bg-[#4596FF]/10 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-600 font-medium">
                        Searched:
                      </span>
                      <span className="text-gray-900 font-semibold flex-1">
                        {searchQuery}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-8 leading-relaxed">
                    {sources.length > 0
                      ? `Found ${sources.length} relevant sources for your search. Review and select the sources you'd like to include in your research.`
                      : "This selection of sources explores the fascinating connections between mythological figures and the names of geographic features across different cultures and celestial bodies."}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={toggleAllSources}
                      className="text-gray-700 font-semibold hover:text-gray-900"
                    >
                      Select all sources
                    </button>
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                        sources.every((s) => s.selected)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={toggleAllSources}
                    >
                      {sources.every((s) => s.selected) && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3 8L6.5 11.5L13 5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {sources.slice(0, 1).map((source) => (
                      <div
                        key={source.id}
                        className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => toggleSource(source.id)}
                      >
                        <div className="min-w-12 min-h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          {source.type === "pdf" ? (
                            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                              PDF
                            </div>
                          ) : (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                x="4"
                                y="4"
                                width="16"
                                height="16"
                                rx="2"
                                stroke="#3B82F6"
                                strokeWidth="2"
                              />
                              <line
                                x1="4"
                                y1="8"
                                x2="20"
                                y2="8"
                                stroke="#3B82F6"
                                strokeWidth="2"
                              />
                              <line
                                x1="8"
                                y1="4"
                                x2="8"
                                y2="8"
                                stroke="#3B82F6"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-medium text-gray-900 mb-1">
                              {source.title}
                            </h3>
                            {source.url && (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="flex-shrink-0"
                                >
                                  <path
                                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </a>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {source.description}
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            source.selected
                              ? "bg-blue-600 border-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {source.selected && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M3 8L6.5 11.5L13 5"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {selectedCount === sources.length
                        ? sources.length
                        : selectedCount}{" "}
                      sources selected
                    </span>
                    <button
                      onClick={handleImportBoard}
                      disabled={selectedCount === 0 || isImporting}
                      className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                    >
                      {isImporting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Creating Board...
                        </>
                      ) : (
                        "Import as a Board"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 3: Chat Interface */}
          {currentStep === "chat" && (
            <div className="flex h-[calc(100vh-161px)]">
              {/* Sidebar */}
              <div
                className={`bg-white border-r border-gray-200 flex flex-col py-6 gap-4 px-2 transition-all duration-300 h-full overflow-auto ${
                  isSidebarExpanded ? "w-80" : "w-20"
                }`}
              >
                {/* Expand/Collapse Button */}
                <button
                  onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                  className="min-w-12 min-h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                  title={
                    isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
                  }
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`transform transition-transform duration-200 ${
                      isSidebarExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {isSidebarExpanded ? (
                  /* Expanded Sidebar View */
                  <div className="flex flex-col gap-4 w-full px-2 flex-1 overflow-hidden">
                    {/* Select All Button */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Assets ({searchAssets.length})
                      </span>
                      <button
                        onClick={toggleAllAssets}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {selectedAssets.size === searchAssets.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    </div>

                    {/* Selective Search Status */}
                    {selectedAssets.size > 0 &&
                      selectedAssets.size < searchAssets.length && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <p className="text-xs text-blue-700">
                            🎯 Selective search: {selectedAssets.size} of{" "}
                            {searchAssets.length} assets selected
                          </p>
                        </div>
                      )}

                    {/* Asset List with Checkboxes */}
                    <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                      {searchAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                          onClick={() => toggleAssetSelection(asset.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAssets.has(asset.id)}
                            onChange={() => {}} // Handled by parent onClick
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {renderAssetIcon(asset)}
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {asset.title.length > 25
                                  ? `${asset.title.substring(0, 25)}...`
                                  : asset.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 capitalize">
                              {asset.type.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Collapsed Sidebar View */
                  <>
                    <button className="min-w-12 min-h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsAttachModalOpen(true)}
                      className="min-w-12 min-h-12 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                    >
                      <span className="text-2xl">+</span>
                    </button>
                    <button className="min-w-12 min-h-12 bg-blue-500 rounded-lg flex items-center justify-center hover:bg-blue-600">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <rect
                          x="4"
                          y="4"
                          width="16"
                          height="16"
                          rx="2"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <line
                          x1="4"
                          y1="8"
                          x2="20"
                          y2="8"
                          stroke="white"
                          strokeWidth="2"
                        />
                        <line
                          x1="8"
                          y1="4"
                          x2="8"
                          y2="8"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    {searchAssets.map((asset) => (
                      <button
                        key={asset.id}
                        className="min-w-12 min-h-12 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 border border-gray-200"
                        title={asset.title}
                      >
                        {renderAssetIcon(asset)}
                      </button>
                    ))}
                    <button className="mt-auto min-w-12 min-h-12 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200">
                      <Sparkles className="text-blue-600" size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Main Chat Area */}
              <div className="flex-1 min-w-[300px] flex flex-col h-full min-h-0">
                {/* Chat Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-[#F1F5F8] min-h-0"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center px-6 py-8">
                      <div className="text-center flex flex-col items-center justify-center max-w-lg">
                        <div className="mb-8">
                          <WifiIcon width={80} height={80} />
                        </div>

                        <h2 className="text-2xl text-center font-medium text-gray-800 mb-4">
                          How can we assist you today?
                        </h2>

                        <p className="text-base text-gray-500 leading-relaxed mb-4">
                          {searchKb
                            ? `Get expert guidance from your knowledge base "${searchKb.name}". Ask any question and get AI-powered responses based on your search results.`
                            : "Get expert guidance from your curated web search results. Ask any question and get AI-powered responses based on your selected content."}
                        </p>

                        <div className="mt-4 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            <span className="font-medium">Assets:</span>{" "}
                            {searchAssets.length} sources
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-2">
                      <div className="space-y-4 bg-gray pb-4">
                        {messages.map((message) => (
                          <MessageComponent
                            key={message.id}
                            message={message}
                          />
                        ))}

                        {isStreaming && (
                          <div className="flex items-center gap-1 justify-start">
                            <Loader2
                              size={10}
                              className="animate-spin text-gray-500"
                            />
                            <span className="text-[10px]">Generating...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex-1 relative">
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit();
                          }
                        }}
                        placeholder="Type your prompt here"
                        className="w-full px-3 py-2.5 pr-16 focus:outline-none focus:border-transparent resize-none text-sm"
                        rows={1}
                        style={{ minHeight: "40px", maxHeight: "100px" }}
                        disabled={isStreaming}
                      />

                      <div className="absolute right-2 bottom-1 flex items-center gap-1">
                        <button
                          onClick={handleChatSubmit}
                          disabled={!chatInput.trim() || isStreaming}
                          className={`p-1.5 rounded-lg transition-colors ${
                            chatInput.trim()
                              ? "opacity-100"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          style={{
                            background:
                              "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 2L11 13" />
                            <polygon points="22,2 15,22 11,13 2,9" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attachment Modal */}
      <AttachmentModal />
    </div>
  );
};

export default NotebookLMFlow;
