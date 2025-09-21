"use client";
import React, { useState, useRef, useEffect } from "react";
import { EditIcon, DeleteIcon } from "./icons";

interface ImageItem {
  id: string;
  title: string;
  thumbnail: string;
}

interface ImageCollectionProps {
  id?: string;
  className?: string;
  initialData?: { files: File[] };
  onClose?: () => void;
  inline?: boolean;
}

const ImageCollection: React.FC<ImageCollectionProps> = ({
  id,
  className = "",
  initialData,
  onClose,
  inline = false,
}) => {
  // id is used for React key in parent component
  const [images, setImages] = useState<ImageItem[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 70 }); // Percentage values (10% from left, 60% from top)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const PhotosIcon: React.FC = () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.33301 7.00004C2.33301 5.76236 2.82467 4.57538 3.69984 3.70021C4.57501 2.82504 5.762 2.33337 6.99967 2.33337H20.9997C22.2373 2.33337 23.4243 2.82504 24.2995 3.70021C25.1747 4.57538 25.6663 5.76236 25.6663 7.00004V21C25.6663 22.2377 25.1747 23.4247 24.2995 24.2999C23.4243 25.175 22.2373 25.6667 20.9997 25.6667H6.99967C5.762 25.6667 4.57501 25.175 3.69984 24.2999C2.82467 23.4247 2.33301 22.2377 2.33301 21V7.00004Z"
        fill="white"
        stroke="#244785"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.91667 12.8333C11.5275 12.8333 12.8333 11.5275 12.8333 9.91667C12.8333 8.30584 11.5275 7 9.91667 7C8.30584 7 7 8.30584 7 9.91667C7 11.5275 8.30584 12.8333 9.91667 12.8333Z"
        fill="white"
        stroke="#244785"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.947 14.7245L7 25.6667H21.1552C22.3517 25.6667 23.4992 25.1914 24.3453 24.3453C25.1914 23.4992 25.6667 22.3517 25.6667 21.1552V21C25.6667 20.4564 25.4625 20.2475 25.095 19.845L20.3933 14.7175C20.1742 14.4785 19.9077 14.2878 19.6107 14.1575C19.3137 14.0272 18.9929 13.9603 18.6686 13.9609C18.3444 13.9616 18.0238 14.0298 17.7274 14.1613C17.4309 14.2928 17.1652 14.4846 16.947 14.7245Z"
        fill="white"
        stroke="#244785"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (inline) return;
      // Only allow dragging from the header area or ellipses
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
      // Only allow dragging from the header area or ellipses
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
    if (initialData?.files && initialData.files.length > 0) {
      const newImages = initialData.files
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => ({
          id: Date.now().toString() + Math.random(),
          title: file.name,
          thumbnail: URL.createObjectURL(file),
        }));
      setImages(newImages);
    }
  }, [initialData]);

  // Handle routed image files from VideoCollection (for backward compatibility)
  useEffect(() => {
    const handleImageFilePasted = (event: CustomEvent) => {
      const file = event.detail.file;
      if (file && file.type.startsWith("image/")) {
        // Create a new image item
        const newImage = {
          id: Date.now().toString(),
          title: file.name,
          thumbnail: URL.createObjectURL(file),
        };

        // Update the images state
        setImages((prevImages) => [...prevImages, newImage]);
      }
    };

    window.addEventListener(
      "imageFilePasted",
      handleImageFilePasted as EventListener
    );
    return () =>
      window.removeEventListener(
        "imageFilePasted",
        handleImageFilePasted as EventListener
      );
  }, []);

  const handleEdit = (imageId: string): void => {
    // Trigger file input to replace the image
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.type.startsWith("image/")) {
        // Clean up old thumbnail URL
        const oldImage = images.find((img) => img.id === imageId);
        if (oldImage && oldImage.thumbnail.startsWith("blob:")) {
          URL.revokeObjectURL(oldImage.thumbnail);
        }

        const updatedImage = {
          id: imageId,
          title: file.name,
          thumbnail: URL.createObjectURL(file),
        };
        setImages((prevImages) =>
          prevImages.map((img) => (img.id === imageId ? updatedImage : img))
        );
      }
    };
    input.click();
  };

  const handleCloseComponent = (): void => {
    console.log("ImageCollection handleCloseComponent called");
    // Clean up image URLs
    images.forEach((img) => {
      if (img.thumbnail.startsWith("blob:")) {
        URL.revokeObjectURL(img.thumbnail);
      }
    });

    // Check if this is a sidebar component or has onClose prop
    if (id === "sidebar-image-collection" || onClose) {
      console.log(
        "ImageCollection is sidebar component or has onClose prop, calling onClose"
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

  const handleImageClick = (image: ImageItem): void => {
    // Open the image in a new tab
    window.open(image.thumbnail, "_blank");
  };

  return (
    <div
      ref={containerRef}
      className={`${
        inline ? "relative" : "fixed z-20"
      } select-none rounded-xl p-1 ${className}`}
      style={
        inline
          ? {
              width: "100%",
              height: "100%",
              background: "#244785",
            }
          : {
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: "min(296px, 70vw)",
              height: "min(224px, 50vh)",
              maxWidth: "296px",
              maxHeight: "224px",
              opacity: 1,
              transform: "rotate(0deg)",
              background: "#244785",
            }
      }
      tabIndex={inline ? undefined : 0}
    >
      {/* Main Container */}
      <div className="relative w-full h-full">
        {images.map((image) => (
          <div key={image.id} className="shadow-lg">
            {/* Header - Draggable */}
            <div
              className="h-[44px] rounded-t-xl flex items-center justify-between px-[10px] py-[8px] drag-handle cursor-move"
              data-draggable="true"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{
                background: "#244785",
                boxShadow: "0px 0px 40px 0px #1E1E1E33",
              }}
            >
              <div className="flex items-center overflow-hidden gap-2">
                <PhotosIcon />
                <span className="text-white truncate font-medium text-[16px] leading-[100%]">
                  {image.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(image.id)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  style={{ pointerEvents: "auto" }}
                  title="Replace image"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("ImageCollection close button clicked");
                    handleCloseComponent();
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  style={{ pointerEvents: "auto" }}
                  title="Close image collection"
                >
                  <DeleteIcon />
                </button>
              </div>
            </div>

            {/* Image */}
            <div
              className="rounded-[10px] h-[172px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handleImageClick(image)}
              title="Click to open image in new tab"
            >
              <img
                src={image.thumbnail}
                alt={image.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCollection;
