"use client";
import {
  Asset,
  Collection,
  Conversation,
  KnowledgeBase,
  WorkspaceDetailed,
} from "@/app/types/workspace";
import { apiClient } from "@/app/utils/apiClient";
import { chatApi } from "@/app/utils/chatApi";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Handle, Position } from "reactflow";
import remarkGfm from "remark-gfm";
import ConversationLoadingSpinner from "./ConversationLoadingSpinner";
import DeleteIcon from "./icons/DeleteIcon";
import ConfirmationModal from "./modals/ConfirmationModal";
import { useToast } from "./ui/Toast";

interface Message {
  id: number;
  content: string;
  role: "user" | "agent";
  created_at: string;
  user_id: number;
}

interface ComponentInstance {
  id: string;
  type: string;
  data?: { file?: File; files?: File[]; text?: string };
}

interface SimpleChatInterfaceProps {
  knowledgeBase: KnowledgeBase;
  workspace?: WorkspaceDetailed;
  className?: string;
  attachedAssets?: ComponentInstance[];
  showHandles?: boolean; // Controls whether to show ReactFlow handles
  initialConversationId?: number; // Optional conversation ID to load initially
}

export default function SimpleChatInterface({
  knowledgeBase,
  workspace,
  className = "",
  attachedAssets = [],
  showHandles = false,
  initialConversationId,
}: SimpleChatInterfaceProps) {
  const { showToast } = useToast();

  const [selectedChat, setSelectedChat] = useState(-1); // -1 means no selection
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(["All Attached Nodes"])
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Available AI models
  const availableModels = [
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "qwen/qwen3-14b:free", name: "Qwen 3 14B" },
    { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B" },
    { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout" },
    {
      id: "cognitivecomputations/dolphin3.0-mistral-24b:free",
      name: "Dolphin 3.0 Mistral 24B",
    },
    { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B" },
  ];

  // Helper function to get social media platform name from URL
  const getSocialPlatformName = useCallback((url: string): string => {
    if (!url) return "Social Media";

    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "YouTube Video";
    if (url.includes("vimeo.com")) return "Vimeo Video";
    if (url.includes("instagram.com")) return "Instagram Video";
    if (url.includes("facebook.com") || url.includes("fb.watch"))
      return "Facebook Video";
    if (url.includes("tiktok.com")) return "Twitter";
    if (url.includes("twitter.com") || url.includes("x.com")) return "X";
    return "Social Media Video";
  }, []);

  // Helper functions for dynamic filter generation
  const getAvailableCollections = useCallback((): Collection[] => {
    // Only return collections that are linked to this specific knowledge base
    return (
      workspace?.collections?.filter(
        (collection) =>
          collection.is_active &&
          collection.knowledge_base_id === knowledgeBase.id
      ) || []
    );
  }, [workspace?.collections, knowledgeBase.id]);

  const getAvailableAssets = useCallback((): Asset[] => {
    // Get collection IDs that belong to this knowledge base
    const knowledgeBaseCollectionIds = getAvailableCollections().map(
      (col) => col.id
    );

    // Return assets that are linked to this knowledge base OR belong to collections linked to this knowledge base
    return (
      workspace?.assets?.filter(
        (asset) =>
          asset.is_active &&
          (asset.knowledge_base_id === knowledgeBase.id ||
            (asset.collection_id &&
              knowledgeBaseCollectionIds.includes(asset.collection_id)))
      ) || []
    );
  }, [workspace?.assets, knowledgeBase.id, getAvailableCollections]);

  const generateFilterOptions = useCallback((): string[] => {
    const options = ["All Attached Nodes"];

    // Add collections first
    const collections = getAvailableCollections();
    collections.forEach((collection) => {
      options.push(collection.name);
    });

    // Add individual assets that are not in any collection
    const assets = getAvailableAssets();
    const assetsWithoutCollection = assets.filter(
      (asset) => !asset.collection_id
    );
    assetsWithoutCollection.forEach((asset) => {
      // For social assets, show platform name instead of URL
      if (asset.type === "social" && asset.url) {
        const platformName = getSocialPlatformName(asset.url);
        options.push(platformName);
      } else {
        options.push(asset.title);
      }
    });

    return options;
  }, [getAvailableAssets, getAvailableCollections, getSocialPlatformName]);

  const getAssetsForFilter = useCallback(
    (filterName: string): string[] => {
      if (filterName === "All Attached Nodes") {
        // Return all asset titles (original titles for backend)
        return getAvailableAssets().map((asset) => asset.title);
      }

      // Check if it's a collection name
      const collection = getAvailableCollections().find(
        (col) => col.name === filterName
      );
      if (collection) {
        // Return all assets in this collection (original titles for backend)
        return getAvailableAssets()
          .filter((asset) => asset.collection_id === collection.id)
          .map((asset) => asset.title);
      }

      // Check if it's a social media platform name (display name)
      const socialPlatforms = [
        "YouTube Video",
        "Facebook Video",
        "Instagram Video",
        "Twitter",
        "X",
        "Vimeo Video",
      ];
      if (socialPlatforms.includes(filterName)) {
        // Find assets that match this platform and return their ORIGINAL titles (URLs for backend)
        return getAvailableAssets()
          .filter((asset) => {
            if (asset.type === "social" && asset.url) {
              return getSocialPlatformName(asset.url) === filterName;
            }
            return false;
          })
          .map((asset) => asset.title); // Return original title (URL) for backend API
      }

      // It's an individual asset name - check if it's a social platform display name
      const matchingAsset = getAvailableAssets().find((asset) => {
        if (asset.type === "social" && asset.url) {
          return getSocialPlatformName(asset.url) === filterName;
        }
        return asset.title === filterName;
      });

      return matchingAsset ? [matchingAsset.title] : [filterName];
    },
    [getAvailableAssets, getAvailableCollections, getSocialPlatformName]
  );

  const getAssetsForSelectedFilters = useCallback((): string[] => {
    const allAssets = new Set<string>();

    // If "All Attached Nodes" is selected, return all assets
    if (selectedFilters.has("All Attached Nodes")) {
      return getAvailableAssets().map((asset) => asset.title);
    }

    // Otherwise, combine assets from all selected filters
    selectedFilters.forEach((filter) => {
      const assets = getAssetsForFilter(filter);
      assets.forEach((asset) => allAssets.add(asset));
    });

    return Array.from(allAssets);
  }, [selectedFilters, getAssetsForFilter, getAvailableAssets]);

  const toggleFilter = useCallback((filterName: string) => {
    setSelectedFilters((prev) => {
      const newFilters = new Set(prev);

      if (filterName === "All Attached Nodes") {
        // If toggling "All Attached Nodes", clear everything else
        if (newFilters.has(filterName)) {
          newFilters.delete(filterName);
        } else {
          return new Set(["All Attached Nodes"]);
        }
      } else {
        // Remove "All Attached Nodes" if selecting individual items
        newFilters.delete("All Attached Nodes");

        if (newFilters.has(filterName)) {
          newFilters.delete(filterName);
        } else {
          newFilters.add(filterName);
        }

        // If no filters left, default back to "All Attached Nodes"
        if (newFilters.size === 0) {
          newFilters.add("All Attached Nodes");
        }
      }

      return newFilters;
    });
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Update selected filters if any are no longer available
  useEffect(() => {
    const availableFilters = generateFilterOptions();
    setSelectedFilters((prev) => {
      const validFilters = new Set<string>();
      prev.forEach((filter) => {
        if (availableFilters.includes(filter)) {
          validFilters.add(filter);
        }
      });

      // If no valid filters left, default to "All Attached Nodes"
      if (validFilters.size === 0) {
        validFilters.add("All Attached Nodes");
      }

      return validFilters;
    });
  }, [generateFilterOptions]);

  // Load existing conversation if we have conversations from knowledgeBase
  useEffect(() => {
    let allConversations: Conversation[] = [];

    // Priority 1: Load conversations directly from knowledgeBase (for chat page)
    if (knowledgeBase?.conversations) {
      allConversations = [...knowledgeBase.conversations];
      console.log(
        "Loaded conversations from knowledgeBase:",
        allConversations.length
      );
    }
    // Priority 2: Load conversations from workspace knowledge bases (for dashboard)
    else if (workspace?.knowledge_bases) {
      workspace.knowledge_bases.forEach((kb) => {
        if (kb.conversations) {
          allConversations.push(...kb.conversations);
        }
      });
      console.log(
        "Loaded conversations from workspace:",
        allConversations.length
      );
    }

    const sortedConversations = allConversations.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    setConversations(sortedConversations);
    console.log("Knowledge base loaded:", knowledgeBase?.name);

    // If we have an initial conversation ID, load it
    if (initialConversationId && sortedConversations.length > 0) {
      const conversationIndex = sortedConversations.findIndex(
        (conv) => conv.id === initialConversationId
      );
      if (conversationIndex !== -1) {
        setSelectedChat(conversationIndex);
        loadConversation(sortedConversations[conversationIndex]);
      }
    }
  }, [knowledgeBase, workspace, initialConversationId]);

  // Load conversation messages
  const loadConversation = async (conversation: Conversation) => {
    try {
      setIsLoading(true);
      setConversationId(conversation.id);
      const conversationData = await chatApi.getConversation(conversation.id);
      setMessages(conversationData.messages || []);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat selection
  const handleChatClick = (index: number) => {
    setSelectedChat(index);
    if (conversations[index]) {
      loadConversation(conversations[index]);
      if (!showHandles) {
        const params = new URLSearchParams({
          kb: knowledgeBase.name,
        });

        const conversationId = conversations[index].id;

        // Include current conversation ID if one is selected
        if (conversationId) {
          params.set("conversationId", conversationId.toString());
        }

        router.push(`/chat?${params.toString()}`);
      }
    } else {
      // Start new conversation
      setMessages([]);
      setConversationId(null);
    }
  };

  // Create new chat
  const handleNewChat = () => {
    setSelectedChat(-1); // -1 means new chat
    setMessages([]);
    setConversationId(null);
  };

  // Send message to chat agent
  const sendMessage = async (messageText: string) => {
    if (!knowledgeBase || !messageText.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now(),
      content: messageText.trim(),
      role: "user",
      created_at: new Date().toISOString(),
      user_id: 0, // Will be set by backend
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsStreaming(true);
    try {
      // Get the assets to include based on selected filters
      const selectedAssets = getAssetsForSelectedFilters();

      const stream = await chatApi.sendMessage({
        message: messageText.trim(),
        knowledge_base_name: knowledgeBase.name,
        conversation_id: conversationId,
        document_titles: selectedAssets,
        model: selectedModel,
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

            // Delay right here, inside the same case
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
              // If this is a new conversation (selectedChat === -1), add it to the list
              if (selectedChat === -1) {
                const newConversation: Conversation = {
                  id: chunk.conversationId,
                  conversation_name: `New Chat`,
                  project_id: 0, // Will be updated from backend
                  knowledge_base_id: knowledgeBase.id,
                  user_id: 0, // Will be updated from backend
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
                setConversations((prev) => [newConversation, ...prev]);
                setSelectedChat(0); // Select the new conversation
              }
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
      console.error("Failed to send message:", error);
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsStreaming(false);
    }
  };

  // Logo Component
  const LogoIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <div
      className="flex items-center justify-center rounded-full bg-white"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 46 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.8048 29.1955L12.6621 28.9615V33.5877V28.963L12.8048 29.1955Z"
          fill="#1E1E1E"
        />
        <path
          d="M16.9337 33.3713L16.9199 33.3636L16.9337 33.3713Z"
          fill="#1E1E1E"
        />
        <path
          d="M16.9316 33.3707L16.9202 33.3636L16.8974 33.3493C15.2312 32.2986 13.8306 30.877 12.8048 29.1954L12.6621 28.9629V33.5876H16.9316V33.3707Z"
          fill="#1E1E1E"
        />
        <path
          d="M16.9197 33.3608L16.8969 33.3451C16.1725 32.8914 15.4958 32.3657 14.877 31.776C15.4958 32.3682 16.1725 32.8967 16.8969 33.3537L16.9197 33.3608Z"
          fill="#1E1E1E"
        />
        <path
          d="M22.989 45.5901C26.8697 45.5896 30.6843 44.5855 34.0623 42.6752C37.4403 40.7648 40.2667 38.0133 42.2671 34.6878C44.2674 31.3624 45.3736 27.5761 45.4783 23.6968C45.5829 19.8174 44.6824 15.977 42.8642 12.5486C41.046 9.12011 38.372 6.2202 35.102 4.13055C31.8319 2.04091 28.0769 0.832577 24.2019 0.622944C20.3268 0.413312 16.4634 1.20951 12.987 2.93418C9.51055 4.65885 6.53931 7.25337 4.36189 10.4657C5.74454 10.276 7.14944 10.3243 8.51582 10.6083L9.2148 10.751C12.2387 7.36314 16.4098 5.21474 20.9238 4.71998C25.4378 4.22523 29.9752 5.41914 33.6612 8.07154C37.3471 10.7239 39.9206 14.647 40.8854 19.0844C41.8503 23.5218 41.1382 28.1593 38.8865 32.1028C36.6348 36.0462 33.0028 39.0165 28.6909 40.4408C24.379 41.8652 19.6924 41.6428 15.5348 39.8165C11.3771 37.9902 8.0428 34.6894 6.17463 30.5504C4.30647 26.4114 4.03675 21.7273 5.41749 17.4013C5.49309 17.163 5.5744 16.9262 5.65999 16.688C5.74558 16.4498 5.83545 16.2201 5.9296 15.9905H6.01376C6.23101 15.9899 6.44814 16.0008 6.66424 16.0233C6.90001 16.0457 7.13432 16.0814 7.36607 16.1303C8.55398 16.3794 9.65137 16.9479 10.54 17.7747C11.4286 18.6015 12.0747 19.6551 12.4087 20.822C12.4928 21.1185 12.5553 21.4208 12.5956 21.7264C12.6376 22.0274 12.6586 22.3311 12.6583 22.635V22.7292C12.6583 22.9931 12.674 23.2727 12.6983 23.5765C12.7225 23.8804 12.7668 24.1985 12.8195 24.5009C13.2059 26.7169 14.267 28.7596 15.8578 30.3499C17.4486 31.9403 19.4916 33.0008 21.7077 33.3866C23.9238 33.7724 26.2049 33.4646 28.2396 32.5054C30.2742 31.5462 31.9632 29.9822 33.0757 28.0272L33.1042 27.9758C33.2369 27.7362 33.3524 27.5165 33.4523 27.3011C33.5664 27.06 33.6762 26.8075 33.7804 26.5351C33.8289 26.4081 33.8759 26.2783 33.923 26.1471C34.0257 25.8389 34.1099 25.5522 34.1798 25.2669C34.3014 24.7685 34.3886 24.2624 34.4408 23.752C34.4784 23.3871 34.4975 23.0204 34.4979 22.6536V22.635C34.4979 22.3255 34.485 22.0145 34.4594 21.7121C34.4308 21.3954 34.3909 21.0844 34.3395 20.7892C34.0028 18.8294 33.1371 16.999 31.8359 15.4953C30.5347 13.9917 28.8476 12.872 26.9565 12.2573C25.0655 11.6425 23.0425 11.5559 21.1059 12.007C19.1692 12.458 17.3926 13.4294 15.9678 14.8165L15.9179 14.8635L15.9607 14.9177C16.8678 16.0785 17.5623 17.3907 18.0119 18.7935L18.059 18.9362L18.146 18.8106C18.8692 17.7829 19.869 16.9812 21.0294 16.4987C22.1898 16.0161 23.4632 15.8725 24.7019 16.0844C25.9406 16.2963 27.0939 16.8551 28.0279 17.6959C28.9619 18.5367 29.6383 19.6251 29.9788 20.8348C30.0626 21.1321 30.126 21.4347 30.1685 21.7406C30.2087 22.0414 30.2291 22.3445 30.2298 22.6479C30.2288 24.2497 29.6493 25.7972 28.598 27.0057C27.5466 28.2142 26.0942 29.0023 24.508 29.225C22.9217 29.4478 21.3084 29.0901 19.9649 28.2179C18.6214 27.3457 17.6381 26.0176 17.196 24.4781L17.176 24.4239C17.166 24.3853 17.1546 24.3468 17.1475 24.3055C17.0917 24.094 17.0474 23.8798 17.0148 23.6635C17.0148 23.6464 17.0148 23.6307 17.0148 23.615C17.0134 23.6013 17.0134 23.5874 17.0148 23.5737L16.9877 23.3454C16.9631 23.1199 16.9507 22.8933 16.9506 22.6664V22.6479C16.9506 22.3383 16.9392 22.0274 16.915 21.7235C16.8907 21.4197 16.8465 21.1001 16.7937 20.8006C16.4665 18.8861 15.6337 17.0938 14.3815 15.6091C13.1293 14.1244 11.5031 13.0013 9.67128 12.3558C9.44304 12.274 9.21195 12.2003 8.978 12.1347C8.73835 12.0676 8.49728 12.0077 8.25335 11.9578C6.65041 11.6212 4.99195 11.6534 3.40329 12.0519C1.47849 15.4743 0.482551 19.3407 0.514413 23.267C0.546276 27.1934 1.60483 31.0431 3.58492 34.4338C5.565 37.8245 8.39773 40.6381 11.8017 42.5952C15.2057 44.5523 19.0625 45.5848 22.989 45.5901Z"
          fill="#1E1E1E"
        />
      </svg>
    </div>
  );

  // Logo Header Component
  const LogoHeaderIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.728 22.3299C13.6539 22.3297 15.547 21.8313 17.2234 20.8833C18.8997 19.9353 20.3024 18.5698 21.2951 16.9194C22.2878 15.2691 22.8368 13.3901 22.8887 11.4649C22.9407 9.53974 22.4938 7.63385 21.5915 5.93242C20.6892 4.23098 19.3621 2.79185 17.7393 1.75482C16.1165 0.717799 14.253 0.118142 12.3299 0.0141084C10.4069 -0.0899256 8.48957 0.3052 6.76433 1.1611C5.03909 2.017 3.56455 3.30458 2.48397 4.89874C3.17013 4.80462 3.86734 4.82857 4.54543 4.96954L4.89231 5.04033C6.39298 3.35906 8.46294 2.29287 10.7031 2.04734C12.9433 1.80181 15.1951 2.39431 17.0243 3.71061C18.8535 5.02692 20.1306 6.97382 20.6095 9.17595C21.0883 11.3781 20.7349 13.6795 19.6174 15.6366C18.5 17.5936 16.6976 19.0676 14.5577 19.7745C12.4178 20.4813 10.092 20.371 8.02873 19.4646C5.96542 18.5583 4.31069 16.9202 3.38358 14.8662C2.45646 12.8121 2.32261 10.4876 3.00783 8.34066C3.04535 8.22243 3.0857 8.10492 3.12817 7.9867C3.17065 7.86847 3.21525 7.7545 3.26197 7.64052H3.30374C3.41156 7.64023 3.51931 7.64567 3.62655 7.65681C3.74356 7.66795 3.85984 7.68567 3.97485 7.7099C4.56437 7.83353 5.10897 8.11569 5.54996 8.52599C5.99094 8.93629 6.3116 9.45916 6.47735 10.0383C6.5191 10.1854 6.55009 10.3354 6.57009 10.4871C6.59094 10.6365 6.60135 10.7872 6.60124 10.938V10.9847C6.60124 11.1157 6.60902 11.2545 6.62106 11.4052C6.63309 11.556 6.65504 11.7139 6.68123 11.864C6.87299 12.9637 7.39956 13.9774 8.18903 14.7667C8.97849 15.5559 9.99236 16.0822 11.0921 16.2737C12.1919 16.4651 13.324 16.3124 14.3337 15.8364C15.3435 15.3603 16.1816 14.5842 16.7337 13.614L16.7479 13.5885C16.8137 13.4695 16.871 13.3605 16.9206 13.2536C16.9772 13.134 17.0318 13.0087 17.0834 12.8735C17.1075 12.8105 17.1309 12.7461 17.1542 12.6809C17.2052 12.528 17.247 12.3857 17.2816 12.2441C17.342 11.9968 17.3853 11.7456 17.4112 11.4923C17.4299 11.3112 17.4393 11.1293 17.4395 10.9472V10.938C17.4395 10.7844 17.4331 10.6301 17.4204 10.48C17.4062 10.3228 17.3864 10.1685 17.3609 10.022C17.1938 9.04942 16.7642 8.14101 16.1185 7.3948C15.4727 6.64859 14.6354 6.09294 13.697 5.78785C12.7585 5.48276 11.7546 5.4398 10.7935 5.66363C9.83239 5.88746 8.95071 6.36957 8.24361 7.0579L8.21884 7.08127L8.24008 7.10817C8.69025 7.68421 9.0349 8.3354 9.25806 9.03159L9.28143 9.10238L9.32461 9.04008C9.68351 8.53004 10.1797 8.13221 10.7555 7.89274C11.3314 7.65327 11.9633 7.58198 12.5781 7.68714C13.1928 7.7923 13.7651 8.0696 14.2286 8.48687C14.6922 8.90414 15.0279 9.44428 15.1968 10.0446C15.2384 10.1921 15.2699 10.3423 15.291 10.4942C15.3109 10.6434 15.3211 10.7938 15.3214 10.9444C15.3209 11.7393 15.0333 12.5073 14.5116 13.107C13.9898 13.7068 13.269 14.0979 12.4818 14.2084C11.6946 14.319 10.894 14.1415 10.2273 13.7086C9.56053 13.2758 9.07255 12.6167 8.85314 11.8527L8.84322 11.8258C8.83827 11.8066 8.8326 11.7875 8.82906 11.767C8.80138 11.6621 8.77941 11.5557 8.76323 11.4484C8.76323 11.4399 8.76323 11.4322 8.76323 11.4244C8.76249 11.4175 8.76249 11.4107 8.76323 11.4038L8.74978 11.2906C8.73756 11.1787 8.73141 11.0662 8.73137 10.9536V10.9444C8.73137 10.7908 8.72571 10.6364 8.71367 10.4857C8.70164 10.3349 8.67969 10.1763 8.6535 10.0276C8.49109 9.07754 8.0778 8.18809 7.45637 7.45128C6.83494 6.71447 6.02794 6.15707 5.11885 5.83674C5.00558 5.79615 4.8909 5.75958 4.7748 5.72701C4.65587 5.69374 4.53623 5.66401 4.41518 5.63923C3.61969 5.47221 2.79665 5.48819 2.00824 5.68595C1.05303 7.38436 0.558774 9.30313 0.574587 11.2517C0.590399 13.2002 1.11572 15.1107 2.09838 16.7934C3.08104 18.476 4.48683 19.8724 6.17612 20.8436C7.86541 21.8149 9.77941 22.3273 11.728 22.3299Z"
        fill="white"
      />
    </svg>
  );

  // Search Icon
  const SearchIcon: React.FC = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.4993 12.5L8.88824 8.88885M1.66602 5.87959C1.66602 6.43284 1.77499 6.98068 1.98671 7.49182C2.19843 8.00296 2.50875 8.46739 2.89996 8.8586C3.29117 9.24981 3.75561 9.56014 4.26675 9.77186C4.77789 9.98358 5.32572 10.0926 5.87898 10.0926C6.43223 10.0926 6.98007 9.98358 7.49121 9.77186C8.00235 9.56014 8.46678 9.24981 8.85799 8.8586C9.2492 8.46739 9.55953 8.00296 9.77125 7.49182C9.98297 6.98068 10.0919 6.43284 10.0919 5.87959C10.0919 5.32633 9.98297 4.7785 9.77125 4.26736C9.55953 3.75622 9.2492 3.29178 8.85799 2.90057C8.46678 2.50936 8.00235 2.19904 7.49121 1.98732C6.98007 1.7756 6.43223 1.66663 5.87898 1.66663C5.32572 1.66663 4.77789 1.7756 4.26675 1.98732C3.75561 2.19904 3.29117 2.50936 2.89996 2.90057C2.50875 3.29178 2.19843 3.75622 1.98671 4.26736C1.77499 4.7785 1.66602 5.32633 1.66602 5.87959Z"
        stroke="#4596FF"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Chat Icon
  const ChatIcon: React.FC<{ fill: string }> = ({ fill }) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.9737 0.666504H1.69167C1.41966 0.666504 1.15878 0.776251 0.966437 0.971601C0.774092 1.16695 0.666034 1.4319 0.666034 1.70817V12.1248C0.664851 12.3235 0.720179 12.5182 0.825367 12.6857C0.930555 12.8532 1.08113 12.9862 1.25898 13.0688C1.39451 13.1329 1.54217 13.1663 1.69167 13.1665C1.93244 13.1659 2.1652 13.0787 2.34872 12.9204L2.35449 12.9159L4.44808 11.0832H12.9737C13.2457 11.0832 13.5066 10.9734 13.6989 10.7781C13.8913 10.5827 13.9993 10.3178 13.9993 10.0415V1.70817C13.9993 1.4319 13.8913 1.16695 13.6989 0.971601C13.5066 0.776251 13.2457 0.666504 12.9737 0.666504ZM12.9737 10.0415H4.25577C4.13264 10.0416 4.01364 10.0866 3.92052 10.1685L1.69167 12.1248V1.70817H12.9737V10.0415Z"
        fill={fill}
      />
    </svg>
  );

  // More Options Icon
  const MoreIcon: React.FC<{ fill: string }> = ({ fill }) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="2" r="1.5" fill={fill} />
      <circle cx="8" cy="8" r="1.5" fill={fill} />
      <circle cx="8" cy="14" r="1.5" fill={fill} />
    </svg>
  );

  // Send Icon
  const SendIcon: React.FC = () => (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.7585 1.23588C12.6327 1.36303 12.5328 1.51412 12.4647 1.68048C12.3966 1.84684 12.3615 2.0252 12.3615 2.20533C12.3615 2.38547 12.3966 2.56382 12.4647 2.73018C12.5328 2.89655 12.6327 3.04764 12.7585 3.17479L18.55 9.04738L2.01575 9.04738C1.65778 9.04738 1.31447 9.19158 1.06134 9.44825C0.80822 9.70492 0.666016 10.053 0.666016 10.416C0.666016 10.779 0.80822 11.1271 1.06134 11.3838C1.31447 11.6405 1.65778 11.7847 2.01575 11.7847L18.55 11.7847L12.7585 17.6595C12.5049 17.9167 12.3625 18.2654 12.3625 18.629C12.3625 18.9926 12.5049 19.3413 12.7585 19.5984C13.0121 19.8556 13.356 20 13.7146 20C14.0732 20 14.4171 19.8556 14.6706 19.5984L22.769 11.3866C22.8949 11.2595 22.9947 11.1084 23.0628 10.942C23.1309 10.7757 23.166 10.5973 23.166 10.4172C23.166 10.237 23.1309 10.0587 23.0628 9.89231C22.9947 9.72595 22.8949 9.57486 22.769 9.44771L14.6706 1.23588C14.5452 1.10829 14.3962 1.00705 14.2322 0.937971C14.0681 0.868895 13.8922 0.833334 13.7146 0.833334C13.5369 0.833334 13.361 0.868895 13.197 0.937971C13.0329 1.00705 12.8839 1.10829 12.7585 1.23588Z"
        fill="white"
      />
    </svg>
  );

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper function to render asset preview
  const renderAssetPreview = (asset: ComponentInstance) => {
    const { type, data } = asset;

    switch (type) {
      case "image":
        if (data?.file) {
          const imageUrl = URL.createObjectURL(data.file);
          return (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
              <Image
                src={imageUrl}
                alt="Attached image"
                width={32}
                height={32}
                className="object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {data.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(data.file.size)}
                </p>
              </div>
            </div>
          );
        }
        break;
      case "document":
      case "pdf":
        if (data?.file) {
          return (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
              <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    fill="#ef4444"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {data.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(data.file.size)}
                </p>
              </div>
            </div>
          );
        }
        break;
      case "audio":
        if (data?.file) {
          return (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 1L18 7V21C18 21.5304 17.7893 22.0391 17.4142 22.4142C17.0391 22.7893 16.5304 23 16 23H8C7.46957 23 6.96086 22.7893 6.58579 22.4142C6.21071 22.0391 6 21.5304 6 21V3C6 2.46957 6.21071 1.96086 6.58579 1.58579C6.96086 1.21071 7.46957 1 8 1H12Z"
                    fill="#8b5cf6"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {data.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(data.file.size)}
                </p>
              </div>
            </div>
          );
        }
        break;
      case "text":
        if (data?.text) {
          return (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    fill="#3b82f6"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  Text Note
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {data.text.substring(0, 30)}...
                </p>
              </div>
            </div>
          );
        }
        break;
      default:
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                  fill="#6b7280"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {type}
              </p>
              <p className="text-xs text-gray-500">Unknown type</p>
            </div>
          </div>
        );
    }
    return null;
  };

  // Maximize Icon
  const MaximizeIcon: React.FC = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 3H7M3 3V7M3 3L7 7M13 3H9M13 3V7M13 3L9 7M3 13H7M3 13V9M3 13L7 9M13 13H9M13 13V9M13 13L9 9"
        stroke="#6B7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const recentChats = conversations.map((conv) => ({
    id: conv.id,
    name: conv.conversation_name || `Chat ${conv.id}`,
    created_at: conv.created_at,
  }));

  const filterTags = generateFilterOptions();

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Delete knowledge base
  const deleteKnowledgeBase = async () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await apiClient.delete(`/agent/knowledge-bases/${knowledgeBase.name}`);
      // Show success message
      showToast("Knowledge base deleted successfully", "success");
      // Navigate to dashboard and refresh to update the UI
      router.push("/dashboard");
      // Refresh the page to update the knowledge bases list
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Failed to delete knowledge base:", error);
      showToast("Failed to delete knowledge base", "error");
    }
  };

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
                    <h3 className="text-sm font-semibold mb-2">{children}</h3>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
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

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {pathname !== "/chat" && (
        <div
          className="px-4 sm:px-6 py-3 sm:py-4 text-white rounded-t-xl"
          style={{
            background:
              "radial-gradient(50% 97.57% at 50% 50%, #4596FF 0%, #8E5EFF 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoHeaderIcon size={22} />
              <h1 className="text-lg sm:text-xl font-semibold">
                Chat with Slay Canvas
              </h1>
            </div>
            <button
              onClick={deleteKnowledgeBase}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Delete Knowledge Base"
            >
              <DeleteIcon size={20} color="white" />
            </button>
          </div>
        </div>
      )}

      <div className="border-1 border-black/10 shadow-md  flex h-full min-h-0">
        {/* Left Sidebar */}
        <div className="w-[200px] min-w-[180px] max-w-[220px] bg-white border-r border-gray-200 flex flex-col min-h-0">
          {/* Top Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center ">
              <LogoIcon size={28} />
              <span className="text-sm"> SlayCanvas ChatBot</span>
            </div>
          </div>

          {/* Recent Chats Section */}
          <div className="flex-1 pt-4 px-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-700">
                Recent Chats
              </h3>
              <button
                className="text-xs text-[#1279FF] font-medium hover:text-[#0D6EFD] transition-colors"
                onClick={handleNewChat}
              >
                New Chat +
              </button>
            </div>

            <div className="space-y-1">
              {recentChats.length === 0 && !isLoading && (
                <div className="text-xs text-gray-500 text-center py-4">
                  No conversations yet. Start a new chat!
                </div>
              )}

              {recentChats.map((chat, index) => (
                <div
                  key={chat.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    selectedChat === index
                      ? "bg-[#4596FF99] text-white"
                      : " hover:bg-gray-50"
                  }`}
                  onClick={() => handleChatClick(index)}
                >
                  <div className="flex items-center gap-2">
                    <ChatIcon
                      fill={selectedChat === index ? "#fff" : "#1E1E1E"}
                    />
                    <span
                      className={`text-xs truncate ${
                        selectedChat === index ? "text-white" : "text-[#424242]"
                      }`}
                    >
                      {chat.name.length > 18
                        ? `${chat.name.substring(0, 18)}..`
                        : chat.name}
                    </span>
                  </div>
                  {/* <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <MoreIcon
                      fill={selectedChat === index ? "#fff" : "#1E1E1E"}
                    />
                  </button> */}
                </div>
              ))}
            </div>
          </div>

          {pathname !== "/chat" && (
            <div
              className="p-4 border-t border-gray-200"
              onClick={() => router.push(`/chat?kb=${knowledgeBase.name}`)}
            >
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <MaximizeIcon />
                <span>Maximize the Chat</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-[300px] flex flex-col min-h-0">
          {/* Filter Tags and Model Selection */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-sm font-medium text-gray-700">
                Filter Content:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  AI Model:
                </span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4596FF] focus:border-transparent bg-white"
                >
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              className="flex gap-2 w-full overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {filterTags.map((tag, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 min-w-fit rounded-full text-sm font-medium transition-colors ${
                    selectedFilters.has(tag)
                      ? "bg-[#4596FF] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() => toggleFilter(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-[#F1F5F8] min-h-0"
          >
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <ConversationLoadingSpinner />
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center px-6 py-8">
                <div className="text-center flex flex-col items-center justify-center max-w-lg">
                  <div className="mb-8">
                    <LogoIcon size={80} />
                  </div>

                  <h2 className="text-2xl text-center font-medium text-gray-800 mb-4">
                    How can we assist you today?
                  </h2>

                  <p className="text-base text-gray-500 leading-relaxed">
                    Get expert guidance from your knowledge base &ldquo;
                    {knowledgeBase.name}&rdquo;. Ask any question and get
                    AI-powered responses based on your uploaded content.
                  </p>

                  <div className="mt-4 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Current Model:</span>{" "}
                      {
                        availableModels.find((m) => m.id === selectedModel)
                          ?.name
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-6 py-2">
                <div className="space-y-4 bg-gray pb-4">
                  {messages.map((message) => (
                    <MessageComponent key={message.id} message={message} />
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
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your prompt here"
                  className="w-full px-3 py-2.5 pr-16 focus:outline-none focus:border-transparent resize-none text-sm"
                  rows={1}
                  style={{ minHeight: "40px", maxHeight: "100px" }}
                  disabled={isStreaming}
                />

                <div className="absolute right-2 bottom-1 flex items-center gap-1">
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isStreaming}
                    className={`p-1.5 rounded-lg transition-colors ${
                      message.trim()
                        ? "opacity-100"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    style={{
                      background:
                        "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
                    }}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ReactFlow Handles - Only show when used in ReactFlow */}
      {showHandles && (
        <>
          {/* Left side handles - both source and target */}
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            style={{
              background: "#F0F5F7",
              width: "24px",
              height: "24px",
              border: "2px solid #4596FF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              zIndex: 1000,
              left: "-12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />

          {/* Right handle */}
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            style={{
              background: "#F0F5F7",
              width: "24px",
              height: "24px",
              border: "2px solid #4596FF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              zIndex: 1000,
              right: "-12px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Knowledge Base"
        message={`Are you sure you want to delete the knowledge base "${knowledgeBase.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
}
