"use client";

import { VideoItem } from "@/app/models/interfaces";
import Image from "next/image";
import React, { memo, useEffect, useMemo, useState } from "react";
import DeleteIcon from "./icons/DeleteIcon";

// Extend Window interface for third-party libraries
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    FB?: {
      XFBML: {
        parse: () => void;
      };
    };
  }
}

// Helper to load external script once
function loadScript(src: string, id?: string) {
  if (id && document.getElementById(id)) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    // check existing
    const existing = Array.from(document.scripts).find((s) => s.src === src);
    if (existing) return resolve();
    const s = document.createElement("script");
    if (id) s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(s);
  });
}

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

const VideoPreview = memo(function VideoPreview({
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

  // Simply use the props directly - no need for complex stable value system
  // that was causing re-render issues

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
    () => ["youtube", "vimeo", "instagram", "facebook", "twitter", "tiktok"],
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

    // If it's a direct video URL, mark as direct
    if (isDirectVideoUrl || file || uploadedBlobUrl) return "direct";

    return null;
  }, [src, type, embedPlatforms, isDirectVideoUrl, file, uploadedBlobUrl]);

  // Platform styling configuration
  const platformConfig = useMemo(() => {
    const configs: Record<
      string,
      { bg: string; headerBg: string; icon: string; iconFilter?: string }
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
    };
    return (
      configs[detectedPlatform || ""] || {
        bg: "#F8F9FA",
        headerBg: "#1AB7EA",
        icon: "/x.png",
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
        };
      } catch {
        setObjectUrl(null);
      }
    } else {
      // Clear objectUrl when file is removed
      setObjectUrl(null);
    }
  }, [file]); // Only depend on file, not objectUrl

  const shouldUseVideoTag = !!file || !!uploadedBlobUrl || isDirectVideoUrl;

  const videoSource = useMemo(() => {
    if (objectUrl) return objectUrl;
    if (uploadedBlobUrl) return uploadedBlobUrl;
    if (isDirectVideoUrl && src) return src;
    return null;
  }, [objectUrl, uploadedBlobUrl, isDirectVideoUrl, src]);

  // Build provider embed HTML (improved approach)
  // returns { type: 'iframe'|'html'|'fallback', htmlOrSrc }
  const embedPayload = useMemo(() => {
    if (!src) return null;

    // YouTube
    const yt = src.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([A-Za-z0-9_-]{6,})/
    );
    if (yt && yt[1]) {
      return {
        type: "iframe" as const,
        src: `https://www.youtube.com/embed/${yt[1]}`,
      };
    }

    // Vimeo
    const v = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (v && v[1])
      return {
        type: "iframe" as const,
        src: `https://player.vimeo.com/video/${v[1]}`,
      };

    // TikTok - prefer embed.js + blockquote snippet
    if (/tiktok\.com/i.test(src)) {
      const html = `<blockquote class="tiktok-embed" cite="${src}" data-video="${src}" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="TikTok" href="${src}"></a> </section></blockquote>`;
      return { type: "html" as const, html, provider: "tiktok" as const };
    }

    // Instagram
    if (/instagram\.com/i.test(src)) {
      const html = `<blockquote class="instagram-media" data-instgrm-permalink="${src}" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"></blockquote>`;
      return { type: "html" as const, html, provider: "instagram" as const };
    }

    // Twitter / X
    if (/twitter\.com|x\.com/i.test(src)) {
      const html = `<blockquote class="twitter-tweet" data-theme="light"><a href="${src}"></a></blockquote>`;
      return { type: "html" as const, html, provider: "twitter" as const };
    }

    // Facebook video/embed
    if (/facebook\.com/i.test(src)) {
      const html = `<div id="fb-root"></div><div class="fb-video" data-href="${src}" data-width="auto" data-show-text="false"></div>`;
      return { type: "html" as const, html, provider: "facebook" as const };
    }

    // If direct video url handled earlier; fallback to direct iframe try
    if (isDirectVideoUrl) {
      return { type: "iframe" as const, src: src }; // likely works for direct hosted files
    }

    return { type: "fallback" as const, href: src };
  }, [src, isDirectVideoUrl]);

  // Effect to load provider scripts when needed
  useEffect(() => {
    if (!embedPayload || embedPayload.type !== "html") return;

    const provider = embedPayload.provider;
    if (provider === "tiktok") {
      // TikTok embed script
      loadScript("https://www.tiktok.com/embed.js", "tiktok-embed-js").catch(
        () => {}
      );
    } else if (provider === "instagram") {
      loadScript("https://www.instagram.com/embed.js", "instagram-embed-js")
        .then(() => {
          // Instagram requires window.instgrm && window.instgrm.Embeds.process()
          // run it after script load
          if (
            window.instgrm &&
            window.instgrm.Embeds &&
            typeof window.instgrm.Embeds.process === "function"
          ) {
            window.instgrm.Embeds.process();
          }
        })
        .catch(() => {});
    } else if (provider === "twitter") {
      loadScript(
        "https://platform.twitter.com/widgets.js",
        "twitter-widgets-js"
      ).catch(() => {});
    } else if (provider === "facebook") {
      // Facebook SDK init (light)
      if (!document.getElementById("facebook-jssdk")) {
        const fb = document.createElement("script");
        fb.id = "facebook-jssdk";
        fb.src =
          "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v16.0";
        fb.async = true;
        document.body.appendChild(fb);
      } else {
        // reparse XFBML if already loaded
        if (
          window.FB &&
          window.FB.XFBML &&
          typeof window.FB.XFBML.parse === "function"
        ) {
          window.FB.XFBML.parse();
        }
      }
    }
  }, [embedPayload]);

  // Additional effect to ensure Instagram embeds are processed after render
  useEffect(() => {
    if (
      embedPayload?.type === "html" &&
      embedPayload?.provider === "instagram"
    ) {
      // Process Instagram embeds after a short delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (
          window.instgrm &&
          window.instgrm.Embeds &&
          typeof window.instgrm.Embeds.process === "function"
        ) {
          window.instgrm.Embeds.process();
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [embedPayload?.type, embedPayload?.html, embedPayload?.provider]); // Re-run when Instagram HTML changes

  // Memoize media style to prevent unnecessary re-renders
  const mediaStyle = useMemo(
    (): React.CSSProperties => ({
      width: "100%",
      height: "100%",
      objectFit: "cover",
      border: 0,
      display: "block",
    }),
    []
  );

  // Helper render function for embed content
  const renderEmbedContent = useMemo(() => {
    if (!embedPayload) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            width: "100%",
            height: "100%",
          }}
        >
          Preview unavailable
        </div>
      );
    }

    if (embedPayload.type === "iframe") {
      return (
        <iframe
          src={embedPayload.src}
          title="video-preview-embed"
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={mediaStyle}
        />
      );
    }

    if (embedPayload.type === "html") {
      // render provider HTML (blockquotes, etc)
      return (
        <div
          style={{ width: "100%", height: "100%", overflow: "auto" }}
          // render HTML snippet
          dangerouslySetInnerHTML={{ __html: embedPayload.html }}
        />
      );
    }

    // fallback: show link + thumbnail if possible
    return (
      <div
        style={{
          padding: 12,
          color: "#fff",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <a
          href={embedPayload.href}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#fff" }}
        >
          Open video
        </a>
      </div>
    );
  }, [embedPayload, mediaStyle]);

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
    ["instagram", "twitter", "facebook"].includes(detectedPlatform);
  const contentStyle: React.CSSProperties = {
    width: "100%",
    height: isSocialVideo ? 520 : 320,
    position: "relative",
    background: "#000",
    overflow: isSocialVideo ? "auto" : "hidden",
  };

  // Helper render function for video content
  const renderVideoContent = useMemo(() => {
    if (shouldUseVideoTag && videoSource) {
      return (
        <video
          src={videoSource}
          controls
          playsInline
          style={mediaStyle}
          key={videoSource} // Force re-render when source changes
        />
      );
    }

    return renderEmbedContent;
  }, [shouldUseVideoTag, videoSource, mediaStyle, renderEmbedContent]);

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
                style={
                  platformConfig.iconFilter
                    ? { filter: platformConfig.iconFilter }
                    : undefined
                }
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
          <button
            onClick={handleClose}
            style={{
              ...actionButtonStyle,
              background: "rgba(255, 255, 255, 0.2)",
            }}
          >
            <DeleteIcon size={20} color="white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>{renderVideoContent}</div>
    </div>
  );
});

export default VideoPreview;
