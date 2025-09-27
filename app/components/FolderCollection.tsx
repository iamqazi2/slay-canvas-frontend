"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspaceStore } from "../store/workspaceStore";
import { collectionApi } from "../utils/collectionApi";
import { getAssetIdFromComponentId } from "../utils/assetUtils";
import { DeleteIcon, EditIcon, FolderIcon } from "./icons";
import NewFolderIcon from "./icons/NewFolder";
import { useToast } from "./ui/Toast";
import ConfirmationModal from "./modals/ConfirmationModal";
import {
  AudioPlayer,
  ImageCollection,
  PdfDocument,
  TextCollection,
  VideoPreview,
  WikipediaLink,
} from "./index";

interface AssetItem {
  id: string;
  type: string;
  title: string;
  data?: {
    file?: File;
    files?: File[];
    text?: string;
    url?: string;
    title?: string;
    content?: string;
  };
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
  const { showToast } = useToast();
  const { currentWorkspaceId } = useWorkspaceStore();
  const [name, setName] = useState(initialData?.name || "Collection");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assets, setAssets] = useState<AssetItem[]>(initialData?.assets || []);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 10, y: 70 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Use refs to track initial values without causing re-renders
  const initialNameRef = useRef<string>(initialData?.name || "Collection");

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
                asset.data?.file
                  ? { file: asset.data.file }
                  : asset.data?.url
                  ? {
                      url: asset.data.url,
                      name: asset.data.title || asset.title,
                    }
                  : undefined
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
                  : asset.data?.url
                  ? {
                      url: asset.data.url,
                      title: asset.data.title || asset.title,
                    }
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
                asset.data?.file
                  ? { file: asset.data.file }
                  : asset.data?.url
                  ? {
                      url: asset.data.url,
                      title: asset.data.title || asset.title,
                    }
                  : undefined
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
                asset.data?.text
                  ? { text: asset.data.text }
                  : asset.data?.content
                  ? { text: asset.data.content }
                  : undefined
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

  // Handle initial data updates
  useEffect(() => {
    if (initialData) {
      if (initialData.name && initialData.name !== initialNameRef.current) {
        setName(initialData.name);
        initialNameRef.current = initialData.name;
      }
      if (initialData.assets) {
        setAssets(initialData.assets);
      }
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
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const dragData = JSON.parse(e.dataTransfer.getData("application/json"));
      if (dragData && dragData.id && dragData.type) {
        const newAsset: AssetItem = {
          id: dragData.id,
          type: dragData.type,
          title: dragData.title,
          data: dragData.data,
        };

        // Check for duplicates
        setAssets((prev) => {
          if (prev.find((a) => a.id === newAsset.id)) {
            return prev;
          }
          return [...prev, newAsset];
        });

        // Persist to backend if this is a collection
        if (currentWorkspaceId) {
          const collectionId = id?.startsWith("collection-")
            ? parseInt(id.replace("collection-", ""), 10)
            : null;

          if (collectionId) {
            try {
              const assetId = getAssetIdFromComponentId(dragData.id);
              if (assetId) {
                await collectionApi.linkAssetToCollection(
                  currentWorkspaceId,
                  assetId,
                  collectionId
                );
                console.log(
                  `Successfully linked asset ${assetId} to collection ${collectionId}`
                );
              } else {
                console.warn(
                  "Could not extract asset ID from component ID:",
                  dragData.id
                );
              }
            } catch (error) {
              console.error("Failed to link asset to collection:", error);
              // Revert the local state change on error
              setAssets((prev) => prev.filter((a) => a.id !== newAsset.id));
            }
          }
        }
      }
    },
    [currentWorkspaceId, id]
  );

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

  const handleNameSave = async () => {
    setIsEditingName(false);

    // Only call API if name actually changed from the initial value
    if (name !== initialNameRef.current) {
      // Get collection ID from the component ID
      const collectionId = id?.startsWith("collection-")
        ? parseInt(id.replace("collection-", ""), 10)
        : null;

      // Call API to rename collection if we have the necessary data
      if (collectionId && currentWorkspaceId) {
        try {
          await collectionApi.renameCollection(
            currentWorkspaceId,
            collectionId,
            name
          );
          console.log(
            `Successfully renamed collection ${collectionId} to "${name}"`
          );
          // Update the initial name ref to the new name
          initialNameRef.current = name;
        } catch (error) {
          console.error("Failed to rename collection:", error);
          // Revert the name change on error
          setName(initialNameRef.current);
        }
      }
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    }
  };

  const handleRemoveAsset = async (assetId: string) => {
    // Remove from local state immediately for UI responsiveness
    const updatedAssets = assets.filter((a) => a.id !== assetId);
    setAssets(updatedAssets);

    // Unlink asset from collection in backend
    if (currentWorkspaceId && id?.startsWith("collection-")) {
      const collectionId = parseInt(id.replace("collection-", ""), 10);
      try {
        const assetIdNum = getAssetIdFromComponentId(assetId);
        if (assetIdNum) {
          await collectionApi.unlinkAssetFromCollection(
            currentWorkspaceId,
            assetIdNum,
            collectionId
          );
          console.log(
            `Successfully unlinked asset ${assetIdNum} from collection ${collectionId}`
          );

          // Dispatch updateComponent event to update the collection in the dashboard
          const updateEvent = new CustomEvent("updateComponent", {
            detail: {
              componentId: id,
              data: { name, assets: updatedAssets },
            },
          });
          window.dispatchEvent(updateEvent);
        } else {
          console.warn(
            "Could not extract asset ID from component ID:",
            assetId
          );
        }
      } catch (error) {
        console.error("Failed to unlink asset from collection:", error);
        // Revert the local state change on error
        setAssets(assets); // Restore original assets
        showToast("Failed to remove asset from collection", "error");
      }
    }
  };

  const handleCloseComponent = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
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
              background: "#1279FF",
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
              background: "#1279FF",
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
            background: "#1279FF",
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
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {assets.map((asset) => (
                <div className="w-fit" key={asset.id}>
                  {/* Render the actual component */}
                  {renderAssetComponent(asset)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Collection"
        message="Are you sure you want to close this collection? This will remove all assets from the collection."
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </div>
  );
};

export default FolderCollection;
