"use client";
import React, { useState, useRef, useEffect } from "react";
import { EditIcon, DeleteIcon } from "./icons";

interface PdfDocumentProps {
  className?: string;
  id?: string;
  initialData?: { file: File };
  onClose?: () => void;
  inline?: boolean;
}

const PdfDocument: React.FC<PdfDocumentProps> = ({
  className = "",
  id,
  initialData,
  onClose,
  inline = false,
}) => {
  // id is used for React key in parent component
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 77, y: 40 }); // Percentage values (70% from left, 40% from top)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("Culture.pdf");
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
    if (initialData?.file) {
      const file = initialData.file;
      setDocumentFile(file);
      setDocumentName(file.name);
      readDocumentContent(file);
    }
  }, [initialData]);

  // Handle routed document files from VideoCollection (for backward compatibility)
  useEffect(() => {
    const handleDocumentFilePasted = (event: CustomEvent) => {
      const file = event.detail.file;
      if (file) {
        // Update the document title to reflect the new file
        const fileName = file.name;
        // You can add more logic here to handle different document types
        console.log("Document file received:", fileName);

        // For now, just log the file - you can extend this to actually process the document
        // This could involve reading the file content, displaying it, etc.
      }
    };

    window.addEventListener(
      "documentFilePasted",
      handleDocumentFilePasted as EventListener
    );
    return () =>
      window.removeEventListener(
        "documentFilePasted",
        handleDocumentFilePasted as EventListener
      );
  }, []);

  const handleEdit = (): void => {
    // Trigger file input to change document
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDocumentFile(file);
        setDocumentName(file.name);
        readDocumentContent(file);
      }
    };
    input.click();
  };

  const handleDelete = (): void => {
    console.log("PdfDocument handleDelete called");
    // Clean up document URL if it exists
    if (documentFile) {
      // Note: We don't need to revoke URL here since we're not using object URLs for documents
      setDocumentFile(null);
      setDocumentContent("");
      setDocumentName("Culture.pdf");
    }

    // Check if this is a sidebar component or has onClose prop
    if (id === "sidebar-pdf-document" || onClose) {
      console.log(
        "PdfDocument is sidebar component or has onClose prop, calling onClose"
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
    if (documentFile) {
      // Open the document file
      const url = URL.createObjectURL(documentFile);
      window.open(url, "_blank");
    } else {
      console.log("Open PDF document");
    }
  };

  const readDocumentContent = async (file: File): Promise<void> => {
    try {
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        // Read text files
        const text = await file.text();
        setDocumentContent(text);
      } else if (file.type === "application/pdf") {
        // For PDF files, we'll show a placeholder since we can't easily render PDFs
        setDocumentContent("PDF Document - Click to open in new tab");
      } else if (file.name.endsWith(".csv")) {
        // Read CSV files
        const text = await file.text();
        setDocumentContent(text);
      } else {
        // For other document types, show a message
        const estimatedPages = Math.ceil(file.size / 1000);
        setDocumentContent(
          `Document: ${file.name}\nType: ${file.type}\nPages: ~${estimatedPages} pages`
        );
      }
    } catch (error) {
      console.error("Error reading document:", error);
      setDocumentContent("Error reading document content");
    }
  };

  // Document Icon
  const DocumentIcon: React.FC = () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.66699 4.66671V23.3334C4.66699 23.9522 4.91282 24.5457 5.35041 24.9833C5.78799 25.4209 6.38149 25.6667 7.00033 25.6667H21.0003C21.6192 25.6667 22.2127 25.4209 22.6502 24.9833C23.0878 24.5457 23.3337 23.9522 23.3337 23.3334V9.73237C23.3336 9.42153 23.2715 9.11382 23.1509 8.82733C23.0303 8.54083 22.8536 8.28132 22.6313 8.06404L17.4513 2.99837C17.0154 2.57214 16.43 2.33345 15.8203 2.33337H7.00033C6.38149 2.33337 5.78799 2.57921 5.35041 3.01679C4.91282 3.45438 4.66699 4.04787 4.66699 4.66671ZM10.5003 15.1667H17.5003H10.5003ZM10.5003 19.8334H14.0003H10.5003Z"
        fill="white"
      />
      <path
        d="M10.5003 15.1667H17.5003M10.5003 19.8334H14.0003M4.66699 4.66671V23.3334C4.66699 23.9522 4.91282 24.5457 5.35041 24.9833C5.78799 25.4209 6.38149 25.6667 7.00033 25.6667H21.0003C21.6192 25.6667 22.2127 25.4209 22.6502 24.9833C23.0878 24.5457 23.3337 23.9522 23.3337 23.3334V9.73237C23.3336 9.42153 23.2715 9.11382 23.1509 8.82733C23.0303 8.54083 22.8536 8.28132 22.6313 8.06404L17.4513 2.99837C17.0154 2.57214 16.43 2.33345 15.8203 2.33337H7.00033C6.38149 2.33337 5.78799 2.57921 5.35041 3.01679C4.91282 3.45438 4.66699 4.04787 4.66699 4.66671Z"
        stroke="#424242"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.334 2.33337V7.00004C16.334 7.61888 16.5798 8.21237 17.0174 8.64996C17.455 9.08754 18.0485 9.33337 18.6673 9.33337H23.334"
        fill="white"
      />
      <path
        d="M16.334 2.33337V7.00004C16.334 7.61888 16.5798 8.21237 17.0174 8.64996C17.455 9.08754 18.0485 9.33337 18.6673 9.33337H23.334"
        stroke="#424242"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Reddit Icon
  const RedditIcon: React.FC = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.924 7.154H17.41L17.437 5.264C17.4341 5.15347 17.3915 5.04768 17.317 4.966L12.901 0.134C12.8653 0.0937799 12.8218 0.0611823 12.7732 0.0381578C12.7245 0.0151333 12.6718 0.00215516 12.618 0L3.37801 0C3.17084 0.00332606 2.97304 0.0869012 2.82625 0.233132C2.67946 0.379363 2.59513 0.576843 2.59101 0.784V7.154H2.07601C1.79101 7.154 1.51601 7.272 1.31601 7.482C1.11195 7.69543 0.998667 7.97972 1.00001 8.275V14.105C1.00001 14.723 1.48201 15.225 2.07601 15.225H2.59101V19.215C2.59489 19.4227 2.67938 19.6207 2.82663 19.7672C2.97387 19.9137 3.17232 19.9972 3.38001 20H16.658C17.073 20 17.438 19.648 17.438 19.216V15.226H17.925C18.519 15.226 19.001 14.723 19.001 14.104V8.274C19.001 7.978 18.888 7.692 18.686 7.482C18.5882 7.37868 18.4703 7.29633 18.3397 7.23995C18.209 7.18356 18.0683 7.15432 17.926 7.154M3.95001 1.378H10.906V5.955C10.9056 6.05806 10.945 6.15728 11.016 6.232C11.0504 6.2682 11.0919 6.29706 11.1377 6.31682C11.1836 6.33659 11.233 6.34685 11.283 6.347H16.042V7.154H3.95001V1.378ZM3.95001 18.622V15.225H16.042V18.622H3.95001ZM12.291 1.52L12.676 1.954L15.256 4.807L15.399 4.98H12.762C12.562 4.98 12.436 4.94667 12.384 4.88C12.3307 4.81467 12.2997 4.71033 12.291 4.567V1.52ZM3.00001 14.232V8.232H4.91801C5.64468 8.232 6.11801 8.262 6.33801 8.322C6.67801 8.412 6.96235 8.608 7.19101 8.91C7.41968 9.21067 7.53401 9.6 7.53401 10.078C7.53401 10.446 7.46801 10.756 7.33601 11.008C7.20401 11.258 7.03635 11.4547 6.83301 11.598C6.64773 11.7339 6.43682 11.8309 6.21301 11.883C5.92768 11.9403 5.51468 11.969 4.97401 11.969H4.19501V14.232H3.00001ZM4.19501 9.247V10.95H4.84901C5.32035 10.95 5.63535 10.9187 5.79401 10.856C5.94735 10.7975 6.07866 10.6927 6.16969 10.5561C6.26073 10.4196 6.30698 10.258 6.30201 10.094C6.30941 9.89643 6.2415 9.70341 6.11201 9.554C5.98731 9.41284 5.81781 9.31891 5.63201 9.288C5.49001 9.26133 5.20335 9.248 4.77201 9.248L4.19501 9.247ZM8.23501 8.232H10.419C10.9117 8.232 11.2873 8.27033 11.546 8.347C11.8927 8.45033 12.19 8.63433 12.438 8.899C12.6853 9.16433 12.8737 9.48833 13.003 9.871C13.133 10.255 13.1977 10.7277 13.197 11.289C13.197 11.783 13.1363 12.2087 13.015 12.566C12.8663 13.0027 12.655 13.356 12.381 13.626C12.1743 13.8313 11.8943 13.9913 11.541 14.106C11.2777 14.19 10.9253 14.232 10.484 14.232H8.23501V8.232ZM9.43001 9.247V13.221H10.322C10.656 13.221 10.897 13.202 11.045 13.164C11.239 13.1147 11.3997 13.0313 11.527 12.914C11.6557 12.7967 11.76 12.6037 11.84 12.335C11.9207 12.0663 11.961 11.7 11.961 11.236C11.961 10.772 11.921 10.416 11.841 10.168C11.7766 9.94956 11.6599 9.75013 11.501 9.587C11.3467 9.44286 11.1552 9.34482 10.948 9.304C10.7813 9.266 10.4547 9.247 9.96801 9.247H9.43001ZM13.943 14.232V8.232H18V9.247H15.138V10.667H17.608V11.682H15.138V14.232H13.943Z"
        fill="#FF4500"
      />
    </svg>
  );

  // Removed unused PlayButtonIcon component
  // Removed unused PlayButtonIcon component
  const _ = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_62_3432)">
        <circle cx="20" cy="20" r="12" fill="#F0F5F7" />
        <circle cx="20" cy="20" r="11.5" stroke="#4596FF" strokeOpacity="0.1" />
      </g>
      <defs>
        <filter
          id="filter0_d_62_3432"
          x="0"
          y="0"
          width="40"
          height="40"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.269231 0 0 0 0 0.586822 0 0 0 0 1 0 0 0 0.3 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_62_3432"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_62_3432"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );

  return (
    <div
      ref={containerRef}
      className={`${
        inline ? "relative w-full h-full" : "fixed z-20 select-none"
      } ${className}`}
      style={
        inline
          ? {}
          : {
              left: `${position.x}%`,
              top: `${position.y}%`,
              width: "min(300px, 80vw)",
              maxWidth: "300px",
              opacity: 1,
              transform: "rotate(0deg)",
            }
      }
      tabIndex={0}
    >
      <div
        className="relative w-full h-full"
        style={{
          background: "#424242",
          borderRadius: "12px",
          padding: "4px 3px",
          boxShadow: "0px 0px 40px 0px #1E1E1E33",
        }}
      >
        {/* Header - Draggable */}
        <div
          className="flex items-center justify-between px-3 py-2 drag-handle cursor-move"
          data-draggable="true"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{ height: "44px" }}
        >
          <div className="flex items-center overflow-hidden gap-3">
            <DocumentIcon />
            <span
              className="text-white truncate font-medium"
              style={{
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "#FFFFFF",
              }}
            >
              {documentName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              style={{ pointerEvents: "auto" }}
              title="Edit document"
            >
              <EditIcon />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("PdfDocument close button clicked");
                handleDelete();
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              style={{ pointerEvents: "auto" }}
              title="Close document"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div
          className="px-3 py-2 bg-[var(--background)]"
          style={{
            minHeight: "56px",
            borderRadius: "12px",
          }}
        >
          {documentContent ? (
            <div className="space-y-2">
              <div
                className="flex items-center justify-between"
                onClick={handleOpen}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpen}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    style={{ pointerEvents: "auto" }}
                  >
                    <RedditIcon />
                  </button>
                  <div className="flex items-center gap-2" onClick={handleOpen}>
                    <span
                      className="font-medium"
                      style={{
                        fontWeight: 500,
                        fontSize: "14px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "#1E1E1ECC",
                      }}
                    >
                      {`${Math.ceil(documentContent.length / 1000)} pages`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-hidden">
                <div className="text-xs truncate text-gray-600 overflow-hidden bg-gray-50 p-2 rounded">
                  {documentContent.length > 200
                    ? `${documentContent.substring(0, 200)}...`
                    : documentContent}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-between"
              onClick={handleOpen}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={handleOpen}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  style={{ pointerEvents: "auto" }}
                >
                  <RedditIcon />
                </button>
                <div className="flex items-center gap-2">
                  {/* <PagesIcon /> */}
                  <span
                    className="font-medium"
                    style={{
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "#1E1E1ECC",
                    }}
                  >
                    106 pages
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfDocument;
