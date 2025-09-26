"use client";
import React, { useState, useRef, useEffect } from "react";
import { EditIcon, DeleteIcon } from "./icons";
import { useToast } from "./ui/Toast";
import ConfirmationModal from "./modals/ConfirmationModal";

interface TextCollectionProps {
  className?: string;
  id?: string;
  initialData?: { text: string };
  onClose?: () => void;
  inline?: boolean;
}

const TextCollection: React.FC<TextCollectionProps> = ({
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
  const [textContent, setTextContent] = useState<string>(
    initialData?.text || ""
  );
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
    if (initialData?.text) {
      setTextContent(initialData.text);
    }
  }, [initialData]);

  const handleDelete = (): void => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (): void => {
    // Check if this is a sidebar component or has onClose prop
    if (id === "sidebar-text-collection" || onClose) {
      console.log(
        "TextCollection is sidebar component or has onClose prop, calling onClose"
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

  // Text Icon
  const TextIcon: React.FC = () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.66699 7.00004C4.66699 5.76236 5.15765 4.57538 6.03282 3.70021C6.90799 2.82504 8.09497 2.33337 9.33266 2.33337H18.6667C19.9043 2.33337 21.0913 2.82504 21.9665 3.70021C22.8417 4.57538 23.3333 5.76236 23.3333 7.00004V21C23.3333 22.2377 22.8417 23.4247 21.9665 24.2999C21.0913 25.175 19.9043 23.9522 18.6667 23.9522H9.33266C8.09497 23.9522 6.90799 25.175 6.03282 24.2999C5.15765 23.4247 4.66699 22.2377 4.66699 21V7.00004Z"
        fill="white"
        stroke="#12A4FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33301 9.33337H18.6663M9.33301 14H18.6663M9.33301 18.6667H14.6663"
        stroke="#12A4FF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

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
              height: "min(200px, 40vh)",
              maxWidth: "300px",
              maxHeight: "200px",
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
          {/* Left side - Text icon and title */}
          <div className="flex items-center gap-3">
            <TextIcon />
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
              Text Content
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
          {textContent ? (
            <div className="space-y-2">
              <div
                className="text-xs text-gray-600 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded"
                style={{
                  fontFamily: "Urbanist, sans-serif",
                  fontSize: "14px",
                  lineHeight: "140%",
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                }}
              >
                {textContent}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              No text content
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Text Collection"
        message="Are you sure you want to close this text collection? This will remove the current content."
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default TextCollection;
