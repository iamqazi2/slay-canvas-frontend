"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { EditIcon, DeleteIcon, FolderIcon } from "./icons";
import {
  AudioPlayer,
  ImageCollection,
  PdfDocument,
  TextCollection,
  VideoPreview,
  WikipediaLink,
} from "./index";
import NewFolderIcon from "./icons/NewFolder";

interface AssetItem {
  id: string;
  type: string;
  title: string;
  data?: { file?: File; files?: File[]; text?: string };
}

interface FolderCollectionProps {
  id?: string;
  className?: string;
  initialData?: { name?: string; assets?: AssetItem[] };
  onClose?: () => void;
  inline?: boolean;
}

const FolderCollection: React.FC<FolderCollectionProps> = ({
  id,
  className = "",
  initialData,
  onClose,
  inline = false,
}) => {
  const [name, setName] = useState(initialData?.name || "Collection");
  const [assets, setAssets] = useState<AssetItem[]>(initialData?.assets || []);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 70 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const renderAssetComponent = (asset: AssetItem) => {
    const getAssetWidth = (type: string) => {
      switch (type) {
        case "videoCollection":
          return "400px";
        case "imageCollection":
          return "296px";
        case "audioPlayer":
          return "400px";
        case "pdfDocument":
          return "300px";
        case "wikipediaLink":
          return "300px";
        case "text":
          return "300px";
        default:
          return "300px";
      }
    };

    const component = (() => {
      switch (asset.type) {
        case "videoCollection":
          return (
            <VideoPreview
              key={asset.id}
              file={asset.data?.file}
              src={asset.data?.text}
              onClose={() => handleRemoveAsset(asset.id)}
            />
          );
        case "audioPlayer":
          return (
            <AudioPlayer
              key={asset.id}
              id={asset.id}
              inline={true}
              initialData={
                asset.data?.file ? { file: asset.data.file } : undefined
              }
              onClose={() => handleRemoveAsset(asset.id)}
            />
          );
        case "imageCollection":
          return (
            <ImageCollection
              key={asset.id}
              id={asset.id}
              inline={true}
              initialData={
                asset.data?.files
                  ? { files: asset.data.files }
                  : asset.data?.file
                  ? { files: [asset.data.file] }
                  : undefined
              }
              onClose={() => handleRemoveAsset(asset.id)}
            />
          );
        case "pdfDocument":
          return (
            <PdfDocument
              key={asset.id}
              id={asset.id}
              inline={true}
              initialData={
                asset.data?.file ? { file: asset.data.file } : undefined
              }
              onClose={() => handleRemoveAsset(asset.id)}
            />
          );
        case "wikipediaLink":
          return (
            <WikipediaLink
              key={asset.id}
              id={asset.id}
              inline={true}
              initialData={
                asset.data?.text ? { text: asset.data.text } : undefined
              }
              onClose={() => handleRemoveAsset(asset.id)}
            />
          );
        case "text":
          return (
            <TextCollection
              key={asset.id}
              id={asset.id}
              inline={true}
              initialData={
                asset.data?.text ? { text: asset.data.text } : undefined
              }
              onClose={() => handleRemoveAsset(asset.id)}
            />
          );
        default:
          return null;
      }
    })();

    return <div style={{ width: getAssetWidth(asset.type) }}>{component}</div>;
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (inline) return;
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-draggable="true"]') ||
        target.closest(".drag-handle")
      ) {
        e.preventDefault();
        setIsDragging(true);

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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-draggable="true"]') ||
        target.closest(".drag-handle")
      ) {
        e.preventDefault();
        const touch = e.touches[0];
        setIsDragging(true);

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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const percentageX = (newX / viewportWidth) * 100;
        const percentageY = (newY / viewportHeight) * 100;

        setPosition({
          x: Math.max(0, Math.min(percentageX, 100)),
          y: Math.max(0, Math.min(percentageY, 100)),
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

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const percentageX = (newX / viewportWidth) * 100;
        const percentageY = (newY / viewportHeight) * 100;

        setPosition({
          x: Math.max(0, Math.min(percentageX, 100)),
          y: Math.max(0, Math.min(percentageY, 100)),
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
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

  // Handle initial data
  useEffect(() => {
    if (initialData?.name) {
      setName(initialData.name);
    }
    if (initialData?.assets) {
      setAssets(initialData.assets);
    }
  }, [initialData]);

  // Update component instance data when assets change
  useEffect(() => {
    if (id && inline) {
      const updateEvent = new CustomEvent("updateComponent", {
        detail: {
          componentId: id,
          data: { name, assets },
        },
      });
      window.dispatchEvent(updateEvent);
    }
  }, [id, inline, name, assets]);

  // Handle drop of assets
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dragData = JSON.parse(e.dataTransfer.getData("application/json"));
    if (dragData && dragData.id && dragData.type) {
      const newAsset: AssetItem = {
        id: dragData.id,
        type: dragData.type,
        title: dragData.title,
        data: dragData.data,
      };
      setAssets((prev) => {
        // Avoid duplicates
        if (prev.find((a) => a.id === newAsset.id)) {
          return prev;
        }
        return [...prev, newAsset];
      });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleNameEdit = () => {
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 0);
  };

  const handleNameSave = () => {
    setIsEditingName(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
  };

  const handleCloseComponent = () => {
    if (id) {
      const removeEvent = new CustomEvent("removeComponent", {
        detail: { componentId: id },
      });
      window.dispatchEvent(removeEvent);
    }
    if (onClose) {
      onClose();
    }
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
              width: "min(400px, 80vw)",
              height: "min(300px, 60vh)",
              maxWidth: "400px",
              maxHeight: "300px",
              opacity: 1,
              transform: "rotate(0deg)",
              background: "#244785",
            }
      }
      tabIndex={inline ? undefined : 0}
    >
      {/* Main Container */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
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
            <NewFolderIcon width={24} height={24} className="text-white" />
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameSave}
                onKeyPress={handleNameKeyPress}
                className="bg-transparent text-white border-none outline-none font-medium text-[16px] leading-[100%] flex-1"
              />
            ) : (
              <span
                className="text-white truncate font-medium text-[16px] leading-[100%] cursor-pointer"
                onClick={handleNameEdit}
                title="Click to edit name"
              >
                {name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNameEdit}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Edit name"
            >
              <EditIcon />
            </button>
            <button
              onClick={handleCloseComponent}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Close collection"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 bg-white rounded-b-xl p-2 overflow-y-auto min-h-[200px]"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <FolderIcon width={48} height={48} className="mb-4 opacity-50" />
              <p className="text-center">
                Drop assets here to add to collection
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-2 gap-y-0">
              {assets.map((asset) => (
                <div key={asset.id}>
                  {/* Render the actual component */}
                  {renderAssetComponent(asset)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderCollection;
