"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import MobilePasteDropdown from "./MobilePasteDropdown";
import { useDispatch, useSelector } from "react-redux";
import { StoreTypes } from "@/app/models/interfaces";
import {
  setHasContent,
  setVideoCollection,
  setVideoUrl,
} from "@/app/redux/slices/videoSlice";
import Modal from "./Modal";
import TextField from "./TextField";
import Button from "./Button";

// Utility hook for handling video drops in other components
export const useVideoDrop = (
  onVideoDrop?: (video: VideoItem, position: { x: number; y: number }) => void
) => {
  useEffect(() => {
    const handleVideoDropped = (e: CustomEvent) => {
      const { video, dropPosition } = e.detail;
      if (onVideoDrop) {
        onVideoDrop(video, dropPosition);
      }
    };

    window.addEventListener(
      "videoDropped",
      handleVideoDropped as EventListener
    );

    return () => {
      window.removeEventListener(
        "videoDropped",
        handleVideoDropped as EventListener
      );
    };
  }, [onVideoDrop]);
};

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  type:
    | "youtube"
    | "vimeo"
    | "instagram"
    | "facebook"
    | "tiktok"
    | "twitter"
    | "direct"
    | "other";
  duration?: string;
  author?: string;
  platform?: string;
}

interface VideoCollectionProps {
  className?: string;
  id?: string;
  initialData?: {
    file?: File;
    text?: string;
  };
  onClose?: () => void;
  inline?: boolean;
}

export default function VideoCollection({
  className = "",
  id,
  initialData,
  onClose,
  inline = false,
}: VideoCollectionProps) {
  // id is used for React key in parent component
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isVideoPopup, setIsVideoPopup] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("Collections");
  const [isEditingTitle, setIsEditingTitle] = useState(false);


  // const [videos, setVideos] = useState<VideoItem[]>([]);
  // const [hasContent, setHasContent] = useState(false);
  // const [linkUrl, setLinkUrl] = useState("");
  // const [draggedVideoId, setDraggedVideoId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile paste dropdown state
  const [showMobilePasteDropdown, setShowMobilePasteDropdown] = useState(false);
  const [mobilePastePosition, setMobilePastePosition] = useState({
    x: 0,
    y: 0,
  });
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);

  const dispatch = useDispatch();

  const videoProvider = useSelector(
    (state: StoreTypes) => state.videCollectionSlice
  );

  const { videos, videoUrl, hasContent } = videoProvider;

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

  const createVideoFromUrl = useCallback((url: string): VideoItem => {
    const type = detectVideoType(url);
    const id = generateVideoId();

    let title = "Video";
    let description = "";
    let author = "";
    let platform = "";

    switch (type) {
      case "youtube":
        title = "YouTube Video";
        description = "Watch on YouTube";
        author = "YouTube";
        platform = "YouTube";
        break;
      case "vimeo":
        title = "Vimeo Video";
        description = "Watch on Vimeo";
        author = "Vimeo";
        platform = "Vimeo";
        break;
      case "instagram":
        title = "Instagram Post";
        description = "View on Instagram";
        author = "Instagram";
        platform = "Instagram";
        break;
      case "facebook":
        title = "Facebook Video";
        description = "Watch on Facebook";
        author = "Facebook";
        platform = "Facebook";
        break;
      case "tiktok":
        title = "TikTok Video";
        description = "Watch on TikTok";
        author = "TikTok";
        platform = "TikTok";
        break;
      case "twitter":
        title = "Twitter Video";
        description = "View on Twitter";
        author = "Twitter";
        platform = "Twitter";
        break;
      case "direct":
        title = "Video File";
        description = "Play video";
        author = "Local";
        platform = "Direct";
        break;
      default:
        title = "Video Link";
        description = "Open video";
        author = "External";
        platform = "Other";
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

  const showVideo = () => {
    if (url && url.trim()) {
      const video = createVideoFromUrl(url.trim());
      addVideo(video);
      setIsVideoPopup(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (inline) return; // No dragging in inline mode
    // Only allow dragging from the header area or ellipses
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-draggable="true"]') ||
      target.closest(".drag-handle")
    ) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const touch = e.touches[0];

    // Check if it's a long press on the main content area (not draggable elements)
    if (
      !target.closest('[data-draggable="true"]') &&
      !target.closest(".drag-handle")
    ) {
      // Start long press timer
      const timer = setTimeout(() => {
        setMobilePastePosition({ x: touch.clientX, y: touch.clientY });
        setShowMobilePasteDropdown(true);
      }, 200); // 1 milisecond hold
      setHoldTimer(timer);
    } else {
      // Handle dragging for draggable elements
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.min(475, viewportWidth * 0.9);
        const maxHeight = Math.min(409, viewportHeight * 0.8);

        // Constrain position to viewport
        const constrainedX = Math.max(
          0,
          Math.min(newX, viewportWidth - maxWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, viewportHeight - maxHeight)
        );

        setPosition({
          x: constrainedX,
          y: constrainedY,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.min(475, viewportWidth * 0.9);
        const maxHeight = Math.min(409, viewportHeight * 0.8);

        // Constrain position to viewport
        const constrainedX = Math.max(
          0,
          Math.min(newX, viewportWidth - maxWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, viewportHeight - maxHeight)
        );

        setPosition({
          x: constrainedX,
          y: constrainedY,
        });
      } else if (holdTimer) {
        // Cancel long press if user moves finger
        clearTimeout(holdTimer);
        setHoldTimer(null);
      }
    },
    [isDragging, dragStart, holdTimer]
  );

  const handleTouchMoveReact = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = Math.min(475, viewportWidth * 0.9);
        const maxHeight = Math.min(409, viewportHeight * 0.8);

        // Constrain position to viewport
        const constrainedX = Math.max(
          0,
          Math.min(newX, viewportWidth - maxWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(newY, viewportHeight - maxHeight)
        );

        setPosition({
          x: constrainedX,
          y: constrainedY,
        });
      } else if (holdTimer) {
        // Cancel long press if user moves finger
        clearTimeout(holdTimer);
        setHoldTimer(null);
      }
    },
    [isDragging, dragStart, holdTimer]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);

    // Clear long press timer if it exists
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
  }, [holdTimer]);

  // Mobile paste dropdown handlers
  const handleCloseMobilePasteDropdown = () => {
    setShowMobilePasteDropdown(false);
  };

  const handlePasteAudio = () => {
    handleCloseMobilePasteDropdown();
    // Trigger audio paste functionality
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        routeToAudioPlayer(file);
      }
    };
    input.click();
  };

  const handlePasteImage = () => {
    handleCloseMobilePasteDropdown();
    // Trigger image paste functionality
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        routeToImageCollection(file);
      }
    };
    input.click();
  };

  const handlePasteVideo = () => {
    handleCloseMobilePasteDropdown();
    // Trigger video paste functionality
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const videoUrl = URL.createObjectURL(file);
        const video = createVideoFromUrl(videoUrl);
        video.title = file.name;
        video.type = "direct";
        addVideo(video);
      }
    };
    input.click();
  };

  const handlePasteDocument = () => {
    handleCloseMobilePasteDropdown();
    // Trigger document paste functionality
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        routeToPdfDocument(file);
      }
    };
    input.click();
  };

  const handlePasteText = () => {
    handleCloseMobilePasteDropdown();
    // Trigger text paste functionality
    const text = prompt("Enter text to create Wikipedia link:");
    if (text && text.trim()) {
      routeToWikipediaLink(text.trim());
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimer) {
        clearTimeout(holdTimer);
      }
    };
  }, [holdTimer]);

  // Handle initial data when component is created
  useEffect(() => {
    if (initialData?.text) {
      const text = initialData.text;
      try {
        new URL(text);
        const videoType = detectVideoType(text);
        if (
          videoType === "youtube" ||
          videoType === "vimeo" ||
          videoType === "instagram" ||
          videoType === "facebook" ||
          videoType === "tiktok" ||
          videoType === "twitter" ||
          videoType === "direct" ||
          videoType === "other"
        ) {
          const video = createVideoFromUrl(text);
          addVideo(video);
        }
      } catch {
        // Not a valid URL
      }
    } else if (initialData?.file) {
      const file = initialData.file;
      if (file.type.startsWith("video/")) {
        const videoUrl = URL.createObjectURL(file);
        const video = createVideoFromUrl(videoUrl);
        video.title = file.name;
        video.type = "direct";
        addVideo(video);
      }
    }
  }, [initialData, createVideoFromUrl, addVideo]);

  // Global drag and drop event listeners for external drops
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "copy";
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();

      // Check if this is a video item being dropped
      const videoData = e.dataTransfer?.getData("application/video-item");
      if (videoData) {
        try {
          const video: VideoItem = JSON.parse(videoData);

          // Dispatch a custom event for other components to listen to
          const dropEvent = new CustomEvent("videoDropped", {
            detail: {
              video,
              dropPosition: {
                x: e.clientX,
                y: e.clientY,
              },
              target: e.target,
            },
          });

          window.dispatchEvent(dropEvent);

          // Show feedback
          showFeedback(`Video "${video.title}" dropped outside collection`);
        } catch (error) {
          console.error("Error parsing dropped video data:", error);
        }
      }
    };

    // Add global event listeners
    document.addEventListener("dragover", handleGlobalDragOver);
    document.addEventListener("drop", handleGlobalDrop);

    return () => {
      document.removeEventListener("dragover", handleGlobalDragOver);
      document.removeEventListener("drop", handleGlobalDrop);
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragStart, handleMouseMove, handleTouchMove, handleTouchEnd]);

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();

    // Check for files first
    const files = Array.from(e.clipboardData.files);
    if (files.length > 0) {
      const file = files[0];
      const fileType = file.type;
      const fileName = file.name;

      // Route to appropriate component based on file type
      if (fileType.startsWith("audio/")) {
        // Route to AudioPlayer
        routeToAudioPlayer(file);
      } else if (fileType.startsWith("image/")) {
        // Route to ImageCollection
        routeToImageCollection(file);
      } else if (
        fileType === "application/pdf" ||
        fileName.endsWith(".txt") ||
        fileName.endsWith(".doc") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".xls") ||
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".csv")
      ) {
        // Route to PdfDocument
        routeToPdfDocument(file);
      }
      return;
    }

    // Check for text content
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.trim()) {
      // Check if it's a valid URL
      try {
        new URL(pastedText);
        // Check if it's a video URL
        const videoType = detectVideoType(pastedText);
        if (
          videoType === "youtube" ||
          videoType === "vimeo" ||
          videoType === "instagram" ||
          videoType === "facebook" ||
          videoType === "tiktok" ||
          videoType === "twitter" ||
          videoType === "direct" ||
          videoType === "other"
        ) {
          const video = createVideoFromUrl(pastedText);
          addVideo(video);
        } else {
          // setLinkUrl(pastedText);
          dispatch(setVideoUrl(pastedText));
          dispatch(setHasContent(true));
        }
      } catch {
        // If not a valid URL, try to extract URL from text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = pastedText.match(urlRegex);
        if (matches && matches[0]) {
          const videoType = detectVideoType(matches[0]);
          if (
            videoType === "youtube" ||
            videoType === "vimeo" ||
            videoType === "instagram" ||
            videoType === "facebook" ||
            videoType === "tiktok" ||
            videoType === "twitter" ||
            videoType === "direct" ||
            videoType === "other"
          ) {
            const video = createVideoFromUrl(matches[0]);
            addVideo(video);
          } else {
            // setLinkUrl(matches[0]);
            dispatch(setVideoUrl(matches[0]));
            dispatch(setHasContent(true));
          }
        } else {
          // Route to TextCollection for text content
          routeToTextCollection(pastedText);
        }
      }
    }
  };

  const handleRemoveContent = useCallback(() => {
    dispatch(setHasContent(false));
    // setLinkUrl("");
    dispatch(setVideoUrl(""));
  }, [dispatch]);

  // Routing functions for different file types
  const routeToAudioPlayer = useCallback((file: File) => {
    // Create a new AudioPlayer component instance
    const createEvent = new CustomEvent("createComponent", {
      detail: {
        componentType: "audioPlayer",
        data: { file },
      },
    });
    window.dispatchEvent(createEvent);

    // Show feedback
    showFeedback("Audio file routed to new Audio Player");
  }, []);

  const routeToImageCollection = useCallback((file: File) => {
    // Create a new ImageCollection component instance
    const createEvent = new CustomEvent("createComponent", {
      detail: {
        componentType: "imageCollection",
        data: { file },
      },
    });
    window.dispatchEvent(createEvent);

    // Show feedback
    showFeedback("Image file routed to new Image Collection");
  }, []);

  const routeToPdfDocument = useCallback((file: File) => {
    // Create a new PdfDocument component instance
    const createEvent = new CustomEvent("createComponent", {
      detail: {
        componentType: "pdfDocument",
        data: { file },
      },
    });
    window.dispatchEvent(createEvent);

    // Show feedback
    showFeedback("Document file routed to new PDF Document");
  }, []);

  const routeToWikipediaLink = useCallback((text: string) => {
    // Create a new WikipediaLink component instance
    const createEvent = new CustomEvent("createComponent", {
      detail: {
        componentType: "wikipediaLink",
        data: { text },
      },
    });
    window.dispatchEvent(createEvent);

    // Show feedback
    showFeedback("Text content routed to new Wikipedia Link");
  }, []);

  const routeToTextCollection = useCallback((text: string) => {
    // Create a new TextCollection component instance
    const createEvent = new CustomEvent("createComponent", {
      detail: {
        componentType: "text",
        data: { text },
      },
    });
    window.dispatchEvent(createEvent);

    // Show feedback
    showFeedback("Text content routed to new Text Collection");
  }, []);

  const showFeedback = (message: string) => {
    // Create a temporary feedback element
    const feedback = document.createElement("div");
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-family: Urbanist, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation styles
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(feedback);

    // Remove after 3 seconds
    setTimeout(() => {
      feedback.remove();
      style.remove();
    }, 1000);
  };

  // Handle keyboard shortcuts and global paste events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        // Let the paste event handle it
        return;
      }
      if (e.key === "Escape" && hasContent) {
        handleRemoveContent();
      }
    };

    // Global paste event handler to ensure paste works even when component is not focused
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Only handle paste if no other component is focused or if this component is focused
      const activeElement = document.activeElement;
      const isThisComponentFocused =
        containerRef.current?.contains(activeElement) ||
        activeElement === containerRef.current ||
        activeElement === document.body;

      if (isThisComponentFocused) {
        e.preventDefault();

        // Check for files first
        const files = Array.from(e.clipboardData?.files || []);
        if (files.length > 0) {
          const file = files[0];
          const fileType = file.type;
          const fileName = file.name;

          // Route to appropriate component based on file type
          if (fileType.startsWith("audio/")) {
            routeToAudioPlayer(file);
          } else if (fileType.startsWith("image/")) {
            routeToImageCollection(file);
          } else if (
            fileType === "application/pdf" ||
            fileName.endsWith(".txt") ||
            fileName.endsWith(".doc") ||
            fileName.endsWith(".docx") ||
            fileName.endsWith(".xls") ||
            fileName.endsWith(".xlsx") ||
            fileName.endsWith(".csv")
          ) {
            routeToPdfDocument(file);
          }
          return;
        }

        // Check for text content
        const pastedText = e.clipboardData?.getData("text") || "";
        if (pastedText.trim()) {
          // Check if it's a valid URL
          try {
            new URL(pastedText);
            // setLinkUrl(pastedText);
            dispatch(setVideoUrl(pastedText));
            dispatch(setHasContent(true));
          } catch {
            // If not a valid URL, try to extract URL from text
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const matches = pastedText.match(urlRegex);
            if (matches && matches[0]) {
              // setLinkUrl(matches[0]);
              dispatch(setVideoUrl(matches[0]));
              dispatch(setHasContent(true));
            } else {
              // Route to WikipediaLink for text content
              routeToWikipediaLink(pastedText);
            }
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("paste", handleGlobalPaste);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("paste", handleGlobalPaste);
    };
  }, [
    hasContent,
    routeToAudioPlayer,
    routeToImageCollection,
    routeToPdfDocument,
    routeToTextCollection,
    routeToWikipediaLink,
    dispatch,
    handleRemoveContent,
  ]);

  const handleClick = () => {
    // Ensure this component gets focus when clicked
    if (containerRef.current) {
      containerRef.current.focus();
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`${
          inline ? "relative w-full h-full" : "fixed z-20 select-none"
        } ${className}`}
        style={
          inline
            ? {}
            : {
                left: position.x,
                top: position.y,
                width: "min(475px, 75vw)",
                height: "min(409px, 80vh)",
                maxWidth: "475px",
                maxHeight: "409px",
                opacity: 1,
                transform: "rotate(0deg)",
              }
        }
        onPaste={handlePaste}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMoveReact}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
      >
        {/* Main Container */}
        <div
          className="relative  p-0 w-full h-full"
          style={{
            background: "var(--video-collection-bg)",
            boxShadow: "0px 0px 28.82px 0px var(--video-collection-sub-shadow)",
            borderRadius: "8.65px",
            // border: "2px solid #4596FF",
          }}
        >
          {/* Sub Div */}
          <div
            className="absolute inset-0 rounded-lg "
            style={{
              background: "var(--video-collection-main-bg)",
              borderRadius: "8.65px",
            }}
          >
            {/* Header - Draggable */}
            <div
              className="flex bg-[#1279FF] items-center justify-between w-full px-2 py-2 drag-handle cursor-move rounded-t-lg border border-gray-300"
              data-draggable="true"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                paddingRight: "7.21px",
                paddingLeft: "7.21px",
              }}
            >
              <div className="flex items-center gap-2">
                {/* Folder Icon */}
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.01074 4.28931H8.75586L10.2266 5.75903L10.4375 5.97095H17.4609C17.9876 5.97095 18.4216 6.40432 18.4219 6.93091V15.3381C18.4219 15.8649 17.9877 16.2991 17.4609 16.2991H4.01074C3.48427 16.2991 3.05032 15.8655 3.0498 15.3391L3.05762 5.25024L3.06348 5.15161C3.11267 4.66652 3.52129 4.28931 4.01074 4.28931Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="1.44117"
                  />
                </svg>

                {/* Title */}
                {isEditingTitle ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingTitle(false);
                      }
                    }}
                    className="bg-transparent border-none outline-none text-white font-medium"
                    style={{
                      fontWeight: 500,
                      fontSize: "11.53px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "var(--video-collection-text-primary)",
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => setIsEditingTitle(true)}
                    className="!text-white font-medium cursor-pointer hover:opacity-80"
                    style={{
                      fontWeight: 500,
                      fontSize: "11.53px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "var(--video-collection-text-primary)",
                    }}
                  >
                    {title}
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClose) {
                    onClose();
                  } else {
                    // For dashboard instances, emit remove event
                    const removeEvent = new CustomEvent("removeComponent", {
                      detail: { componentId: id },
                    });
                    window.dispatchEvent(removeEvent);
                  }
                }}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            {/* Content Area */}
            <div
              className="relative w-full h-[365px] overflow-hidden"
              style={{
                background: "white",
                borderRadius: "8.65px",
              }}
            >
              {hasContent ? (
                /* Legacy Link Preview */
                <div
                  className="absolute rounded-lg "
                  style={{
                    width: "200px",
                    height: "280px",
                    top: "20px",
                    left: "20px",
                    background:
                      videoUrl.includes("youtube.com") ||
                      videoUrl.includes("youtu.be")
                        ? "#FF543E4D"
                        : videoUrl.includes("instagram.com")
                        ? "var(--video-collection-pink)"
                        : videoUrl.includes("vimeo.com")
                        ? "#12c8ff"
                        : videoUrl.includes("facebook.com") ||
                          videoUrl.includes("fb.watch")
                        ? "#1279ff"
                        : videoUrl.includes("tiktok.com")
                        ? "#000000"
                        : "#1DA1F2",
                    padding: "1.44px",
                    borderRadius: "8.65px",
                  }}
                >
                  {/* Link Header */}
                  <div
                    className="flex items-center justify-between px-2 py-1 w-full"
                    style={{
                      height: "27.38px",
                      paddingRight: "7.21px",
                      paddingLeft: "7.21px",
                    }}
                  >
                    {/* Platform Logo and Title */}
                    <div className="flex items-center gap-2">
                      {videoUrl.includes("youtube.com") ||
                      videoUrl.includes("youtu.be") ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="#FF4500"
                          >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          <span
                            className="text-white"
                            style={{
                              fontWeight: 400,
                              fontSize: "8.65px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "var(--video-collection-text-primary)",
                            }}
                          >
                            YouTube Video
                          </span>
                        </>
                      ) : videoUrl.includes("instagram.com") ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.95987 0.0142822H3.06927C1.39034 0.0142822 0.0292969 1.37532 0.0292969 3.05425V9.94485C0.0292969 11.6238 1.39034 12.9848 3.06927 12.9848H9.95987C11.6388 12.9848 12.9998 11.6238 12.9998 9.94485V3.05425C12.9998 1.37532 11.6388 0.0142822 9.95987 0.0142822Z"
                              fill="url(#paint0_radial_62_4619)"
                            />
                            <path
                              d="M9.95987 0.0142822H3.06927C1.39034 0.0142822 0.0292969 1.37532 0.0292969 3.05425V9.94485C0.0292969 11.6238 1.39034 12.9848 3.06927 12.9848H9.95987C11.6388 12.9848 12.9998 11.6238 12.9998 9.94485V3.05425C12.9998 1.37532 11.6388 0.0142822 9.95987 0.0142822Z"
                              fill="url(#paint1_radial_62_4619)"
                            />
                            <path
                              d="M6.51434 1.43298C5.13835 1.43298 4.96563 1.43901 4.42522 1.46359C3.88583 1.48831 3.51764 1.57368 3.1955 1.69898C2.86222 1.82838 2.57955 2.00151 2.29795 2.28321C2.01609 2.56487 1.84297 2.84753 1.71316 3.18066C1.58751 3.5029 1.50204 3.87124 1.47777 4.41038C1.4536 4.95084 1.44727 5.12361 1.44727 6.49965C1.44727 7.8757 1.45335 8.04786 1.47787 8.58826C1.50269 9.12766 1.58807 9.49585 1.71326 9.81798C1.84277 10.1513 2.01589 10.4339 2.2976 10.7155C2.57915 10.9974 2.86181 11.1709 3.19484 11.3003C3.51723 11.4256 3.88547 11.511 4.42476 11.5357C4.96522 11.5603 5.13779 11.5663 6.51373 11.5663C7.88988 11.5663 8.06204 11.5603 8.60244 11.5357C9.14184 11.511 9.51043 11.4256 9.83282 11.3003C10.166 11.1709 10.4482 10.9974 10.7297 10.7155C11.0116 10.4339 11.1846 10.1513 11.3145 9.81814C11.439 9.49585 11.5246 9.12756 11.5499 8.58837C11.5742 8.04796 11.5805 7.8757 11.5805 6.49965C11.5805 5.12361 11.5742 4.95094 11.5499 4.41048C11.5246 3.87109 11.439 3.50295 11.3145 3.18081C11.1846 2.84753 11.0116 2.56487 10.7297 2.28321C10.4479 2.00141 10.1661 1.82828 9.83252 1.69903C9.50952 1.57368 9.14113 1.48826 8.60174 1.46359C8.06128 1.43901 7.88922 1.43298 6.51277 1.43298H6.51434ZM6.05981 2.34604C6.19474 2.34584 6.34527 2.34604 6.51434 2.34604C7.86718 2.34604 8.02748 2.3509 8.56171 2.37517C9.0557 2.39777 9.32383 2.4803 9.50243 2.54967C9.73889 2.64147 9.90745 2.75127 10.0847 2.92865C10.262 3.10598 10.3718 3.27485 10.4638 3.51131C10.5332 3.68966 10.6158 3.95778 10.6383 4.45178C10.6626 4.9859 10.6679 5.14631 10.6679 6.49849C10.6679 7.85067 10.6626 8.01113 10.6383 8.5452C10.6157 9.03919 10.5332 9.30732 10.4638 9.48571C10.372 9.72217 10.262 9.89054 10.0847 10.0678C9.90735 10.2451 9.73899 10.3548 9.50243 10.4467C9.32403 10.5164 9.0557 10.5987 8.56171 10.6213C8.02759 10.6456 7.86718 10.6508 6.51434 10.6508C5.16145 10.6508 5.00109 10.6456 4.46702 10.6213C3.97303 10.5985 3.7049 10.516 3.52615 10.4466C3.28974 10.3547 3.12082 10.245 2.94349 10.0677C2.76616 9.89034 2.65641 9.72187 2.56435 9.48531C2.49499 9.30691 2.41236 9.03879 2.38986 8.54479C2.36559 8.01067 2.36073 7.85026 2.36073 6.49722C2.36073 5.14418 2.36559 4.98463 2.38986 4.45051C2.41246 3.95651 2.49499 3.68839 2.56435 3.50979C2.65621 3.27333 2.76616 3.10446 2.94354 2.92713C3.12092 2.7498 3.28974 2.64 3.5262 2.54799C3.7048 2.47833 3.97303 2.396 4.46702 2.3733C4.93442 2.35217 5.11555 2.34584 6.05981 2.34477V2.34604ZM9.2189 3.1873C8.88324 3.1873 8.61091 3.45938 8.61091 3.79509C8.61091 4.13076 8.88324 4.40309 9.2189 4.40309C9.55456 4.40309 9.82689 4.13076 9.82689 3.79509C9.82689 3.45943 9.55456 3.1871 9.2189 3.1871V3.1873ZM6.51434 3.89769C5.07745 3.89769 3.91243 5.06271 3.91243 6.49965C3.91243 7.9366 5.07745 9.10106 6.51434 9.10106C7.95128 9.10106 9.1159 7.9366 9.1159 6.49965C9.1159 5.06276 7.95118 3.89769 6.51424 3.89769H6.51434ZM6.51434 4.81075C7.44705 4.81075 8.20325 5.56684 8.20325 6.49965C8.20325 7.43237 7.44705 8.18856 6.51434 8.18856C5.58163 8.18856 4.82548 7.43237 4.82548 6.49965C4.82548 5.56684 5.58158 4.81075 6.51434 4.81075Z"
                              fill="white"
                            />
                            <defs>
                              <radialGradient
                                id="paint0_radial_62_4619"
                                cx="0"
                                cy="0"
                                r="1"
                                gradientUnits="userSpaceOnUse"
                                gradientTransform="translate(3.4746 13.9838) rotate(-90) scale(12.8548 11.956)"
                              >
                                <stop stopColor="#FFDD55" />
                                <stop offset="0.1" stopColor="#FFDD55" />
                                <stop offset="0.5" stopColor="#FF543E" />
                                <stop offset="1" stopColor="#C837AB" />
                              </radialGradient>
                              <radialGradient
                                id="paint1_radial_62_4619"
                                cx="0"
                                cy="0"
                                r="1"
                                gradientUnits="userSpaceOnUse"
                                gradientTransform="translate(-2.14332 0.948617) rotate(78.681) scale(5.74615 23.6858)"
                              >
                                <stop stopColor="#3771C8" />
                                <stop offset="0.128" stopColor="#3771C8" />
                                <stop
                                  offset="1"
                                  stopColor="#6600FF"
                                  stopOpacity="0"
                                />
                              </radialGradient>
                            </defs>
                          </svg>

                          <span
                            className="text-white"
                            style={{
                              fontWeight: 400,
                              fontSize: "8.65px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "var(--video-collection-text-primary)",
                            }}
                          >
                            Instagram Post
                          </span>
                        </>
                      ) : videoUrl.includes("vimeo.com") ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
                          </svg>
                          <span
                            className="text-white"
                            style={{
                              fontWeight: 400,
                              fontSize: "8.65px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "var(--video-collection-text-primary)",
                            }}
                          >
                            Vimeo Video
                          </span>
                        </>
                      ) : videoUrl.includes("facebook.com") ||
                        videoUrl.includes("fb.watch") ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span
                            className="text-white"
                            style={{
                              fontWeight: 400,
                              fontSize: "8.65px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "var(--video-collection-text-primary)",
                            }}
                          >
                            Facebook Video
                          </span>
                        </>
                      ) : videoUrl.includes("tiktok.com") ? (
                        <>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="white"
                          >
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                          <span
                            className="text-white"
                            style={{
                              fontWeight: 400,
                              fontSize: "8.65px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "var(--video-collection-text-primary)",
                            }}
                          >
                            TikTok Video
                          </span>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              width: "15.85px",
                              height: "15.85px",
                              background: "white",
                              borderRadius: "4px",
                            }}
                          />
                          <span
                            className="text-white"
                            style={{
                              fontWeight: 400,
                              fontSize: "8.65px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                              color: "var(--video-collection-text-primary)",
                            }}
                          >
                            Video Content
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2">
                      {/* External Link Icon */}
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.51802 6.59875L13.0217 2.09509M13.0217 2.09509H10.0192M13.0217 2.09509V5.09753M13.0217 8.70046V11.7029C13.0217 12.0214 12.8951 12.3269 12.6699 12.5521C12.4447 12.7773 12.1392 12.9039 11.8207 12.9039H3.41387C3.09535 12.9039 2.78988 12.7773 2.56465 12.5521C2.33942 12.3269 2.21289 12.0214 2.21289 11.7029V3.29607C2.21289 2.97755 2.33942 2.67208 2.56465 2.44685C2.78988 2.22162 3.09535 2.09509 3.41387 2.09509H6.41631"
                          stroke="white"
                          strokeWidth="1.44117"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* Close Icon */}
                      <button onClick={handleRemoveContent}>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.07301 1.49451H11.7985C12.1807 1.49451 12.5473 1.64634 12.8175 1.91662C13.0878 2.18689 13.2396 2.55346 13.2396 2.93568V9.66114C13.2396 10.0434 13.0878 10.4099 12.8175 10.6802C12.5473 10.9505 12.1807 11.1023 11.7985 11.1023H5.07301C4.88375 11.1023 4.69635 11.065 4.52149 10.9926C4.34664 10.9202 4.18777 10.814 4.05395 10.6802C3.78367 10.4099 3.63184 10.0434 3.63184 9.66114V2.93568C3.63184 2.55346 3.78367 2.18689 4.05395 1.91662C4.32422 1.64634 4.69078 1.49451 5.07301 1.49451ZM7.1621 4.17509C7.04943 4.06241 6.89661 3.99911 6.73726 3.99911C6.57791 3.99911 6.42509 4.06241 6.31241 4.17509C6.19974 4.28776 6.13644 4.44058 6.13644 4.59993C6.13644 4.75928 6.19974 4.9121 6.31241 5.02478L7.58725 6.29841L6.31301 7.57205C6.20034 7.68472 6.13704 7.83754 6.13704 7.99689C6.13704 8.15624 6.20034 8.30906 6.31301 8.42174C6.42569 8.53441 6.57851 8.59771 6.73786 8.59771C6.89721 8.59771 7.05003 8.53441 7.16271 8.42174L8.43574 7.1475L9.70938 8.42174C9.76517 8.47753 9.8314 8.52178 9.9043 8.55198C9.97719 8.58217 10.0553 8.59771 10.1342 8.59771C10.2131 8.59771 10.2913 8.58217 10.3641 8.55198C10.437 8.52178 10.5033 8.47753 10.5591 8.42174C10.6149 8.36595 10.6591 8.29971 10.6893 8.22682C10.7195 8.15392 10.735 8.07579 10.735 7.99689C10.735 7.91799 10.7195 7.83986 10.6893 7.76697C10.6591 7.69407 10.6149 7.62784 10.5591 7.57205L9.28483 6.29841L10.5591 5.02478C10.6149 4.96898 10.6591 4.90275 10.6893 4.82986C10.7195 4.75696 10.735 4.67883 10.735 4.59993C10.735 4.52103 10.7195 4.4429 10.6893 4.37001C10.6591 4.29711 10.6149 4.23088 10.5591 4.17509C10.5033 4.11929 10.437 4.07504 10.3641 4.04484C10.2913 4.01465 10.2131 3.99911 10.1342 3.99911C10.0553 3.99911 9.97719 4.01465 9.9043 4.04484C9.8314 4.07504 9.76517 4.11929 9.70938 4.17509L8.43634 5.44932L7.1621 4.17509Z"
                            fill="white"
                          />
                          <path
                            d="M2.43096 2.69546C2.43096 2.5362 2.36769 2.38346 2.25508 2.27085C2.14246 2.15824 1.98973 2.09497 1.83047 2.09497C1.67121 2.09497 1.51847 2.15824 1.40586 2.27085C1.29325 2.38346 1.22998 2.5362 1.22998 2.69546V9.66112C1.22998 11.782 2.95218 13.5042 5.0731 13.5042H12.0388C12.198 13.5042 12.3508 13.441 12.4634 13.3284C12.576 13.2158 12.6393 13.063 12.6393 12.9038C12.6393 12.7445 12.576 12.5918 12.4634 12.4791C12.3508 12.3665 12.198 12.3033 12.0388 12.3033H5.0731C4.37251 12.3028 3.70075 12.0243 3.20535 11.5289C2.70996 11.0335 2.43143 10.3617 2.43096 9.66112V2.69546Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Video Preview Content */}
                  <div className="p-2 text-white h-full">
                    <div className="h-full flex flex-col">
                      {/* Video Container */}
                      <div
                        className="flex-1 bg-black/20 rounded-lg overflow-hidden relative"
                        style={{ minHeight: "200px" }}
                      >
                        {videoUrl.includes("youtube.com") ||
                        videoUrl.includes("youtu.be") ? (
                          <iframe
                            src={
                              videoUrl.includes("youtu.be")
                                ? `https://www.youtube.com/embed/${
                                    videoUrl
                                      .split("youtu.be/")[1]
                                      ?.split("?")[0]
                                  }`
                                : `https://www.youtube.com/embed/${
                                    videoUrl.split("v=")[1]?.split("&")[0]
                                  }`
                            }
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : videoUrl.includes("instagram.com") ? (
                          <div
                            className="w-full h-full flex flex-col bg-gradient-to-br from-purple-500 to-pink-500 cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                            onClick={() => window.open(videoUrl, "_blank")}
                          >
                            {/* Instagram Content Preview */}
                            <div className="flex-1 flex items-center justify-center p-4">
                              <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-3 mx-auto">
                                  <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="white"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                                <p className="text-white text-sm font-medium mb-1">
                                  Instagram Post
                                </p>
                                <p className="text-white/70 text-xs">
                                  Tap to view on Instagram
                                </p>
                              </div>
                            </div>

                            {/* Instagram Footer */}
                            <div className="flex items-center justify-between p-3 border-t border-white/20">
                              <div className="flex items-center space-x-4">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="white"
                                >
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="white"
                                >
                                  <path d="M21.99 4c0-1.1-.89-2-2-2L4 2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                                </svg>
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="white"
                                >
                                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                                </svg>
                              </div>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="white"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            </div>
                          </div>
                        ) : videoUrl.includes("vimeo.com") ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${
                              videoUrl.split("vimeo.com/")[1]?.split("?")[0]
                            }`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        ) : videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video
                            src={videoUrl}
                            className="w-full h-full object-cover"
                            controls
                            preload="metadata"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
                            onClick={() => window.open(videoUrl, "_blank")}
                          >
                            <div className="text-center">
                              <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="white"
                                className="mx-auto mb-2"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                              <p className="text-white text-sm">
                                Video Preview
                              </p>
                              <p className="text-xs opacity-75 mt-1 break-all">
                                {videoUrl}
                              </p>
                              <p className="text-xs opacity-50 mt-2">
                                Click to open
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video Info Display */}
                      <div className="text-center mt-2">
                        <h3 className="text-white text-sm font-medium mb-8">
                          {}
                        </h3>
                        <p className="text-white/70 text-xs break-all">{}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty State */
                <div className=" flex flex-col items-center justify-center h-full">
                  {/* File Broken Icon */}
                  <svg
                    width="73"
                    height="73"
                    viewBox="0 0 73 73"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.77051 30.0243C8.77051 29.4271 8.53326 28.8543 8.11096 28.432C7.68866 28.0097 7.1159 27.7725 6.51868 27.7725C5.92146 27.7725 5.3487 28.0097 4.9264 28.432C4.5041 28.8543 4.26685 29.4271 4.26685 30.0243H8.77051ZM64.3157 42.0341C64.3157 42.6313 64.5529 43.2041 64.9752 43.6264C65.3975 44.0487 65.9703 44.2859 66.5675 44.2859C67.1647 44.2859 67.7375 44.0487 68.1598 43.6264C68.5821 43.2041 68.8193 42.6313 68.8193 42.0341H64.3157ZM4.58211 17.7954C4.52398 18.3898 4.70437 18.983 5.08359 19.4444C5.46282 19.9059 6.00981 20.1978 6.60425 20.2559C7.19868 20.314 7.79187 20.1336 8.2533 19.7544C8.71473 19.3752 9.00662 18.8282 9.06475 18.2337L4.58211 17.7954ZM68.5041 54.263C68.5328 53.9687 68.5034 53.6716 68.4173 53.3886C68.3313 53.1057 68.1903 52.8425 68.0026 52.614C67.8148 52.3855 67.5839 52.1962 67.3229 52.057C67.062 51.9178 66.7763 51.8313 66.4819 51.8025C66.1876 51.7737 65.8905 51.8032 65.6075 51.8893C65.3246 51.9753 65.0613 52.1162 64.8329 52.304C64.3714 52.6832 64.0795 53.2302 64.0214 53.8247L68.5041 54.263ZM42.548 63.8018H30.5382V68.3054H42.548V63.8018ZM8.77051 42.0341V30.0243H4.26685V42.0341H8.77051ZM64.3157 40.722V42.0341H68.8193V40.722H64.3157ZM45.2231 13.8442L57.1098 24.5419L60.1213 21.1911L48.2376 10.4935L45.2231 13.8442ZM68.8193 40.722C68.8193 35.6509 68.8643 32.4383 67.5883 29.568L63.472 31.4024C64.2706 33.1979 64.3157 35.2546 64.3157 40.722H68.8193ZM57.1098 24.5419C61.1721 28.1988 62.6733 29.61 63.472 31.4024L67.5883 29.568C66.3093 26.6946 63.8923 24.5839 60.1213 21.1911L57.1098 24.5419ZM30.6283 8.25664C35.3781 8.25664 37.1706 8.29267 38.7649 8.90516L40.3802 4.70175C37.8221 3.71695 35.0359 3.75298 30.6283 3.75298V8.25664ZM48.2376 10.4965C44.9769 7.56307 42.9383 5.68054 40.3802 4.70175L38.7679 8.90516C40.3652 9.51766 41.7103 10.6826 45.2231 13.8442L48.2376 10.4965ZM30.5382 63.8018C24.8125 63.8018 20.7472 63.7958 17.6577 63.3814C14.6403 62.9761 12.8989 62.2135 11.6288 60.9435L8.44625 64.126C10.6921 66.3779 13.5414 67.3717 17.0602 67.8461C20.5131 68.3114 24.9417 68.3054 30.5382 68.3054V63.8018ZM4.26685 42.0341C4.26685 47.6306 4.26084 52.0562 4.72622 55.512C5.20061 59.0309 6.19742 61.8802 8.44324 64.129L11.6258 60.9465C10.3588 59.6734 9.59618 57.932 9.19085 54.9116C8.77652 51.828 8.77051 47.7597 8.77051 42.0341H4.26685ZM42.548 68.3054C48.1445 68.3054 52.5701 68.3114 56.0259 67.8461C59.5448 67.3717 62.3941 66.3749 64.6429 64.129L61.4603 60.9465C60.1873 62.2135 58.4459 62.9761 55.4254 63.3814C52.3419 63.7958 48.2736 63.8018 42.548 63.8018V68.3054ZM30.6283 3.75298C24.9987 3.75298 20.5521 3.74697 17.0843 4.21235C13.5504 4.68673 10.6921 5.68354 8.44324 7.92937L11.6258 11.112C12.8989 9.84493 14.6433 9.08231 17.6818 8.67698C20.7833 8.26264 24.8726 8.25664 30.6283 8.25664V3.75298ZM9.06475 18.2337C9.42804 14.5287 10.2117 12.5291 11.6288 11.115L8.44625 7.93237C5.93621 10.4364 4.98443 13.6941 4.58211 17.7954L9.06475 18.2337ZM64.0214 53.8247C63.6581 57.5297 62.8715 59.5293 61.4573 60.9435L64.6399 64.126C67.15 61.622 68.1017 58.3644 68.5041 54.263L64.0214 53.8247Z"
                      fill="#4596FF"
                    />
                    <path
                      d="M39.5457 7.50574V15.0118C39.5457 22.0886 39.5457 25.6285 41.7434 27.8263C43.9412 30.024 47.4811 30.024 54.5579 30.024H66.5676"
                      stroke="#4596FF"
                      strokeWidth="4.50366"
                    />
                    <g clipPath="url(#clip0_62_677)">
                      <path
                        d="M18.5284 44.6761C13.7522 44.6761 9.88135 48.547 9.88135 53.3232C9.88135 58.0993 13.7522 61.9702 18.5284 61.9702C23.3045 61.9702 27.1754 58.0993 27.1754 53.3232C27.1754 48.547 23.3045 44.6761 18.5284 44.6761ZM12.0431 53.3232C12.0431 49.7394 14.948 46.8379 18.5284 46.8379C19.9504 46.8379 21.2643 47.3007 22.3317 48.0775L13.2827 57.1265C12.5059 56.0591 12.0431 54.7452 12.0431 53.3232ZM18.5284 59.8084C17.1063 59.8084 15.7924 59.3457 14.725 58.5688L23.774 49.5198C24.5509 50.5906 25.0136 51.9011 25.0136 53.3232C25.0136 56.907 22.1088 59.8084 18.5284 59.8084Z"
                        fill="#1279FF"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_62_677">
                        <rect
                          width="17.2941"
                          height="17.2941"
                          fill="white"
                          transform="translate(9.88135 44.6761)"
                        />
                      </clipPath>
                    </defs>
                  </svg>

                  {/* Description Text */}
                  <p
                    className="text-center px-8 mt-4"
                    style={{
                      fontWeight: 500,
                      fontSize: "11.53px",
                      lineHeight: "120%",
                      letterSpacing: "0%",
                      color: "var(--video-collection-text-secondary)",
                    }}
                  >
                    Use this board as your moodboard or research space. Paste
                    videos, audio files, images, documents, or text and
                    they&apos;ll be automatically routed to the appropriate
                    component.
                  </p>

                  {/* Add Video Button */}
                  <button
                    onClick={() => {
                      setIsVideoPopup(true);
                    }}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Add Video URL
                  </button>
                </div>
              )}

              {/* Bottom Center Ellipse - Draggable */}
              <div
                className="absolute cursor-move drag-handle"
                data-draggable="true"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{
                  width: "23.06px",
                  height: "23.06px",
                  top: "204.5px",
                  left: "226.26px",
                  background: "var(--video-collection-bg)",
                  border: "0.72px solid var(--video-collection-border)",
                  borderRadius: "50%",
                  boxShadow:
                    "0px 0px 5.76px 0px var(--video-collection-shadow)",
                }}
              />

              {/* Bottom Right Ellipse - Draggable */}
              <div
                className="absolute cursor-move drag-handle"
                data-draggable="true"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                style={{
                  bottom: "-10px",
                  right: "-10px",
                }}
              >
                <svg
                  width="9"
                  height="11"
                  viewBox="0 0 9 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.79841 0.6123C8.09939 0.52497 8.41641 0.697898 8.48094 1.00458C8.68701 1.98387 8.69713 2.99625 8.50856 3.98288C8.28442 5.15567 7.78589 6.25876 7.05374 7.20196C6.32159 8.14516 5.3766 8.9017 4.29604 9.40971C3.38701 9.83708 2.40375 10.0784 1.40395 10.1216C1.09084 10.1352 0.844695 9.87092 0.854648 9.55768C0.864602 9.24444 1.12701 9.00119 1.43991 8.9835C2.26042 8.93712 3.06628 8.73377 3.81318 8.38263C4.73165 7.95082 5.53489 7.30777 6.15722 6.50604C6.77954 5.70432 7.20329 4.7667 7.39382 3.76982C7.54875 2.95917 7.54588 2.12806 7.38732 1.32168C7.32685 1.01417 7.49742 0.699631 7.79841 0.6123Z"
                    fill="#1279FF"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Paste Dropdown */}
        <MobilePasteDropdown
          isVisible={showMobilePasteDropdown}
          position={mobilePastePosition}
          onClose={handleCloseMobilePasteDropdown}
          onPasteAudio={handlePasteAudio}
          onPasteImage={handlePasteImage}
          onPasteVideo={handlePasteVideo}
          onPasteDocument={handlePasteDocument}
          onPasteText={handlePasteText}
        />
      </div>

      <Modal
        isOpen={isVideoPopup}
        onClose={() => setIsVideoPopup(false)}
        closeOnEscape
        showCloseButton
        size="md"
        title="YouTube, Vimeo, Instagram, Facebook, TikTok, Twitter, or direct video link"
      >
        <div className="flex flex-col w-full items-center gap-4">
          <TextField
            value={url}
            onChange={(e) => setUrl(e)}
            label="Enter Url"
            onEnter={showVideo}
          />
          <Button onClick={showVideo} variant="gradient" className="w-full">
            Submit
          </Button>
        </div>
      </Modal>
    </>
  );
}
