"use client";
import { VideoItem } from "@/app/models/interfaces";
import { useCallback, useState } from "react";

const useVideo = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  // Utility functions for video processing
  const detectVideoType = (url: string): VideoItem["type"] => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("facebook.com") || url.includes("fb.watch")) return "facebook";
    if (url.includes("tiktok.com")) return "tiktok";
    if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
    if (url.match(/\.(mp4|avi|mov|wmv|flv|webm|ogg)$/i)) return "direct";
    return "other";
  };

  const generateVideoId = (): string => {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const addVideo = useCallback((video: VideoItem) => {
    setVideos((prev) => [...prev, video]);
  }, []);

  const removeVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== videoId));
  };

  const moveVideo = (fromIndex: number, toIndex: number) => {
    setVideos((prev) => {
      const newVideos = [...prev];
      const [movedVideo] = newVideos.splice(fromIndex, 1);
      newVideos.splice(toIndex, 0, movedVideo);
      return newVideos;
    });
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

  return {
    videos,
    addVideo,
    createVideoFromUrl,
    removeVideo,
    moveVideo,
    detectVideoType,
  };
};

export { useVideo };
