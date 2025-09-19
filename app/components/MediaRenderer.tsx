"use client";
import React from "react";

interface MediaRendererProps {
  url: string;
  className?: string;
}

const MediaRenderer: React.FC<MediaRendererProps> = ({ url, className }) => {
  // Check if it's a video (basic check by extension or YouTube/Vimeo embed)
  const isVideo =
    url.match(/\.(mp4|webm|ogg)$/i) ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com");

  // YouTube embed handler
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return (
      <iframe
        className={className}
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Vimeo embed handler
  if (url.includes("vimeo.com")) {
    const videoId = url.split("/").pop();
    return (
      <iframe
        className={className}
        width="560"
        height="315"
        src={`https://player.vimeo.com/video/${videoId}`}
        title="Vimeo video player"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // Direct video file
  if (isVideo) {
    return (
      <video className={className} controls width="100%">
        <source src={url} />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Default -> Image
  return <img src={url} alt="media" className={className} />;
};

export default MediaRenderer;
