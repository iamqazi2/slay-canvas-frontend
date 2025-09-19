"use client";
import React, { useEffect, useRef } from "react";

interface OverlayPanelProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
  width?: string;
  maxHeight?: string;
  zIndex?: number;
}

const OverlayPanel: React.FC<OverlayPanelProps> = ({
  isVisible,
  onClose,
  children,
  className = "",
  position = "top-right",
  width = "w-96",
  maxHeight = "max-h-[85vh]",
  zIndex = 100,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when panel is open
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isVisible, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "flex items-start justify-end pt-20 pr-6";
      case "top-left":
        return "flex items-start justify-start pt-20 pl-6";
      case "bottom-right":
        return "flex items-end justify-end pb-20 pr-6";
      case "bottom-left":
        return "flex items-end justify-start pb-20 pl-6";
      case "center":
        return "flex items-center justify-center";
      default:
        return "flex items-start justify-end pt-20 pr-6";
    }
  };

  return (
    <div className={`fixed inset-0 ${getPositionClasses()}`} style={{ zIndex: zIndex }} aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-opacity-20" aria-hidden="true" onClick={handleBackdropClick} />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative bg-white rounded-2xl shadow-2xl ${width} ${maxHeight} overflow-hidden border border-gray-200 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default OverlayPanel;
