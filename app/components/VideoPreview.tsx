"use client";

import { VideoItem } from "@/app/models/interfaces";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import DeleteIcon from "./icons/DeleteIcon";
import EditIcon from "./icons/EditIcon";

type VideoPreviewProps = {
  id?: string;
  file?: File | null;
  src?: string | null;
  uploadedBlobUrl?: string | null;
  type?: VideoItem["type"] | string | null;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
};

export default function VideoPreview({
  id,
  file,
  src,
  uploadedBlobUrl,
  type,
  className,
  style,
  onClose,
}: VideoPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const handleClose = () => {
    // If we have an id, dispatch the removeComponent event for backend deletion
    if (id) {
      console.log(
        "VideoPreview dispatching removeComponent event with id:",
        id
      );
      const removeEvent = new CustomEvent("removeComponent", {
        detail: { componentId: id },
      });
      window.dispatchEvent(removeEvent);
    } else if (onClose) {
      // Fallback to onClose prop if no id
      console.log("VideoPreview using onClose callback");
      onClose();
    }
  };

  const isDirectVideoUrl = useMemo(() => {
    const candidate = uploadedBlobUrl || src;
    if (!candidate) return false;
    return /\.(mp4|webm|ogg|mov|m4v|wmv|flv)$/i.test(candidate.split("?")[0]);
  }, [src, uploadedBlobUrl]);

  const embedPlatforms = useMemo(
    () => ["youtube", "vimeo", "instagram", "facebook", "tiktok", "twitter"],
    []
  );

  // Detect platform from URL or type
  const detectedPlatform = useMemo(() => {
    if (type && embedPlatforms.includes(type)) return type;
    if (!src) return null;

    if (/youtube\.com|youtu\.be/i.test(src)) return "youtube";
    if (/vimeo\.com/i.test(src)) return "vimeo";
    if (/instagram\.com/i.test(src)) return "instagram";
    if (/facebook\.com/i.test(src)) return "facebook";
    if (/tiktok\.com/i.test(src)) return "tiktok";
    if (/twitter\.com|x\.com/i.test(src)) return "twitter";

    return null;
  }, [src, type, embedPlatforms]);

  // Platform styling configuration
  const platformConfig = useMemo(() => {
    const configs: Record<
      string,
      { bg: string; headerBg: string; icon: string }
    > = {
      instagram: {
        bg: "#FDF2F8", // Light pink
        headerBg: "#E6486B", // Instagram pink
        icon: "/insta-logo.svg",
      },
      youtube: {
        bg: "#FEF2F2", // Light red
        headerBg: "#fcb7b7", // YouTube red
        icon: "/yt-logo.svg",
      },
      facebook: {
        bg: "#EFF6FF", // Light blue
        headerBg: "#2c5b98", // Facebook blue
        icon: "/fb-logo.svg",
      },
      tiktok: {
        bg: "#000000", // Dark like logo
        headerBg: "#1c1417", // TikTok pink
        icon: "/tiktok-logo.svg",
      },
      direct: {
        bg: "#F8F9FA",
        headerBg: "#6B7280",
        icon: "/file.svg",
      },
      vimeo: {
        bg: "#F0F9FF", // Light cyan
        headerBg: "#1AB7EA", // Vimeo blue
        icon: "🎬",
      },
      twitter: {
        bg: "#F0F9FF", // Light cyan
        headerBg: "#1DA1F2", // Twitter blue
        icon: "🐦",
      },
    };
    return (
      configs[detectedPlatform || ""] || {
        bg: "#F8F9FA",
        headerBg: "#FF6B7A",
        icon: "📷",
      }
    );
  }, [detectedPlatform]);

  useEffect(() => {
    if (file) {
      try {
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => {
          URL.revokeObjectURL(url);
          setObjectUrl(null);
        };
      } catch {
        setObjectUrl(null);
      }
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const shouldUseVideoTag =
    !!file || !!uploadedBlobUrl || isDirectVideoUrl || false;

  const videoSource =
    objectUrl || uploadedBlobUrl || (isDirectVideoUrl ? src! : null);

  const iframeSrc = (() => {
    if (!src) return null;
    if (type && embedPlatforms.includes(type)) return src;
    if (
      /\/embed\/|player\.vimeo\.com|facebook\.com\/plugins|instagram\.com\/p\/|instagram\.com\/reel|tiktok\.com\/embed|twitframe\.com/i.test(
        src
      )
    )
      return src;
    const yt = src.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{6,})/
    );
    if (yt && yt[1]) {
      return `https://www.youtube.com/embed/${yt[1]}`;
    }
    const v = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (v && v[1]) return `https://player.vimeo.com/video/${v[1]}`;
    if (!isDirectVideoUrl) return src;
    return null;
  })();

  // If neither videoSource nor iframeSrc, show fallback UI
  if (!videoSource && !iframeSrc) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          color: "#fff",
          padding: 12,
          borderRadius: 8,
          minHeight: 160,
          ...style,
        }}
      >
        <div>Preview unavailable</div>
      </div>
    );
  }

  // Main card container exactly matching screenshot
  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    background: platformConfig.bg,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    ...style,
  };

  // Header overlay at the top with platform color
  const headerOverlayStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    background: `linear-gradient(135deg, ${platformConfig.headerBg} 0%, ${platformConfig.headerBg} 100%)`,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  };

  // Left side with icon and text
  const headerLeftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flex: 1,
  };

  const iconStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const textStyle: React.CSSProperties = {
    color: "white",
    fontSize: 15,
    fontWeight: 500,
    letterSpacing: "-0.01em",
  };

  // Right side action buttons
  const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: 8,
  };

  const actionButtonStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 1)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    color: "white",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  };

  // Content area with video/image
  const isSocialVideo =
    detectedPlatform &&
    ["instagram", "tiktok", "facebook"].includes(detectedPlatform);
  const contentStyle: React.CSSProperties = {
    width: "100%",
    height: isSocialVideo ? 520 : 320,
    position: "relative",
    background: "#000",
    overflow: isSocialVideo ? "auto" : "hidden",
  };

  const mediaStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    border: 0,
    display: "block",
  };

  if (shouldUseVideoTag && videoSource) {
    return (
      <div className={className} style={cardStyle}>
        {/* Header Overlay */}
        <div style={headerOverlayStyle}>
          <div style={headerLeftStyle}>
            <div style={iconStyle}>
              {platformConfig.icon.startsWith("/") ? (
                <Image
                  src={platformConfig.icon}
                  width={18}
                  height={18}
                  alt={detectedPlatform || "video"}
                />
              ) : (
                <span>{platformConfig.icon}</span>
              )}
            </div>
            <span style={textStyle}>
              {detectedPlatform
                ? detectedPlatform.charAt(0).toUpperCase() +
                  detectedPlatform.slice(1)
                : "Video"}
            </span>
          </div>
          <div style={actionsStyle}>
            {detectedPlatform === "direct" ? (
              <>
                <button
                  onClick={handleClose}
                  style={{
                    ...actionButtonStyle,
                    background: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <DeleteIcon size={20} color="white" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  style={{
                    ...actionButtonStyle,
                    background: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <DeleteIcon size={20} color="white" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Video Content */}
        <div className="p-2" style={contentStyle}>
          <video src={videoSource} controls playsInline style={mediaStyle} />
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={cardStyle}>
      {/* Header Overlay */}
      <div style={headerOverlayStyle}>
        <div style={headerLeftStyle}>
          <div style={iconStyle}>
            {platformConfig.icon.startsWith("/") ? (
              <Image
                src={platformConfig.icon}
                width={18}
                height={18}
                alt={detectedPlatform || "video"}
              />
            ) : (
              <span>{platformConfig.icon}</span>
            )}
          </div>
          <span style={textStyle}>
            {detectedPlatform
              ? detectedPlatform.charAt(0).toUpperCase() +
                detectedPlatform.slice(1)
              : "Video"}
          </span>
        </div>
        <div style={actionsStyle}>
          {detectedPlatform === "direct" ? (
            <>
              <button
                onClick={handleClose}
                style={{
                  ...actionButtonStyle,
                  background: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <DeleteIcon size={20} color="white" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleClose}
                style={{
                  ...actionButtonStyle,
                  background: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <DeleteIcon size={20} color="white" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Iframe Content */}
      <div style={contentStyle}>
        <iframe
          src={iframeSrc || undefined}
          title="video-preview-embed"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={mediaStyle}
        />
      </div>
    </div>
  );
}
