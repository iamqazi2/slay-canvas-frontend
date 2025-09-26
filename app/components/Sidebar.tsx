"use client";

import {
  setHasContent,
  setVideoCollection,
  setVideoUrl,
} from "@/app/redux/slices/videoSlice";
import { useUserStore } from "@/app/store/userStore";
import { useWorkspaceStore } from "@/app/store/workspaceStore";
import { collectionApi } from "@/app/utils/collectionApi";
import { useToast } from "./ui/Toast";
import Image from "next/image";
import React, { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StoreTypes, VideoItem } from "../models/interfaces";
import {
  FileIcon,
  FolderIcon,
  GlobeIcon,
  GridIconNew,
  LockIcon,
  NotificationIcon,
  TrashIcon,
  UserIcon,
  WifiIcon,
} from "./icons";
import AudioModal from "./modals/AudioModal";
import DocumentModal from "./modals/DocumentModal";
import ImageModal from "./modals/ImageModal";
import PlusModal from "./modals/PlusModal";
import TextModal from "./modals/TextModal";
import VideoModal from "./modals/VideoModal";
import WebLinkModal from "./modals/WebLinkModal";
import WikipediaModal from "./modals/WikipediaModal";

type SidebarProps = {
  onChatClick: () => void;
};

export default function Sidebar({ onChatClick }: SidebarProps) {
  const { showToast } = useToast();

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Workspace and user stores
  const { currentWorkspaceId } = useWorkspaceStore();
  const { isAuthenticated } = useUserStore();

  // State for managing which components are visible and their data
  const [visibleComponents, setVisibleComponents] = useState<{
    imageCollection: boolean;
    audioPlayer: boolean;
    videoCollection: boolean;
    pdfDocument: boolean;
    wikipediaLink: boolean;
    webLink: boolean; // added
    text: boolean;
  }>({
    imageCollection: false,
    audioPlayer: false,
    videoCollection: false,
    pdfDocument: false,
    wikipediaLink: false,
    webLink: false, // added
    text: false,
  });

  const [componentData, setComponentData] = useState<{
    imageFiles?: File[];
    audioFile?: File;
    videoFile?: File;
    documentFile?: File;
    textContent?: string;
    url?: string; // added
  }>({});

  const [isVideoPopup, setIsVideoPopup] = useState(false);
  const [isImagePopup, setIsImagePopup] = useState(false);
  const [isAudioPopup, setIsAudioPopup] = useState(false);
  const [isDocumentPopup, setIsDocumentPopup] = useState(false);
  const [isWikipediaPopup, setIsWikipediaPopup] = useState(false);
  const [isWebLinkPopup, setIsWebLinkPopup] = useState(false);
  const [isTextPopup, setIsTextPopup] = useState(false);
  const [isPlusPopup, setIsPlusPopup] = useState(false);
  const [wikiUrl, setWikiUrl] = useState("");
  const [webLinkUrl, setWebLinkUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [videoModalHeading, setVideoModalHeading] = useState("Add Video");

  const dispatch = useDispatch();

  const videoProvider = useSelector(
    (state: StoreTypes) => state.videCollectionSlice
  );

  const { videos } = videoProvider;

  // Handle folder collection creation with backend API call
  const handleCreateFolderCollection = async () => {
    if (!currentWorkspaceId || !isAuthenticated) {
      console.error("No workspace selected or user not authenticated");
      // Still create local folder for UI purposes
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: {
            componentType: "folderCollection",
            data: { name: "Collection" },
          },
        })
      );
      return;
    }

    try {
      // Create collection in backend
      const collection = await collectionApi.createCollection(
        currentWorkspaceId,
        {
          name: "New Collection",
          description: "Collection created from dashboard",
          is_active: true,
        }
      );

      console.log("Created backend collection:", collection);

      // Dispatch to dashboard with collection ID
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: {
            componentType: "folderCollection",
            data: {
              name: collection.name,
              collectionId: collection.id, // Pass backend collection ID
              backendCollection: collection,
            },
          },
        })
      );
    } catch (error) {
      console.error("Failed to create collection:", error);
      // Fallback to local creation
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: {
            componentType: "folderCollection",
            data: { name: "Collection" },
          },
        })
      );
    }
  };

  // File input handlers
  const handleImageFileChange = (files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length > 0) {
      // Always create new collection for flow
      setComponentData((prev) => ({ ...prev, imageFiles: validFiles }));
      setVisibleComponents((prev) => ({ ...prev, imageCollection: true }));
      // Dispatch to dashboard
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: {
            componentType: "imageCollection",
            data: { files: validFiles },
          },
        })
      );
      setIsImagePopup(false);
    }
  };

  const handleAudioFileChange = (files: File[]) => {
    const file = files[0];
    if (file && file.type.startsWith("audio/")) {
      setComponentData((prev) => ({ ...prev, audioFile: file }));
      setVisibleComponents((prev) => ({ ...prev, audioPlayer: true }));
      setIsAudioPopup(false);
      // Dispatch to dashboard
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: { componentType: "audioPlayer", data: { file } },
        })
      );
    }
  };

  const handleVideoFileChange = (
    files: File[],
    isSocialVideo: boolean = false
  ) => {
    const file = files[0];
    if (file && file.type.startsWith("video/")) {
      setComponentData((prev) => ({ ...prev, videoFile: file }));
      setIsVideoPopup(false);

      if (isSocialVideo) {
        // For social video uploads, use socialVideo component type for backend video type
        window.dispatchEvent(
          new CustomEvent("createComponent", {
            detail: { componentType: "socialVideo", data: { file } },
          })
        );
      } else {
        // For regular video files, keep using videoCollection
        window.dispatchEvent(
          new CustomEvent("createComponent", {
            detail: { componentType: "videoCollection", data: { file } },
          })
        );
      }
    }
  };

  const handleDocumentFileChange = (files: File[]) => {
    const file = files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".csv"))
    ) {
      setComponentData((prev) => ({ ...prev, documentFile: file }));
      setVisibleComponents((prev) => ({ ...prev, pdfDocument: true }));
      setIsDocumentPopup(false);
      // Dispatch to dashboard
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: { componentType: "pdfDocument", data: { file } },
        })
      );
    }
  };

  // Wrapper functions for old file inputs
  const handleAudioFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAudioFileChange([file]);
    }
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  const handleVideoFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFileChange([file], false); // Regular video upload
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleDocumentFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDocumentFileChange([file]);
    }
    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  const showWikipedia = (url?: string) => {
    const finalUrl = url || wikiUrl.trim();
    setComponentData((prev) => ({ ...prev, textContent: finalUrl }));
    setVisibleComponents((prev) => ({ ...prev, wikipediaLink: true }));
    setIsWikipediaPopup(false);
    // Dispatch to dashboard
    window.dispatchEvent(
      new CustomEvent("createComponent", {
        detail: {
          componentType: "wikipediaLink",
          data: { text: finalUrl },
        },
      })
    );
  };

  const showWebLink = (incomingUrl?: string) => {
    const finalUrl = (incomingUrl || webLinkUrl || "").trim();
    if (!finalUrl) {
      showToast("Please enter a valid URL", "error");
      return;
    }

    // store url and textContent so UI components can read it
    setComponentData((prev) => ({
      ...prev,
      textContent: finalUrl,
      url: finalUrl, // simplified, avoid duplicate keys
    }));

    // show the webLink UI (fixed key)
    setVisibleComponents((prev) => ({ ...prev, webLink: true }));
    setIsWebLinkPopup(false);

    // Dispatch to dashboard with url in payload
    window.dispatchEvent(
      new CustomEvent("createComponent", {
        detail: {
          componentType: "webLink",
          data: { url: finalUrl, text: finalUrl },
        },
      })
    );
  };

  const showText = (text: string) => {
    setComponentData((prev) => ({ ...prev, textContent: text.trim() }));
    setVisibleComponents((prev) => ({ ...prev, text: true }));
    setIsTextPopup(false);
    // Dispatch to dashboard
    window.dispatchEvent(
      new CustomEvent("createComponent", {
        detail: { componentType: "text", data: { text: text.trim() } },
      })
    );
  };

  // Utility functions for video processing
  const detectVideoType = (url: string): VideoItem["type"] => {
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("facebook.com") || url.includes("fb.watch"))
      return "facebook";
    if (url.includes("tiktok.com")) return "tiktok";
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
    if (url.match(/\.(mp4|avi|mov|wmv|flv|webm|ogg)$/i)) return "direct";
    return "other";
  };

  const generateVideoId = (): string => {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // changed: map social URLs to embeddable URLs when possible
  const createVideoFromUrl = useCallback((inputUrl: string): VideoItem => {
    const type = detectVideoType(inputUrl);
    const id = generateVideoId();

    let title = "Video";
    let description = "";
    let author = "";
    let platform = "";
    let url = inputUrl;

    // Helper to safely parse URL
    let parsed: URL | null = null;
    try {
      parsed = new URL(inputUrl);
    } catch {
      parsed = null;
    }

    switch (type) {
      case "youtube": {
        title = "YouTube Video";
        description = "Watch on YouTube";
        author = "YouTube";
        platform = "YouTube";
        // transform to embed URL if we can
        const ytMatch =
          inputUrl.match(
            /(?:v=|\/embed\/|youtu\.be\/|watch\?v=)([A-Za-z0-9_-]{6,})/
          ) || [];
        const ytId = ytMatch[1] || null;
        if (ytId) {
          url = `https://www.youtube.com/embed/${ytId}`;
        }
        break;
      }
      case "vimeo":
        title = "Vimeo Video";
        description = "Watch on Vimeo";
        author = "Vimeo";
        platform = "Vimeo";
        // Vimeo supports embed URLs; if the url already contains /video/ or an id keep it
        if (parsed) {
          const vMatch = inputUrl.match(
            /vimeo\.com\/(?:channels\/[^\s\/]+\/)?(\d+)/
          );
          if (vMatch && vMatch[1]) {
            url = `https://player.vimeo.com/video/${vMatch[1]}`;
          } else {
            url = inputUrl;
          }
        }
        break;
      case "instagram":
        title = "Instagram Post";
        description = "View on Instagram";
        author = "Instagram";
        platform = "Instagram";
        // convert to Instagram embed (handles /p/ and /reel/)
        if (parsed) {
          const m = parsed.pathname.match(/\/(reel|p)\/([^\/\?]+)/);
          if (m && m[1] && m[2]) {
            url = `https://www.instagram.com/${m[1]}/${m[2]}/embed/`;
          } else {
            // fallback: attempt a generic embed of the page
            url = `https://www.instagram.com${parsed.pathname}embed/`;
          }
        }
        break;
      case "facebook":
        title = "Facebook Video";
        description = "Watch on Facebook";
        author = "Facebook";
        platform = "Facebook";

        // Try to create a canonical Facebook video href so plugins/video.php can render it.
        // Handle URLs like:
        //  - https://www.facebook.com/<page>/videos/123456789012345/
        //  - https://www.facebook.com/watch/?v=123456789012345
        //  - https://www.facebook.com/video.php?v=123456789012345
        //  - short fb.watch links (fallback to original input)
        {
          let href = inputUrl;
          // try to extract numeric id from /videos/<id>/
          const videosMatch = inputUrl.match(
            /facebook\.com\/[^\/]+\/videos\/(\d+)/i
          );
          const watchMatch = inputUrl.match(/[?&]v=(\d+)/);
          const videoPhpMatch = inputUrl.match(/video\.php\?v=(\d+)/i);
          if (videosMatch && videosMatch[1]) {
            href = `https://www.facebook.com/watch/?v=${videosMatch[1]}`;
          } else if (watchMatch && watchMatch[1]) {
            href = `https://www.facebook.com/watch/?v=${watchMatch[1]}`;
          } else if (videoPhpMatch && videoPhpMatch[1]) {
            href = `https://www.facebook.com/watch/?v=${videoPhpMatch[1]}`;
          } else {
            // fallback: keep the original URL (some fb.watch or share URLs will redirect)
            href = inputUrl;
          }

          url = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
            href
          )}&show_text=false`;
        }
        break;
      case "tiktok":
        title = "TikTok Video";
        description = "Watch on TikTok";
        author = "TikTok";
        platform = "TikTok";
        // try to extract numeric video id for embed; fall back to generic embed wrapper
        const ttMatch =
          inputUrl.match(/video\/(\d+)/) ||
          inputUrl.match(/\/@[^\/]+\/video\/(\d+)/);
        if (ttMatch && ttMatch[1]) {
          url = `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
        } else {
          // generic embed wrapper (iframe)
          url = `https://www.tiktok.com/embed/${encodeURIComponent(inputUrl)}`;
        }
        break;
      case "twitter":
        title = "Twitter Video";
        description = "View on Twitter";
        author = "Twitter";
        platform = "Twitter";
        // use twitframe to render a tweet/video in an iframe
        url = `https://twitframe.com/show?url=${encodeURIComponent(inputUrl)}`;
        break;
      case "direct":
        title = "Video File";
        description = "Play video";
        author = "Local";
        platform = "Direct";
        url = inputUrl;
        break;
      default:
        title = "Video Link";
        description = "Open video";
        author = "External";
        platform = "Other";
        url = inputUrl;
    }

    return {
      id,
      title,
      description,
      url,
      type,
      author,
      platform,
    };
  }, []);

  const addVideo = useCallback(
    (video: VideoItem) => {
      // setVideos((prev) => [...prev, video]);
      dispatch(setVideoCollection([...videos, video]));
      dispatch(setHasContent(true));
      dispatch(setVideoUrl(video.url));
    },
    [videos, dispatch]
  );

  return (
    <>
      <div className="sticky left-2 sm:left-4 mt-3 w-16 sm:w-20">
        <div className="w-12 sm:w-16 bg-white rounded-2xl shadow-lg p-3 sm:p-5 flex flex-col items-center gap-3 sm:gap-5 z-50">
          {/* Top Section - Chat Icon with Star */}
          <div
            onClick={() => onChatClick()}
            className="cursor-pointer hover:opacity-70 transition-opacity"
          >
            <NotificationIcon
              width={24}
              height={24}
              className="sm:w-8 sm:h-8"
            />
          </div>

          {/* Separator */}
          <div className="w-6 sm:w-8 h-px bg-gray-200"></div>

          {/* Main Icon List */}
          <div className="flex flex-col items-center gap-6 sm:gap-10">
            {/* Social Media Group Icon - Video Collection */}
            <div className=" bg-[#F0F5F8] transition-opacity grid grid-cols-2 p-[4px] rounded-md gap-1">
              <Image
                className="cursor-pointer"
                src="/tiktok.svg"
                height={15}
                width={15}
                alt="TikTok"
                onClick={() => {
                  setVideoModalHeading("Add TikTok Video");
                  setIsVideoPopup(true);
                }}
              />
              <Image
                className="cursor-pointer"
                src="/youtube.svg"
                height={15}
                width={15}
                alt="YouTube"
                onClick={() => {
                  setVideoModalHeading("Add YouTube Video");
                  setIsVideoPopup(true);
                }}
              />
              <Image
                className="cursor-pointer"
                src="/insta.svg"
                height={15}
                width={15}
                alt="Instagram"
                onClick={() => {
                  setVideoModalHeading("Add Instagram Video");
                  setIsVideoPopup(true);
                }}
              />
              <Image
                className="cursor-pointer"
                src="/plus.svg"
                height={15}
                width={15}
                alt="Add Video"
                onClick={() => setIsPlusPopup(true)}
              />
            </div>

            {/* Gallery Icon - Image Collection */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => {
                // imageInputRef.current?.click()
                setIsImagePopup(true);
              }}
            >
              <UserIcon width={24} height={24} className="sm:w-8 sm:h-8" />
            </div>

            {/* Microphone Icon - Audio Player */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => {
                // For now, we'll keep the old file input for audio
                // You can replace this with a modal containing AudioUpload component
                // audioInputRef.current?.click();
                setIsAudioPopup(true);
              }}
            >
              <LockIcon width={24} height={24} className="sm:w-8 sm:h-8" />
            </div>

            {/* Text/Type Icon - Text */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setIsTextPopup(true)}
            >
              <TrashIcon width={24} height={24} className="sm:w-8 sm:h-8" />
            </div>

            {/* Hierarchy/Flowchart Icon - Wikipedia */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setIsWikipediaPopup(true)}
            >
              <GridIconNew width={24} height={24} className="sm:w-8 sm:h-8" />
            </div>

            {/* Globe Icon - Web Link */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => setIsWebLinkPopup(true)}
            >
              <GlobeIcon width={24} height={24} className="sm:w-8 sm:h-8" />
            </div>

            {/* Document Icon - PDF Document */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => {
                // For now, we'll keep the old file input for documents
                // You can replace this with a modal containing DocumentUpload component
                // documentInputRef.current?.click();
                setIsDocumentPopup(true);
              }}
            >
              <FileIcon width={24} height={24} className="sm:w-8 sm:h-8" />
            </div>

            {/* Folder Icon - Folder Collection */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={handleCreateFolderCollection}
            >
              <FolderIcon width={24} height={24} className="sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
        {/* Bottom Section - Dark Button with Wifi Icon */}
        <button className="mt-3 w-12 sm:w-16 h-10 sm:h-12 bg-black rounded-xl flex items-center justify-center hover:bg-gray-700 transition-colors">
          <WifiIcon width={20} height={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageFileChange([file]);
          }
          if (imageInputRef.current) {
            imageInputRef.current.value = "";
          }
        }}
        className="hidden"
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleAudioFileInputChange}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoFileInputChange}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv"
        onChange={handleDocumentFileInputChange}
        className="hidden"
      />

      {/* Components now rendered in React Flow */}

      <VideoModal
        isOpen={isVideoPopup}
        onClose={() => setIsVideoPopup(false)}
        onSubmit={(submittedUrl) => {
          const trimmed = submittedUrl?.trim();
          if (!trimmed) return;
          // create a VideoItem from submitted url and add immediately to collection
          const video = createVideoFromUrl(trimmed);
          addVideo(video);
          setIsVideoPopup(false);
          // Dispatch to dashboard with the correct component type for social media
          window.dispatchEvent(
            new CustomEvent("createComponent", {
              detail: {
                componentType: "videoSocial", // Changed from videoCollection to videoSocial
                data: {
                  url: video.url, // Use url instead of text
                  text: video.url, // Keep text as fallback
                  title: video.title,
                  type: video.type,
                },
              },
            })
          );
        }}
        heading={videoModalHeading}
      />

      <ImageModal
        isOpen={isImagePopup}
        onClose={() => setIsImagePopup(false)}
        onFilesChange={handleImageFileChange}
      />

      <WikipediaModal
        isOpen={isWikipediaPopup}
        onClose={() => setIsWikipediaPopup(false)}
        onSubmit={(submittedUrl) => {
          setWikiUrl(submittedUrl);
          showWikipedia(submittedUrl);
        }}
      />

      <AudioModal
        isOpen={isAudioPopup}
        onClose={() => setIsAudioPopup(false)}
        onFilesChange={handleAudioFileChange}
      />

      <DocumentModal
        isOpen={isDocumentPopup}
        onClose={() => setIsDocumentPopup(false)}
        onFilesChange={handleDocumentFileChange}
      />

      <WebLinkModal
        isOpen={isWebLinkPopup}
        onClose={() => setIsWebLinkPopup(false)}
        onSubmit={(submittedUrl) => {
          const trimmed = submittedUrl.trim();
          if (!trimmed) {
            showToast("Please enter a valid URL", "error");
            return;
          }
          setWebLinkUrl(trimmed);
          // pass the trimmed url directly so showWebLink doesn't rely on stale state
          showWebLink(trimmed);
        }}
      />

      <TextModal
        isOpen={isTextPopup}
        onClose={() => setIsTextPopup(false)}
        onSubmit={(submittedText) => {
          showText(submittedText);
        }}
      />

      <PlusModal
        isOpen={isPlusPopup}
        onClose={() => setIsPlusPopup(false)}
        onFacebookVideo={() => {
          setVideoModalHeading("Add Facebook Video");
          setIsVideoPopup(true);
        }}
        onDeviceImport={() => {
          // Create a special input handler for social video uploads
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "video/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              handleVideoFileChange([file], true); // Social video upload
            }
          };
          input.click();
        }}
      />
    </>
  );
}
