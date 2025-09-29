"use client";
import React, { useEffect, useRef, useState } from "react";
import { DeleteIcon, EditIcon } from "./icons";
import { useToast } from "./ui/Toast";
import ConfirmationModal from "./modals/ConfirmationModal";

interface WebLinkProps {
  className?: string;
  id?: string;
  initialData?: { text: string; url?: string };
  onClose?: () => void;
  inline?: boolean;
}

const WebLink: React.FC<WebLinkProps> = ({
  className = "",
  id,
  initialData,
  onClose,
  inline = false,
}) => {
  const { showToast } = useToast();

  // id is used for React key in parent component
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [position, setPosition] = useState({ x: 77, y: 70 }); // Percentage values (70% from left, 70% from top)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [textContent, setTextContent] = useState<string>("");
  const [linkUrl, setLinkUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (inline) return; // No dragging in inline mode
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-draggable="true"]') ||
        target.closest(".drag-handle")
      ) {
        e.preventDefault();
        setIsDragging(true);

        // Convert percentage position to pixels for drag calculation
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const currentXPixels = (position.x / 100) * viewportWidth;
        const currentYPixels = (position.y / 100) * viewportHeight;

        setDragStart({
          x: e.clientX - currentXPixels,
          y: e.clientY - currentYPixels,
        });
      }
    },
    [position, inline]
  );

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-draggable="true"]') ||
        target.closest(".drag-handle")
      ) {
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);

        // Convert percentage position to pixels for drag calculation
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const currentXPixels = (position.x / 100) * viewportWidth;
        const currentYPixels = (position.y / 100) * viewportHeight;

        setDragStart({
          x: touch.clientX - currentXPixels,
          y: touch.clientY - currentYPixels,
        });
      }
    },
    [position]
  );

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Convert to percentages
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const percentageX = (newX / viewportWidth) * 100;
        const percentageY = (newY / viewportHeight) * 100;

        setPosition({
          x: Math.max(0, Math.min(percentageX, 100)), // Clamp between 0-100%
          y: Math.max(0, Math.min(percentageY, 100)), // Clamp between 0-100%
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const newX = touch.clientX - dragStart.x;
        const newY = touch.clientY - dragStart.y;

        // Convert to percentages
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const percentageX = (newX / viewportWidth) * 100;
        const percentageY = (newY / viewportHeight) * 100;

        setPosition({
          x: Math.max(0, Math.min(percentageX, 100)), // Clamp between 0-100%
          y: Math.max(0, Math.min(percentageY, 100)), // Clamp between 0-100%
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false);
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
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Handle initial data when component is created
  useEffect(() => {
    if (initialData?.url) {
      setLinkUrl(initialData.url);
      setTextContent(initialData.text || initialData.url);
    } else if (initialData?.text) {
      const text = initialData.text;
      setTextContent(text);

      // If the text is already a URL, use it directly
      if (text.startsWith("http")) {
        setLinkUrl(text);
      } else {
        // For non-URL text, we can't create a valid link
        setLinkUrl("");
      }
    }
  }, [initialData]);

  const handleDelete = (): void => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (): void => {
    // Check if this is a sidebar component or has onClose prop
    if (id === "sidebar-web-link" || onClose) {
      console.log(
        "WebLink is sidebar component or has onClose prop, calling onClose"
      );
      if (onClose) {
        onClose();
      }
      return;
    }

    // Remove this component instance
    if (id) {
      const removeEvent = new CustomEvent("removeComponent", {
        detail: { componentId: id },
      });
      window.dispatchEvent(removeEvent);
    }
  };

  const handleOpen = (): void => {
    if (linkUrl) {
      window.open(linkUrl, "_blank");
    }
  };

  // Globe Icon
  const GlobeIcon: React.FC = () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.75 14C1.75 17.2489 3.04062 20.3647 5.33794 22.6621C7.63526 24.9594 10.7511 26.25 14 26.25C17.2489 26.25 20.3647 24.9594 22.6621 22.6621C24.9594 20.3647 26.25 17.2489 26.25 14C26.25 10.7511 24.9594 7.63526 22.6621 5.33794C20.3647 3.04062 17.2489 1.75 14 1.75C10.7511 1.75 7.63526 3.04062 5.33794 5.33794C3.04062 7.63526 1.75 10.7511 1.75 14Z"
        fill="white"
        stroke="#12A4FF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 14C8.75 10.7511 9.30312 7.63526 10.2877 5.33794C11.2723 3.04062 12.6076 1.75 14 1.75C15.3924 1.75 16.7277 3.04062 17.7123 5.33794C18.6969 7.63526 19.25 10.7511 19.25 14C19.25 17.2489 18.6969 20.3647 17.7123 22.6621C16.7277 24.9594 15.3924 26.25 14 26.25C12.6076 26.25 11.2723 24.9594 10.2877 22.6621C9.30312 20.3647 8.75 17.2489 8.75 14Z"
        fill="white"
        stroke="#12A4FF"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M2.625 18.0833H25.375H2.625ZM2.625 9.91663H25.375H2.625Z"
        fill="white"
      />
      <path
        d="M2.625 18.0833H25.375M2.625 9.91663H25.375"
        stroke="#12A4FF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );

  const getDisplayTitle = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return "Web Link";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${
        inline ? "relative w-full h-full" : "fixed select-none"
      } ${className}`}
      style={
        inline
          ? {}
          : {
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: "min(300px, 80vw)",
              height: "min(145px, 30vh)",
              maxWidth: "300px",
              maxHeight: "145px",
              opacity: 1,
              transform: "rotate(0deg)",
            }
      }
      tabIndex={0}
    >
      {/* Main Container */}
      <div
        className="relative w-full h-full"
        style={{
          background: "#12A4FF",
          borderRadius: "12px",
          padding: "2px",
          boxShadow: "0px 0px 40px 0px #1E1E1E33",
        }}
      >
        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between px-3 py-2 drag-handle cursor-move"
          data-draggable="true"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            height: "44px",
          }}
        >
          {/* Left side - Globe icon and title */}
          <div className="flex items-center gap-3">
            <GlobeIcon />
            <span
              className="text-white font-medium"
              style={{
                fontFamily: "Urbanist, sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "#FFFFFF",
              }}
            >
              Web Links
            </span>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              style={{ pointerEvents: "auto" }}
            >
              <DeleteIcon />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="px-3 py-2 bg-white"
          style={{
            minHeight: "56px",
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            borderRadius: "12px",
          }}
        >
          {linkUrl ? (
            <div className="space-y-2">
              <button
                onClick={handleOpen}
                className="text-left w-full overflow-hidden hover:bg-gray-50 rounded transition-colors p-2"
                style={{ pointerEvents: "auto" }}
              >
                <span
                  className="font-medium underline truncate"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textDecoration: "underline",
                    textDecorationStyle: "solid",
                    textDecorationThickness: "0%",
                    textDecorationSkipInk: "auto",
                    color: "#244785",
                    wordWrap: "break-word",
                    wordBreak: "break-all",
                    overflowWrap: "break-word",
                  }}
                >
                  {linkUrl}
                </span>
              </button>
              <div
                className="text-xs text-gray-600 max-h-16 overflow-y-auto bg-gray-50 p-2 rounded"
                style={{
                  fontFamily: "Urbanist, sans-serif",
                  fontSize: "12px",
                  lineHeight: "140%",
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                }}
              >
                {textContent && textContent !== linkUrl
                  ? textContent.length > 150
                    ? `${textContent.substring(0, 150)}...`
                    : textContent
                  : "Click to open link"}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4">
              <span style={{ fontSize: "14px" }}>No link data available</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Web Link"
        message="Are you sure you want to close this web link? This will remove the current content."
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default WebLink;
