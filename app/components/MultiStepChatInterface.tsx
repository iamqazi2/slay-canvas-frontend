"use client";

import { Asset, KnowledgeBase, WorkspaceDetailed } from "@/app/types/workspace";
import { ChevronLeft, File, ImageIcon, Music, Video } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "../utils/apiClient";
import { chatApi } from "../utils/chatApi";
import AttachmentModal from "./AttachmentModal";
import AssetsStep from "./steps/AssetsStep";
import ChatStep from "./steps/ChatStep";
import ContextStep from "./steps/ContextStep";
import {
  Message,
  Note,
  SearchResponse,
  SearchResult,
  Source,
  Step,
} from "./types/multiStepChatTypes";

const NotebookLMFlow = ({
  isFullscreen = false,
  workspace,
  onWorkspaceUpdate,
  externalLoading = false,
  workspaceId,
  useExistingSearchKb = false, // New prop to control whether to use existing search KB
}: {
  isFullscreen?: boolean;
  workspace?: WorkspaceDetailed;
  onWorkspaceUpdate?: () => void;
  externalLoading?: boolean;
  workspaceId?: number;
  useExistingSearchKb?: boolean; // New prop to control whether to use existing search KB
}) => {
  const router = useRouter();
  const params = useParams();

  // Only find the search knowledge base if explicitly told to use existing one
  const searchKb = useExistingSearchKb
    ? workspace?.knowledge_bases.find((kb: KnowledgeBase) =>
        kb.name.includes("kb_search")
      )
    : undefined;

  // Debug logging for search KB
  console.log("MultiStepChatInterface - Search KB lookup:", {
    useExistingSearchKb,
    workspaceKbs:
      workspace?.knowledge_bases?.map((kb) => ({ id: kb.id, name: kb.name })) ||
      [],
    foundSearchKb: searchKb ? { id: searchKb.id, name: searchKb.name } : null,
  });

  // Get assets linked to the search knowledge base
  const searchAssets =
    (searchKb &&
      workspace?.assets.filter(
        (asset: Asset) => asset.knowledge_base_id === searchKb.id
      )) ||
    [];

  const [isMaximized] = useState(isFullscreen);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLinkingToExistingKb, setIsLinkingToExistingKb] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(
    isMaximized ? true : false
  );
  const [selectedAssets, setSelectedAssets] = useState<Set<number>>(
    () => new Set(searchAssets.map((asset) => asset.id))
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isKbCreated, setIsKbCreated] = useState(false); // Track if KB was just created
  const [createdKbName, setCreatedKbName] = useState<string | null>(null); // Store the created KB name
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [originalSearchResults, setOriginalSearchResults] = useState<
    SearchResult[]
  >([]);

  const [currentStep, setCurrentStep] = useState<Step>(() => {
    // Debug logging
    console.log("MultiStepChatInterface - Initial step determination:", {
      useExistingSearchKb,
      searchKb: searchKb ? { id: searchKb.id, name: searchKb.name } : null,
      searchAssetsLength: searchAssets?.length || 0,
      searchAssets:
        searchAssets?.map((a) => ({ id: a.id, title: a.title })) || [],
    });

    // If using existing search KB and it has assets, start from chat step
    if (
      useExistingSearchKb &&
      searchKb &&
      searchAssets &&
      searchAssets.length > 0
    ) {
      console.log("Starting from chat step - existing KB with assets found");
      return "chat";
    }

    // If using existing search KB but no specific assets, check if KB has any content
    if (useExistingSearchKb && searchKb) {
      // KB exists but no assets found in current workspace filter - still go to chat
      // This handles cases where assets might be filtered differently
      console.log(
        "Starting from chat step - existing KB found (no assets in current filter)"
      );
      return "chat";
    }

    console.log("Starting from context step - no existing KB or fresh start");
    return "context";
  });

  const [contextInput, setContextInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Function to restore chat state from localStorage
  const restoreChatState = () => {
    try {
      const savedState = localStorage.getItem("multiStepChatState");
      if (savedState) {
        const chatState = JSON.parse(savedState);
        const {
          messages: savedMessages,
          notes: savedNotes,
          conversationId: savedConversationId,
        } = chatState;

        // Check if the saved state is recent (within last 5 minutes)
        const timeDiff = Date.now() - chatState.timestamp;
        if (timeDiff < 5 * 60 * 1000) {
          // 5 minutes
          console.log("Restoring chat state from localStorage:", chatState);

          if (savedMessages && Array.isArray(savedMessages)) {
            setMessages(savedMessages);
          }

          if (savedNotes && Array.isArray(savedNotes)) {
            setNotes(savedNotes);
          }

          if (savedConversationId) {
            setConversationId(savedConversationId);
          }

          // Clear the localStorage after restoration
          localStorage.removeItem("multiStepChatState");
          return true;
        } else {
          console.log("Saved chat state is too old, ignoring");
          localStorage.removeItem("multiStepChatState");
        }
      }
    } catch (error) {
      console.error("Error restoring chat state:", error);
      localStorage.removeItem("multiStepChatState");
    }
    return false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };

    if (dropdownOpen !== null) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Load notes from workspace data (backend already sends notes)
  useEffect(() => {
    if (searchKb?.notes) {
      setNotes(searchKb.notes);
    }
  }, [searchKb]);

  // Restore chat state from localStorage when component mounts in fullscreen mode
  useEffect(() => {
    if (isFullscreen && useExistingSearchKb) {
      restoreChatState();
    }
  }, [isFullscreen, useExistingSearchKb]);

  // Save note function
  const handleSaveNote = async (
    content: string,
    role: "user" | "agent" = "agent"
  ) => {
    const kbName = searchKb?.name || createdKbName;
    if (!kbName) return;

    try {
      const response = await apiClient.post(
        `/knowledge-bases/${kbName}/notes?content=${encodeURIComponent(
          content
        )}&role=${role}`
      );

      if (response) {
        // Add the new note to the beginning of the list
        const newNote: Note = {
          id: (response as { id: number }).id || Date.now(),
          content: content,
          role: role,
          created_at: new Date().toISOString(),
          notes: true,
        };
        setNotes((prev) => [newNote, ...prev]);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  // Delete note function
  const handleDeleteNote = async (noteId: number) => {
    const kbName = searchKb?.name || createdKbName;
    if (!kbName) return;

    try {
      await apiClient.delete(`/knowledge-bases/${kbName}/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

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

      // Check if we have an existing search KB - if yes, use link API, else use create API
      const hasExistingKb = searchKb && searchKb.id;
      setIsLinkingToExistingKb(!!hasExistingKb);

      const apiEndpoint = hasExistingKb
        ? "/search/select-and-link-kb"
        : "/search/select-and-create-kb";

      const payload = {
        workspace_id: workspaceId,
        knowledge_base_id: hasExistingKb ? searchKb.id : 0,
        selected_titles: selectedTitles,
        search_results: originalSearchResults,
      };

      console.log(
        `🚀 Making API call to ${apiEndpoint} with payload:`,
        payload
      );

      const response = await apiClient.post(apiEndpoint, payload);

      console.log("✅ API call successful!");

      // Store the created KB name from response (only for create API)
      if (
        !hasExistingKb &&
        response &&
        (response as { knowledge_base_name?: string }).knowledge_base_name
      ) {
        setCreatedKbName(
          (response as { knowledge_base_name: string }).knowledge_base_name
        );
      }

      setIsKbCreated(true); // Mark that KB was created/updated
      setCurrentStep("chat");

      // Trigger workspace update to refresh the UI with new assets
      onWorkspaceUpdate?.();
    } catch (error) {
      console.error("❌ Error creating/updating knowledge base:", error);
      // Still proceed to chat step even if API call fails
      setIsKbCreated(true); // Mark that KB was created/updated (or attempted)
      setCurrentStep("chat");

      // Trigger workspace update even on error to refresh any partial updates
      onWorkspaceUpdate?.();
    } finally {
      setIsImporting(false);
      setIsLinkingToExistingKb(false);
    }
  };

  // Handle back navigation to step 1
  const handleBackToContext = () => {
    setCurrentStep("context");
    // Clear any previous search data
    setSources([]);
    setOriginalSearchResults([]);
    setContextInput("");
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
    // Always return the titles of selected assets
    return searchAssets
      .filter(
        (asset) => selectedAssets.has(asset.id) && typeof asset.url === "string"
      )
      .map((asset) => asset.url as string);
  };

  // Send chat message with selective search
  const sendChatMessage = async (messageText: string) => {
    // Use searchKb name if available, otherwise use the created KB name
    const kbName = searchKb?.name || createdKbName;

    if (!kbName || !messageText.trim() || !workspaceId || isStreaming) {
      console.log("❌ Missing requirements for chat:", {
        kbName,
        messageText: messageText.trim(),
        workspaceId,
        isStreaming,
      });
      return;
    }

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
        (searchKb?.conversations && searchKb.conversations.length > 0
          ? searchKb.conversations[0].id
          : null);

      const stream = await chatApi.sendMessage({
        message: messageText.trim(),
        model: "gpt-4o-mini",
        knowledge_base_name: kbName,
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
  if (!searchKb && currentStep === "chat" && !isKbCreated) {
    setCurrentStep("context");
  }

  return (
    <div
      className={
        isMaximized ? "h-full" : "flex items-center justify-center p-4"
      }
    >
      <div
        className={
          isMaximized
            ? "w-full h-full bg-[#F0F5F8] overflow-hidden relative"
            : "w-full max-w-4xl bg-[#F0F5F8] rounded-2xl shadow-lg overflow-hidden relative"
        }
        // style={isMaximized ? {} : { height: "87vh" }}
      >
        {/* Loading Overlay */}
        {(isLoading ||
          isImporting ||
          isDeleting ||
          isAttaching ||
          externalLoading) && (
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4596FF]"></div>
              <span className="text-sm text-gray-600">
                {isLoading
                  ? "Searching..."
                  : isImporting
                  ? isLinkingToExistingKb
                    ? "Adding to Knowledge Base..."
                    : "Creating Knowledge Base..."
                  : isDeleting
                  ? "Cleaning up..."
                  : isAttaching
                  ? "Uploading..."
                  : externalLoading
                  ? "Creating Asset..."
                  : "Loading..."}
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        {!isMaximized && (
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
                <svg
                  width="29"
                  height="28"
                  viewBox="0 0 29 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_44_261)">
                    <path
                      d="M14.3016 3.73457C6.57007 3.73457 0.302734 9.9494 0.302734 17.6179V24.2667H2.8834V23.6041C2.8834 20.4937 5.4244 17.9726 8.5604 17.9726C11.6964 17.9726 14.2374 20.4926 14.2374 23.6041V24.2667H16.8181V23.6041C16.8181 19.0809 13.1197 15.4152 8.5604 15.4152C6.85471 15.413 5.18991 15.9374 3.7934 16.9167C4.51367 15.5045 5.61081 14.3193 6.9633 13.4923C8.31578 12.6653 9.8708 12.2289 11.4561 12.2314C16.1892 12.2314 20.0276 16.0394 20.0276 20.7329V24.2667H22.6082V20.7317C22.6082 14.6242 17.6149 9.67056 11.4549 9.67056C8.79749 9.66484 6.22536 10.6081 4.20173 12.3306C5.17982 10.5029 6.63639 8.9755 8.41563 7.91182C10.1949 6.84815 12.2298 6.2882 14.3027 6.2919C20.6097 6.2919 25.7221 11.3622 25.7221 17.6167V24.2667H28.3027V17.6167C28.3016 9.94823 22.0342 3.73457 14.3016 3.73457Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_44_261">
                      <rect
                        width="28"
                        height="28"
                        fill="white"
                        transform="translate(0.302734)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentStep === "chat" && (
                <button
                  onClick={
                    isMaximized
                      ? () => window.history.back()
                      : () => {
                          // Save current chat state to localStorage before navigation
                          const chatState = {
                            messages,
                            notes,
                            currentStep,
                            conversationId,
                            timestamp: Date.now(),
                          };
                          localStorage.setItem(
                            "multiStepChatState",
                            JSON.stringify(chatState)
                          );
                          router.push(`/chat?kb=${searchKb?.collection_name}`);
                        }
                  }
                  className="text-white hover:bg-gray-800 rounded p-1"
                  title={isMaximized ? "Minimize" : "Maximize"}
                >
                  {isMaximized ? (
                    <svg
                      width="40"
                      height="40"
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
                      width="40"
                      height="40"
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
              <button
                onClick={async () => {
                  // Delete knowledge base when closing
                  const kbName = searchKb?.name || createdKbName;
                  console.log(onWorkspaceUpdate);
                  if (kbName) {
                    try {
                      setIsDeleting(true);
                      await apiClient.delete(
                        `/agent/knowledge-bases/${kbName}`
                      );
                      console.log("Knowledge base deleted successfully");
                      // Trigger workspace update to refresh the UI in real-time
                      onWorkspaceUpdate?.();
                    } catch (error) {
                      console.error("Failed to delete knowledge base:", error);
                    } finally {
                      setIsDeleting(false);
                    }
                  } else {
                    onWorkspaceUpdate?.();
                  }
                }}
                className="text-white hover:bg-red-600 rounded p-1 transition-colors"
                title="Close and delete knowledge base"
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="h-full">
          {/* Step 1: Context Input */}
          {currentStep === "context" && (
            <ContextStep
              contextInput={contextInput}
              setContextInput={setContextInput}
              handleContextSubmit={handleContextSubmit}
              isLoading={isLoading}
            />
          )}

          {/* Step 2: Assets Selection */}
          {currentStep === "assets" && (
            <AssetsStep
              isLoading={isLoading}
              searchQuery={searchQuery}
              sources={sources}
              toggleSource={toggleSource}
              toggleAllSources={toggleAllSources}
              selectedCount={selectedCount}
              handleImportBoard={handleImportBoard}
              isImporting={isImporting}
              hasExistingKb={!!searchKb}
            />
          )}

          {/* Step 3: Chat Interface */}
          {currentStep === "chat" && (
            <ChatStep
              isFullscreen={isMaximized}
              searchKb={searchKb}
              searchAssets={searchAssets}
              messages={messages}
              notes={notes}
              expandedNotes={expandedNotes}
              setExpandedNotes={setExpandedNotes}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              isStreaming={isStreaming}
              selectedAssets={selectedAssets}
              toggleAssetSelection={toggleAssetSelection}
              toggleAllAssets={toggleAllAssets}
              isSidebarExpanded={isSidebarExpanded}
              setIsSidebarExpanded={setIsSidebarExpanded}
              isNotesExpanded={isNotesExpanded}
              setIsNotesExpanded={setIsNotesExpanded}
              isAttachModalOpen={isAttachModalOpen}
              setIsAttachModalOpen={setIsAttachModalOpen}
              chatInput={chatInput}
              setChatInput={setChatInput}
              handleChatSubmit={handleChatSubmit}
              handleSaveNote={handleSaveNote}
              handleDeleteNote={handleDeleteNote}
              messagesContainerRef={messagesContainerRef}
              renderAssetIcon={renderAssetIcon}
              handleBackToContext={handleBackToContext}
            />
          )}
        </div>
      </div>

      {/* Attachment Modal */}
      <AttachmentModal
        isAttachModalOpen={isAttachModalOpen}
        setIsAttachModalOpen={setIsAttachModalOpen}
        handleLinkAttach={handleLinkAttach}
        handleFileAttach={handleFileAttach}
        isAttaching={isAttaching}
      />
    </div>
  );
};

export default NotebookLMFlow;
