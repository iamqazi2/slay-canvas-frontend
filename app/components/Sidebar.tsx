"use client";
import React, { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GlobeIcon,
  FileIcon,
  FolderIcon,
  WifiIcon,
  NotificationIcon,
  UserIcon,
  TrashIcon,
  LockIcon,
  GridIconNew,
  SocialMediaIcon,
} from "./icons";
import ImageCollection from "./ImageCollection";
import AudioPlayer from "./AudioPlayer";
import VideoCollection from "./VideoCollection";
import PdfDocument from "./PdfDocument";
import TextCollection from "./TextCollection";
import WikipediaLink from "./WikipediaLink";
import { StoreTypes, VideoItem } from "@/app/models/interfaces";
import VideoModal from "./modals/VideoModal";
import ImageModal from "./modals/ImageModal";
import AudioModal from "./modals/AudioModal";
import DocumentModal from "./modals/DocumentModal";
import WikipediaModal from "./modals/WikipediaModal";
import TextModal from "./modals/TextModal";
import WebLinkModal from "./modals/WebLinkModal";
import {
  setHasContent,
  setVideoCollection,
  setVideoUrl,
} from "@/app/redux/slices/videoSlice";

type SidebarProps = {
  onChatClick: () => void;
};

export default function Sidebar({ onChatClick }: SidebarProps) {
  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // State for managing which components are visible and their data
  const [visibleComponents, setVisibleComponents] = useState<{
    imageCollection: boolean;
    audioPlayer: boolean;
    videoCollection: boolean;
    pdfDocument: boolean;
    wikipediaLink: boolean;
    text: boolean;
  }>({
    imageCollection: false,
    audioPlayer: false,
    videoCollection: false,
    pdfDocument: false,
    wikipediaLink: false,
    text: false,
  });

  const [componentData, setComponentData] = useState<{
    imageFiles?: File[];
    audioFile?: File;
    videoFile?: File;
    documentFile?: File;
    textContent?: string;
  }>({});

  const [isVideoPopup, setIsVideoPopup] = useState(false);
  const [isImagePopup, setIsImagePopup] = useState(false);
  const [isAudioPopup, setIsAudioPopup] = useState(false);
  const [isDocumentPopup, setIsDocumentPopup] = useState(false);
  const [isWikipediaPopup, setIsWikipediaPopup] = useState(false);
  const [isWebLinkPopup, setIsWebLinkPopup] = useState(false);
  const [isTextPopup, setIsTextPopup] = useState(false);
  const [url, setUrl] = useState("");
  const [wikiUrl, setWikiUrl] = useState("");
  const [webLinkUrl, setWebLinkUrl] = useState("");
  const [textContent, setTextContent] = useState("");

  const dispatch = useDispatch();

  const videoProvider = useSelector(
    (state: StoreTypes) => state.videCollectionSlice
  );

  const { videos } = videoProvider;

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
          detail: { componentType: "imageCollection", data: { files: validFiles } },
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

  const handleVideoFileChange = (files: File[]) => {
    const file = files[0];
    if (file && file.type.startsWith("video/")) {
      setComponentData((prev) => ({ ...prev, videoFile: file }));
      setVisibleComponents((prev) => ({ ...prev, videoCollection: true }));
      setIsVideoPopup(false);
      // Dispatch to dashboard
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: { componentType: "videoCollection", data: { file } },
        })
      );
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
      handleVideoFileChange([file]);
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

  const showWikipedia = () => {
    setComponentData((prev) => ({ ...prev, textContent: wikiUrl.trim() }));
    setVisibleComponents((prev) => ({ ...prev, wikipediaLink: true }));
    setIsWikipediaPopup(false);
    // Dispatch to dashboard
    window.dispatchEvent(
      new CustomEvent("createComponent", {
        detail: { componentType: "wikipediaLink", data: { text: wikiUrl.trim() } },
      })
    );
  };

  const showWebLink = () => {
    setComponentData((prev) => ({ ...prev, textContent: webLinkUrl.trim() }));
    setVisibleComponents((prev) => ({ ...prev, wikipediaLink: true }));
    setIsWebLinkPopup(false);
    // Dispatch to dashboard
    window.dispatchEvent(
      new CustomEvent("createComponent", {
        detail: { componentType: "wikipediaLink", data: { text: webLinkUrl.trim() } },
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
      // Dispatch to dashboard
      window.dispatchEvent(
        new CustomEvent("createComponent", {
          detail: { componentType: "videoCollection", data: { text: url.trim() } },
        })
      );
    }
  };

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
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => {
                // const url = prompt(
                //   "Enter video URL (YouTube, Vimeo, Instagram, Facebook, TikTok, Twitter, or direct video link):"
                // );
                // if (url && url.trim()) {
                //   const video = createVideoFromUrl(url.trim());
                //   addVideo(video);
                // }

                setIsVideoPopup(true);
              }}
            >
              <SocialMediaIcon size={24} className="sm:w-8 sm:h-8" />
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

            {/* Folder Icon - Video Collection */}
            <div
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => {
                setVisibleComponents((prev) => ({
                  ...prev,
                  videoCollection: true,
                }));
              }}
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
          setUrl(submittedUrl);
          showVideo();
        }}
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
          showWikipedia();
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
          setWebLinkUrl(submittedUrl);
          showWebLink();
        }}
      />

      <TextModal
        isOpen={isTextPopup}
        onClose={() => setIsTextPopup(false)}
        onSubmit={(submittedText) => {
          showText(submittedText);
        }}
      />
    </>
  );
}
